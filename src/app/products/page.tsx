import type { Metadata } from "next";
import { ProductsPage } from "@/components/products-page";
import { JsonLd } from "@/components/seo/json-ld";
import { productsFaqs } from "@/lib/site-content";
import { breadcrumbJsonLd, faqJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Buy Discord Server Boosts — All Products",
  description: "Discord server boost packages — 8, 14, 20 and 30 boosts, monthly, yearly or lifetime — plus members, reactions, aged accounts and Nitro. One-time payment.",
  alternates: { canonical: "/products" },
};

export default function Page() {
  return (
    <>
      <JsonLd data={[faqJsonLd(productsFaqs), breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Products", path: "/products" }])]} />
      <ProductsPage />
    </>
  );
}
