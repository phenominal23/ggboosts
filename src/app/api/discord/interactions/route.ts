import { NextResponse } from "next/server";
import { avatarUrl, discordApi, PRODUCTS, verifyDiscordRequest } from "@/lib/vouches/discord";
import { alert } from "@/lib/reseller/alerts";
import { claimCooldown, nextVouchNumber, releaseCooldown, removeVouch, saveVouch, type Vouch, vouchStoreReady } from "@/lib/vouches/store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Discord "Interactions Endpoint URL": https://ggboosts.com/api/discord/interactions
// Handles /vouch (customers) and /vouch-remove (staff). Discord needs an answer within 3 seconds.

type Option = { name: string; value: string | number };
type Interaction = {
  type: number;
  guild_id?: string;
  channel_id?: string;
  member?: { roles?: string[]; permissions?: string; user?: DiscordUser };
  user?: DiscordUser;
  data?: { name: string; options?: Option[]; resolved?: { attachments?: Record<string, { url: string; content_type?: string }> } };
};
type DiscordUser = { id: string; username: string; global_name?: string | null; avatar?: string | null };

const LIME = 0xb8ff3c;
const COOLDOWN_SECONDS = 10 * 60;
const EPHEMERAL = 64;

const reply = (content: string) => NextResponse.json({ type: 4, data: { content, flags: EPHEMERAL, allowed_mentions: { parse: [] } } });

function vouchEmbed(v: Vouch) {
  return {
    title: "New Customer Review",
    color: LIME,
    thumbnail: { url: v.avatar },
    fields: [
      { name: "User Feedback", value: `${"⭐".repeat(v.rating)} (${v.rating}/5)` },
      { name: "Product", value: `\`${v.product}\`` },
      { name: "Review", value: `> ${v.message.replace(/\n+/g, "\n> ")}` },
      { name: "Vouch Nº", value: String(v.n), inline: true },
      { name: "Vouched by", value: `<@${v.userId}>`, inline: true },
      { name: "Vouched at", value: `<t:${Math.floor(v.createdAt / 1000)}:f>`, inline: true },
    ],
    ...(v.proof ? { image: { url: v.proof } } : {}),
    footer: { text: "GGBoosts.com • Leave yours with /vouch" },
    timestamp: new Date(v.createdAt).toISOString(),
  };
}

async function handleVouch(i: Interaction) {
  const user = i.member?.user ?? i.user;
  if (!user || !i.guild_id) return reply("Use /vouch inside the GGBoosts Discord server.");
  if (!vouchStoreReady()) return reply("Vouches are not set up yet — please tell staff.");

  const roleId = process.env.VOUCH_ROLE_ID;
  if (roleId && !i.member?.roles?.includes(roleId)) return reply("Only customers can vouch. If you've ordered, ask staff for the Customer role.");

  const opt = (name: string) => i.data?.options?.find(o => o.name === name)?.value;
  const rating = Math.min(5, Math.max(1, Number(opt("rating")) || 0));
  const product = PRODUCTS.includes(String(opt("product")) as (typeof PRODUCTS)[number]) ? String(opt("product")) : "Other";
  const message = String(opt("message") ?? "").trim().slice(0, 400);
  if (!rating || message.length < 5) return reply("Please add a star rating and a short message.");

  const proofId = opt("proof");
  const file = proofId ? i.data?.resolved?.attachments?.[String(proofId)] : undefined;
  const proof = file && (file.content_type ?? "").startsWith("image/") ? file.url : undefined;

  if (!(await claimCooldown(user.id, COOLDOWN_SECONDS))) return reply("Thanks! You just vouched — you can leave another one in a few minutes.");

  const v: Vouch = {
    n: await nextVouchNumber(),
    userId: user.id,
    name: user.global_name || user.username,
    avatar: avatarUrl(user),
    rating, product, message, proof,
    createdAt: Date.now(),
  };
  await saveVouch(v);

  const payload = { embeds: [vouchEmbed(v)], allowed_mentions: { parse: [] } };
  const vouchChannel = process.env.VOUCH_CHANNEL_ID;

  // Typed in #vouches itself: answer with the card right there.
  if (!vouchChannel || i.channel_id === vouchChannel) return NextResponse.json({ type: 4, data: payload });

  // Typed anywhere else (e.g. a ticket): post the card in #vouches and quietly thank the customer.
  // Never post the card in the ticket — if #vouches can't be reached, undo and tell staff.
  try {
    await discordApi(`/channels/${vouchChannel}/messages`, { method: "POST", body: payload });
    return reply(`💚 Thanks for your vouch! It's posted in <#${vouchChannel}> as vouch #${v.n}.`);
  } catch (e) {
    const err = e instanceof Error ? e.message : String(e);
    console.error("vouch post failed", err);
    await removeVouch(v.n).catch(() => {});
    await releaseCooldown(user.id).catch(() => {});
    await alert("⚠️ /vouch couldn't post in #vouches", { Customer: `${v.name} (${user.id})`, Error: err, Fix: "Give the bot View Channel, Send Messages and Embed Links in #vouches, and check VOUCH_CHANNEL_ID" }, 0xf59e0b);
    return reply(`Sorry — your vouch couldn't be posted in <#${vouchChannel}> right now. Staff have been notified; please try /vouch again shortly.`);
  }
}

async function handleRemove(i: Interaction) {
  const perms = BigInt(i.member?.permissions ?? "0");
  if ((perms & BigInt(8192)) === BigInt(0) && (perms & BigInt(8)) === BigInt(0)) return reply("Only staff can remove vouches.");
  const n = Number(i.data?.options?.find(o => o.name === "number")?.value);
  if (!vouchStoreReady() || !n) return reply("Couldn't remove that vouch.");
  const ok = await removeVouch(n);
  return reply(ok ? `Removed vouch #${n} from the website. Delete its Discord message too if needed.` : `Vouch #${n} wasn't found (it may be older than the last 500).`);
}

export async function POST(req: Request) {
  const raw = await req.text();
  const ok = verifyDiscordRequest(raw, req.headers.get("x-signature-ed25519"), req.headers.get("x-signature-timestamp"), process.env.DISCORD_PUBLIC_KEY);
  if (!ok) return new NextResponse("invalid request signature", { status: 401 });

  const i = JSON.parse(raw) as Interaction;
  if (i.type === 1) return NextResponse.json({ type: 1 }); // PING from Discord when you save the URL

  if (i.type === 2) {
    try {
      if (i.data?.name === "vouch") return await handleVouch(i);
      if (i.data?.name === "vouch-remove") return await handleRemove(i);
    } catch (e) {
      console.error("interaction failed", e);
      return reply("Something went wrong — please try again in a minute.");
    }
  }
  return reply("Unknown command.");
}
