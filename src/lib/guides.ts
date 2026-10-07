// Guides (the /guides section). Each guide is plain data so copy can be edited without touching layout.
// Text supports **bold** and [links](/path). Facts about Discord come from Discord's own help center
// (support.discord.com, "Server Boosting FAQ"). Re-check them if Discord changes boosting.

export type GuideBlock =
  | { h2: string }
  | { p: string }
  | { ul: string[] }
  | { ol: string[] }
  | { table: { head: string[]; rows: string[][] } }
  | { tip: string }
  | { cta: { title: string; text: string; label: string; href: string } };

export type Guide = {
  slug: string;
  title: string;
  /** Short title for cards and breadcrumbs. */
  short: string;
  description: string;
  topic: "Boosts" | "Members" | "Accounts" | "Basics";
  updated: string; // ISO date
  minutes: number;
  blocks: GuideBlock[];
};

export const guides: Guide[] = [
  {
    slug: "discord-server-boost-levels",
    title: "Discord Server Boost Levels: How Many Boosts for Level 1, 2 and 3",
    short: "Boost levels explained",
    description: "How many boosts you need for each Discord server level, and every perk Level 1, Level 2 and Level 3 unlock — emojis, audio quality, banners, vanity URL and more.",
    topic: "Boosts",
    updated: "2026-10-07",
    minutes: 4,
    blocks: [
      { p: "Discord servers unlock perks in three levels. Each level needs a set number of **server boosts**, and the perks stack — Level 3 includes everything from Levels 1 and 2." },
      { h2: "How many boosts does each level need?" },
      { table: { head: ["Level", "Boosts needed"], rows: [["Level 1", "2 boosts"], ["Level 2", "7 boosts"], ["Level 3", "14 boosts"]] } },
      { tip: "Aiming for Level 3? You need **14 boosts**. Our [14 and 20 boost packages](/products) are built around exactly that." },
      { h2: "What each level unlocks" },
      {
        table: {
          head: ["Perk", "Level 1", "Level 2", "Level 3"],
          rows: [
            ["Emoji slots", "100", "150", "250"],
            ["Sticker slots", "15", "30", "60"],
            ["Soundboard slots", "24", "36", "48"],
            ["Voice audio quality", "128 kbps", "256 kbps", "384 kbps"],
            ["Go Live streaming", "720p 60fps", "1080p 60fps", "1080p 60fps"],
            ["Upload limit (everyone in the server)", "—", "50 MB", "100 MB"],
            ["Server banner", "—", "Static", "Animated"],
            ["Custom invite link (vanity URL)", "—", "—", "Yes"],
          ],
        },
      },
      { p: "Level 1 also adds an **animated server icon** and a **custom invite background**. Level 2 adds **custom role icons**. Level 3 gives your server a **vanity URL** like discord.gg/yourname — the perk most server owners are after." },
      { h2: "What happens if you lose boosts?" },
      { p: "If your boost count drops below a level's requirement, the server drops back a level and those perks switch off. Your emojis and stickers aren't deleted — the extra ones just become unusable until you're back at the right level." },
      { p: "That's why boosts bought from GGBoosts come with a replacement warranty for the length of the plan. See [how long boosts last](/guides/how-long-do-discord-boosts-last) for the details." },
      { cta: { title: "Get to Level 3 today", text: "One-time payment, no Discord login needed.", label: "See boost packages", href: "/products" } },
    ],
  },
  {
    slug: "discord-nitro-vs-buying-server-boosts",
    title: "Discord Nitro vs Buying Server Boosts: Which Is Cheaper?",
    short: "Nitro vs buying boosts",
    description: "What it really costs to reach Level 3 through Discord Nitro or Discord's own boosts, compared with buying boosts as a one-time package.",
    topic: "Boosts",
    updated: "2026-10-07",
    minutes: 4,
    blocks: [
      { p: "There are three ways to boost a Discord server: get friends with Nitro to boost it, buy boosts from Discord yourself, or buy a boost package. Here's how the costs compare for the most common goal — **Level 3, which needs 14 boosts**." },
      { h2: "What Discord charges" },
      { ul: ["**Nitro** is $9.99/month and includes **2 server boosts**.", "Extra boosts are bought monthly from Discord, at roughly **$4.99 each** per month.", "Nitro subscribers get **30% off** extra boosts. Nitro Basic doesn't include boosts or the discount."] },
      { p: "Prices are US prices in 2026 and can differ by country — check Discord's app for yours." },
      { h2: "Cost of Level 3 through Discord" },
      {
        table: {
          head: ["Route", "Monthly cost", "Per year"],
          rows: [
            ["14 boosts bought from Discord", "≈ $69.86", "≈ $838"],
            ["Nitro + 12 discounted boosts", "≈ $51.87", "≈ $622"],
            ["7 friends, each with Nitro", "$0 to you — but 7 people paying $9.99", "—"],
          ],
        },
      },
      { p: "Every one of those routes is a **subscription**. Stop paying and the boosts disappear, and the server drops a level." },
      { h2: "Buying a boost package" },
      { p: "A boost package is a **one-time payment** for a set number of boosts for a set time — 1 month, 3 months, 1 year or lifetime. Nothing renews, and you never share your Discord login: you just give a server invite link." },
      { p: "Compare live prices on the [products page](/products). For most servers, a package costs a fraction of what Discord charges for the same boost count." },
      { h2: "The honest trade-off" },
      { p: "Buying boosts from a third party is against Discord's Terms of Service, so no seller can promise zero risk. Boosts are applied by real Nitro accounts, the same way any member boosts a server, and boost plans are covered by a replacement warranty if boosts drop." },
      { cta: { title: "Level 3 for a one-time price", text: "Pick 14 boosts and a plan length that suits you.", label: "Compare packages", href: "/products" } },
    ],
  },
  {
    slug: "how-to-make-a-permanent-discord-invite",
    title: "How to Make a Permanent Discord Invite Link (Never Expires)",
    short: "Permanent invite links",
    description: "Step-by-step: create a Discord invite that never expires and has no use limit, on desktop and mobile — and why boost and member orders need one.",
    topic: "Basics",
    updated: "2026-10-07",
    minutes: 2,
    blocks: [
      { p: "Discord invites expire after 7 days by default. For boosts and member orders you need a **permanent** invite — one that never expires and can be used any number of times — so delivery doesn't fail halfway through." },
      { h2: "On desktop" },
      { ol: ["Click your **server name** in the top-left corner.", "Choose **Invite People**.", "Click **Edit invite link** at the bottom of the box.", "Set **Expire After** to **Never**.", "Set **Max Number of Uses** to **No limit**.", "Click **Generate a New Link**, then **Copy**."] },
      { h2: "On mobile" },
      { ol: ["Open your server and tap the **server name** at the top.", "Tap **Invite**.", "Tap **Edit invite link** (or the settings icon).", "Set expiry to **Never** and max uses to **No limit**.", "Tap **Save**, then copy the link."] },
      { tip: "The link should look like **https://discord.gg/abc123**. If you don't see the Edit option, you need the **Create Invite** permission — ask the server owner." },
      { h2: "Before you order" },
      { ul: ["Pause anti-raid or verification bots until delivery is finished.", "Turn off **member screening** / rules screening while the order runs.", "Don't delete the invite until your order is complete."] },
      { p: "Level 3 servers can also set a vanity link like discord.gg/yourname. Learn how to get there in our [boost levels guide](/guides/discord-server-boost-levels)." },
      { cta: { title: "Got your invite?", text: "Paste it at checkout and we'll handle the rest.", label: "Browse products", href: "/products" } },
    ],
  },
  {
    slug: "how-to-copy-a-discord-message-link",
    title: "How to Copy a Discord Message Link (Desktop & Mobile)",
    short: "Copy a message link",
    description: "How to copy the link to a specific Discord message on desktop and mobile — needed for message reaction orders.",
    topic: "Members",
    updated: "2026-10-07",
    minutes: 2,
    blocks: [
      { p: "Every Discord message has its own link. Reaction orders need it so the reactions land on the right message." },
      { h2: "On desktop" },
      { ol: ["Hover over the message.", "Click the **⋯ (More)** button, or right-click the message.", "Choose **Copy Message Link**."] },
      { h2: "On mobile" },
      { ol: ["Long-press the message.", "Tap **Copy Message Link** (on some versions it's under **Share**)."] },
      { h2: "What a message link looks like" },
      { p: "**https://discord.com/channels/** followed by three long numbers — the server, the channel and the message. If your link only has two numbers, you copied a channel link instead." },
      { tip: "Make sure the channel is visible to new members and that they're allowed to **add reactions** there, or the order can't be delivered." },
      { cta: { title: "Add reactions to any message", text: "Pick an amount, paste your invite and message link.", label: "See reaction pricing", href: "/discord-members" } },
    ],
  },
  {
    slug: "online-vs-offline-discord-members",
    title: "Online vs Offline Discord Members: What's the Difference?",
    short: "Online vs offline members",
    description: "The difference between online and offline Discord members, which one to choose, and how to prepare your server before ordering.",
    topic: "Members",
    updated: "2026-10-07",
    minutes: 3,
    blocks: [
      { p: "Discord shows two counts under every server invite: **members** and **online**. A new server with a handful of people can look empty — adding members makes it look active and established from the first glance." },
      { h2: "The difference" },
      {
        table: {
          head: ["", "Online members", "Offline members"],
          rows: [
            ["Shows in member count", "Yes", "Yes"],
            ["Shows in the green \"online\" count", "Yes", "No"],
            ["Appears in the online member list", "Yes", "No"],
            ["How long they stay", "30 days", "90 days"],
            ["Price", "Higher", "Lower"],
          ],
        },
      },
      { h2: "Which should you pick?" },
      { ul: ["**Offline members** — the budget way to grow your total member count.", "**Online members** — when you want the server to look busy right now, for example around a launch or giveaway.", "**Both** — many servers mix them so the online number is believable compared with the total."] },
      { h2: "Before you order" },
      { ol: ["Have your **server ID** ready (Discord Settings → Advanced → Developer Mode on, then right-click your server → Copy Server ID).", "Pause anti-raid bots, join protection and server applications until delivery finishes.", "After checkout, open an Order Help ticket in our Discord — we'll send you a delivery bot link to add to your server.", "Don't kick or ban delivered members. You can remove the bot once delivery is done."] },
      { h2: "Things to know" },
      { p: "Delivered members aren't permanent: **online members stay 30 days and offline members 90 days**, then leave automatically. Order again to keep the same count. Adding members is also against Discord's Terms of Service, so treat it as a way to give your server a head start — not a replacement for real community growth." },
      { cta: { title: "Grow your server", text: "Pick any amount from 200 up — price updates as you go.", label: "See member pricing", href: "/discord-members" } },
    ],
  },
  {
    slug: "aged-discord-accounts-explained",
    title: "Aged Discord Accounts Explained: What They Are and How to Secure One",
    short: "Aged accounts explained",
    description: "What an aged Discord account is, what 'Full Access' means, and the first things to do after you get one.",
    topic: "Accounts",
    updated: "2026-10-07",
    minutes: 3,
    blocks: [
      { p: "An aged Discord account is simply an account created years ago — 2016, 2018, 2021 and so on. The creation date shows on the profile as **Member Since**." },
      { h2: "Why account age matters" },
      { ul: ["Some servers and moderation bots block or flag brand-new accounts.", "An older \"Member Since\" date looks more established.", "Older years are rarer, which is why a 2016 account costs more than a 2021 one."] },
      { h2: "What \"Full Access\" means" },
      { p: "You receive the account's **email and password**, so you can change both and take full control. Nobody else should be able to get back in once you've secured it." },
      { h2: "Do this first" },
      { ol: ["Log in and change the **password**.", "Change the account **email** to one you own.", "Turn on **two-factor authentication** (User Settings → My Account).", "Log out of all other sessions (User Settings → Devices)."] },
      { tip: "Do these steps right away — before joining servers or changing the profile." },
      { h2: "Things to know" },
      { p: "Discord's Terms of Service don't allow selling or transferring accounts, so Discord can act on accounts it finds have changed hands. Keep your use normal and don't use accounts for spam or anything that breaks Discord's rules." },
      { cta: { title: "Pick an account year", text: "2016 through 2021, full access, buy one or several.", label: "See accounts", href: "/aged-discord-accounts" } },
    ],
  },
  {
    slug: "how-long-do-discord-boosts-last",
    title: "How Long Do Discord Server Boosts Last?",
    short: "How long boosts last",
    description: "How long Discord server boosts last, what happens when they run out, the 7-day transfer cooldown, and how boost plans and warranties work.",
    topic: "Boosts",
    updated: "2026-10-07",
    minutes: 3,
    blocks: [
      { h2: "Boosts from Discord" },
      { p: "A boost you buy from Discord lasts as long as you keep paying for it — it's a monthly or yearly subscription. Cancel it and the boost is removed at the end of the billing period." },
      { h2: "Boosts from GGBoosts" },
      { p: "Our boost plans are a **one-time payment** for a set length: **1 month, 3 months, 1 year or lifetime**. Nothing renews automatically. When a plan ends, the boosts come off and you can buy a new plan whenever you like." },
      { h2: "The 7-day cooldown" },
      { ul: ["Once a boost is used on a server, it can't be moved to another server for **7 days**.", "If a booster leaves or is removed from your server, that boost is gone from your count — another reason not to kick boosting accounts."] },
      { h2: "What happens when boosts drop" },
      { p: "If your boost count falls below what your level needs, the server drops a level and the higher perks switch off. See what each level needs in our [boost levels guide](/guides/discord-server-boost-levels)." },
      { p: "Every GGBoosts boost plan includes a **replacement warranty** for its full length. If a boost drops, open a Warranty ticket in our Discord with your order ID." },
      { cta: { title: "Choose a plan length", text: "Monthly, yearly or lifetime — one payment, no renewals.", label: "See boost plans", href: "/products" } },
    ],
  },
];

