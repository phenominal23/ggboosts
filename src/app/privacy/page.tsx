import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";
import { legal, site } from "@/lib/site-content";

export const metadata: Metadata = { title: "Privacy Policy | GGBoosts" };

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy">
      <p>This policy explains what information {site.name} (operated by {legal.businessName}) collects, why, and what we do with it.</p>

      <h2>What we collect</h2>
      <ul>
        <li><strong>Order details:</strong> your email address, the products you buy, the amount paid and your order ID.</li>
        <li><strong>Server details:</strong> the Discord invite link you provide at checkout, needed to deliver your boosts.</li>
        <li><strong>Support messages:</strong> anything you send us on Discord.</li>
      </ul>
      <p>We never ask for your Discord password, email login, token or 2FA codes.</p>

      <h2>Payments</h2>
      <p>Payments are processed by Shoppex and the payment providers shown at checkout. We do not receive or store your full card number or crypto wallet keys.</p>

      <h2>How we use it</h2>
      <ul>
        <li>To deliver your order and honor the warranty.</li>
        <li>To provide support and answer questions.</li>
        <li>To prevent fraud and payment abuse.</li>
      </ul>

      <h2>Who we share it with</h2>
      <ul>
        <li><strong>Shoppex</strong>, which runs our checkout and order records.</li>
        <li><strong>Payment providers</strong>, to process your payment.</li>
        <li><strong>Our fulfillment partner</strong>, which receives your server invite link and package details to apply the boosts.</li>
      </ul>
      <p>We do not sell your personal information.</p>

      <h2>Cookies</h2>
      <p>This website does not use advertising or tracking cookies. The Shoppex checkout may use cookies needed to complete your payment securely.</p>

      <h2>How long we keep it</h2>
      <p>We keep order records for as long as your plan&apos;s warranty applies and as required for accounting, tax and fraud prevention.</p>

      <h2>Your choices</h2>
      <p>You can ask us to show you, correct or delete the information we hold about you, unless we must keep it for legal reasons. Open a ticket in our <a href={site.supportUrl} target="_blank" rel="noreferrer">Discord</a>.</p>

      <h2>Changes</h2>
      <p>We may update this policy. The date at the top shows the latest version.</p>
    </LegalPage>
  );
}
