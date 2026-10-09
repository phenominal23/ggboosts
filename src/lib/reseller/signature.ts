import { createHmac, timingSafeEqual } from "node:crypto";

// Shoppex shows secrets like "prefix_<hex>". Depending on the product type the HMAC key may be the whole
// string, the part after the prefix, or that part decoded from hex/base64 — so try each form.
export function keyVariants(secret: string): [string, Buffer][] {
  const out: [string, Buffer][] = [["raw", Buffer.from(secret)]];
  const tail = secret.includes("_") ? secret.slice(secret.lastIndexOf("_") + 1) : null;
  if (tail && tail !== secret) out.push(["noPrefix", Buffer.from(tail)]);
  for (const [label, v] of [["", secret], ["noPrefix", tail]] as const) {
    if (!v) continue;
    if (/^[0-9a-f]+$/i.test(v) && v.length % 2 === 0) out.push([`${label || "raw"}+hex`, Buffer.from(v, "hex")]);
    if (/^[A-Za-z0-9+/=_-]+$/.test(v)) { const b = Buffer.from(v.replace(/-/g, "+").replace(/_/g, "/"), "base64"); if (b.length >= 16) out.push([`${label || "raw"}+base64`, b]); }
  }
  return out;
}

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
  return secrets.some(secret => keyVariants(secret).some(([, key]) => {
    const expected = createHmac("sha256", key).update(`${deliveryId}.${timestamp}.${rawBody}`).digest();
    return expected.length === given.length && timingSafeEqual(expected, given);
  }));
}

/** For the rejection alert only: says which signing variant (if any) matches, never the secret itself. */
export function diagnoseSignature(opts: { header: string | null; legacy: string | null; timestamp: string | null; headerId: string | null; bodyId: string | null; rawBody: string; secrets: string[] }): string {
  const { header, legacy, timestamp, headerId, bodyId, rawBody, secrets } = opts;
  const h = header?.match(/h=([0-9a-fA-F]+)/)?.[1]?.toLowerCase();
  const t = header?.match(/t=(\d+)/)?.[1];
  const out: string[] = [`secrets=${secrets.length} (lengths ${secrets.map(s => s.length).join("/") || "-"})`, `v2 header=${header ? "yes" : "no"}`, `legacy header=${legacy ? "yes" : "no"}`, `t matches=${t === timestamp}`, `age=${timestamp ? Math.round(Date.now() / 1000 - Number(timestamp)) : "?"}s`, `ids equal=${headerId === bodyId}`];
  secrets.forEach((secret, i) => {
    out.push(`secret#${i + 1} shape: ${secret.includes("_") ? `prefix ${secret.lastIndexOf("_") + 1} chars + ${secret.length - secret.lastIndexOf("_") - 1} chars` : "no prefix"}, ${/^[0-9a-f_a-z]+$/i.test(secret) ? "alphanumeric" : "has symbols"}`);
    const tries: [string, string][] = [["headerId", `${headerId}.${t}.${rawBody}`], ["bodyId", `${bodyId}.${t}.${rawBody}`], ["noId", `${t}.${rawBody}`], ["bodyOnly", rawBody]];
    for (const [kname, key] of keyVariants(secret)) {
      for (const [name, str] of tries) if (h && createHmac("sha256", key).update(str).digest("hex") === h) out.push(`secret#${i + 1} matches v2 via ${name} with key ${kname}`);
      if (legacy && createHmac("sha512", key).update(rawBody).digest("hex") === legacy.replace(/^sha512=/, "").toLowerCase()) out.push(`secret#${i + 1} matches LEGACY with key ${kname}`);
    }
  });
  if (out.every(l => !l.includes("matches "))) out.push("no secret matches anything → the secret in Vercel is not the one saved on this product");
  return out.join("\n");
}
