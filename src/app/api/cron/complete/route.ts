import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { alert } from "@/lib/reseller/alerts";
import { resellerFetch } from "@/lib/reseller/client";
import { canAutoComplete, deliveredText } from "@/lib/reseller/messages";
import { fulfillLineItem, ShoppexDevError } from "@/lib/reseller/shoppex-dev";
import { listPending, removePending, storeConfigured, updatePending } from "@/lib/reseller/store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

// Auto-complete check. An outside timer (cron-job.org) calls this every few minutes.
// For every order still waiting on Liteboosts: if Liteboosts has delivered, mark the Shoppex order
// delivered (the customer gets the delivery email). Orders we can't finish automatically get an alert.

type OrderLines = { data: { status?: string; lines: { delivered: boolean; serials: string[] }[] } };

const MAX_PER_RUN = 20;
const STALE_MS = 24 * 60 * 60 * 1000;

function authorized(req: Request) {
  const secret = process.env.CRON_SECRET ?? "";
  if (secret.length < 16) return false;
  const url = new URL(req.url);
  const given = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? url.searchParams.get("token") ?? "";
  const a = Buffer.from(given);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

async function run(req: Request) {
  if (!authorized(req)) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (!storeConfigured()) return NextResponse.json({ error: "Redis not configured" }, { status: 500 });

  const all = await listPending();
  const batch = all.slice(0, MAX_PER_RUN);
  const result = { waiting: all.length, checked: 0, completed: 0, manual: 0, stillWaiting: 0, errors: 0 };

  for (const p of batch) {
    result.checked++;
    const info = { Order: p.invoiceId, Product: p.title, "Liteboosts order": p.lbOrderId };
    try {
      const { lines, status } = (await resellerFetch<OrderLines>(`/orders/${encodeURIComponent(p.lbOrderId)}`, { timeoutMs: 6000 })).data;
      const delivered = lines.length > 0 && lines.every(l => l.delivered);

      if (!delivered) {
        if (/cancel|refund|fail/i.test(status ?? "")) {
          await alert("❌ Liteboosts cancelled/failed this order — fulfill or refund by hand", { ...info, Status: status }, 0xef4444);
          await removePending(p.lbOrderId);
          result.manual++;
        } else {
          if (!p.staleAlerted && Date.now() - p.createdAt > STALE_MS) {
            await alert("🐢 Still waiting on Liteboosts after 24h — check with their support", info, 0xf59e0b);
            await updatePending({ ...p, staleAlerted: true });
          }
          result.stillWaiting++;
        }
        continue;
      }

      const serials = lines.flatMap(l => l.serials ?? []);
      if (!canAutoComplete(p.title, serials)) {
        await alert("📦 Liteboosts finished — fulfill this one by hand", { ...info, "Liteboosts sent": serials.join("\n").slice(0, 900) || "nothing" }, 0x38bdf8);
        await removePending(p.lbOrderId);
        result.manual++;
        continue;
      }

      try {
        await fulfillLineItem({ invoiceId: p.invoiceId, lineItemId: p.lineItemId, deliveryId: p.deliveryId, message: deliveredText(p.title, serials), codes: serials });
        await alert("✅ Auto-completed", info);
        result.completed++;
      } catch (e) {
        // Already delivered (e.g. fulfilled by hand) — nothing left to do.
        if (e instanceof ShoppexDevError && (e.status === 409 || e.status === 422 || /already/i.test(e.message))) {
          result.completed++;
        } else throw e;
      }
      await removePending(p.lbOrderId);
    } catch (e) {
      result.errors++;
      const msg = e instanceof Error ? e.message : String(e);
      // Alert once per order so a broken key doesn't spam every 5 minutes.
      if (!p.errorAlerted) {
        await alert("⚠️ Auto-complete couldn't finish this order — will keep retrying", { ...info, Error: msg }, 0xf59e0b);
        await updatePending({ ...p, errorAlerted: true }).catch(() => {});
      }
    }
  }
  return NextResponse.json(result);
}

export const GET = run;
export const POST = run;
