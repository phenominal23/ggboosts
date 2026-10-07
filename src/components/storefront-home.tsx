"use client";

import { ArrowRight, Check } from "lucide-react";
import { Gem } from "@/components/home/gem";
import { BoostFeed, CheckoutMock, PaymentMock } from "@/components/home/how-it-works-mocks";
import { Pricing } from "@/components/home/pricing";
import { ReviewsSection } from "@/components/home/reviews-section";
import { Comparison } from "@/components/home/comparison";
import { DiscordIcon, FaqSection, Footer, Nav, SiteBackground, useScrollReveal, useStorefront } from "@/components/home/site-chrome";
import { faqs, features, finalCta, hero, howItWorks, site, stats } from "@/lib/site-content";

export function StorefrontHome() {
  const { products, offers, demo, status, retry } = useStorefront();
  useScrollReveal(status);

  return (
    <main className="lb">
      <a className="skip-link" href="#pricing">Skip to pricing</a>
      <SiteBackground />
      <Nav />

      {/* HERO */}
      <section className="lb-hero">
        <a className="lb-pill lb-anim" href="#pricing" style={{ animationDelay: ".05s" }}><span className="lb-pill__check"><Check size={12} strokeWidth={3} /></span>{hero.pill}<ArrowRight size={14} /></a>
        <h1 className="lb-anim" style={{ animationDelay: ".15s" }}>{hero.titleTop}<br /><em>{hero.titleAccent}</em></h1>
        <p className="lb-hero__lead lb-anim" style={{ animationDelay: ".28s" }}><strong>{hero.lead}</strong><br />{hero.body}</p>
        <div className="lb-hero__actions lb-anim" style={{ animationDelay: ".4s" }}>
          <a className="lb-btn lb-btn--primary lb-btn--lg" href="#pricing">{hero.primaryCta} <ArrowRight size={17} /></a>
          <a className="lb-btn lb-btn--ghost lb-btn--lg" href={site.supportUrl} target="_blank" rel="noreferrer"><DiscordIcon /> {hero.secondaryCta}</a>
        </div>
        <dl className="lb-stats lb-anim" style={{ animationDelay: ".55s" }}>
          {stats.map(s => <div key={s.label}><dt>{s.label}</dt><dd>{s.value}</dd></div>)}
        </dl>
        <a className="lb-scroll" href="#features" aria-label="Scroll to features"><span /></a>
      </section>

      {/* FEATURES */}
      <section className="lb-section lb-features" id="features" data-nav-section>
        <div className="lb-features__copy" data-reveal>
          <span className="lb-eyebrow">{features.eyebrow}</span>
          <h2>{features.titleTop}<br /><em>{features.titleAccent}</em></h2>
          <p className="lb-sub">{features.body}</p>
          <ol className="lb-feature-list">
            {features.items.map((item, i) => (
              <li key={item.title}><span>0{i + 1}</span><div><h3>{item.title}</h3><p>{item.text}</p></div></li>
            ))}
          </ol>
          <div className="lb-row">
            <a className="lb-btn lb-btn--primary" href="#pricing">See Packages <ArrowRight size={16} /></a>
            <a className="lb-link" href={site.supportUrl} target="_blank" rel="noreferrer">Ask a question →</a>
          </div>
        </div>
        <div className="lb-features__art" data-reveal><Gem size={380} /></div>
      </section>

      {/* HOW IT WORKS */}
      <section className="lb-section" id="how-it-works">
        <header className="lb-head" data-reveal>
          <span className="lb-eyebrow">{howItWorks.eyebrow}</span>
          <h2>{howItWorks.titleBefore} <em>{site.name}</em> {howItWorks.titleAfter}</h2>
          <p>{howItWorks.body}</p>
        </header>
        <div className="lb-steps">
          {howItWorks.steps.map((step, i) => (
            <article key={step.title} className="lb-step" data-reveal style={{ transitionDelay: `${i * 0.1}s` }}>
              {i === 0 ? <CheckoutMock offers={offers} demo={demo} /> : i === 1 ? <PaymentMock /> : <BoostFeed />}
              <span className="lb-step__num">Step 0{i + 1}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      <Pricing products={products} offers={offers} status={status} demo={demo} onRetry={retry} />

      <ReviewsSection />

      {status === "ready" && <Comparison offers={offers} />}

      <FaqSection items={faqs} title={<>Frequently Asked <em>Questions</em></>} sub="Everything you need to know about delivery, safety, and support." />

      {/* FINAL CTA */}
      <section className="lb-final" data-reveal>
        <Gem size={150} />
        <h2>{finalCta.titleBefore} <em>{finalCta.titleAccent}</em></h2>
        <p>{finalCta.body}</p>
        <div className="lb-hero__actions">
          <a className="lb-btn lb-btn--primary lb-btn--lg" href="#pricing">{finalCta.cta} <ArrowRight size={17} /></a>
          <a className="lb-btn lb-btn--ghost lb-btn--lg" href={site.supportUrl} target="_blank" rel="noreferrer"><DiscordIcon /> Discord Support</a>
        </div>
      </section>

      <Footer />
    </main>
  );
}
