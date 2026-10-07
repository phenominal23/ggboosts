"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Check } from "lucide-react";
import { Pricing } from "@/components/home/pricing";
import { CtaBanner, FaqSection, Footer, Nav, SiteBackground, useScrollReveal, useStorefront } from "@/components/home/site-chrome";
import { GuideCard } from "@/components/seo/guide-card";
import { JsonLd } from "@/components/seo/json-ld";
import { categoryOf } from "@/lib/catalog";
import type { CategoryPage } from "@/lib/category-pages";
import { getGuide } from "@/lib/guides";
import { getCurrency, getUnitPrice, isSoldOut } from "@/lib/product-utils";
import { absolute } from "@/lib/seo";

export function CategoryLanding({ page }: { page: CategoryPage }) {
  const { products, offers, demo, status, retry } = useStorefront();
  useScrollReveal(status);
  const related = page.guides.map(getGuide).filter(g => g !== null);

  // Product structured data, built from the live catalog so prices always match what's on the page.
  const productLd = useMemo(() => demo ? [] : products.filter(p => categoryOf(p) === page.category).map(p => ({
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.title,
    image: absolute("/opengraph-image.png"),
    brand: { "@type": "Brand", name: "GGBoosts" },
    offers: {
      "@type": "Offer",
      price: getUnitPrice(p).toFixed(getUnitPrice(p) < 1 ? 3 : 2),
      priceCurrency: getCurrency(p),
      availability: isSoldOut(p) ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
      url: absolute(page.path),
    },
  })), [products, demo, page]);

  return (
    <main className="lb">
      <a className="skip-link" href="#pricing">Skip to prices</a>
      <SiteBackground />
      <Nav active="products" />
      {productLd.length > 0 && <JsonLd data={productLd} />}

      <header className="lb-page-head">
        <nav className="lb-crumbs lb-anim" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><Link href="/products">Products</Link><span>/</span><span aria-current="page">{page.crumb}</span></nav>
        <span className="lb-eyebrow lb-anim" style={{ animationDelay: ".05s" }}>{page.eyebrow}</span>
        <h1 className="lb-anim" style={{ animationDelay: ".12s" }}>{page.titleBefore} <em>{page.titleAccent}</em></h1>
        <p className="lb-anim" style={{ animationDelay: ".2s" }}>{page.body}</p>
      </header>

      <Pricing products={products} offers={offers} status={status} demo={demo} onRetry={retry} showHead={false} only={page.category} />

      <section className="lb-section lb-section--tight">
        <div className="cl-points" data-reveal>
          {page.points.map(pt => (
            <div key={pt.title} className="cl-point"><span><Check size={16} /></span><h2>{pt.title}</h2><p>{pt.text}</p></div>
          ))}
        </div>
        <div className="cl-steps" data-reveal>
          <h2>How to order</h2>
          <ol>{page.steps.map(s => <li key={s}>{s}</li>)}</ol>
        </div>
      </section>

      <FaqSection id="category-faq" items={page.faqs} title={<>{page.crumb} <em>Questions</em></>} />

      {related.length > 0 && (
        <section className="lb-section lb-section--tight">
          <header className="lb-head" data-reveal><span className="lb-eyebrow">Guides</span><h2>Helpful <em>reading</em></h2></header>
          <div className="gd-grid" data-reveal>{related.map(g => <GuideCard key={g.slug} guide={g} />)}</div>
        </section>
      )}

      <CtaBanner eyebrow="Get started" title={page.cta.title} body={page.cta.body} href="#pricing" label="See prices" />
      <Footer />
    </main>
  );
}
