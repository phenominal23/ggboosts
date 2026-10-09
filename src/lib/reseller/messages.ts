// Customer-facing delivery text used when an order completes automatically.
const HELP = "Questions? Open a ticket with your order ID: https://discord.gg/Bewfk2dHzj";

export type Kind = "boosts" | "members" | "nitro" | "content";

export function kindOf(title: string): Kind {
  const t = title.toLowerCase();
  if (/\btoken/.test(t)) return "content";
  if (/\bboosts?\b/.test(t)) return "boosts";
  if (/\bmembers?\b|\breactions?\b/.test(t)) return "members";
  if (/\bnitro\b/.test(t) && !/\baccount/.test(t)) return "nitro";
  return "content"; // accounts, Nitro accounts, tokens: need login details/codes to deliver
}

export function deliveredText(title: string, serials: string[]): string {
  const kind = kindOf(title);
  if (kind === "nitro" && serials.length) {
    return `✅ Your Discord Nitro is ready!\n\nRedeem it by opening the link below while logged in to the Discord account you want Nitro on:\n\n${serials.join("\n")}\n\n${HELP}`;
  }
  if (serials.length) return `✅ Your ${title} is ready! Your details are below.\n\n${serials.join("\n")}\n\nSecure anything with a login right away: change the password and email, and turn on 2FA.\n\n${HELP}`;
  if (kind === "boosts") return `✅ Your ${title} order has been sent to your server!\n\nIt can take a few minutes for Discord to show the new boost count. Don't kick or ban the boosting accounts — removed boosts aren't covered by the warranty.\n\n${HELP}`;
  return `✅ Your ${title} order has been delivered!\n\nCheck your server — it can take a few minutes for Discord to update. You can remove the delivery bot now and turn your anti-raid settings back on. Don't kick or ban delivered members.\n\n${HELP}`;
}

/** Whether an order can be completed without content from Liteboosts (e.g. boosts/members are delivered to the server). */
export function canAutoComplete(title: string, serials: string[]) {
  return serials.length > 0 || kindOf(title) === "boosts" || kindOf(title) === "members";
}
