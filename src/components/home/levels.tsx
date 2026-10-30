import { ArrowRight, Check, Headphones, LifeBuoy, ShieldCheck, Zap } from "lucide-react";
import { features, levels } from "@/lib/site-content";

const featureIcons = [Zap, ShieldCheck, Headphones, LifeBuoy];

export function LevelsSection() {
  return (
    <section className="gs-section lv" id="features" data-nav-section>
      <header className="gs-head gs-head--left" data-reveal>
        <span className="gs-eyebrow">{levels.eyebrow}</span>
        <h2>{levels.titleBefore} <em>{levels.titleAccent}</em></h2>
        <p>{levels.body}</p>
      </header>

      <ol className="lv__ladder" data-reveal>
        {levels.tiers.map(t => (
          <li key={t.level} className={`lv__tier ${t.level === 3 ? "is-top" : ""}`}>
            <div className="lv__node"><span>{t.level}</span></div>
            <div className="lv__card">
              <div className="lv__head">
                <h3>Level {t.level}</h3>
                <span className="lv__need">{t.boosts} boosts</span>
              </div>
              <ul>{t.perks.map(p => <li key={p}><Check size={14} /> {p}</li>)}</ul>
              {t.level === 3
                ? <a className="gs-btn gs-btn--primary" href="#pricing">Get Level 3 <ArrowRight size={16} /></a>
                : <a className="lv__more" href="#pricing">See packages →</a>}
            </div>
          </li>
        ))}
      </ol>

      <div className="why" data-reveal>
        <span className="why__label">{features.eyebrow}</span>
        <ul>
          {features.items.map((f, i) => {
            const Icon = featureIcons[i] ?? Zap;
            return (
              <li key={f.title}>
                <span className="why__icon"><Icon size={18} /></span>
                <div><h3>{f.title}</h3><p>{f.text}</p></div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
