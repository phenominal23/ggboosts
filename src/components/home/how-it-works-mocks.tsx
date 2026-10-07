"use client";

import { useEffect, useRef, useState } from "react";
import { useAnimationGate } from "@/components/home/use-animation-gate";
import { Bitcoin, Check, ChevronDown, CreditCard, DollarSign, Minus, Plus } from "lucide-react";
import type { BoostOffer } from "@/lib/boost-offers";
import { formatDuration } from "@/lib/boost-packages";
import { COUNTS, DURATIONS, findOffer, money } from "@/lib/pricing-helpers";
import { getCurrency } from "@/lib/product-utils";
import { paymentOptions, site } from "@/lib/site-content";
import { BuyButton } from "@/components/home/buy-button";

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const q = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(q.matches);
    const on = () => setReduced(q.matches);
    q.addEventListener("change", on);
    return () => q.removeEventListener("change", on);
  }, []);
  return reduced;
}

export function CheckoutMock({ offers, demo }: { offers: BoostOffer[]; demo: boolean }) {
  const [countIdx, setCountIdx] = useState(2);
  const [duration, setDuration] = useState(3);
  const count = COUNTS[countIdx];
  const offer = findOffer(offers, count, duration);
  return (
    <div className="mock mock--checkout">
      <strong className="mock__title">Checkout</strong>
      <div className="mock__crumbs"><span>Select Plan</span> › Payment</div>
      <div className="mock__row mock__stepper">
        <button type="button" aria-label="Fewer boosts" onClick={() => setCountIdx(i => Math.max(0, i - 1))} disabled={countIdx === 0}><Minus size={14} /></button>
        <output aria-live="polite">{count}</output>
        <button type="button" aria-label="More boosts" onClick={() => setCountIdx(i => Math.min(COUNTS.length - 1, i + 1))} disabled={countIdx === COUNTS.length - 1}><Plus size={14} /></button>
        <span>Server Boosts</span>
      </div>
      <label className="mock__row mock__select">
        <span>Duration</span>
        <strong>{formatDuration(duration)} <ChevronDown size={14} /></strong>
        <select aria-label="Duration" value={duration} onChange={e => setDuration(Number(e.target.value))}>
          {DURATIONS.map(d => <option key={d} value={d}>{formatDuration(d)}</option>)}
        </select>
      </label>
      <div className="mock__subtotal"><span>Subtotal</span><strong>{offer ? money(offer.price, getCurrency(offer.product)) : "—"}</strong></div>
      <BuyButton offer={offer} demo={demo} label="Checkout" className="lb-btn lb-btn--primary lb-btn--sm" />
    </div>
  );
}

const payIcons = { card: CreditCard, cashapp: DollarSign, crypto: Bitcoin } as Record<string, typeof CreditCard>;

export function PaymentMock() {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const active = useAnimationGate(ref);
  const [selected, setSelected] = useState(0);
  const [manual, setManual] = useState(false);
  useEffect(() => {
    if (reduced || manual || !active) return;
    const t = window.setInterval(() => setSelected(s => (s + 1) % paymentOptions.length), 2600);
    return () => window.clearInterval(t);
  }, [reduced, manual, active]);
  return (
    <div ref={ref} className="mock mock--pay" role="radiogroup" aria-label="Payment method preview">
      {paymentOptions.map((option, i) => {
        const Icon = payIcons[option.id] ?? CreditCard;
        return (
          <button key={option.id} type="button" role="radio" aria-checked={selected === i} className={`pay-option pay-option--${option.id} ${selected === i ? "is-selected" : ""}`} onClick={() => { setSelected(i); setManual(true); }}>
            <span className="pay-option__icon"><Icon size={20} /></span>
            <span className="pay-option__text">
              <strong>{option.label}</strong>
              {option.chips.length > 0 && <span className="pay-option__chips">{option.chips.map(c => <i key={c}>{c}</i>)}</span>}
            </span>
            <span className="pay-option__radio">{selected === i && <Check size={13} strokeWidth={3} />}</span>
          </button>
        );
      })}
    </div>
  );
}

const feedEvents = ["has landed.", "just arrived.", "has boosted the server!", "has boosted the server!", "has boosted the server!", "has boosted the server!", "has boosted the server!", "has boosted the server!", "has boosted the server!", "has boosted the server!", "has boosted the server!"];

function clock(offsetMin: number) {
  const d = new Date(Date.now() + offsetMin * 60000);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export function BoostFeed() {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const active = useAnimationGate(ref);
  const [shown, setShown] = useState(feedEvents.length);
  const [times, setTimes] = useState<string[]>([]);
  useEffect(() => { setTimes(feedEvents.map((_, i) => clock(Math.floor(i / 3)))); }, []);
  useEffect(() => {
    if (reduced) { setShown(feedEvents.length); return; }
    if (!active) return; // paused: keep whatever is showing
    const t = window.setInterval(() => setShown(n => (n >= feedEvents.length + 4 ? 0 : n + 1)), 650);
    return () => window.clearInterval(t);
  }, [reduced, active]);
  return (
    <div ref={ref} className="mock mock--feed" aria-label="Example of boosts arriving in a Discord server">
      <ul>
        {feedEvents.slice(0, Math.min(shown, feedEvents.length)).map((event, i) => (
          <li key={i}><span className="feed__arrow">→</span><b>{site.name}</b> {event}<time>{times[i] ?? ""}</time></li>
        ))}
      </ul>
    </div>
  );
}
