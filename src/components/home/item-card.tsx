"use client";

import Link from "next/link";
import type { Product } from "@shoppexio/storefront";
import { ArrowRight, Check, Gem, UserRound, Users } from "lucide-react";
import { type CategoryId, isFeatured, unitName, unitPrice } from "@/lib/catalog";
import { getCurrency, getProductHref, getUnitPrice, isSoldOut } from "@/lib/product-utils";

const icons: Record<CategoryId, typeof Gem> = { boosts: Gem, nitro: Gem, accounts: UserRound, members: Users };

// Used only when a product has no "Product Highlights" filled in on Shoppex.
const fallbackPerks: Record<CategoryId, string[]> = {
  boosts: [],
  nitro: ["Full Nitro perks", "2 server boosts included", "Delivered to your email & dashboard"],
  accounts: ["Full access — change email & password", "Delivered to your email & dashboard", "Discord support"],
  members: ["Pick any amount at checkout", "No Discord login needed", "Discord support"],
};

/** Nitro, accounts, members, reactions as a row, same layout as the boost packages. Amount is picked at checkout. */
export function ItemCard({ product, category, demo }: { product: Product; category: CategoryId; demo: boolean }) {
  const currency = getCurrency(product);
  const price = getUnitPrice(product);
  const soldOut = isSoldOut(product);
  const featured = !soldOut && isFeatured(product);
  const unit = unitName(product);
  const Icon = icons[category];
  const highlights = (product.product_highlights ?? []).map(h => h.trim()).filter(Boolean);
  const perks = (highlights.length ? highlights : fallbackPerks[category]).slice(0, 5);
  const href = demo ? getProductHref(product) : `/checkout?${new URLSearchParams({ product: product.uniqid })}`;
  const title = product.title.replace(/\s+-\s+Full Access$/i, "");
  const sub = /full access/i.test(product.title) ? "Full Access" : product.short_description?.trim() || null;
  const formatted = unitPrice(price, currency);

  return (
    <article className={`br br--item ${soldOut ? "is-soldout" : ""} ${featured ? "is-popular" : ""}`}>
      <span className="br__icon"><Icon size={20} /></span>
      <div className="br__info">
        <h3>{title} {featured && <span className="br__tag">Most popular</span>}{sub && <span className="br__sub">{sub}</span>}</h3>
        <p>{perks.slice(0, 3).map(p => <span key={p}><Check size={13} /> {p}</span>)}</p>
      </div>
      <div className="br__price">
        <strong>{formatted}</strong>
        <small>{unit.one === "plan" ? "one-time" : `per ${unit.one}`}</small>
      </div>
      {soldOut
        ? <button className="gs-btn gs-btn--primary br__buy" type="button" disabled>Sold out</button>
        : <Link className="gs-btn gs-btn--primary br__buy" href={href}>Buy <ArrowRight size={15} /></Link>}
    </article>
  );
}
