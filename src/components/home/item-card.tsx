"use client";

import { useState } from "react";
import Link from "next/link";
import type { Product } from "@shoppexio/storefront";
import { ArrowRight, Check, Gem, Minus, Plus, UserRound, Users } from "lucide-react";
import { type CategoryId, unitName, unitPrice } from "@/lib/catalog";
import { getCurrency, getProductHref, getQuantityBounds, getUnitPrice, isSoldOut } from "@/lib/product-utils";
import { money } from "@/lib/pricing-helpers";

const icons: Record<CategoryId, typeof Gem> = { boosts: Gem, nitro: Gem, accounts: UserRound, members: Users };

const perks: Record<CategoryId, string[]> = {
  boosts: [],
  nitro: ["Delivered to your email & dashboard", "Full access", "Discord support"],
  accounts: ["Full access — change email & password", "Delivered to your email & dashboard", "Discord support"],
  members: ["Delivered to your server invite", "Pick any amount in range", "Discord support"],
};

/** A product you buy by quantity: Nitro, accounts, members, reactions. */
export function ItemCard({ product, category, demo }: { product: Product; category: CategoryId; demo: boolean }) {
  const currency = getCurrency(product);
  const price = getUnitPrice(product);
  const { min, max } = getQuantityBounds(product);
  const top = max > 0 ? max : 9999;
  const step = min >= 100 ? 100 : 1;
  const bulk = min >= 100;
  const [qty, setQty] = useState(min);
  const soldOut = isSoldOut(product);
  const unit = unitName(product);
  const Icon = icons[category];
  const clamp = (n: number) => Math.min(top, Math.max(min, Math.round(n)));
  const total = price * qty;
  const href = demo ? getProductHref(product) : `/checkout?${new URLSearchParams({ product: product.uniqid, qty: String(qty) })}`;
  const single = min === 1 && max === 1;

  return (
    <article className={`lb-card lb-item ${soldOut ? "is-soldout" : ""}`}>
      <header>
        <span className="lb-card__icon"><Icon size={20} /></span>
        <div><h3>{product.title.replace(/\s+-\s+Full Access$/i, "")}</h3><span>{/full access/i.test(product.title) ? "Full Access" : bulk ? `${unitPrice(price, currency)} per ${unit.one}` : "Fast delivery"}</span></div>
      </header>

      <div className="lb-card__price">
        <strong><sup>$</sup>{money(single || !bulk ? price : total, currency).replace("$", "")}</strong>
        <span>{bulk ? `for ${qty.toLocaleString()} ${unit.many}` : single ? "One-time payment" : `per ${unit.one} · up to ${top} per order`}</span>
      </div>

      {!single && !soldOut && (
        <div className="lb-qty">
          <span className="lb-qty__label">Quantity</span>
          <div className="lb-qty__ctl">
            <button type="button" aria-label="Less" disabled={qty <= min} onClick={() => setQty(q => clamp(q - step))}><Minus size={15} /></button>
            <input type="number" inputMode="numeric" min={min} max={top} step={step} value={qty} aria-label={`Number of ${unit.many}`}
              onChange={e => setQty(Number(e.target.value) || min)} onBlur={() => setQty(q => clamp(q))} />
            <button type="button" aria-label="More" disabled={qty >= top} onClick={() => setQty(q => clamp(q + step))}><Plus size={15} /></button>
          </div>
          <small>Min {min.toLocaleString()} · Max {top.toLocaleString()}{!bulk && qty > 1 ? ` · Total ${money(total, currency)}` : ""}</small>
        </div>
      )}

      <ul>{perks[category].map(p => <li key={p}><Check size={14} /> {p}</li>)}</ul>

      {soldOut
        ? <button className="lb-btn lb-btn--primary" type="button" disabled>Sold out</button>
        : <Link className="lb-btn lb-btn--primary" href={href}>Buy now<ArrowRight size={16} /></Link>}
    </article>
  );
}
