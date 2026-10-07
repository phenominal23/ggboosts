"use client";

import { categoryOfTitle } from "@/lib/catalog";
import { site } from "@/lib/site-content";

// What the buyer has to do after paying, by product type. Shown on the checkout success page and on the
// order page while the order waits for delivery (Shoppex only reveals product Instructions after fulfillment).
export function NextSteps({ productTitle, orderId }: { productTitle: string; orderId: string }) {
  const category = categoryOfTitle(productTitle);
  const discord = <a href={site.supportUrl} target="_blank" rel="noreferrer">our Discord</a>;
  const id = <code>{orderId}</code>;

  const steps =
    category === "members" ? [
      <>Join {discord}.</>,
      <>Open an <b>Order Help</b> ticket and paste your order ID: {id}</>,
      <>We&apos;ll send you a delivery bot link — add the bot to your server.</>,
      <>Keep anti-raid, join protection and server applications disabled until delivery is done.</>,
    ]
    : category === "boosts" ? [
      <>Keep your server invite active until your boosts are delivered.</>,
      <>Keep anti-raid, join protection and server applications disabled until delivery is done.</>,
      <>Don&apos;t kick or ban the boosting accounts.</>,
      <>We&apos;ll email you the moment your boosts are delivered.</>,
    ]
    : category === "accounts" || category === "nitro" ? [
      <>Nothing to do yet — we&apos;re preparing your account.</>,
      <>Your login details will be emailed to you and shown on your order page.</>,
      <>As soon as you get them: change the password and email, and turn on 2FA.</>,
    ]
    : [<>We&apos;ll email you the moment your order is delivered. Questions? Ask in {discord} with your order ID: {id}</>];

  return (
    <div className="next-steps">
      <span className="next-steps__label">Next steps</span>
      <ol>{steps.map((s, i) => <li key={i}>{s}</li>)}</ol>
    </div>
  );
}
