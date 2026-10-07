"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, BookOpen, Rocket, Search, UserRound, Users } from "lucide-react";
import { type Guide, guides, guideTopics } from "@/lib/guides";

const topicIcons: Record<Guide["topic"], typeof Rocket> = { Boosts: Rocket, Members: Users, Accounts: UserRound, Basics: BookOpen };
const slugOf = (id: string) => id.toLowerCase();

/** Knowledge-base view of all guides: search box, topic jump links, and one card per topic. */
export function GuidesBrowser() {
  const [q, setQ] = useState("");
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  const hits = words.length ? guides.filter(g => words.every(w => `${g.title} ${g.description} ${g.topic}`.toLowerCase().includes(w))) : [];

  return (
    <>
      <div className="kb-search">
        <Search size={18} />
        <input type="search" value={q} onChange={e => setQ(e.target.value)} placeholder="Search guides — e.g. invite, level 3, members" aria-label="Search guides" />
      </div>
      {!words.length && (
        <nav className="kb-topics" aria-label="Topics">
          {guideTopics.filter(t => guides.some(g => g.topic === t.id)).map(t => <a key={t.id} href={`#${slugOf(t.id)}`}>{t.label}</a>)}
        </nav>
      )}

      <section className="lb-section lb-section--tight">
        {words.length ? (
          <div className="kb-results">
            <div className="kb-section">
              <header><span><Search size={18} /></span><div><h2>{hits.length} result{hits.length === 1 ? "" : "s"}</h2><p>for “{q.trim()}”</p></div></header>
              {hits.length ? (
                <ul>{hits.map(g => <li key={g.slug}><Link href={`/guides/${g.slug}`}>{g.title}<small>{g.minutes} min</small></Link></li>)}</ul>
              ) : <p className="kb-empty">No guides match that. Try another word, or ask us in Discord.</p>}
            </div>
          </div>
        ) : (
          <div className="kb-sections">
            {guideTopics.map(t => {
              const list = guides.filter(g => g.topic === t.id);
              if (!list.length) return null;
              const Icon = topicIcons[t.id];
              return (
                <div key={t.id} id={slugOf(t.id)} className="kb-section">
                  <header><span><Icon size={18} /></span><div><h2>{t.label}</h2><p>{t.blurb}</p></div></header>
                  <ul>{list.map(g => <li key={g.slug}><Link href={`/guides/${g.slug}`}>{g.title}<small>{g.minutes} min <ArrowRight size={12} /></small></Link></li>)}</ul>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
