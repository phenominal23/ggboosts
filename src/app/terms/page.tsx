import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal/legal-page";
import { legal, site } from "@/lib/site-content";

export const metadata: Metadata = { title: "Terms of Service | GGBoosts" };

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service">
      <p>These Terms of Service (&quot;Terms&quot;) govern your use of the {site.name} website and any purchase you make from us. {site.name} is operated by {legal.businessName} (&quot;we&quot;, &quot;us&quot;). By placing an order you agree to these Terms.</p>

      <h2>1. What we sell</h2>
      <p>We sell Discord server boost packages. A package applies a set number of boosts to the Discord server you specify, for the plan length you choose (for example 1 Month, 3 Months, 1 Year or Lifetime).</p>

      <h2>2. Not affiliated with Discord</h2>
      <p>{site.name} is an independent service. We are not affiliated with, endorsed by or sponsored by Discord Inc. &quot;Discord&quot; and related marks belong to their owners.</p>

      <h2>3. Your responsibility and Discord&apos;s rules</h2>
      <p>Purchasing boosts from a third party may conflict with Discord&apos;s Terms of Service. By ordering, you confirm you understand this and accept any risk to your server or accounts. We are not responsible for actions Discord takes, including removing boosts or restricting servers or accounts.</p>
      <p>You must be at least 18 years old, or the age of majority where you live, to place an order. You confirm that you own or are authorized to manage the server you submit.</p>

      <h2>4. Orders and payment</h2>
      <p>Checkout and payment are handled by our payment partner, Shoppex, and the payment providers available at checkout. Prices are shown before you pay. Every plan is a one-time payment; nothing renews automatically.</p>

      <h2>5. Delivery</h2>
      <p>You must provide a valid, non-expiring Discord invite link for your server at checkout. Delivery begins after payment is confirmed. Delivery times shown on our site are typical estimates, not guarantees. Orders delayed or failed because of an invalid, expired or changed invite link are not our responsibility, but contact us and we will help.</p>

      <h2>6. Warranty</h2>
      <p>If boosts from your order drop before your plan ends, we will replace them at no charge. Lifetime plans are covered for as long as {site.name} operates. To claim, open a ticket in our Discord with your order ID. The warranty does not cover losses caused by Discord enforcement actions, a server being deleted, or you removing boosts or changing server ownership.</p>

      <h2>7. Refunds and chargebacks</h2>
      <p>Refunds are covered by our <Link href="/refund-policy">Refund Policy</Link>. Opening a chargeback or payment dispute without first contacting us may result in the boosts on that order being removed and future orders being refused.</p>

      <h2>8. Acceptable use</h2>
      <p>You may not use our service for fraud, to boost servers used for illegal activity, or with stolen payment methods. We may refuse or cancel any order we reasonably believe breaks these rules.</p>

      <h2>9. Limitation of liability</h2>
      <p>Our service is provided &quot;as is&quot;. To the fullest extent allowed by law, our total liability for any claim relating to an order is limited to the amount you paid for that order, and we are not liable for indirect or consequential losses.</p>

      <h2>10. Changes</h2>
      <p>We may update these Terms. The version in effect when you place an order applies to that order.</p>

      <h2>11. Governing law</h2>
      <p>These Terms are governed by the laws of {legal.governingLaw}.</p>

      <h2>12. Contact</h2>
      <p>Questions? Email <a href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a> or open a ticket in our <a href={site.supportUrl} target="_blank" rel="noreferrer">Discord</a>.</p>
    </LegalPage>
  );
}
