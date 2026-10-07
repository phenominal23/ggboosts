import type { Metadata } from "next";
import { CustomerDashboard } from "@/components/dashboard/customer-dashboard";

export const metadata: Metadata = {
  title: "My Orders",
  robots: { index: false, follow: false },
};

export default function DashboardPage() {
  return <CustomerDashboard />;
}
