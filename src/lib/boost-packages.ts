// Match explicit labels only. Never infer quantities from price or stock.
export const LIFETIME = 0;

export function getBoostCount(title: string): number | null {
  const match = title.match(/\b(8|14|20|30)\s*(?:x\s*)?(?:server\s+)?boosts?\b/i);
  return match ? Number(match[1]) : null;
}

// Returns months (1, 3, 12) or LIFETIME (0). Ambiguous labels return null.
export function getDuration(title: string): number | null {
  const lifetime = /\blifetime\b/i.test(title);
  const matches = [...title.matchAll(/\b(1|3|12)\s*[- ]?\s*(months?|mos?|years?)\b/gi)];
  const durations = matches.map(match => /^year/i.test(match[2]) ? Number(match[1]) * 12 : Number(match[1]));
  if (lifetime) durations.push(LIFETIME);
  const unique = [...new Set(durations)];
  return unique.length === 1 && [LIFETIME, 1, 3, 12].includes(unique[0]) ? unique[0] : null;
}

export function getServerLevel(count: number): number {
  return count >= 14 ? 3 : count >= 7 ? 2 : count >= 2 ? 1 : 0;
}

export function formatDuration(duration: number | null): string {
  if (duration === LIFETIME) return "Lifetime";
  if (duration === 12) return "1 Year";
  if (duration === null) return "";
  return `${duration} Month${duration === 1 ? "" : "s"}`;
}
