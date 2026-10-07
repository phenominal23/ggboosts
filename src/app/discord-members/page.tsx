import type { Metadata } from "next";
import { CategoryLanding } from "@/components/category-landing";
import { JsonLd } from "@/components/seo/json-ld";
import { getCategoryPage } from "@/lib/category-pages";
import { breadcrumbJsonLd, faqJsonLd } from "@/lib/seo";

const page = getCategoryPage("members");

export const metadata: Metadata = {
  title: page.metaTitle,
  description: page.metaDescription,
  alternates: { canonical: page.path },
  openGraph: { title: page.metaTitle, description: page.metaDescription, url: page.path },
};

export default function Page() {
  return (
    <>
      <JsonLd data={[faqJsonLd(page.faqs), breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Products", path: "/products" }, { name: page.crumb, path: page.path }])]} />
      <CategoryLanding page={page} />
    </>
  );
}