/** Guides shown in the top-menu dropdown, in order, with a one-line hint under each. */
export const menuGuides: { slug: string; label: string; hint: string }[] = [
  { slug: "discord-server-boost-levels", label: "Discord Boost Levels", hint: "Boosts needed for Level 1–3" },
  { slug: "discord-nitro-vs-buying-server-boosts", label: "Nitro vs Buying Boosts", hint: "Which is cheaper?" },
  { slug: "online-vs-offline-discord-members", label: "Buying Discord Members", hint: "Online vs offline explained" },
  { slug: "aged-discord-accounts-explained", label: "Aged Discord Accounts", hint: "What you get & how to secure it" },
  { slug: "how-to-make-a-permanent-discord-invite", label: "Permanent Invite Links", hint: "Needed for every order" },
];

/** Knowledge-base sections, in display order. */
export const guideTopics: { id: Guide["topic"]; label: string; blurb: string }[] = [
  { id: "Boosts", label: "Server Boosts", blurb: "Levels, perks, pricing and how long boosts last." },
  { id: "Members", label: "Members & Reactions", blurb: "Growing your member count and adding reactions." },
  { id: "Accounts", label: "Accounts & Nitro", blurb: "Aged accounts and keeping them secure." },
  { id: "Basics", label: "Getting Started", blurb: "Invite links and what we need from you." },
];

export function getGuide(slug: string) {
  return guides.find(g => g.slug === slug) ?? null;
}

export function relatedGuides(slug: string, count = 3) {
  const me = getGuide(slug);
  const same = guides.filter(g => g.slug !== slug && g.topic === me?.topic);
  const rest = guides.filter(g => g.slug !== slug && g.topic !== me?.topic);
  return [...same, ...rest].slice(0, count);
}
