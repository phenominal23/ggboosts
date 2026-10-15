import { redis, storeConfigured } from "@/lib/reseller/store";

// Vouches live in the same Upstash Redis as the auto-complete check.

export type Vouch = {
  n: number;
  userId: string;
  name: string;
  avatar: string;
  rating: number;
  product: string;
  message: string;
  proof?: string;
  createdAt: number;
};

const LIST = "ggb:vouches";
const COUNT = "ggb:vouch:count";
const KEEP = 500;

export const vouchStoreReady = storeConfigured;

/** Returns false if this user vouched in the last `seconds` (simple spam guard). */
export async function claimCooldown(userId: string, seconds: number) {
  const ok = await redis<string | null>("SET", `ggb:vouch:cd:${userId}`, "1", "NX", "EX", seconds);
  return ok === "OK";
}

export async function releaseCooldown(userId: string) {
  await redis("DEL", `ggb:vouch:cd:${userId}`);
}

export async function nextVouchNumber() {
  return redis<number>("INCR", COUNT);
}

export async function saveVouch(v: Vouch) {
  await redis("LPUSH", LIST, JSON.stringify(v));
  await redis("LTRIM", LIST, 0, KEEP - 1);
}

export async function listVouches(limit = 30): Promise<Vouch[]> {
  const raw = (await redis<string[]>("LRANGE", LIST, 0, limit - 1)) ?? [];
  return raw.flatMap(r => { try { return [JSON.parse(r) as Vouch]; } catch { return []; } });
}

export async function removeVouch(n: number) {
  const raw = (await redis<string[]>("LRANGE", LIST, 0, KEEP - 1)) ?? [];
  const hit = raw.find(r => { try { return (JSON.parse(r) as Vouch).n === n; } catch { return false; } });
  if (!hit) return false;
  await redis("LREM", LIST, 1, hit);
  return true;
}
