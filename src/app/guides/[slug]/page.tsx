import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Lightbulb } from "lucide-react";
import { DiscordIcon, Footer, Nav, SiteBackground } from "@/components/home/site-chrome";
import { GuideCard } from "@/components/seo/guide-card";
import { JsonLd } from "@/components/seo/json-ld";
import { plainText, RichText } from "@/components/seo/rich-text";
import { type GuideBlock, getGuide, guides, relatedGuides } from "@/lib/guides";
import { site } from "@/lib/site-content";
import { absolute, breadcrumbJsonLd } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return guides.map(g => ({ slug: g.slug }));
}
export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const guide = getGuide((await params).slug);
  if (!guide) return {};
  const path = `/guides/${guide.slug}`;
  return {
    title: guide.title,
    description: guide.description,
    alternates: { canonical: path },
    openGraph: { title: guide.title, description: guide.description, url: path, type: "article", modifiedTime: guide.updated },
  };
}

function Block({ block }: { block: GuideBlock }) {
  if ("h2" in block) return <h2>{block.h2}</h2>;
  if ("p" in block) return <p><RichText text={block.p} /></p>;
  if ("ul" in block) return <ul>{block.ul.map(t => <li key={t}><RichText text={t} /></li>)}</ul>;
  if ("ol" in block) return <ol>{block.ol.map(t => <li key={t}><RichText text={t} /></li>)}</ol>;
  if ("tip" in block) return <aside className="gd-tip"><Lightbulb size={18} /><p><RichText text={block.tip} /></p></aside>;
  if ("table" in block) {
    return (
      <div className="gd-table"><table>
        <thead><tr>{block.table.head.map((h, i) => <th key={`${i}-${h}`} scope="col">{h}</th>)}</tr></thead>
        <tbody>{block.table.rows.map(r => <tr key={r.join("|")}>{r.map((c, i) => i === 0 ? <th key={`${i}-${c}`} scope="row">{c}</th> : <td key={`${i}-${c}`}>{c}</td>)}</tr>)}</tbody>
      </table></div>
    );
  }
  return (
    <aside className="gd-cta">
      <div><strong>{block.cta.title}</strong><p>{block.cta.text}</p></div>
      <Link className="lb-btn lb-btn--primary" href={block.cta.href}>{block.cta.label} <ArrowRight size={16} /></Link>
    </aside>
  );
}

export default async function GuidePage({ params }: Props) {
  const guide = getGuide((await params).slug);
  if (!guide) notFound();
  const path = `/guides/${guide.slug}`;
  const updated = new Date(`${guide.updated}T12:00:00Z`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const bodyText = guide.blocks.filter(b => "p" in b).map(b => plainText((b as { p: string }).p));

  return (
    <main className="lb">
      <JsonLd data={[
        {
          "@context": "https://schema.org",
          "@type": "Article",
          headline: guide.title,
          description: guide.description,
          dateModified: guide.updated,
          datePublished: guide.updated,
          mainEntityOfPage: absolute(path),
          image: absolute("/opengraph-image.png"),
          author: { "@type": "Organization", name: "GGBoosts", url: absolute("/") },
          publisher: { "@type": "Organization", name: "GGBoosts", logo: { "@type": "ImageObject", url: absolute("/email-logo.png") } },
          articleBody: bodyText.join(" "),
        },
        breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Guides", path: "/guides" }, { name: guide.short, path }]),
      ]} />
      <SiteBackground />
      <Nav active="guides" />
      <article className="gd-article">
        <nav className="lb-crumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><Link href="/guides">Guides</Link><span>/</span><span aria-current="page">{guide.short}</span></nav>
        <header>
          <span className="lb-eyebrow">{guide.topic}</span>
          <h1>{guide.title}</h1>
          <p className="gd-meta">Updated {updated} · {guide.minutes} min read</p>
        </header>
        <div className="gd-body">{guide.blocks.map((b, i) => <Block key={`${guide.slug}-${i}`} block={b} />)}</div>
        <footer className="gd-help">
          <p>Still stuck? Ask us in Discord — a real person answers.</p>
          <a className="lb-btn lb-btn--ghost" href={site.supportUrl} target="_blank" rel="noreferrer"><DiscordIcon size={16} /> Discord Support</a>
        </footer>
      </article>
      <section className="lb-section lb-section--tight">
        <header className="lb-head"><span className="lb-eyebrow">Keep reading</span><h2>More <em>guides</em></h2></header>
        <div className="gd-grid">{relatedGuides(guide.slug).map(g => <GuideCard key={g.slug} guide={g} />)}</div>
      </section>
      <Footer />
    </main>
  );
}
