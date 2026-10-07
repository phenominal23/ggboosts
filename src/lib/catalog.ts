import type { Product } from "@shoppexio/storefront";

// Groups the Shoppex catalog into the tabs on the pricing section. Matching is by product title,
// so keep titles like "2016 Account - Full Access", "Online Members", "Discord Nitro - 3 Months".
export type CategoryId = "boosts" | "nitro" | "accounts" | "members";

export const CATEGORIES: { id: CategoryId; label: string }[] = [
  { id: "boosts", label: "Server Boosts" },
  { id: "nitro", label: "Nitro" },
  { id: "accounts", label: "Accounts" },
  { id: "members", label: "Members" },
];

export function categoryOf(product: Product): CategoryId | null {
  return categoryOfTitle(product.title);
}

export function categoryOfTitle(title: string): CategoryId | null {
  const t = title.toLowerCase();
  if (/\bboosts?\b/.test(t)) return "boosts";
  if (/\bnitro\b/.test(t) && /\baccounts?\b/.test(t)) return "accounts"; // e.g. "3 Month Nitro Account"
  if (/\bnitro\b/.test(t)) return "nitro";
  if (/\baccounts?\b/.test(t)) return "accounts";
  if (/\bmembers?\b|\breactions?\b/.test(t)) return "members";
  return null;
}

/** "member" / "reaction" / "account" — what one unit of quantity is called. */
export function unitName(product: Product): { one: string; many: string } {
  const t = product.title.toLowerCase();
  if (/members?\b/.test(t)) return { one: "member", many: "members" };
  if (/reactions?\b/.test(t)) return { one: "reaction", many: "reactions" };
  if (/accounts?\b/.test(t)) return { one: "account", many: "accounts" };
  return { one: "item", many: "items" };
}

/** Sort: accounts oldest first (most valuable); members online → offline → reactions; others by price. */
export function sortProducts(list: Product[], category: CategoryId): Product[] {
  const t = (p: Product) => p.title.toLowerCase();
  // Accounts: Nitro accounts first, then oldest year first (most valuable).
  const accountRank = (p: Product) => (t(p).includes("nitro") ? 0 : Number(p.title.match(/\b(20\d\d)\b/)?.[1] ?? 9999));
  // Members: offline → online → NFT → reactions.
  const memberRank = (p: Product) => (t(p).includes("nft") ? 2 : t(p).includes("offline") ? 0 : t(p).includes("online") ? 1 : t(p).includes("member") ? 3 : 4);
  return [...list].sort((a, b) =>
    category === "accounts" ? accountRank(a) - accountRank(b)
      : category === "members" ? memberRank(a) - memberRank(b)
        : Number(b.price ?? 0) - Number(a.price ?? 0));
}

/** The one card per tab that gets the highlighted "Most popular" look. */
export function isFeatured(product: Product): boolean {
  return /^online members$/i.test(product.title.trim());
}

/** Unit prices under a dollar can have fractions of a cent ($0.015), so show up to 3 decimals. */
export function unitPrice(value: number, currency = "USD") {
  const digits = value > 0 && value < 1 && Math.round(value * 100) !== value * 100 ? 3 : 2;
  return new Intl.NumberFormat("en-US", { style: "currency", currency, minimumFractionDigits: 2, maximumFractionDigits: digits }).format(value);
}

