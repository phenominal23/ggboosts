// Posts automation events to a private Discord channel (DISCORD_ALERT_WEBHOOK_URL). Never throws.
export async function alert(title: string, lines: Record<string, string | number | null | undefined>, color = 0xb8ff3c) {
  const url = process.env.DISCORD_ALERT_WEBHOOK_URL;
  if (!url) return;
  const fields = Object.entries(lines).filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([name, value]) => ({ name, value: String(value).slice(0, 1000), inline: String(value).length < 40 }));
  try {
    await fetch(url, {
      method: "POST", headers: { "Content-Type": "application/json" }, signal: AbortSignal.timeout(3000),
      body: JSON.stringify({ username: "GGBoosts Orders", embeds: [{ title, color, fields, timestamp: new Date().toISOString() }] }),
    });
  } catch { /* alerts are best-effort */ }
}
