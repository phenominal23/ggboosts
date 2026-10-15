"use client";

import { useEffect, useState } from "react";
import { exampleReviews, reviews as manualReviews, type Review } from "@/lib/reviews";

// Reviews shown on the site: live /vouch reviews from Discord first, then any added by hand
// in src/lib/reviews.ts. Example data only appears in local development.

type Result = { list: Review[]; examples: boolean };
let cache: Promise<Review[]> | null = null;

function loadVouches(): Promise<Review[]> {
  cache ??= fetch("/api/vouches")
    .then(r => (r.ok ? r.json() : { vouches: [] }))
    .then((d: { vouches?: { name: string; rating: number; quote: string; product?: string }[] }) =>
      (d.vouches ?? []).map(v => ({ name: v.name, rating: Math.min(5, Math.max(1, v.rating)) as Review["rating"], quote: v.quote, product: v.product })))
    .catch(() => []);
  return cache;
}

function combine(vouches: Review[]): Result {
  const list = [...vouches, ...manualReviews];
  if (list.length) return { list, examples: false };
  if (process.env.NODE_ENV !== "production") return { list: exampleReviews, examples: true };
  return { list: [], examples: false };
}

export function useReviews(): Result {
  const [result, setResult] = useState<Result>(() => combine([]));
  useEffect(() => {
    let alive = true;
    loadVouches().then(v => { if (alive && v.length) setResult(combine(v)); });
    return () => { alive = false; };
  }, []);
  return result;
}
