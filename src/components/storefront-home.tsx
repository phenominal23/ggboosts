"use client";

import { ArrowRight, Check } from "lucide-react";
import { HowChat } from "@/components/home/how-chat";
import { LevelsSection } from "@/components/home/levels";
import { Pricing } from "@/components/home/pricing";
import { ReviewsSection } from "@/components/home/reviews-section";
import { ServerWindow } from "@/components/home/server-window";
import { DiscordIcon, FaqSection, Footer, Nav, SiteBackground, useScrollReveal, useStorefront } from "@/components/home/site-chrome";
import { faqs, finalCta, hero, site } from "@/lib/site-content";

export function StorefrontHome() {
  const { products, offers, demo, status, retry } = useStorefront();
  useScrollReveal(status);

  return (
    <main className="gs">
      <a className="skip-link" href="#pricing">Skip to pricing</a>
      <SiteBackground />
      <Nav />

      {/* HERO: copy on the left, a pretend Discord server levelling up on the right */}
      <section className="hero">
        <div className="hero__copy">
          <span className="hero__chip gs-anim" style={{ animationDelay: ".05s" }}><i />{hero.chip}</span>
          <h1 className="gs-anim" style={{ animationDelay: ".12s" }}>{hero.titleTop} <em>{hero.titleAccent}</em></h1>
          <p className="hero__lead gs-anim" style={{ animationDelay: ".22s" }}>{hero.lead}</p>
          <div className="hero__actions gs-anim" style={{ animationDelay: ".32s" }}>
            <a className="gs-btn gs-btn--primary gs-btn--lg" href="#pricing">{hero.primaryCta} <ArrowRight size={17} /></a>
            <a className="gs-btn gs-btn--ghost gs-btn--lg" href={site.supportUrl} target="_blank" rel="noreferrer"><DiscordIcon /> {hero.secondaryCta}</a>
          </div>
          <ul className="hero__trust gs-anim" style={{ animationDelay: ".42s" }}>
            {hero.trust.map(t => <li key={t}><Check size={14} strokeWidth={3} /> {t}</li>)}
          </ul>
        </div>
        <div className="hero__art gs-anim" style={{ animationDelay: ".3s" }}><ServerWindow /></div>
      </section>

      <LevelsSection />

      <HowChat />

      <Pricing products={products} offers={offers} status={status} demo={demo} onRetry={retry} />

      <ReviewsSection />

      <FaqSection items={faqs} title={<>Questions, <em>answered</em></>} sub="Everything you need to know about delivery, safety, and support." />

      {/* FINAL CTA: a Discord-style server invite */}
      <section className="invite" data-reveal>
        <div className="invite__copy">
          <h2>{finalCta.titleBefore} <em>{finalCta.titleAccent}</em></h2>
          <p>{finalCta.body}</p>
        </div>
        <div className="invite__card">
          <span className="invite__label">{finalCta.invite}</span>
          <div className="invite__row">
            <span className="invite__icon"><img src="/ggboosts-mark.svg" alt="" /></span>
            <div>
              <strong>{finalCta.server}</strong>
              <p><i className="invite__dot invite__dot--on" /> Level 3 <i className="invite__dot" /> 14 boosts</p>
            </div>
          </div>
          <a className="gs-btn gs-btn--primary invite__btn" href="#pricing">{finalCta.cta}</a>
          <a className="invite__help" href={site.supportUrl} target="_blank" rel="noreferrer"><DiscordIcon size={15} /> Questions? Ask in our Discord</a>
        </div>
      </section>

      <Footer />
    </main>
  );
}
