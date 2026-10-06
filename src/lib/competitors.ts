// Competitor prices for the comparison table. Your own prices come from Shoppex automatically.
// Re-check these regularly and update `checkedOn` — stale comparisons are misleading.
// Leave a price as null if you haven't verified it; that row is skipped.
// A column only appears when your price is lower than every competitor listed for it.

export type CompetitorPrices = Record<number, { month1: number | null; month3: number | null }>;

export type Competitor = { name: string; prices: CompetitorPrices };

export const checkedOn = "October 2026";

export const competitors: Competitor[] = [
  {
    // Verified from quickboosts.gg on 2026-10-06 (1 Month packages listed but marked out of stock that day).
    name: "QuickBoosts",
    prices: {
      8: { month1: 5.99, month3: 11.99 },
      14: { month1: 9.99, month3: 20.99 },
      20: { month1: 14.99, month3: 29.99 },
      30: { month1: 21.99, month3: 44.99 },
    },
  },
  {
    // Verified from boostly.to on 2026-10-06. 3 Month prices weren't shown on the site — add them once checked.
    name: "Boostly",
    prices: {
      8: { month1: 5.0, month3: null },
      14: { month1: 9.0, month3: null },
      20: { month1: 14.0, month3: null },
      30: { month1: 21.0, month3: null },
    },
  },
];
