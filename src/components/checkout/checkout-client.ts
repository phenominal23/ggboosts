"use client";

import { HeadlessCheckoutClient, HeadlessCheckoutError } from "@shoppexio/checkout-js/headless";
import type { CheckoutGatewayOption, CheckoutPaymentStatus, CheckoutSessionView } from "@shoppexio/checkout-js/headless";
import { normalizeStorefrontCustomFields, type StorefrontCustomField } from "@shoppexio/storefront";
import { shoppexConfig } from "@/lib/shoppex-config";

// One browser client for the whole checkout. Uses the publishable (browser-safe) key only.
let client: HeadlessCheckoutClient | null = null;
export function getCheckoutClient() {
  if (!client) client = new HeadlessCheckoutClient({ publishableKey: shoppexConfig.publishableKey, apiBaseUrl: shoppexConfig.apiBaseUrl });
  return client;
}

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://ggboosts.com").replace(/\/+$/, "");
const LAST_SESSION_KEY = "ggb_checkout_session";

export function rememberSession(id: string) {
  try { sessionStorage.setItem(LAST_SESSION_KEY, id); } catch { /* private mode */ }
}
export function recallSession(): string | null {
  try { return sessionStorage.getItem(LAST_SESSION_KEY); } catch { return null; }
}
export function forgetSession() {
  try { sessionStorage.removeItem(LAST_SESSION_KEY); } catch { /* private mode */ }
}

/** Shop can't use headless checkout right now (plan, origin, key) — fall back to the Shoppex pop-up. */
export function isSetupError(error: unknown) {
  if (!(error instanceof HeadlessCheckoutError)) return false;
  const code = (error.code ?? "").toUpperCase();
  return code === "BUSINESS_PLAN_REQUIRED" || code === "ORIGIN_NOT_ALLOWED" || error.status === 401 || (error.status === 403 && !code.startsWith("WITHDRAWAL"));
}

export function friendlyError(error: unknown): string {
  if (error instanceof HeadlessCheckoutError) {
    if (error.status === 0) return "Couldn't reach the payment server. Check your connection and try again.";
    if (error.status === 409 && error.code === "withdrawal_consent_required") return "Please tick the consent box above to continue.";
    if (error.status >= 500) return "The payment server had a problem. Please try again in a moment.";
    return error.message || "Something went wrong. Please try again.";
  }
  if (error instanceof Error) {
    if (error.name === "AttributionRequiredError") return "Scroll down so the payment button is visible, then try again.";
    if (error.message === "Failed to fetch") return "Couldn't reach the payment server. Check your connection and try again.";
    return error.message;
  }
  return "Something went wrong. Please try again.";
}

export const PAID: CheckoutPaymentStatus[] = ["COMPLETED"];
export const FAILED: CheckoutPaymentStatus[] = ["FAILED", "VOIDED"];
export const WAITING: CheckoutPaymentStatus[] = ["PENDING", "PROCESSING", "AWAITING_CONFIRMATION", "UNDERPAID"];

/** Payment methods we can render. Customer Balance needs its own OTP flow, so it's left out for now. */
export function usableGateways(session: CheckoutSessionView): CheckoutGatewayOption[] {
  return session.gateways_available.filter(g => g.kind !== "balance");
}

export function gatewayGroup(g: CheckoutGatewayOption): "card" | "crypto" | "other" {
  const id = `${g.gateway} ${g.label}`.toLowerCase();
  if (g.kind === "address") return "crypto";
  if (/square|stripe|card|nmi|sumup/.test(id)) return "card";
  if (/crypto|bitcoin|btc|ltc|litecoin|solana|\bsol\b|usdt|usdc|ethereum|\beth\b|wallet/.test(id)) return "crypto";
  return "other";
}

/** The product's checkout fields (Server Invite Link, Discord Username, the agreement checkboxes…). */
export function fieldsForLine(session: CheckoutSessionView, lineIndex = 0): StorefrontCustomField[] {
  const line = session.line_items[lineIndex];
  return line ? normalizeStorefrontCustomFields(line.custom_fields_config) : [];
}

export function money(amount: string | number | null | undefined, currency: string) {
  const n = Number(amount ?? 0);
  if (!Number.isFinite(n)) return String(amount ?? "");
  // Per-unit prices like $0.015 (members) need a third decimal; everything else shows cents.
  const digits = n > 0 && n < 1 && Math.abs(Math.round(n * 100) - n * 100) > 1e-9 ? 3 : 2;
  try { return new Intl.NumberFormat("en-US", { style: "currency", currency: currency.toUpperCase(), minimumFractionDigits: 2, maximumFractionDigits: digits }).format(n); }
  catch { return `${n.toFixed(2)} ${currency}`; }
}

export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

/** Shoppex only allows payment while its badge is on screen — jump it into view first (no smooth scroll). */
export async function revealAttribution() {
  const el = document.querySelector<HTMLElement>(".co-attrib");
  if (!el) return;
  const r = el.getBoundingClientRect();
  if (r.top >= 0 && r.bottom <= window.innerHeight) return;
  el.scrollIntoView({ block: "center", behavior: "instant" as ScrollBehavior });
  await new Promise(res => requestAnimationFrame(() => requestAnimationFrame(res)));
}
