import { NextResponse } from "next/server";
import { alert } from "@/lib/reseller/alerts";
import { ResellerError, resellerFetch } from "@/lib/reseller/client";
import { buildResellerFields } from "@/lib/reseller/fields";
import { resellerTarget } from "@/lib/reseller/mapping";
import { canAutoComplete, deliveredText } from "@/lib/reseller/messages";
import { diagnoseSignature, verifyDynamicSignature } from "@/lib/reseller/signature";
import { savePending, storeConfigured } from "@/lib/reseller/store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 20;

// Shoppex calls this when a Dynamic product is paid. We buy the matching Liteboosts product with our
// reseller balance. If Liteboosts hands back the goods (e.g. Nitro codes) we deliver them right away;
// otherwise we answer "pending" so the order waits as "Awaiting delivery" and we get a Discord alert.
// We never answer with an error: an error would mark the customer's order as FAILED.

type DeliveryBody = {
  invoiceId?: string; deliveryId?: string; idempotencyKey?: string; customerEmail?: string;
  productTitle?: string; variantTitle?: string | null; quantity?: number;
  customFields?: Record<string, unknown>;
  line_item?: { id?: string | number };
};
type OrderLines = { data: { lines: { delivered: boolean; serials: string[] }[] } };
type OrderResponse = { data: { order: { uniqid: string; status: string; total: string; reused?: boolean }; deliverables: { delivered: boolean; serials: string[]; product_title?: string }[] } };

const pending = () => NextResponse.json({ status: "pending" });

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

export async function POST(req: Request) {
  const startedAt = Date.now();
  const rawBody = await req.text();
  const deliveryId = req.headers.get("x-shoppex-delivery-id");
  // One Vercel variable per product: DYNAMIC_WEBHOOK_SECRET, DYNAMIC_WEBHOOK_SECRET_14, _20, … (commas also work).
  const secrets = Object.entries(process.env)
    .filter(([k]) => k.startsWith("DYNAMIC_WEBHOOK_SECRET"))
    .flatMap(([, v]) => (v ?? "").split(","))
    .map(s => s.trim()).filter(Boolean);
  const ok = verifyDynamicSignature({ header: req.headers.get("x-shoppex-signature-v2"), timestamp: req.headers.get("x-shoppex-timestamp"), deliveryId, rawBody, secrets });
  if (!ok) {
    let bodyId: string | null = null;
    try { bodyId = (JSON.parse(rawBody) as { deliveryId?: string }).deliveryId ?? null; } catch { /* ignore */ }
    const diag = diagnoseSignature({ header: req.headers.get("x-shoppex-signature-v2"), legacy: req.headers.get("x-shoppex-signature"), timestamp: req.headers.get("x-shoppex-timestamp"), headerId: deliveryId, bodyId, rawBody, secrets });
    await alert("⚠️ Rejected delivery call (bad signature)", { "Delivery ID": deliveryId ?? "missing", Hint: secrets.length ? "Signature didn't match DYNAMIC_WEBHOOK_SECRET" : "DYNAMIC_WEBHOOK_SECRET is not set", Diagnosis: diag }, 0xf59e0b);
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  let body: DeliveryBody;
  try { body = JSON.parse(rawBody); } catch { return pending(); }
  const title = body.productTitle ?? "Order";
  const info = { Order: body.invoiceId, Product: [title, body.variantTitle].filter(Boolean).join(" · "), Qty: body.quantity };

  const target = resellerTarget(title, body.variantTitle);
  if (!target) {
    await alert("🛠️ Manual order — fulfill by hand", info, 0x38bdf8);
    return pending();
  }

  const contact = process.env.RESELLER_CONTACT_USERNAME ?? "";
  if (!contact) {
    await alert("⚠️ Not ordered — RESELLER_CONTACT_USERNAME missing", info, 0xf59e0b);
    return pending();
  }

  try {
    const res = await resellerFetch<OrderResponse>("/orders", {
      method: "POST",
      idempotencyKey: body.idempotencyKey ?? deliveryId ?? `${body.invoiceId}`,
      timeoutMs: 11_000,
      body: JSON.stringify({ items: [{ product_id: target.productId, variant_id: target.variantId, quantity: Math.max(1, Number(body.quantity) || 1), custom_fields: buildResellerFields(body.customFields ?? {}, contact) }] }),
    });
    const { order } = res.data;
    let lines: { delivered: boolean; serials: string[] }[] = res.data.deliverables;
    // Liteboosts often finishes a few seconds after accepting the order — re-check while we still have
    // time inside Shoppex's 15-second window, so fast orders are marked delivered right away.
    while (!(lines.length > 0 && lines.every(d => d.delivered)) && Date.now() - startedAt < 10_000) {
      await sleep(1500);
      try { lines = (await resellerFetch<OrderLines>(`/orders/${encodeURIComponent(order.uniqid)}`, { timeoutMs: 2000 })).data.lines; } catch { break; }
    }
    const allDelivered = lines.length > 0 && lines.every(d => d.delivered);
    const serials = lines.flatMap(d => d.serials ?? []);
    const lbInfo = { ...info, "Liteboosts order": order.uniqid, Cost: `$${order.total}` };

    if (allDelivered && canAutoComplete(title, serials)) {
      await alert("✅ Auto-delivered", lbInfo);
      return NextResponse.json({ data: { service_text: deliveredText(title, serials), dynamic_response: serials.length ? { codes: serials } : { status: "sent" }, deliveryType: "DYNAMIC", count: Math.max(1, serials.length) } });
    }
    // Delivered by Liteboosts but not something we can hand over automatically (e.g. members): finish by hand.
    if (allDelivered) {
      await alert("📦 Ordered on Liteboosts — finish this one by hand", { ...lbInfo, "Liteboosts sent": serials.join("\n").slice(0, 900) || "nothing", Next: "Check the order on Liteboosts, then fulfill it in Shoppex" }, 0x38bdf8);
      return pending();
    }
    // Remember the order so the auto-complete check (/api/cron/complete) can finish it later.
    const lineItemId = body.line_item?.id != null ? String(body.line_item.id) : "";
    let tracked = false;
    if (storeConfigured() && body.invoiceId && lineItemId && deliveryId) {
      try {
        await savePending({ lbOrderId: order.uniqid, invoiceId: body.invoiceId, lineItemId, deliveryId, title, createdAt: Date.now() });
        tracked = true;
      } catch (e) { console.error("savePending failed", e); }
    }
    await alert("⏳ Ordered on Liteboosts — waiting on their delivery", { ...lbInfo, Next: tracked ? "Will auto-complete when Liteboosts delivers" : "When Liteboosts delivers, mark this order fulfilled in Shoppex" }, 0xfbbf24);
    return pending();
  } catch (e) {
    const err = e instanceof ResellerError ? `${e.code}: ${e.message}` : e instanceof Error ? e.message : String(e);
    const lowBalance = e instanceof ResellerError && e.code === "INSUFFICIENT_BALANCE";
    const timedOut = e instanceof Error && (e.name === "TimeoutError" || e.name === "AbortError");
    const heading = lowBalance ? "💸 Not ordered — top up your Liteboosts balance, then buy by hand"
      : timedOut ? "⌛ Liteboosts didn't answer in time — CHECK your Liteboosts orders before buying again"
        : "❌ Liteboosts order failed — fulfill by hand";
    await alert(heading, { ...info, Error: err }, 0xef4444);
    return pending();
  }
}
