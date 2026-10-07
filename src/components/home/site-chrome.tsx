"use client";

// Shared pieces used by both the homepage and the Products page.
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Script from "next/script";
import type { Product } from "@shoppexio/storefront";
import { ArrowRight, Menu, Plus, X } from "lucide-react";
import { GGMark } from "@/components/gg-navigation";
import { Gem } from "@/components/home/gem";
import { PaymentLogo } from "@/components/home/payment-logos";
import { getVisibleReviews } from "@/components/home/reviews-section";
import { getBoostOffers } from "@/lib/boost-offers";
import { getCustomerPortalHref } from "@/lib/shoppex-config";
import { loadStorefrontData } from "@/lib/storefront-data";
import { paymentLogos, site } from "@/lib/site-content";

export function DiscordIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.3 4.4A19.6 19.6 0 0 0 15.4 3l-.6 1.3a18.2 18.2 0 0 0-5.5 0L8.7 3a19.5 19.5 0 0 0-4.9 1.5C.7 9.1-.2 13.6.3 18.1a19.8 19.8 0 0 0 6 3l1.3-2.1c-.7-.3-1.4-.6-2-1l.5-.4a14 14 0 0 0 11.9 0l.5.4c-.6.4-1.3.7-2 1l1.3 2.1a19.7 19.7 0 0 0 6-3c.6-5.2-.8-9.7-3.6-13.7ZM8.3 15.3c-1.2 0-2.2-1.1-2.2-2.4s1-2.4 2.2-2.4 2.2 1.1 2.2 2.4-1 2.4-2.2 2.4Zm7.4 0c-1.2 0-2.2-1.1-2.2-2.4s1-2.4 2.2-2.4 2.2 1.1 2.2 2.4-1 2.4-2.2 2.4Z" />
    </svg>
  );
}

// Loads Shoppex products (or demo data) once per page.
export function useStorefront() {
  const [products, setProducts] = useState<Product[]>([]);
  const [demo, setDemo] = useState(false);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    loadStorefrontData().then(result => {
      if (cancelled) return;
      if (!result.success) { setStatus("error"); return; }
      setProducts(result.products); setDemo(result.sample); setStatus("ready");
    }).catch(() => { if (!cancelled) setStatus("error"); });
    return () => { cancelled = true; };
  }, [attempt]);
  const offers = useMemo(() => getBoostOffers(products), [products]);
  const retry = useCallback(() => setAttempt(a => a + 1), []);
  return { products, offers, demo, status, retry };
}

// Fade/slide sections in as they scroll into view. Respects reduced-motion.
export function useScrollReveal(trigger: unknown) {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-visible)");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      els.forEach(el => el.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); }
    }), { threshold: 0.05 });
    els.forEach(el => { el.classList.add("will-reveal"); io.observe(el); });
    return () => io.disconnect();
  }, [trigger]);
}

// Shoppex checkout pop-up script — only needed when selling live products.
export function ShoppexEmbed({ enabled }: { enabled: boolean }) {
  return enabled ? <Script src="https://checkout.shoppex.io/embed/embed.iife.js" strategy="afterInteractive" /> : null;
}

export function SiteBackground() {
  return <div className="lb-bg" aria-hidden="true"><i className="lb-bg__a" /><i className="lb-bg__b" /><i className="lb-bg__grid" /></div>;
}

export function Nav({ active }: { active?: "products" }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 20);
    on(); window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  const showReviews = getVisibleReviews().list.length > 0;
  const links: { href: string; label: string; key?: string }[] = [
    { href: "/#features", label: "Features" },
    { href: "/products", label: "Products", key: "products" },
    ...(showReviews ? [{ href: "/#reviews", label: "Reviews" }] : []),
    { href: "/#faq", label: "FAQ" },
    { href: getCustomerPortalHref(), label: "My Orders" },
  ];
  return (
    <header className={`lb-nav ${scrolled ? "is-scrolled" : ""} ${open ? "is-open" : ""}`}>
      <Link className="lb-brand" href="/" aria-label={`${site.name} home`}><GGMark /><span>GG<b>Boosts</b></span></Link>
      <nav className="lb-nav__links" aria-label="Main">
        {links.map(l => <a key={l.label} href={l.href} className={l.key && l.key === active ? "is-active" : ""} aria-current={l.key && l.key === active ? "page" : undefined}>{l.label}</a>)}
      </nav>
      <a className="lb-btn lb-btn--discord lb-nav__cta" href={site.supportUrl} target="_blank" rel="noreferrer"><DiscordIcon size={16} /> Discord</a>
      <button className="lb-nav__toggle" type="button" aria-expanded={open} aria-controls="lb-mobile-nav" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen(!open)}>{open ? <X size={20} /> : <Menu size={20} />}</button>
      <nav id="lb-mobile-nav" className="lb-nav__mobile" hidden={!open} aria-label="Mobile">
        {links.map(l => <a key={l.label} href={l.href} onClick={() => setOpen(false)}>{l.label}</a>)}
        <a className="lb-btn lb-btn--discord" href={site.supportUrl} target="_blank" rel="noreferrer"><DiscordIcon size={16} /> Join our Discord</a>
      </nav>
    </header>
  );
}

