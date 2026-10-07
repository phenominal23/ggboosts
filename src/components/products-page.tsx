"use client";

import Link from "next/link";
import { Pricing } from "@/components/home/pricing";
import { CtaBanner, FaqSection, Footer, Nav, SiteBackground, useScrollReveal, useStorefront } from "@/components/home/site-chrome";
import { productsFaqs, productsPage } from "@/lib/site-content";

export function ProductsPage() {
  const { products, offers, demo, status, retry } = useStorefront();
  useScrollReveal(status);

  return (
    <main className="lb">
      <a className="skip-link" href="#pricing">Skip to products</a>
      <SiteBackground />
      <Nav active="products" />

      <header className="lb-page-head">
        <nav className="lb-crumbs lb-anim" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><span aria-current="page">Products</span></nav>
        <span className="lb-eyebrow lb-anim" style={{ animationDelay: ".05s" }}>{productsPage.eyebrow}</span>
        <h1 className="lb-anim" style={{ animationDelay: ".12s" }}>{productsPage.titleBefore} <em>{productsPage.titleAccent}</em></h1>
        <p className="lb-anim" style={{ animationDelay: ".2s" }}>{productsPage.body}</p>
      </header>

      <Pricing products={products} offers={offers} status={status} demo={demo} onRetry={retry} showHead={false} />

      <FaqSection id="products-faq" items={productsFaqs} title={<>Product <em>Questions</em></>} sub="Plans, warranty, delivery and payments." />

      <CtaBanner eyebrow="Get started" title={<>Your Server Deserves <em>Level 3.</em></>} body={productsPage.ctaBody} href="#pricing" />

      <Footer />
    </main>
  );
}
