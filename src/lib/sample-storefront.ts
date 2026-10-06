import type { Product, Shop } from "@shoppexio/storefront";
import { shoppexConfig } from "@/lib/shoppex-config";

export const sampleShop: Shop = {
  id: "sample_shop",
  name: "GGBoosts (demo)",
  slug: "demo",
  description: "Demo catalog.",
  currency: "USD",
  cart_enabled: true,
  hide_out_of_stock: false,
  hide_stock_counter: false,
};

// Demo catalog shaped like the real one: one product per boost count,
// one variant per duration. Prices are placeholders, not real pricing.
const demoPrices: Record<number, [number, number, number, number]> = {
  8: [3.99, 9.99, 34.99, 49.99],
  14: [5.99, 15.99, 49.99, 79.99],
  20: [8.49, 21.99, 69.99, 109.99],
  30: [12.49, 32.99, 99.99, 149.99],
};
const durationLabels = ["1 Month", "3 Months", "1 Year", "Lifetime"];

export const sampleProducts: Product[] = Object.entries(demoPrices).map(([count, prices]) => ({
  uniqid: `demo_${count}_boosts`,
  title: `${count} Server Boosts`,
  slug: `${count}-server-boosts`,
  description: `${count} Discord server boosts. Demo product — prices are placeholders until the Shoppex store is live.`,
  price: String(prices[0]),
  price_display: String(prices[0]),
  currency: "USD",
  stock: -1,
  quantity_min: 1,
  quantity_max: 1,
  images: [],
  variants: durationLabels.map((title, i) => ({ id: `demo_${count}_${i}`, title, price: prices[i], stock: -1 })),
  product_highlights: [`Server Level ${Number(count) >= 14 ? 3 : 2}`, "Delivered to your server", "Warranty included"],
}));

export function isSampleStorefrontEnabled(): boolean {
  return shoppexConfig.sampleData.enabled;
}

export function getSampleProduct(slugOrId: string): Product | null {
  return sampleProducts.find((product) => (
    product.slug === slugOrId || product.uniqid === slugOrId
  )) ?? null;
}
