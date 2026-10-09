// Shoppex merchant Developer API (shx_ key): used to deliver a waiting order once Liteboosts finishes.
const BASE = process.env.SHOPPEX_DEV_API_BASE ?? "https://api.shoppex.io/dev/v1";

export class ShoppexDevError extends Error {
  constructor(readonly status: number, readonly code: string, message: string) { super(message); }
}

export async function fulfillLineItem(opts: { invoiceId: string; lineItemId: string; deliveryId: string; message: string; codes?: string[] }) {
  const key = process.env.SHOPPEX_DEV_API_KEY;
  if (!key) throw new ShoppexDevError(500, "NOT_CONFIGURED", "SHOPPEX_DEV_API_KEY is not set in Vercel.");
  const res = await fetch(`${BASE}/orders/${encodeURIComponent(opts.invoiceId)}/items/${encodeURIComponent(opts.lineItemId)}/fulfill`, {
    method: "POST", cache: "no-store", signal: AbortSignal.timeout(8000),
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json", "Idempotency-Key": `ggb-fulfill-${opts.deliveryId}`.slice(0, 128) },
    body: JSON.stringify({ delivery_id: opts.deliveryId, message: opts.message, ...(opts.codes?.length ? { codes: opts.codes } : {}), notify_customer: true }),
  });
  const text = await res.text();
  if (!res.ok) {
    let err: { code?: string; message?: string } | undefined;
    try { err = (JSON.parse(text) as { error?: { code?: string; message?: string } }).error; } catch { /* non-JSON */ }
    throw new ShoppexDevError(res.status, err?.code ?? `HTTP_${res.status}`, err?.message ?? text.slice(0, 200));
  }
}
