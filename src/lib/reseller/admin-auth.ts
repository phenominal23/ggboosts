import { timingSafeEqual } from "node:crypto";

/** True when `token` matches ADMIN_TOKEN. Fails closed if ADMIN_TOKEN isn't set or is too short. */
export function isAdmin(token: string | null): boolean {
  const expected = process.env.ADMIN_TOKEN ?? "";
  if (expected.length < 16 || !token) return false;
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
