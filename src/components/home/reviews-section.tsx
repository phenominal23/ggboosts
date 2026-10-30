"use client";

import { useState } from "react";
import { ArrowRight, ExternalLink, Hash, Plus, Star } from "lucide-react";
import { trustpilotUrl } from "@/lib/reviews";
import { useReviews } from "@/lib/use-reviews";
import { reviewsCopy, site } from "@/lib/site-content";

// Reviews shown as an auto-scrolling #reviews Discord channel.
const avatarColors = ["#b8ff3c", "#5865f2", "#ff7ab6", "#ffb547", "#4fd1c5", "#a78bfa", "#f87171"];

function colorFor(name: string) {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return avatarColors[h % avatarColors.length];
}

// Discord names like ";" or "." read as broken on the site.
function displayName(name: string) {
  return /[\p{L}\p{N}]/u.test(name) ? name.trim() : "Verified buyer";
}

// Drop "vouch —" prefixes and typed-in star emoji (we already show real stars).
function cleanQuote(q: string) {
  return q.replace(/^\s*\+?vouch\s*[-—–:|]*\s*/i, "").replace(/[⭐🌟]+/gu, "").replace(/\s{2,}/g, " ").trim();
}

function Avatar({ name, src }: { name: string; src?: string }) {
  const [failed, setFailed] = useState(false);
  if (src && !failed) return <img className="rv-avatar rv-avatar--img" src={src} alt="" aria-hidden="true" loading="lazy" referrerPolicy="no-referrer" onError={() => setFailed(true)} />;
  return <span className="rv-avatar" style={{ background: colorFor(name) }} aria-hidden="true">{name.slice(0, 1).toUpperCase()}</span>;
}

function Stars({ rating, size = 12 }: { rating: number; size?: number }) {
  return <span className="rv-stars" role="img" aria-label={`${rating} out of 5 stars`}>{Array.from({ length: 5 }, (_, i) => <Star key={i} size={size} fill={i < rating ? "currentColor" : "none"} />)}</span>;
}

export function ReviewsSection() {
  const { list, examples } = useReviews();
  if (!list.length) return null;
  const avg = list.reduce((sum, r) => sum + r.rating, 0) / list.length;
  const feed = [...list, ...list];

  return (
    <section className="gs-section gs-reviews" id="reviews" data-nav-section>
      {examples && <p className="gs-demo-flag gs-demo-flag--block">Example reviews — visible only in local development.</p>}
      <div className="rv-split">
        <div className="rv-intro" data-reveal>
          <span className="gs-eyebrow">{reviewsCopy.eyebrow}</span>
          <h2>{reviewsCopy.titleBefore} <em>{reviewsCopy.titleAccent}</em></h2>
          <p>{reviewsCopy.body}</p>
          <div className="rv-score">
            <strong>{avg.toFixed(1)}</strong>
            <div><Stars rating={Math.round(avg)} size={22} /><span>out of 5 · {list.length} review{list.length === 1 ? "" : "s"}</span></div>
          </div>
          <a className="gs-btn gs-btn--primary" href={site.supportUrl} target="_blank" rel="noreferrer">See all reviews <ArrowRight size={16} /></a>
          {trustpilotUrl && <a className="rv-tp" href={trustpilotUrl} target="_blank" rel="noreferrer">View reviews on Trustpilot <ExternalLink size={12} /></a>}
        </div>
        <div className="rv-channel" data-reveal>
          <div className="rv-channel__top"><span><Hash size={16} /> reviews</span><span className="rv-live">Live feed <i /></span></div>
          <div className="rv-channel__viewport">
            <ul className="rv-channel__list" style={{ animationDuration: `${Math.max(list.length, 4) * 4}s` }}>
              {feed.map((r, i) => {
                const name = displayName(r.name);
                return (
                  <li key={i} aria-hidden={i >= list.length}>
                    <Avatar name={name} src={r.avatar} />
                    <div><p className="rv-name"><b style={{ color: colorFor(name) }}>{name}</b><Stars rating={r.rating} />{r.product && <span className="rv-product">{r.product}</span>}</p><p>{cleanQuote(r.quote) || "Great service."}</p></div>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="rv-channel__input"><Plus size={15} /> Message #reviews</div>
        </div>
      </div>
    </section>
  );
}
