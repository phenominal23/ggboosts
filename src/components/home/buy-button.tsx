"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { BoostOffer } from "@/lib/boost-offers";
import { getProductHref, isSoldOut } from "@/lib/product-utils";

// Live mode: go to our own /checkout page for this plan.
// Demo mode: demo products don't exist in Shoppex, so link to the local product page.
export function BuyButton({ offer, demo, label, className = "lb-btn lb-btn--primary" }: { offer?: BoostOffer; demo: boolean; label: string; className?: string }) {
  if (!offer) return <button className={className} type="button" disabled>Unavailable</button>;
  if (isSoldOut(offer.product, offer.variantId)) return <button className={className} type="button" disabled>Sold out</button>;
  if (demo) {
    const href = `${getProductHref(offer.product)}${offer.variantId ? `?variant=${encodeURIComponent(offer.variantId)}` : ""}`;
    return <Link className={className} href={href}>{label}<ArrowRight size={16} /></Link>;
  }
  const q = new URLSearchParams({ product: offer.product.uniqid });
  if (offer.variantId) {
    q.set("variant", offer.variantId);
    // Tells the fallback pop-up which kind of variant this is.
    if (!offer.product.variants?.some(v => v.id === offer.variantId)) q.set("vt", "p");
  }
  return <Link className={className} href={`/checkout?${q.toString()}`}>{label}<ArrowRight size={16} /></Link>;
}
