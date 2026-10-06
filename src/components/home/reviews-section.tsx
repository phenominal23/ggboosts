"use client";

import { ArrowRight, ExternalLink, Hash, Plus, Star } from "lucide-react";
import { exampleReviews, reviews as realReviews, trustpilotUrl, type Review } from "@/lib/reviews";
import { reviewsCopy, site } from "@/lib/site-content";

const avatarColors = ["#b8ff3c", "#5865f2", "#ff7ab6", "#ffb547", "#4fd1c5", "#a78bfa", "#f87171"];

function colorFor(name: string) {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return avatarColors[h % avatarColors.length];
}

function Avatar({ name }: { name: string }) {
  return <span className="rv-avatar" style={{ background: colorFor(name) }} aria-hidden="true">{name.slice(0, 1).toUpperCase()}</span>;
}

function Stars({ rating, size = 12 }: { rating: number; size?: number }) {
  return <span className="rv-stars" aria-label={`${rating} out of 5 stars`}>{Array.from({ length: 5 }, (_, i) => <Star key={i} size={size} fill={i < rating ? "currentColor" : "none"} />)}</span>;
}

// Real reviews only. Example data appears only in local development, clearly labeled.
export function getVisibleReviews(): { list: Review[]; examples: boolean } {
  if (realReviews.length) return { list: realReviews, examples: false };
  if (process.env.NODE_ENV !== "production") return { list: exampleReviews, examples: true };
  return { list: [], examples: false };
}

export function ReviewsSection() {
  const { list, examples } = getVisibleReviews();
  if (!list.length) return null;
  const avg = list.reduce((sum, r) => sum + r.rating, 0) / list.length;
  const feed = [...list, ...list];
  const marquee = [...list, ...list, ...list];

  return (
    <section className="lb-section lb-reviews" id="reviews" data-nav-section>
      {examples && <p className="lb-demo-flag lb-demo-flag--block">Example reviews — visible only in local development. Add real reviews in src/lib/reviews.ts; this section is hidden on the live site until you do.</p>}
      <div className="rv-split">
        <div className="rv-intro" data-reveal>
          <span className="lb-eyebrow">{reviewsCopy.eyebrow}</span>
          <h2>{reviewsCopy.titleBefore} <em>{reviewsCopy.titleAccent}</em></h2>
          <p>{reviewsCopy.body}</p>
          <div className="rv-score">
            <strong>{avg.toFixed(1)}</strong>
            <div><Stars rating={Math.round(avg)} size={22} /><span>out of 5 · {list.length} review{list.length === 1 ? "" : "s"}</span></div>
          </div>
          <a className="lb-btn lb-btn--primary" href={site.supportUrl} target="_blank" rel="noreferrer">See all reviews <ArrowRight size={16} /></a>
          {trustpilotUrl && <a className="rv-tp" href={trustpilotUrl} target="_blank" rel="noreferrer">View reviews on Trustpilot <ExternalLink size={12} /></a>}
        </div>
        <div className="rv-channel" data-reveal>
          <div className="rv-channel__top"><span><Hash size={16} /> reviews</span><span className="rv-live">Live feed <i /></span></div>
          <div className="rv-channel__viewport">
            <ul className="rv-channel__list" style={{ animationDuration: `${list.length * 4}s` }}>
              {feed.map((r, i) => (
                <li key={i} aria-hidden={i >= list.length}>
                  <Avatar name={r.name} />
                  <div><p className="rv-name"><b style={{ color: colorFor(r.name) }}>{r.name}</b><Stars rating={r.rating} /></p><p>{r.quote}</p></div>
                </li>
              ))}
            </ul>
          </div>
          <div className="rv-channel__input"><Plus size={15} /> Message #reviews</div>
        </div>
      </div>
      <div className="rv-marquee-label"><i /> Reviews from our Discord</div>
      <div className="rv-marquee" aria-hidden="true">
        <div className="rv-marquee__track" style={{ animationDuration: `${list.length * 6}s` }}>
          {marquee.map((r, i) => (
            <figure key={i} className="rv-mini">
              <div className="rv-mini__head"><Avatar name={r.name} /><div><b>{r.name}</b><Stars rating={r.rating} size={10} /></div></div>
              <blockquote>“{r.quote}”</blockquote>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
