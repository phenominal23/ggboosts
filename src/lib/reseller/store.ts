// Tiny Redis store (Upstash REST) remembering which Shoppex orders are waiting on which Liteboosts orders.
// Works with Vercel's Upstash integration (KV_REST_API_URL / KV_REST_API_TOKEN) or plain Upstash env names.

export type PendingOrder = {
  lbOrderId: string;
  invoiceId: string;
  lineItemId: string;
  deliveryId: string;
  title: string;
  createdAt: number;
  staleAlerted?: boolean;
  errorAlerted?: boolean;
};

const SET = "ggb:pending";
const KEY = (id: string) => `ggb:pending:${id}`;
const TTL = 60 * 60 * 24 * 14; // forget after 14 days

function creds() {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url: url.replace(/\/+$/, ""), token } : null;
}

export const storeConfigured = () => creds() !== null;

async function redis<T = unknown>(...command: (string | number)[]): Promise<T> {
  const c = creds();
  if (!c) throw new Error("Redis is not configured (KV_REST_API_URL / KV_REST_API_TOKEN).");
  const res = await fetch(c.url, {
    method: "POST", cache: "no-store", signal: AbortSignal.timeout(4000),
    headers: { Authorization: `Bearer ${c.token}`, "Content-Type": "application/json" },
    body: JSON.stringify(command),
  });
  const json = (await res.json()) as { result?: T; error?: string };
  if (!res.ok || json.error) throw new Error(`Redis: ${json.error ?? res.status}`);
  return json.result as T;
}

export async function savePending(p: PendingOrder) {
  await redis("SET", KEY(p.lbOrderId), JSON.stringify(p), "EX", TTL);
  await redis("SADD", SET, p.lbOrderId);
}

export async function listPending(): Promise<PendingOrder[]> {
  const ids = (await redis<string[]>("SMEMBERS", SET)) ?? [];
  const out: PendingOrder[] = [];
  for (const id of ids) {
    const raw = await redis<string | null>("GET", KEY(id));
    if (raw) out.push(JSON.parse(raw)); else await redis("SREM", SET, id); // expired
  }
  return out.sort((a, b) => a.createdAt - b.createdAt);
}

export async function updatePending(p: PendingOrder) {
  await redis("SET", KEY(p.lbOrderId), JSON.stringify(p), "KEEPTTL");
}

export async function removePending(lbOrderId: string) {
  await redis("DEL", KEY(lbOrderId));
  await redis("SREM", SET, lbOrderId);
}
