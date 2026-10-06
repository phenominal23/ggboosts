"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Menu, ShoppingBag, X } from "lucide-react";
import { getCustomerPortalHref } from "@/lib/shoppex-config";

export function GGMark() {
  return <span className="gg-mark" aria-hidden="true"><img src="/ggboosts-mark.svg" alt="" width={36} height={36} /></span>;
}

export function GGNavigation({ quantity = 0, onCart, home = false }: { quantity?: number; onCart?: () => void; home?: boolean }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("");
  useEffect(() => {
    if (!home) return;
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id);
    }, { rootMargin: "-15% 0px -55% 0px", threshold: 0 });
    document.querySelectorAll("[data-nav-section]").forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [home]);
  useEffect(() => {
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);
  return <header className={`gg-nav ${open ? "menu-open" : ""}`}>
    <Link className="gg-brand" href="/" aria-label="GGBoosts home"><GGMark /><strong>GG<span>Boosts</span></strong></Link>
    <nav className="gg-nav-links" aria-label="Main navigation">{[["pricing", "Pricing"], ["features", "Features"], ["how-it-works", "How it works"], ["faq", "FAQ"]].map(([id, label]) => <a key={id} className={active === id ? "active" : ""} aria-current={active === id ? "location" : undefined} href={`${home ? "" : "/"}#${id}`}>{label}</a>)}</nav>
    <div className="gg-nav-actions"><a className="portal-link" href={getCustomerPortalHref()}>My orders <ArrowUpRight size={13}/></a>{onCart ? <button className="gg-cart-button" type="button" onClick={onCart} aria-label={`Open cart, ${quantity} items`}><ShoppingBag size={17}/><span>{quantity}</span></button> : <Link className="gg-cart-button" href="/checkout" aria-label="Checkout"><ShoppingBag size={17}/></Link>}<button className="gg-menu-button" type="button" aria-expanded={open} aria-controls="gg-mobile-menu" aria-label={open ? "Close navigation" : "Open navigation"} onClick={() => setOpen(!open)}>{open ? <X/> : <Menu/>}</button></div>
    <nav id="gg-mobile-menu" className="gg-mobile-menu" aria-label="Mobile navigation" hidden={!open}>{[["pricing", "Pricing"], ["features", "Features"], ["how-it-works", "How it works"], ["faq", "FAQ"]].map(([id, label], i) => <a key={id} href={`${home ? "" : "/"}#${id}`} onClick={() => setOpen(false)}><small>0{i+1}</small>{label}<ArrowUpRight size={18}/></a>)}<a href={getCustomerPortalHref()}>Customer portal <ArrowUpRight size={18}/></a></nav>
  </header>;
}
