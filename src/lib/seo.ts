// Shared SEO helpers: the site's public URL and structured-data (JSON-LD) builders.
import { site } from "@/lib/site-content";
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://ggboosts.com").replace(/\/+$/, "");

export const absolute = (path = "/") => `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;

export function faqJsonLd(items: [string, string][]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
  };
}

export function breadcrumbJsonLd(trail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((t, i) => ({ "@type": "ListItem", position: i + 1, name: t.name, item: absolute(t.path) })),
  };
}

export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "GGBoosts",
  url: SITE_URL,
  logo: absolute("/email-logo.png"),
  sameAs: [site.supportUrl],
};

export const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "GGBoosts",
  url: SITE_URL,
};
