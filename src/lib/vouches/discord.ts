import { createPublicKey, verify } from "node:crypto";

// Discord helpers for the /vouch bot. The bot runs as an HTTP "interactions endpoint" on Vercel,
// so there is no always-on bot process to host.

const API = "https://discord.com/api/v10";

export const PRODUCTS = [
  "Server Boosts",
  "Discord Nitro",
  "Nitro Tokens",
  "Aged Account",
  "Nitro Account",
  "Server Members",
  "Message Reactions",
  "Other",
] as const;

/** Slash commands registered in your server (see /api/discord/register). */
export const COMMANDS = [
  {
    name: "vouch",
    description: "Leave a review for your GGBoosts order (may be shown on ggboosts.com)",
    contexts: [0],
    options: [
      {
        type: 4, name: "rating", description: "How many stars?", required: true,
        choices: [5, 4, 3, 2, 1].map(n => ({ name: `${"⭐".repeat(n)} (${n}/5)`, value: n })),
      },
      { type: 3, name: "product", description: "What did you buy?", required: true, choices: PRODUCTS.map(p => ({ name: p, value: p })) },
      { type: 3, name: "message", description: "How did it go?", required: true, min_length: 5, max_length: 400 },
      { type: 11, name: "proof", description: "Optional screenshot (e.g. your boosted server)", required: false },
    ],
  },
  {
    name: "vouch-remove",
    description: "Staff: remove a vouch from the website by its number",
    contexts: [0],
    default_member_permissions: "8192", // Manage Messages
    options: [{ type: 4, name: "number", description: "Vouch number", required: true, min_value: 1 }],
  },
];

/** Verifies Discord's Ed25519 request signature. Discord rejects the endpoint if this is wrong. */
export function verifyDiscordRequest(rawBody: string, signature: string | null, timestamp: string | null, publicKeyHex: string | undefined) {
  if (!signature || !timestamp || !publicKeyHex) return false;
  try {
    const key = createPublicKey({ key: { kty: "OKP", crv: "Ed25519", x: Buffer.from(publicKeyHex, "hex").toString("base64url") }, format: "jwk" });
    return verify(null, Buffer.from(timestamp + rawBody), key, Buffer.from(signature, "hex"));
  } catch {
    return false;
  }
}

export async function discordApi(path: string, init: { method: string; body?: unknown }) {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) throw new Error("DISCORD_BOT_TOKEN is not set");
  const res = await fetch(`${process.env.DISCORD_API_BASE ?? API}${path}`, {
    method: init.method,
    cache: "no-store",
    signal: AbortSignal.timeout(2000),
    headers: { Authorization: `Bot ${token}`, "Content-Type": "application/json", "User-Agent": "DiscordBot (https://ggboosts.com, 1.0)" },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Discord ${res.status}: ${text.slice(0, 200)}`);
  return text ? JSON.parse(text) : null;
}

export function avatarUrl(user: { id: string; avatar?: string | null }) {
  if (user.avatar) return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128`;
  return `https://cdn.discordapp.com/embed/avatars/${Number((BigInt(user.id) >> BigInt(22)) % BigInt(6))}.png`;
}
