import type { BoostOffer } from "@/lib/boost-offers";
import { LIFETIME } from "@/lib/boost-packages";

export const COUNTS = [8, 14, 20, 30];
export const DURATIONS = [1, 3, 12, LIFETIME];
export const POPULAR = 14;

export function money(value: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(value);
}

export function currencySymbol(currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).formatToParts(0).find(p => p.type === "currency")?.value ?? "$";
}

export function findOffer(offers: BoostOffer[], count: number, duration: number) {
  return offers.find(o => o.count === count && o.duration === duration);
}

// Savings of a longer plan vs. buying the 1-month plan repeatedly, averaged across counts.
export function savingsFor(offers: BoostOffer[], duration: number): number | null {
  if (duration === 1 || duration === LIFETIME) return null;
  const ratios = COUNTS.flatMap(count => {
    const monthly = findOffer(offers, count, 1);
    const longer = findOffer(offers, count, duration);
    if (!monthly || !longer || monthly.price <= 0) return [];
    return [1 - longer.price / (monthly.price * duration)];
  });
  if (!ratios.length) return null;
  const pct = Math.round((ratios.reduce((a, b) => a + b, 0) / ratios.length) * 100);
  return pct > 0 ? pct : null;
}
