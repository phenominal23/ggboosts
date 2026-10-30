"use client";

import Link from "next/link";
import { Footer, Nav, SiteBackground } from "@/components/home/site-chrome";
import { legal } from "@/lib/site-content";

export function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="gs">
      <SiteBackground />
      <Nav />
      <header className="gs-page-head">
        <nav className="gs-crumbs gs-anim" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><span aria-current="page">{title}</span></nav>
        <span className="gs-eyebrow gs-anim">Legal</span>
        <h1 className="gs-anim" style={{ animationDelay: ".08s" }}>{title}</h1>
        <p className="gs-anim" style={{ animationDelay: ".14s" }}>Last updated {legal.lastUpdated}</p>
      </header>
      <article className="gs-legal">{children}</article>
      <Footer />
    </main>
  );
}
