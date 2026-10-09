import { createHmac, timingSafeEqual } from "node:crypto";

// Verifies Shoppex's X-Shoppex-Signature-V2 header ("v1,t=<ts>,h=<hex>") for dynamic delivery calls.
// Signed string: `${deliveryId}.${timestamp}.${rawBody}`, HMAC-SHA256 with the product's dynamic webhook secret.
export function verifyDynamicSignature(opts: { header: string | null; timestamp: string | null; deliveryId: string | null; rawBody: string; secrets: string[] }): boolean {
  const { header, timestamp, deliveryId, rawBody, secrets } = opts;
  if (!header || !timestamp || !deliveryId || secrets.length === 0) return false;
  const parts = Object.fromEntries(header.split(",").map(p => p.trim().split("=", 2)).filter(p => p.length === 2)) as Record<string, string>;
  if (parts.t !== timestamp || !parts.h) return false;
  const ts = Number(timestamp);
  if (!Number.isFinite(ts) || Math.abs(Date.now() / 1000 - ts) > 300) return false;
  const given = Buffer.from(parts.h, "hex");
  return secrets.some(secret => {
    const expected = createHmac("sha256", secret).update(`${deliveryId}.${timestamp}.${rawBody}`).digest();
    return expected.length === given.length && timingSafeEqual(expected, given);
  });
}
