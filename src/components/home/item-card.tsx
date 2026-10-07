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
  nitro: ["Full access", "Delivered to your email & dashboard", "Discord support"],
  accounts: ["Full access — change email & password", "Delivered to your email & dashboard", "Discord support"],
  members: ["Pick any amount at checkout", "No Discord login needed", "Discord support"],
};

/** Nitro, accounts, members, reactions. Shows the unit price — the amount is picked at checkout. */
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
  const symbol = formatted.replace(/[\d.,\s]/g, "");

  return (
    <article className={`lb-card lb-item ${soldOut ? "is-soldout" : ""} ${featured ? "is-popular" : ""}`}>
      {featured && <span className="lb-item__badge">Most popular</span>}
      <header>
        <span className="lb-card__icon"><Icon size={20} /></span>
        <div><h3>{title}</h3>{sub && <span>{sub}</span>}</div>
      </header>

      <div className="lb-card__price">
        <strong><sup>{symbol}</sup>{formatted.replace(symbol, "")}</strong>
        <span>per {unit.one}</span>
      </div>

      <ul>{perks.map(p => <li key={p}><Check size={14} /> {p}</li>)}</ul>

      {soldOut
        ? <button className="lb-btn lb-btn--primary" type="button" disabled>Sold out</button>
        : <Link className="lb-btn lb-btn--primary" href={href}>Buy now<ArrowRight size={16} /></Link>}
    </article>
  );
}
