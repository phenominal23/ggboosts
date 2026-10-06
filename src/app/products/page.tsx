import type { Metadata } from "next";
import { ProductsPage } from "@/components/products-page";

export const metadata: Metadata = {
  title: "All Products | GGBoosts",
  description: "Discord server boost packages — 8, 14, 20 and 30 boosts, monthly, yearly or lifetime. Automated delivery, warranty included.",
};

export default function Page() {
  return <ProductsPage />;
}
