import { NextResponse } from "next/server";
import { listVouches, vouchStoreReady } from "@/lib/vouches/store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Public feed of recent /vouch reviews for the homepage. Only name, stars, product and message.
export async function GET() {
  if (!vouchStoreReady()) return NextResponse.json({ vouches: [] });
  try {
    const vouches = (await listVouches(30)).map(v => ({ n: v.n, name: v.name, rating: v.rating, product: v.product, quote: v.message, createdAt: v.createdAt }));
    return NextResponse.json({ vouches }, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } });
  } catch {
    return NextResponse.json({ vouches: [] });
  }
}
