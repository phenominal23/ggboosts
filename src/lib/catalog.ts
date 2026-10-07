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
  const year = (p: Product) => Number(p.title.match(/\b(20\d\d)\b/)?.[1] ?? 9999);
  const rank = (p: Product) => { const t = p.title.toLowerCase(); return t.includes("online") ? 0 : t.includes("offline") ? 1 : t.includes("member") ? 2 : 3; };
  return [...list].sort((a, b) =>
    category === "accounts" ? year(a) - year(b)
      : category === "members" ? rank(a) - rank(b)
        : Number(b.price ?? 0) - Number(a.price ?? 0));
}

/** Unit prices under a dollar can have fractions of a cent ($0.015), so show up to 3 decimals. */
export function unitPrice(value: number, currency = "USD") {
  const digits = value > 0 && value < 1 && Math.round(value * 100) !== value * 100 ? 3 : 2;
  return new Intl.NumberFormat("en-US", { style: "currency", currency, minimumFractionDigits: 2, maximumFractionDigits: digits }).format(value);
}

