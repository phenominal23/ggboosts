"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { BoostOffer } from "@/lib/boost-offers";
import { getProductHref, isSoldOut } from "@/lib/product-utils";
import { shoppexConfig } from "@/lib/shoppex-config";

// Where Shoppex's "Return to store" sends buyers after paying: their orders on our own site.
const RETURN_URL = `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://ggboosts.com"}/dashboard`;

// Live mode: opens the Shoppex checkout pop-up (Embed SDK binds to the data attributes).
// Demo mode: demo products don't exist in Shoppex, so link to the local product page.
export function BuyButton({ offer, demo, label, className = "lb-btn lb-btn--primary" }: { offer?: BoostOffer; demo: boolean; label: string; className?: string }) {
  if (!offer) return <button className={className} type="button" disabled>Unavailable</button>;
  if (isSoldOut(offer.product, offer.variantId)) return <button className={className} type="button" disabled>Sold out</button>;
  if (demo) {
    const href = `${getProductHref(offer.product)}${offer.variantId ? `?variant=${encodeURIComponent(offer.variantId)}` : ""}`;
    return <Link className={className} href={href}>{label}<ArrowRight size={16} /></Link>;
  }
  const isProductVariant = offer.product.variants?.some(v => v.id === offer.variantId);
  const variantAttr = offer.variantId ? { [isProductVariant ? "data-shoppex-variant-id" : "data-shoppex-price-variant-id"]: offer.variantId } : {};
  return (
    <button
      className={className}
      type="button"
      data-shoppex-shop-id={shoppexConfig.shopSlug}
      data-shoppex-product-id={offer.product.uniqid}
      data-shoppex-theme="dark"
      data-shoppex-return-url={RETURN_URL}
      {...variantAttr}
    >
      {label}<ArrowRight size={16} />
    </button>
  );
}
