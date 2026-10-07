import type { CategoryId } from "@/lib/catalog";

// Copy for the per-category landing pages (/discord-members, /aged-discord-accounts, /discord-nitro).
// Each page targets the phrase people search for. Keep claims to what you can deliver.

export type CategoryPage = {
  path: string;
  category: Exclude<CategoryId, "boosts">;
  metaTitle: string;
  metaDescription: string;
  crumb: string;
  eyebrow: string;
  titleBefore: string;
  titleAccent: string;
  body: string;
  points: { title: string; text: string }[];
  steps: string[];
  faqs: [string, string][];
  guides: string[]; // guide slugs
  cta: { title: string; body: string };
};

export const categoryPages: CategoryPage[] = [
  {
    path: "/discord-members",
    category: "members",
    metaTitle: "Buy Discord Members & Reactions — Online and Offline",
    metaDescription: "Buy online or offline Discord server members and message reactions. Pick any amount, no Discord login needed. Online members stay 30 days, offline 90 days. Card and crypto accepted.",
    crumb: "Discord Members",
    eyebrow: "Members & reactions",
    titleBefore: "Buy Discord",
    titleAccent: "Members",
    body: "Give your server a head start. Online members, offline members and message reactions — pick any amount and pay once.",
    points: [
      { title: "Any amount", text: "Choose exactly how many you need. The price updates as you change the amount." },
      { title: "No login needed", text: "We never ask for your password. You give us your server ID, then add our delivery bot when we send it." },
      { title: "Online or offline", text: "Online members show in the green online count and stay 30 days. Offline members are the budget option and stay 90 days." },
    ],
    steps: ["Pick online members, offline members or reactions, and an amount.", "Enter your server ID and Discord username at checkout.", "Open an Order Help ticket in our Discord — we'll send your delivery bot link there."],
    faqs: [
      ["What's the difference between online and offline members?", "Both count towards your server's member total. Online members also show in the green online count and the online member list; offline members don't, which is why they're cheaper."],
      ["How long do members stay?", "Online members stay for 30 days and offline members for 90 days. After that they leave automatically — order again any time to keep the same count."],
      ["How are members delivered?", "Enter your server ID and Discord username at checkout, then open an Order Help ticket in our Discord with your order ID. We'll send you a delivery bot link — add the bot and the members are added. You can remove the bot once delivery is done."],
      ["Do I need to turn anything off?", "Yes — pause anti-raid bots, join protection and server applications until your order is delivered, and don't kick or ban delivered members."],
      ["What's the minimum order?", "200 online or offline members, or 100 reactions. The quantity picker shows the range for each product."],
    ],
    guides: ["online-vs-offline-discord-members", "how-to-make-a-permanent-discord-invite", "how-to-copy-a-discord-message-link"],
    cta: { title: "Make your server look alive.", body: "Pick an amount, paste your invite, and you're done." },
  },
  {
    path: "/aged-discord-accounts",
    category: "accounts",
    metaTitle: "Buy Aged Discord Accounts (2016–2021) — Full Access",
    metaDescription: "Buy aged Discord accounts from 2016 to 2021 with full access — email and password included. Buy one or several. Card and crypto accepted.",
    crumb: "Aged Accounts",
    eyebrow: "Aged accounts",
    titleBefore: "Aged Discord",
    titleAccent: "Accounts",
    body: "Accounts created between 2016 and 2021, with full access. Change the email and password and they're yours.",
    points: [
      { title: "Full access", text: "You get the email and password, so you can change both and lock the account down." },
      { title: "Pick your year", text: "From 2016 to 2021. Older accounts are rarer, so they cost a little more." },
      { title: "Buy in bulk", text: "Need more than one? Pick the quantity on the card and check out once." },
    ],
    steps: ["Pick an account year and how many you need.", "Pay with card or crypto.", "Log in, change the email and password, and turn on 2FA."],
    faqs: [
      ["What does Full Access mean?", "You receive the account's email and password, so you can change both and take full control of the account."],
      ["What should I do after I get the account?", "Change the password and email right away, turn on two-factor authentication, and log out of other sessions under User Settings → Devices."],
      ["Why do older accounts cost more?", "Fewer accounts from early years exist, and an older 'Member Since' date looks more established."],
      ["How is the account delivered?", "By email and in your GGBoosts dashboard. Use the same email you paid with to sign in to the dashboard."],
    ],
    guides: ["aged-discord-accounts-explained"],
    cta: { title: "Pick your year.", body: "Full access accounts from 2016 to 2021." },
  },
  {
    path: "/discord-nitro",
    category: "nitro",
    metaTitle: "Cheap Discord Nitro — 3 Month Nitro Accounts",
    metaDescription: "Get Discord Nitro for less: accounts with 3 months of Nitro already active. Full access, one-time payment. Card and crypto accepted.",
    crumb: "Discord Nitro",
    eyebrow: "Nitro",
    titleBefore: "Cheap Discord",
    titleAccent: "Nitro",
    body: "Accounts with 3 months of Nitro already active — HD streaming, custom emojis everywhere, bigger uploads and 2 server boosts.",
    points: [
      { title: "One-time payment", text: "No subscription and nothing renews. Pay once for 3 months of Nitro." },
      { title: "Full access", text: "You get the login details and can change the email and password." },
      { title: "All the Nitro perks", text: "HD streaming, custom emojis and stickers everywhere, bigger uploads and 2 server boosts." },
    ],
    steps: ["Pick a Nitro product and quantity.", "Pay with card or crypto.", "Log in and secure the account: new password, new email, 2FA on."],
    faqs: [
      ["What do I get?", "A Discord account with 3 months of Nitro already active, with full access so you can change the email and password."],
      ["Does it renew?", "No. It's a one-time payment. When the Nitro period ends, it simply stops unless you renew it yourself on Discord."],
      ["Can I use the 2 Nitro boosts on my server?", "Yes — Nitro includes 2 server boosts you can put on any server the account has joined."],
      ["How is it delivered?", "By email and in your GGBoosts dashboard."],
    ],
    guides: ["discord-nitro-vs-buying-server-boosts", "discord-server-boost-levels"],
    cta: { title: "Nitro, without the subscription.", body: "Pay once for 3 months of Nitro." },
  },
];

export function getCategoryPage(category: CategoryPage["category"]) {
  return categoryPages.find(c => c.category === category)!;
}
