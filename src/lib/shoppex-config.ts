import { shoppexConfig } from "../../shoppex.config";
export { shoppexConfig };
export type { CheckoutMode, CustomerPortalMode, StorefrontConfig } from "../../shoppex.config";

// Customers manage orders on our own /dashboard page (Shoppex headless customer portal).
export function getCustomerPortalHref(): string {
  return "/dashboard";
}
