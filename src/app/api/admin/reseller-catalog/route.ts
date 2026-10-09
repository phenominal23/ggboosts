import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/reseller/admin-auth";
import { listAllProducts, ResellerError, resellerFetch } from "@/lib/reseller/client";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Private: lists the Liteboosts wholesale catalog (IDs, prices, required fields) so products can be mapped.
// Open /api/admin/reseller-catalog?token=YOUR_ADMIN_TOKEN — never share that link.
export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token");
  if (!isAdmin(token)) return NextResponse.json({ error: "Not found" }, { status: 404 });
  try {
    const [products, balance, me] = await Promise.all([
      listAllProducts(),
      resellerFetch<{ data: unknown }>("/balance"),
      resellerFetch<{ data: { shop?: unknown; tier?: unknown } }>("/me"),
    ]);
    return NextResponse.json({
      shop: me.data.shop, tier: me.data.tier, balance: balance.data,
      products: products.map(p => ({
        title: p.title, product_id: p.product_id, type: p.type, orderable: p.orderable,
        base_price: p.base_price, wholesale_price: p.wholesale_price, discount_percent: p.discount_percent,
        custom_fields: p.custom_fields.map(f => ({ name: f.name, type: f.type, required: f.required })),
        variants: p.variants.map(v => ({ title: v.title, variant_id: v.variant_id, orderable: v.orderable, base_price: v.base_price, wholesale_price: v.wholesale_price })),
      })),
    }, { headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" } });
  } catch (e) {
    const err = e instanceof ResellerError ? { status: e.status, code: e.code, message: e.message } : { status: 500, code: "ERROR", message: String(e) };
    return NextResponse.json({ error: err }, { status: 502, headers: { "Cache-Control": "no-store" } });
  }
}
