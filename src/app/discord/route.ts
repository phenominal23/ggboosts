import { NextResponse } from "next/server";
import { site } from "@/lib/site-content";

// ggboosts.com/discord → the current Discord invite. Use this short link in Shoppex descriptions,
// delivery messages and emails, so a new invite only ever needs changing in site-content.ts.
export function GET() {
  return NextResponse.redirect(site.supportUrl, 307);
}
