"use client";

import { Fragment } from "react";
import type { CheckoutGatewayOption } from "@shoppexio/checkout-js/headless";
import { siAmericanexpress, siApplepay, siBitcoin, siCashapp, siEthereum, siGooglepay, siLitecoin, siMastercard, siSolana, siTether, siVisa, type SimpleIcon } from "simple-icons";
import { gatewayGroup } from "@/components/checkout/checkout-client";

// Small white "card" chips with real brand marks, like the ones on a payment terminal.
const chips: Record<string, { icon: SimpleIcon; bg?: string; fg?: string }> = {
  Visa: { icon: siVisa, fg: "#1a1f71" },
  Mastercard: { icon: siMastercard, fg: "#eb001b" },
  Amex: { icon: siAmericanexpress, bg: "#1f72cd", fg: "#ffffff" },
  "Apple Pay": { icon: siApplepay, bg: "#000000", fg: "#ffffff" },
  "Google Pay": { icon: siGooglepay, fg: "#3c4043" },
  "Cash App": { icon: siCashapp, bg: "#00d64f", fg: "#ffffff" },
};

export function BrandChip({ name }: { name: keyof typeof chips | string }) {
  const c = chips[name];
  if (!c) return null;
  return (
    <span className="co-chip" style={{ background: c.bg ?? "#ffffff", color: c.fg ?? `#${c.icon.hex}` }} title={name}>
      <svg viewBox="0 0 24 24" role="img" aria-label={name}><path d={c.icon.path} fill="currentColor" /></svg>
    </span>
  );
}

const coins: { name: string; icon: SimpleIcon; bg: string }[] = [
  { name: "Bitcoin", icon: siBitcoin, bg: "#f7931a" },
  { name: "Litecoin", icon: siLitecoin, bg: "#345d9d" },
  { name: "Solana", icon: siSolana, bg: "#1b1b24" },
  { name: "USDT", icon: siTether, bg: "#26a17b" },
];

export function CoinStack() {
  return (
    <span className="co-coins">
      {coins.map(c => (
        <span key={c.name} className="co-coin" style={{ background: c.bg }} title={c.name}>
          <svg viewBox="0 0 24 24" role="img" aria-label={c.name}><path d={c.icon.path} fill="#fff" /></svg>
        </span>
      ))}
    </span>
  );
}

export function AcceptedLogos() {
  return (
    <div className="co-accept">
      {["Visa", "Mastercard", "Amex", "Apple Pay", "Google Pay", "Cash App"].map(n => <BrandChip key={n} name={n} />)}
      <CoinStack />
    </div>
  );
}

/** Which coin a Shoppex crypto method is (Shoppex lists each coin as its own method). */
export function coinInfo(g: CheckoutGatewayOption): { name: string; icon: SimpleIcon | null; bg: string } {
  const id = `${g.gateway} ${g.label}`.toLowerCase();
  const net = id.match(/trc-?20|erc-?20|bep-?20|polygon|\bsol(ana)?\b|tron|arbitrum|base/)?.[0];
  const netLabel = net ? ` (${net.replace("-", "").toUpperCase().replace("SOLANA", "SOL")})` : "";
  if (/usdt|tether/.test(id)) return { name: `USDT${netLabel}`, icon: siTether, bg: "#26a17b" };
  if (/usdc/.test(id)) return { name: `USDC${netLabel}`, icon: null, bg: "#2775ca" };
  if (/btc|bitcoin/.test(id)) return { name: "Bitcoin", icon: siBitcoin, bg: "#f7931a" };
  if (/ltc|litecoin/.test(id)) return { name: "Litecoin", icon: siLitecoin, bg: "#345d9d" };
  if (/solana|\bsol\b/.test(id)) return { name: "Solana", icon: siSolana, bg: "#1b1b24" };
  if (/ethereum|\beth\b/.test(id)) return { name: "Ethereum", icon: siEthereum, bg: "#627eea" };
  return { name: g.presentation.button_label ?? g.label, icon: null, bg: "#3f3f46" };
}

export function CoinIcon({ g }: { g: CheckoutGatewayOption }) {
  const c = coinInfo(g);
  return (
    <span className="co-coin" style={{ background: c.bg }} aria-hidden="true">
      {c.icon ? <svg viewBox="0 0 24 24"><path d={c.icon.path} fill="#fff" /></svg> : <b>{c.name.slice(0, 1)}</b>}
    </span>
  );
}

/** Friendly name, subtitle and logos for a Shoppex payment method. */
export function methodInfo(g: CheckoutGatewayOption) {
  const id = `${g.gateway} ${g.label}`.toLowerCase();
  if (/cash ?app/.test(id)) return { title: "Cash App Pay", sub: "Pay from your Cash App balance", logos: <BrandChip name="Cash App" /> };
  const group = gatewayGroup(g);
  if (group === "card") return {
    title: "Card & digital wallets", sub: "Visa, Mastercard, Amex and more",
    logos: <span className="co-chips"><BrandChip name="Visa" /><BrandChip name="Mastercard" /><BrandChip name="Amex" /></span>,
  };
  if (group === "crypto") return { title: "Cryptocurrency", sub: "Bitcoin, Litecoin, Solana and more", logos: <CoinStack /> };
  return { title: g.presentation.button_label ?? g.label, sub: "", logos: g.presentation.icon_url ? <img src={g.presentation.icon_url} alt="" width={28} height={28} /> : null };
}

// Show checkbox labels cleanly: drop raw URLs and link the policy names to our own pages.
const URL_RE = /\(?\s*(?:https?:\/\/)?(?:www\.)?(?:[\w-]+\.)+(?:com|app|io|gg|net|org)(?:\/[\w\-/]*)?\s*\)?/g;
const POLICIES: [RegExp, string][] = [[/terms of service|terms/i, "/terms"], [/refund policy/i, "/refund-policy"], [/privacy policy/i, "/privacy"]];
export function policyLabel(text: string) {
  const clean = text.replace(URL_RE, "").replace(/\s+([.,])/g, "$1").replace(/\s{2,}/g, " ").trim();
  for (const [re, href] of POLICIES) {
    const m = clean.match(re);
    if (m && m.index !== undefined) {
      return <>{clean.slice(0, m.index)}<a href={href} target="_blank" rel="noreferrer">{m[0]}</a>{clean.slice(m.index + m[0].length)}</>;
    }
  }
  return <Fragment>{clean}</Fragment>;
}
