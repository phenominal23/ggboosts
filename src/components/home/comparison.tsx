"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import type { BoostOffer } from "@/lib/boost-offers";
import { checkedOn, competitors } from "@/lib/competitors";
import { COUNTS, findOffer, money } from "@/lib/pricing-helpers";
import { getCurrency } from "@/lib/product-utils";
import { comparisonCopy, site } from "@/lib/site-content";

type Row = { name: string; price: number; ours: boolean };
type Column = { key: "month1" | "month3"; label: string; months: number };
const columns: Column[] = [{ key: "month1", label: "1 Month", months: 1 }, { key: "month3", label: "3 Months", months: 3 }];

// A column is only shown when we have our own price, at least one verified competitor
// price, and we are actually the cheapest. Anything else would be a misleading comparison.
function buildColumn(offers: BoostOffer[], count: number, column: Column): Row[] | null {
  const ours = findOffer(offers, count, column.months);
  // Competitor prices are in USD, so only compare USD-priced products.
  if (!ours || getCurrency(ours.product) !== "USD") return null;
  const others = competitors.flatMap(c => {
    const price = c.prices[count]?.[column.key];
    return typeof price === "number" ? [{ name: c.name, price, ours: false }] : [];
  });
  if (!others.length || others.some(o => o.price <= ours.price)) return null;
  return [{ name: site.name, price: ours.price, ours: true }, ...others.sort((a, b) => a.price - b.price)];
}

export function Comparison({ offers }: { offers: BoostOffer[] }) {
  const table = COUNTS.map(count => ({ count, cols: columns.map(col => ({ col, rows: buildColumn(offers, count, col) })).filter(c => c.rows) }))
    .filter(t => t.cols.length);
  const [picked, setPicked] = useState<number | null>(null);
  if (!table.length) {
    if (process.env.NODE_ENV === "production") return null;
    return <section className="lb-section"><p className="lb-demo-flag lb-demo-flag--block">Price comparison hidden: you need Shoppex prices that beat at least one verified competitor price in src/lib/competitors.ts. (Only visible in local development.)</p></section>;
  }
  const active = table.find(t => t.count === picked) ?? table.find(t => t.count === 14) ?? table[0];

  return (
    <section className="lb-section lb-compare" id="compare">
      <header className="lb-head" data-reveal>
        <span className="lb-eyebrow">{comparisonCopy.eyebrow}</span>
        <h2>{comparisonCopy.titleBefore} <em>{comparisonCopy.titleAccent}</em></h2>
        <p>{comparisonCopy.body}</p>
      </header>
      <div className="cmp" data-reveal>
        <div className="cmp__tabs" role="tablist" aria-label="Boost count">
          {table.map(t => <button key={t.count} type="button" role="tab" aria-selected={active.count === t.count} onClick={() => setPicked(t.count)}>{t.count}x</button>)}
        </div>
        <div className="cmp__cols" style={{ gridTemplateColumns: `repeat(${active.cols.length}, minmax(0, 1fr))` }}>
          {active.cols.map(({ col, rows }) => {
            const max = Math.max(...rows!.map(r => r.price));
            const ours = rows!.find(r => r.ours)!.price;
            return (
              <div key={col.key} className="cmp__col">
                <span className="cmp__label">{col.label}</span>
                {rows!.map(r => (
                  <div key={r.name} className={`cmp__row ${r.ours ? "is-ours" : ""}`}>
                    <div className="cmp__line">
                      <span className="cmp__name">{r.name}{r.ours ? <em>Best price</em> : <small>+{money(r.price - ours)} more</small>}</span>
                      <strong>{money(r.price)}</strong>
                    </div>
                    <div className="cmp__bar"><i style={{ width: `${(r.price / max) * 100}%` }} /></div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
        <p className="cmp__foot">Competitor prices checked {checkedOn} · Subject to change</p>
      </div>
      <div className="lb-center" data-reveal><a className="lb-btn lb-btn--primary" href="#pricing">See Packages <ArrowRight size={16} /></a></div>
    </section>
  );
}
