import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";
import { site } from "@/lib/site-content";

export const metadata: Metadata = { title: "Refund Policy" };

export default function RefundPage() {
  return (
    <LegalPage title="Refund Policy">
      <p>Boost delivery starts automatically once payment clears, so our refund rules are simple.</p>

      <h2>When you get a full refund</h2>
      <ul>
        <li>We cannot deliver your order at all.</li>
        <li>You were charged twice for the same order.</li>
      </ul>

      <h2>When orders are final</h2>
      <p>Once boosts have been delivered to your server, the order is final and is not refundable. This includes changing your mind after delivery.</p>

      <h2>Dropped boosts</h2>
      <p>If boosts drop before your plan ends, they are replaced free under our warranty instead of refunded. Open a ticket in our <a href={site.supportUrl} target="_blank" rel="noreferrer">Discord</a> with your order ID.</p>

      <h2>Wrong invite link</h2>
      <p>If you entered the wrong or an expired invite link, contact us right away. If delivery hasn&apos;t completed, we will redeliver to the correct server.</p>

      <h2>Chargebacks</h2>
      <p>Please contact us before opening a dispute with your bank or payment provider — most problems are fixed within minutes. Orders under an open chargeback may have their boosts removed.</p>

      <h2>How to request a refund</h2>
      <p>Open a ticket in our <a href={site.supportUrl} target="_blank" rel="noreferrer">Discord</a> with your order ID and what went wrong.</p>
    </LegalPage>
  );
}
