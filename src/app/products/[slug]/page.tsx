import type { Metadata } from "next";
import { ProductDetail } from "@/components/product-detail";

// Individual product pages duplicate the category pages, so keep them out of search results.
export const metadata: Metadata = { robots: { index: false, follow: true } };

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  return <ProductDetail slug={slug} />;
}
