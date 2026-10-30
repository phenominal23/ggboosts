"use client";

import { useState } from "react";
import { ArrowRight, ChevronDown, ExternalLink, Star } from "lucide-react";
import { trustpilotUrl } from "@/lib/reviews";
import { type ShownReview, useReviews } from "@/lib/use-reviews";
import { reviewsCopy, site } from "@/lib/site-content";
import { DiscordIcon } from "@/components/home/site-chrome";

// Reviews shown as a wall of the same embeds our /vouch bot posts in Discord.
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

function shortDate(iso?: string) {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function Avatar({ name, src }: { name: string; src?: string }) {
  const [failed, setFailed] = useState(false);
  if (src && !failed) return <img className="vw-ava" src={src} alt="" aria-hidden="true" loading="lazy" referrerPolicy="no-referrer" onError={() => setFailed(true)} />;
  return <span className="vw-ava" style={{ background: colorFor(name) }} aria-hidden="true">{name.slice(0, 1).toUpperCase()}</span>;
}

function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return <span className="vw-stars" role="img" aria-label={`${rating} out of 5 stars`}>{Array.from({ length: 5 }, (_, i) => <Star key={i} size={size} fill={i < rating ? "currentColor" : "none"} />)}</span>;
}

function VouchCard({ r }: { r: ShownReview }) {
  const name = displayName(r.name);
  const date = shortDate(r.createdAt);
  return (
    <figure className="vw-card">
      <div className="vw-card__head">
        <Avatar name={name} src={r.avatar} />
        <div>
          <b style={{ color: colorFor(name) }}>{name}</b>
          <span className="vw-verified">Verified purchase</span>
        </div>
        {r.n ? <span className="vw-num">#{r.n}</span> : null}
      </div>
      <div className="vw-embed">
        <Stars rating={r.rating} />
        <blockquote>{cleanQuote(r.quote) || "Great service."}</blockquote>
        {(r.product || date) && (
          <figcaption>
            {r.product && <span className="vw-chip">{r.product}</span>}
            {date && <span className="vw-date">{date}</span>}
          </figcaption>
        )}
      </div>
    </figure>
  );
}

export function ReviewsSection() {
  const { list, examples } = useReviews();
  const [open, setOpen] = useState(false);
  if (!list.length) return null;
  const avg = list.reduce((sum, r) => sum + r.rating, 0) / list.length;
  const fives = list.filter(r => r.rating === 5).length;
  const shown = open ? list : list.slice(0, 6);

  return (
    <section className="gs-section vw" id="reviews" data-nav-section>
      {examples && <p className="gs-demo-flag gs-demo-flag--block">Example reviews — visible only in local development.</p>}

      <div className="vw-top" data-reveal>
        <header className="gs-head gs-head--left">
          <span className="gs-eyebrow">{reviewsCopy.eyebrow}</span>
          <h2>{reviewsCopy.titleBefore} <em>{reviewsCopy.titleAccent}</em></h2>
          <p>{reviewsCopy.body}</p>
        </header>

        <div className="vw-score">
          <div className="vw-score__num"><strong>{avg.toFixed(1)}</strong><Stars rating={Math.round(avg)} size={18} /></div>
          <ul>
            <li><b>{list.length}</b> vouch{list.length === 1 ? "" : "es"}</li>
            <li><b>{Math.round((fives / list.length) * 100)}%</b> five stars</li>
          </ul>
          <a className="gs-btn gs-btn--ghost" href={site.supportUrl} target="_blank" rel="noreferrer"><DiscordIcon size={16} /> Read them in Discord</a>
          {trustpilotUrl && <a className="vw-tp" href={trustpilotUrl} target="_blank" rel="noreferrer">Trustpilot <ExternalLink size={12} /></a>}
        </div>
      </div>

      <div className="vw-wall" data-reveal>
        {shown.map((r, i) => <VouchCard key={`${r.n ?? "m"}-${i}`} r={r} />)}
      </div>

      {list.length > 6 && (
        <div className="vw-more">
          <button type="button" className="gs-btn gs-btn--ghost" onClick={() => setOpen(o => !o)} aria-expanded={open}>
            {open ? "Show less" : `Show all ${list.length} vouches`} <ChevronDown size={16} style={{ transform: open ? "rotate(180deg)" : undefined }} />
          </button>
          <a className="vw-cta" href="#pricing">Ready to join them? <ArrowRight size={15} /></a>
        </div>
      )}
    </section>
  );
}
