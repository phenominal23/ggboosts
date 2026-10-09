import { NextResponse } from "next/server";
import { alert } from "@/lib/reseller/alerts";
import { ResellerError, resellerFetch } from "@/lib/reseller/client";
import { buildResellerFields } from "@/lib/reseller/fields";
import { resellerTarget } from "@/lib/reseller/mapping";
import { verifyDynamicSignature } from "@/lib/reseller/signature";

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
};
type OrderResponse = { data: { order: { uniqid: string; status: string; total: string; reused?: boolean }; deliverables: { delivered: boolean; serials: string[]; product_title?: string }[] } };

const pending = () => NextResponse.json({ status: "pending" });

function deliveredText(title: string, serials: string[]) {
  const t = title.toLowerCase();
  if (serials.length) {
    const intro = t.includes("nitro") && !t.includes("token") ? "✅ Your Discord Nitro is ready!\n\nRedeem it by opening the link below while logged in to the Discord account you want Nitro on:" : `✅ Your ${title} is ready!`;
    return `${intro}\n\n${serials.join("\n")}\n\nQuestions? Open a ticket with your order ID: https://discord.gg/Bewfk2dHzj`;
  }
  return `✅ Your ${title} order has been sent to your server!\n\nIt can take a few minutes for Discord to show the new boost count. Don't kick or ban the boosting accounts — removed boosts aren't covered by the warranty.\n\nQuestions? Open a ticket with your order ID: https://discord.gg/Bewfk2dHzj`;
}

export async function POST(req: Request) {
  const rawBody = await req.text();
  const deliveryId = req.headers.get("x-shoppex-delivery-id");
  const secrets = (process.env.DYNAMIC_WEBHOOK_SECRET ?? "").split(",").map(s => s.trim()).filter(Boolean);
  const ok = verifyDynamicSignature({ header: req.headers.get("x-shoppex-signature-v2"), timestamp: req.headers.get("x-shoppex-timestamp"), deliveryId, rawBody, secrets });
  if (!ok) {
    await alert("⚠️ Rejected delivery call (bad signature)", { "Delivery ID": deliveryId ?? "missing", Hint: secrets.length ? "Signature didn't match DYNAMIC_WEBHOOK_SECRET" : "DYNAMIC_WEBHOOK_SECRET is not set" }, 0xf59e0b);
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
    const { order, deliverables } = res.data;
    const allDelivered = deliverables.length > 0 && deliverables.every(d => d.delivered);
    const serials = deliverables.flatMap(d => d.serials ?? []);
    const isBoost = /\bboosts?\b/i.test(title) && !/token/i.test(title);
    const lbInfo = { ...info, "Liteboosts order": order.uniqid, Cost: `$${order.total}` };

    if (allDelivered && (serials.length > 0 || isBoost)) {
      await alert("✅ Auto-delivered", lbInfo);
      return NextResponse.json({ data: { service_text: deliveredText(title, serials), dynamic_response: serials.length ? { codes: serials } : { status: "sent" }, deliveryType: "DYNAMIC", count: Math.max(1, serials.length) } });
    }
    await alert("⏳ Ordered on Liteboosts — waiting on their delivery", { ...lbInfo, Next: "When Liteboosts delivers, mark this order fulfilled in Shoppex" }, 0xfbbf24);
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
