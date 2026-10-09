
// Minimal client for the Shoppex Reseller API (Liteboosts' wholesale program).
// Docs: https://docs.shoppex.io/developers/reseller-api
const BASE = "https://api.shoppex.io/reseller/v1";

export class ResellerError extends Error {
  constructor(readonly status: number, readonly code: string, message: string, readonly body?: unknown) {
    super(message);
  }
}

function apiKey() {
  const key = process.env.LITEBOOSTS_API_KEY;
  if (!key) throw new ResellerError(500, "NOT_CONFIGURED", "LITEBOOSTS_API_KEY is not set in Vercel.");
  return key;
}

export async function resellerFetch<T>(path: string, init: RequestInit & { idempotencyKey?: string; timeoutMs?: number } = {}): Promise<T> {
  const { idempotencyKey, timeoutMs = 10_000, ...rest } = init;
  const headers: Record<string, string> = { Authorization: `Bearer ${apiKey()}`, Accept: "application/json" };
  if (rest.body) headers["Content-Type"] = "application/json";
  if (idempotencyKey) headers["Idempotency-Key"] = idempotencyKey.slice(0, 128);
  const res = await fetch(`${BASE}${path}`, { ...rest, headers, cache: "no-store", signal: AbortSignal.timeout(timeoutMs) });
  const text = await res.text();
  let json: unknown = null;
  try { json = text ? JSON.parse(text) : null; } catch { /* non-JSON */ }
  if (!res.ok) {
    const err = (json as { error?: { code?: string; message?: string } } | null)?.error;
    throw new ResellerError(res.status, err?.code ?? `HTTP_${res.status}`, err?.message ?? (text.slice(0, 200) || res.statusText), json);
  }
  return json as T;
}

export type ResellerCustomField = { name: string; type: string; required: boolean; placeholder?: string | null; regex?: string | null };
export type ResellerVariant = { variant_id: string; title: string; orderable: boolean; base_price: string; wholesale_price: string; stock: number };
export type ResellerProduct = {
  product_id: string; uniqid: string; title: string; type: string; orderable: boolean; stock: number;
  currency: string; base_price: string; wholesale_price: string; discount_percent: number;
  custom_fields: ResellerCustomField[]; variants: ResellerVariant[];
};

export async function listAllProducts(): Promise<ResellerProduct[]> {
  const out: ResellerProduct[] = [];
  for (let page = 1; page <= 20; page++) {
    const r = await resellerFetch<{ data: ResellerProduct[]; pagination: { total: number; per_page: number } }>(`/products?page=${page}&per_page=100`);
    out.push(...r.data);
    if (out.length >= r.pagination.total || r.data.length === 0) break;
  }
  return out;
}
