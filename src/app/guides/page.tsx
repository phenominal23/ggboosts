import type { Metadata } from "next";
import Link from "next/link";
import { Footer, Nav, SiteBackground } from "@/components/home/site-chrome";
import { GuidesBrowser } from "@/components/seo/guides-browser";
import { JsonLd } from "@/components/seo/json-ld";
import { guides } from "@/lib/guides";
import { absolute, breadcrumbJsonLd } from "@/lib/seo";

const title = "Discord Guides — Boosts, Invites, Members & Accounts";
const description = "Plain-English Discord guides: boost levels and perks, Nitro vs buying boosts, permanent invite links, message links, members and aged accounts.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/guides" },
  openGraph: { title, description, url: "/guides" },
};

export default function GuidesPage() {
  return (
    <main className="lb">
      <JsonLd data={[
        breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Guides", path: "/guides" }]),
        { "@context": "https://schema.org", "@type": "ItemList", itemListElement: guides.map((g, i) => ({ "@type": "ListItem", position: i + 1, url: absolute(`/guides/${g.slug}`), name: g.title })) },
      ]} />
      <SiteBackground />
      <Nav active="guides" />
      <header className="lb-page-head">
        <nav className="lb-crumbs lb-anim" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><span aria-current="page">Guides</span></nav>
        <span className="lb-eyebrow lb-anim">Guides</span>
        <h1 className="lb-anim">Guides &amp; <em>Help Center</em></h1>
        <p className="lb-anim">Quick, plain-English answers about boosts, invites, members and accounts.</p>
      </header>
      <GuidesBrowser />
      <Footer />
    </main>
  );
}
