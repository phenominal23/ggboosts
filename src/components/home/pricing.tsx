"use client";

import { useMemo, useState } from "react";
import type { Product } from "@shoppexio/storefront";
import { Check, Gem, RotateCw, Rocket, UserRound, Users } from "lucide-react";
import { CATEGORIES, type CategoryId, categoryOf, sortProducts } from "@/lib/catalog";
import { ItemCard } from "@/components/home/item-card";
import type { BoostOffer } from "@/lib/boost-offers";
import { formatDuration, getServerLevel, LIFETIME } from "@/lib/boost-packages";
import { COUNTS, DURATIONS, POPULAR, currencySymbol, findOffer, money, savingsFor } from "@/lib/pricing-helpers";
import { getCurrency } from "@/lib/product-utils";
import { pricing } from "@/lib/site-content";
import { BuyButton } from "@/components/home/buy-button";

type Status = "loading" | "ready" | "error";

function activeLabel(duration: number) {
  if (duration === LIFETIME) return "Active for life";
  if (duration === 1) return "Active for 30 days";
  if (duration === 3) return "Active for 90 days";
  return "Active for 1 year";
}

const tabIcons: Record<CategoryId, typeof Rocket> = { boosts: Rocket, nitro: Gem, accounts: UserRound, members: Users };

export function Pricing({ products = [], offers, status, demo, onRetry, showHead = true }: { products?: Product[]; offers: BoostOffer[]; status: Status; demo: boolean; onRetry: () => void; showHead?: boolean }) {
  const available = DURATIONS.filter(d => offers.some(o => o.duration === d));
  const [picked, setPicked] = useState<number | null>(null);
  const [tab, setTab] = useState<CategoryId>("boosts");
  const grouped = useMemo(() => {
    const map = new Map<CategoryId, Product[]>();
    for (const p of products) {
      const c = categoryOf(p);
      if (c && c !== "boosts") map.set(c, [...(map.get(c) ?? []), p]);
    }
    for (const [c, list] of map) map.set(c, sortProducts(list, c));
    return map;
  }, [products]);
  const tabs = CATEGORIES.filter(c => c.id === "boosts" || grouped.has(c.id));
  const current = tabs.some(t => t.id === tab) ? tab : "boosts";
  const duration = picked !== null && (status !== "ready" || available.includes(picked)) ? picked : available[0] ?? 1;

  return (
    <section className={`lb-section ${showHead ? "" : "lb-section--tight"}`} id="pricing" data-nav-section>
      {showHead ? (
      <header className="lb-head" data-reveal>
          <span className="lb-eyebrow">{pricing.eyebrow}</span>
          <h2>{pricing.titleBefore} <em>{pricing.titleAccent}</em></h2>
          <p>{pricing.body}</p>
          {demo && <span className="lb-demo-flag">Demo prices — connect your Shoppex store to show real pricing</span>}
        </header>
      ) : demo ? <div className="lb-center lb-center--flag"><span className="lb-demo-flag">Demo prices — connect your Shoppex store to show real pricing</span></div> : null}

      <div className="lb-cats" role="tablist" aria-label="Product category" data-reveal>
        {tabs.map(c => {
          const Icon = tabIcons[c.id];
          return <button key={c.id} type="button" role="tab" aria-selected={current === c.id} onClick={e => { setTab(c.id); e.currentTarget.scrollIntoView({ block: "nearest", inline: "nearest" }); }}><Icon size={16} /> {c.label}</button>;
        })}
      </div>

      {status === "error" ? (
        <div className="lb-error"><p>We couldn't load pricing right now.</p><button type="button" className="lb-btn lb-btn--ghost" onClick={onRetry}><RotateCw size={15} /> Try again</button></div>
      ) : current !== "boosts" ? (
        <div className="lb-items" key={current}>
          {(grouped.get(current) ?? []).map(p => <ItemCard key={p.uniqid} product={p} category={current} demo={demo} />)}
        </div>
      ) : (
        <div className="lb-pricing" data-reveal>
          <div className="lb-durations" role="tablist" aria-label="Plan length">
            {DURATIONS.map(d => {
              const save = savingsFor(offers, d);
              const enabled = status !== "ready" || available.includes(d);
              return (
                <button key={d} type="button" role="tab" aria-selected={duration === d} disabled={!enabled} onClick={() => setPicked(d)}>
                  <span>{formatDuration(d)}</span>
                  {save ? <small>Save {save}%</small> : d === LIFETIME && enabled && status === "ready" ? <small>Best deal</small> : null}
                </button>
              );
            })}
          </div>
          <div className="lb-cards" aria-busy={status === "loading"}>
            {COUNTS.map(count => {
              const offer = findOffer(offers, count, duration);
              return (
                <article key={`${count}-${duration}`} className={`lb-card ${count === POPULAR ? "is-popular" : ""}`}>
                  <header>
                    <span className="lb-card__icon"><Rocket size={20} /></span>
                    <div><h3>{count} Server Boosts</h3><span>{formatDuration(duration)}</span></div>
                  </header>
                  <div className="lb-card__price">
                    {status === "loading" ? <span className="lb-skeleton" /> : offer ? (
                      <><strong><sup>{currencySymbol(getCurrency(offer.product))}</sup>{money(offer.price, getCurrency(offer.product)).replace(currencySymbol(getCurrency(offer.product)), "").trim()}</strong><span>{money(offer.price / count, getCurrency(offer.product))}/boost</span></>
                    ) : <><strong className="is-muted">—</strong><span>Not available for this plan</span></>}
                  </div>
                  <ul>
                    <li><Check size={14} /> Server Level {getServerLevel(count)}</li>
                    <li><Check size={14} /> {activeLabel(duration)}</li>
                    <li><Check size={14} /> Automated delivery</li>
                    <li><Check size={14} /> Warranty coverage included</li>
                  </ul>
                  <BuyButton offer={status === "loading" ? undefined : offer} demo={demo} label={`Buy ${count} Boosts`} />
                </article>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
