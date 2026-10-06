"use client";

import Link from "next/link";
import { Footer, Nav, SiteBackground } from "@/components/home/site-chrome";
import { legal } from "@/lib/site-content";

export function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="lb">
      <SiteBackground />
      <Nav />
      <header className="lb-page-head">
        <nav className="lb-crumbs lb-anim" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><span aria-current="page">{title}</span></nav>
        <span className="lb-eyebrow lb-anim">Legal</span>
        <h1 className="lb-anim" style={{ animationDelay: ".08s" }}>{title}</h1>
        <p className="lb-anim" style={{ animationDelay: ".14s" }}>Last updated {legal.lastUpdated}</p>
      </header>
      <article className="lb-legal">{children}</article>
      <Footer />
    </main>
  );
}
