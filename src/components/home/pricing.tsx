"use client";

import { useMemo, useState } from "react";
import type { Product } from "@shoppexio/storefront";
import { Check, Gem, Hash, RotateCw, Rocket, UserRound, Users } from "lucide-react";
import { CATEGORIES, type CategoryId, categoryOf, sortProducts } from "@/lib/catalog";
import { ItemCard } from "@/components/home/item-card";
import type { BoostOffer } from "@/lib/boost-offers";
import { formatDuration, getServerLevel, LIFETIME } from "@/lib/boost-packages";
import { COUNTS, DURATIONS, POPULAR, findOffer, money, savingsFor } from "@/lib/pricing-helpers";
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

export function Pricing({ products = [], offers, status, demo, onRetry, showHead = true, only }: { products?: Product[]; only?: CategoryId; offers: BoostOffer[]; status: Status; demo: boolean; onRetry: () => void; showHead?: boolean }) {
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
  const current = only ?? (tabs.some(t => t.id === tab) ? tab : "boosts");
  const duration = picked !== null && (status !== "ready" || available.includes(picked)) ? picked : available[0] ?? 1;

  const channel = (id: CategoryId) => (id === "boosts" ? "server-boosts" : id);
  const blurb: Record<CategoryId, string> = {
    boosts: "Pick a plan length, then a package. 14 boosts = Level 3.",
    members: "Online and offline members, plus message reactions.",
    nitro: "Nitro plans and boost-ready Nitro tokens.",
    accounts: "Aged accounts with full access.",
  };

  return (
    <section className={`gs-section ${showHead ? "" : "gs-section--tight"}`} id="pricing" data-nav-section>
      {showHead ? (
        <header className="gs-head gs-head--left" data-reveal>
          <span className="gs-eyebrow">{pricing.eyebrow}</span>
          <h2>{pricing.titleBefore} <em>{pricing.titleAccent}</em></h2>
          <p>{pricing.body}</p>
          {demo && <span className="gs-demo-flag">Demo prices — connect your Shoppex store to show real pricing</span>}
        </header>
      ) : demo ? <div className="gs-center gs-center--flag"><span className="gs-demo-flag">Demo prices — connect your Shoppex store to show real pricing</span></div> : null}

      <div className={`shop ${only ? "shop--solo" : ""}`} data-reveal>
        {!only && (
          <div className="shop__side" role="tablist" aria-label="Product category" aria-orientation="vertical">
            <span className="shop__label">Shop</span>
            {tabs.map(c => {
              const Icon = tabIcons[c.id];
              return (
                <button key={c.id} type="button" role="tab" aria-selected={current === c.id} onClick={() => setTab(c.id)}>
                  <Hash size={16} className="shop__hash" /><span>{channel(c.id)}</span><Icon size={15} className="shop__ico" />
                </button>
              );
            })}
          </div>
        )}

        <div className="shop__main">
          <div className="shop__top">
            <div className="shop__title"><Hash size={18} /><strong>{channel(current)}</strong><span>{blurb[current]}</span></div>
            {current === "boosts" && status !== "error" && (
              <div className="shop__plans" role="tablist" aria-label="Plan length">
                {DURATIONS.map(d => {
                  const save = savingsFor(offers, d);
                  const enabled = status !== "ready" || available.includes(d);
                  return (
                    <button key={d} type="button" role="tab" aria-selected={duration === d} disabled={!enabled} onClick={() => setPicked(d)}>
                      {formatDuration(d)}
                      {save ? <small>-{save}%</small> : d === LIFETIME && enabled && status === "ready" ? <small>Best</small> : null}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {status === "error" ? (
            <div className="gs-error"><p>We couldn't load pricing right now.</p><button type="button" className="gs-btn gs-btn--ghost" onClick={onRetry}><RotateCw size={15} /> Try again</button></div>
          ) : current !== "boosts" ? (
            <div className="gs-items" key={current} aria-busy={status === "loading"}>
              {status === "loading" ? [0, 1, 2].map(i => <div key={i} className="gs-card gs-item"><span className="gs-skeleton" /></div>)
                : (grouped.get(current) ?? []).map(p => <ItemCard key={p.uniqid} product={p} category={current} demo={demo} />)}
              {status === "ready" && !grouped.get(current)?.length && <p className="gs-error">Nothing here right now — check back soon or ask in our Discord.</p>}
            </div>
          ) : (
            <div className="br-list" aria-busy={status === "loading"}>
              {COUNTS.map(count => {
                const offer = findOffer(offers, count, duration);
                const cur = offer ? getCurrency(offer.product) : "USD";
                return (
                  <article key={`${count}-${duration}`} className={`br ${count === POPULAR ? "is-popular" : ""}`}>
                    <span className="br__icon"><Rocket size={20} /></span>
                    <div className="br__info">
                      <h3>{count} Server Boosts {count === POPULAR && <span className="br__tag">Most popular</span>}</h3>
                      <p><span className="br__lv">Level {getServerLevel(count)}</span><span>{activeLabel(duration)}</span><span><Check size={13} /> Warranty</span></p>
                    </div>
                    <div className="br__price">
                      {status === "loading" ? <span className="gs-skeleton" /> : offer ? (
                        <><strong>{money(offer.price, cur)}</strong><small>{money(offer.price / count, cur)}/boost</small></>
                      ) : <><strong className="is-muted">—</strong><small>Not available</small></>}
                    </div>
                    <BuyButton offer={status === "loading" ? undefined : offer} demo={demo} label="Buy" className="gs-btn gs-btn--primary br__buy" />
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
