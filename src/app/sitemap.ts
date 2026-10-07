import type { MetadataRoute } from "next";
import { categoryPages } from "@/lib/category-pages";
import { guides } from "@/lib/guides";
import { legal } from "@/lib/site-content";
import { absolute } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: absolute("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: absolute("/products"), lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    ...categoryPages.map(c => ({ url: absolute(c.path), lastModified: now, changeFrequency: "weekly" as const, priority: 0.8 })),
    { url: absolute("/guides"), lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    ...guides.map(g => ({ url: absolute(`/guides/${g.slug}`), lastModified: new Date(g.updated), changeFrequency: "monthly" as const, priority: 0.6 })),
    ...["/terms", "/privacy", "/refund-policy"].map(p => ({ url: absolute(p), lastModified: new Date(legal.lastUpdated), changeFrequency: "yearly" as const, priority: 0.2 })),
  ];
}
