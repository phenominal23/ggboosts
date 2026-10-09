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

/** For the rejection alert only: says which signing variant (if any) matches, never the secret itself. */
export function diagnoseSignature(opts: { header: string | null; legacy: string | null; timestamp: string | null; headerId: string | null; bodyId: string | null; rawBody: string; secrets: string[] }): string {
  const { header, legacy, timestamp, headerId, bodyId, rawBody, secrets } = opts;
  const h = header?.match(/h=([0-9a-fA-F]+)/)?.[1]?.toLowerCase();
  const t = header?.match(/t=(\d+)/)?.[1];
  const out: string[] = [`secrets=${secrets.length} (lengths ${secrets.map(s => s.length).join("/") || "-"})`, `v2 header=${header ? "yes" : "no"}`, `legacy header=${legacy ? "yes" : "no"}`, `t matches=${t === timestamp}`, `age=${timestamp ? Math.round(Date.now() / 1000 - Number(timestamp)) : "?"}s`, `ids equal=${headerId === bodyId}`];
  secrets.forEach((secret, i) => {
    const tries: [string, string][] = [["headerId", `${headerId}.${t}.${rawBody}`], ["bodyId", `${bodyId}.${t}.${rawBody}`], ["noId", `${t}.${rawBody}`], ["bodyOnly", rawBody]];
    for (const [name, str] of tries) if (h && createHmac("sha256", secret).update(str).digest("hex") === h) out.push(`secret#${i + 1} matches v2 via ${name}`);
    if (legacy && createHmac("sha512", secret).update(rawBody).digest("hex") === legacy.replace(/^sha512=/, "").toLowerCase()) out.push(`secret#${i + 1} matches LEGACY`);
  });
  if (out.every(l => !l.includes("matches "))) out.push("no secret matches anything → the secret in Vercel is not the one saved on this product");
  return out.join("\n");
}
