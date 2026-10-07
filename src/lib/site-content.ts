// All homepage copy lives here. Edit text without touching layout code.
// Only publish claims you can back up with your reseller's real delivery and warranty terms.

export const site = {
  name: "GGBoosts",
  supportUrl: "https://discord.com/invite/guE3vpT4J2",
};

export const hero = {
  // Small pill above the headline. Swap for a real number once you have one, e.g. "Trusted by 500+ server owners".
  pill: "Lifetime boost plans now available",
  titleTop: "Discord Server Boosts,",
  titleAccent: "Without the Nitro Price.",
  lead: "Automated delivery straight to your server.",
  body: "No Discord login required, transparent pricing, and a replacement warranty on every order.",
  primaryCta: "Boost My Server",
  secondaryCta: "Discord Support",
};

// Hero stat row. Only use numbers you can prove — invented stats are a chargeback and trust risk.
export const stats = [
  { value: "24/7", label: "Discord support" },
  { value: "0", label: "Logins required" },
  { value: "4", label: "Plan lengths" },
  { value: "100%", label: "Warranty coverage" },
];

export const features = {
  eyebrow: "Why GGBoosts",
  titleTop: "Everything you need,",
  titleAccent: "nothing you don't.",
  body: "Discord boosting built on automation, clear pricing, and real human support.",
  items: [
    { title: "Automated Delivery", text: "No queues and no manual steps. Your order is sent for delivery the moment payment clears." },
    { title: "No Discord Login Required", text: "We never ask for your password, email or token. Your server invite link is all we need." },
    { title: "Real Discord Support", text: "Questions before or after you buy? Open a ticket in our Discord and a real person answers." },
    { title: "Replacement Warranty", text: "If a boost drops before your plan ends, it's replaced at no extra cost." },
  ],
};

export const howItWorks = {
  eyebrow: "How it works",
  titleBefore: "How",
  titleAfter: "Works",
  body: "Choose your package, pay securely, and watch your boosts land.",
  steps: [
    { title: "Choose Your Package", text: "Pick how many boosts you need and how long you want them, then head to checkout in under a minute." },
    { title: "Pay With Confidence", text: "Checkout is handled by Shoppex, so your payment details never touch our servers." },
    { title: "Boosts Land Automatically", text: "Once payment clears, delivery starts automatically. Watch your boost count climb — no tickets, no waiting around." },
  ],
};

// TODO: match these to the gateways you enable in your Shoppex dashboard.
export const paymentOptions = [
  { id: "card", label: "Debit/Credit Card", chips: ["VISA", "MC", "AMEX", "Apple", "GPay"] },
  { id: "cashapp", label: "Cash App", chips: [] },
  { id: "crypto", label: "Cryptocurrency", chips: ["BTC", "ETH", "LTC", "USDT"] },
];
export const paymentLogos = ["Visa", "Mastercard", "Amex", "Apple Pay", "Google Pay", "Cash App", "Bitcoin", "Litecoin", "USDT"];

export const pricing = {
  eyebrow: "Pricing",
  titleBefore: "Choose Your",
  titleAccent: "Package",
  body: "Pick the plan that fits your server and check out securely. Every order includes warranty coverage and Discord support.",
};

export const reviewsCopy = {
  eyebrow: "Customer reviews",
  titleBefore: "Loved by",
  titleAccent: "server owners",
  body: "Real feedback from real customers — posted in our Discord.",
};

export const comparisonCopy = {
  eyebrow: "Price comparison",
  titleBefore: "Why pay more for the",
  titleAccent: "same boosts?",
  body: "Same automated delivery, warranty included, no Discord login required — for less.",
};

export const faqs: [string, string][] = [
  ["Can using this service get my server banned?", "Boosts are applied by real accounts with Nitro, the same way any member boosts a server. That said, buying boosts is against Discord's Terms of Service, so no seller can honestly guarantee zero risk."],
  ["What's your refund policy?", "Because delivery is automated and instant, delivered orders are final. If we can't deliver your order, you get a full refund. Dropped boosts are covered by the warranty."],
  ["What payment methods do you accept?", "Card, Apple Pay, Google Pay, Cash App and crypto, depending on what's available at checkout. Having trouble paying? Open a ticket in our Discord."],
  ["How do I receive my boosts after paying?", "Add your server invite link at checkout. Once payment clears, boosts are applied automatically — no action needed on your end."],
  ["How long does delivery take?", "Delivery starts automatically as soon as payment clears and most orders finish within minutes. If yours hasn't arrived, open a ticket with your order ID."],
  ["Do I need to hand over my Discord login or password?", "Never. We only need your server invite link. We will never ask for your password, email, token or 2FA code."],
  ["Why are your prices so much cheaper than Discord?", "Discord charges per Nitro subscription, and each gives only 2 boosts — Level 3 needs 14. We buy at scale, which lets us sell the same boosts for a fraction of the price."],
  ["What's the difference between a 1 Month and a Lifetime plan?", "Every plan is a one-time payment and nothing renews. Monthly and yearly plans keep your server boosted for that period. Lifetime is one payment with ongoing warranty coverage."],
  ["Where can I get help if something goes wrong?", "Open a ticket in our Discord or email us. Include your order ID and we'll sort it out."],
];

export const finalCta = {
  titleBefore: "Your server deserves",
  titleAccent: "Level 3.",
  body: "One-time payment. Automated delivery. Warranty included.",
  cta: "Boost My Server",
};

export const productsPage = {
  eyebrow: "Catalog",
  titleBefore: "All",
  titleAccent: "Products",
  body: "Automated delivery · Warranty included · Discord support",
  ctaBody: "One-time payment, automated delivery, warranty included — no login needed.",
};

export const productsFaqs: [string, string][] = [
  ["Does every plan come with the same warranty?", "Yes. Every boost package includes replacement coverage for the length of your plan. Lifetime plans are covered for as long as we operate."],
  ["How fast is delivery?", "Delivery starts automatically as soon as payment clears, and most orders finish within minutes. If yours hasn't arrived, open a ticket with your order ID."],
  ["Can I boost more than one server?", "Yes — place one order per server. Each order asks for the invite link of the server you want boosted."],
  ["What payment methods are accepted?", "Card, Apple Pay, Google Pay, Cash App and crypto, depending on what's available at checkout."],
  ["Can I extend or upgrade my plan later?", "Any time. Plans never renew automatically, so just buy another package when you want more boosts or more time — or pick Lifetime and never think about it again."],
];

// Used on the Terms, Privacy and Refund pages. Fill in before going live.
export const legal = {
  businessName: "[YOUR LEGAL NAME OR BUSINESS NAME]",
  governingLaw: "the State of Illinois, United States",
  lastUpdated: "October 6, 2026",
};
