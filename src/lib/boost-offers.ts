import type { Product } from "@shoppexio/storefront";
import { getBoostCount, getDuration } from "./boost-packages";
import { getProductOptions, getUnitPrice } from "./product-utils";

export type BoostOffer = { key: string; product: Product; variantId?: string; count: number; duration: number | null; price: number };

// Both product and option labels must agree when they specify the same dimension.
// Ambiguous or unmapped products remain accessible in the complete catalog.
export function getBoostOffers(products: Product[]): BoostOffer[] {
  return products.flatMap(product => {
    const options = getProductOptions(product);
    const candidates = options.length ? options : [{ id: undefined, title: "", price: undefined }];
    return candidates.flatMap(option => {
      const parentCount = getBoostCount(product.title);
      const optionCount = getBoostCount(option.title);
      const parentDuration = getDuration(product.title);
      const optionDuration = getDuration(option.title);
      if (parentCount !== null && optionCount !== null && parentCount !== optionCount) return [];
      if (parentDuration !== null && optionDuration !== null && parentDuration !== optionDuration) return [];
      const count = optionCount ?? parentCount;
      if (count === null) return [];
      // Do not turn a missing or malformed price into a fabricated $0 offer.
      const rawPrice = product.variants?.find(variant => variant.id === option.id)?.price
        ?? product.price_variants?.find(variant => variant.id === option.id)?.price
        ?? product.price_display ?? product.price;
      if (rawPrice === null || rawPrice === undefined || String(rawPrice).trim() === "" || !Number.isFinite(Number(rawPrice)) || Number(rawPrice) < 0) return [];
      return [{ key: `${product.uniqid}:${option.id ?? "default"}`, product, variantId: option.id, count, duration: optionDuration ?? parentDuration, price: getUnitPrice(product, option.id) }];
    });
  });
}