export function FaqSection({ items, title, sub, id = "faq" }: { items: [string, string][]; title: React.ReactNode; sub?: string; id?: string }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section className="lb-section lb-faq" id={id} data-nav-section>
      <header className="lb-head" data-reveal>
        <span className="lb-eyebrow">FAQ</span>
        <h2>{title}</h2>
        {sub && <p>{sub}</p>}
      </header>
      <div className="lb-faq__list" data-reveal>
        {items.map(([q, a], i) => (
          <div key={q} className={`lb-faq__item ${open === i ? "is-open" : ""}`}>
            <h3><button type="button" id={`${id}-q-${i}`} aria-expanded={open === i} aria-controls={`${id}-a-${i}`} onClick={() => setOpen(open === i ? null : i)}>{q}<span className="lb-faq__icon"><Plus size={16} /></span></button></h3>
            <div className="lb-faq__answer" id={`${id}-a-${i}`} role="region" aria-labelledby={`${id}-q-${i}`}><div><p>{a}</p></div></div>
          </div>
        ))}
      </div>
      <p className="lb-faq__more" data-reveal>Still have questions? <a href={site.supportUrl} target="_blank" rel="noreferrer">Join our Discord →</a></p>
    </section>
  );
}

// Horizontal call-to-action card with the gem on the right (Products page).
export function CtaBanner({ eyebrow, title, body, href }: { eyebrow: string; title: React.ReactNode; body: string; href: string }) {
  return (
    <section className="lb-cta-banner" data-reveal>
      <div>
        <span className="lb-eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
        <p>{body}</p>
        <div className="lb-row">
          <a className="lb-btn lb-btn--primary" href={href}>Boost My Server <ArrowRight size={16} /></a>
          <a className="lb-btn lb-btn--ghost" href={site.supportUrl} target="_blank" rel="noreferrer"><DiscordIcon size={16} /> Discord Support</a>
        </div>
        <small>Not affiliated with or endorsed by Discord Inc. All trademarks belong to their respective owners.</small>
      </div>
      <Gem size={240} />
    </section>
  );
}

export function Footer() {
  return (
    <footer className="lb-footer">
      <div className="lb-pay-marquee" aria-label="Accepted payment methods">
        {/* 4 identical copies: wide enough for any screen, and the loop moves exactly one copy so the reset is invisible. */}
        <div className="lb-pay-marquee__track">{[0, 1, 2, 3].flatMap(copy => paymentLogos.map(p => <span key={`${copy}-${p}`} aria-hidden={copy > 0}><PaymentLogo name={p} /></span>))}</div>
      </div>
      <div className="lb-footer__grid">
        <div>
          <Link className="lb-brand" href="/"><GGMark /><span>GG<b>Boosts</b></span></Link>
          <p>Cheap Discord server boosts with automated delivery, no login required, and a warranty on every order.</p>
        </div>
        <nav aria-label="Shop"><h4>Shop</h4><Link href="/products">All Products</Link><Link href="/products">Lifetime Plans</Link><a href={getCustomerPortalHref()}>My Orders</a></nav>
        <nav aria-label="Help"><h4>Help</h4><a href="/#how-it-works">How It Works</a><a href="/#faq">FAQ</a><Link href="/products#products-faq">Product FAQ</Link></nav>
        <nav aria-label="Contact"><h4>Contact</h4><a href={site.supportUrl} target="_blank" rel="noreferrer">Discord Support</a></nav>
      </div>
      <div className="lb-footer__legal">
        <span>© {new Date().getFullYear()} {site.name}. All rights reserved.</span>
        <nav aria-label="Legal" className="lb-footer__legal-links"><Link href="/terms">Terms</Link><Link href="/privacy">Privacy</Link><Link href="/refund-policy">Refunds</Link></nav>
        <span>Not affiliated with or endorsed by Discord Inc.</span>
      </div>
    </footer>
  );
}
