// All homepage copy lives here. Edit text without touching layout code.
// Only publish claims you can back up with your reseller's real delivery and warranty terms.

export const site = {
  name: "GGBoosts",
  supportUrl: "https://discord.gg/Bewfk2dHzj",
};

export const hero = {
  chip: "Boosts usually land in under a minute",
  titleTop: "Take your server to",
  titleAccent: "Level 3.",
  lead: "Discord server boosts, Nitro, members and aged accounts — delivered automatically.",
  primaryCta: "Boost My Server",
  secondaryCta: "Join our Discord",
  trust: ["No Discord login", "Warranty on boost plans", "Card · Cash App · Crypto"],
};

// Boost levels section. Numbers match the boost-levels guide (src/lib/guides.ts) — keep them in sync.
export const levels = {
  eyebrow: "Server levels",
  titleBefore: "What your server",
  titleAccent: "unlocks",
  body: "Perks stack as you climb — Level 3 includes everything below it.",
  tiers: [
    { level: 1, boosts: 2, perks: ["100 emoji slots", "128 kbps voice audio", "Animated server icon", "Custom invite background", "720p 60fps Go Live"] },
    { level: 2, boosts: 7, perks: ["150 emoji slots", "256 kbps voice audio", "Server banner", "50 MB uploads for everyone", "Custom role icons"] },
    { level: 3, boosts: 14, perks: ["250 emoji slots", "384 kbps voice audio", "Animated server banner", "100 MB uploads for everyone", "Vanity URL — discord.gg/yourname"] },
  ],
};

export const features = {
  eyebrow: "Why GGBoosts",
  items: [
    { title: "Automated delivery", text: "Your order is sent for delivery the moment payment clears. No queues." },
    { title: "No Discord login", text: "We never ask for your password, email or token — just a server invite." },
    { title: "Real support", text: "Open a ticket in our Discord and a real person answers." },
    { title: "Replacement warranty", text: "If a boost drops before your plan ends, it's replaced free." },
  ],
};

export const howItWorks = {
  eyebrow: "How it works",
  title: "Three messages",
  titleAccent: "and you're boosted",
  body: "Ordering takes about a minute. Here's the whole thing.",
  question: "how do I get my server boosted?",
  steps: [
    { title: "Pick your boosts", text: "Choose 8, 14, 20 or 30 boosts and how long you want them — 1 month up to lifetime." },
    { title: "Paste your invite & pay", text: "Drop in a permanent invite to your server and pay by card, Cash App or crypto. Checkout is handled securely by Shoppex." },
    { title: "Watch them land", text: "Delivery starts automatically. Your boost count climbs within minutes — no tickets, no waiting around." },
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
  eyebrow: "Shop",
  titleBefore: "Pick a channel,",
  titleAccent: "pick a plan",
  body: "One-time payments, nothing renews. Boost plans include warranty coverage and Discord support.",
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
  invite: "You've been invited to level up",
  server: "Your Server",
  titleBefore: "Ready when",
  titleAccent: "you are.",
  body: "One-time payment. Automated delivery. Warranty on every boost plan.",
  cta: "Accept — Boost My Server",
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
  businessName: "J&S Unlimited Ventures LLC",
  governingLaw: "the State of Illinois, United States",
  lastUpdated: "October 6, 2026",
};
