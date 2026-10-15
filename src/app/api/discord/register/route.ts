import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/reseller/admin-auth";
import { COMMANDS, discordApi } from "@/lib/vouches/discord";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// One-time setup: open https://ggboosts.com/api/discord/register?token=ADMIN_TOKEN
// to add /vouch and /vouch-remove to your server. Safe to run again after changes.
export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token");
  if (!isAdmin(token)) return NextResponse.json({ error: "not found" }, { status: 404 });

  const app = process.env.DISCORD_APP_ID;
  const guild = process.env.DISCORD_GUILD_ID;
  if (!app || !guild || !process.env.DISCORD_BOT_TOKEN) {
    return NextResponse.json({ error: "Set DISCORD_APP_ID, DISCORD_GUILD_ID and DISCORD_BOT_TOKEN in Vercel, then redeploy." }, { status: 500 });
  }
  try {
    const result = (await discordApi(`/applications/${app}/guilds/${guild}/commands`, { method: "PUT", body: COMMANDS })) as { name: string }[];
    return NextResponse.json({ ok: true, registered: result.map(c => `/${c.name}`) });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : String(e) }, { status: 502 });
  }
}
