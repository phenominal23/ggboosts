import type { Metadata } from "next";
import { StorefrontHome } from "@/components/storefront-home";
import { JsonLd } from "@/components/seo/json-ld";
import { faqs } from "@/lib/site-content";
import { faqJsonLd } from "@/lib/seo";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default function HomePage() {
  return (
    <>
      <JsonLd data={faqJsonLd(faqs)} />
      <StorefrontHome />
    </>
  );
}
