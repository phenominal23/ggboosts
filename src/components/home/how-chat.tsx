import { Bitcoin, CreditCard, DollarSign, Hash, Rocket } from "lucide-react";
import { howItWorks } from "@/lib/site-content";

// "How it works" shown as a Discord conversation with the store's bot.
function StepVisual({ step }: { step: number }) {
  if (step === 0) {
    return <div className="hc__chips">{[8, 14, 20, 30].map(n => <span key={n} className={n === 14 ? "on" : ""}>{n} boosts</span>)}</div>;
  }
  if (step === 1) {
    return (
      <div className="hc__chips">
        <span><CreditCard size={14} /> Card</span>
        <span><DollarSign size={14} /> Cash App</span>
        <span><Bitcoin size={14} /> Crypto</span>
      </div>
    );
  }
  return <div className="hc__land"><Rocket size={16} /> +14 boosts · <b>Level 3 reached</b></div>;
}

export function HowChat() {
  return (
    <section className="gs-section hc" id="how-it-works" data-nav-section>
      <div className="hc__grid">
        <header className="gs-head gs-head--left" data-reveal>
          <span className="gs-eyebrow">{howItWorks.eyebrow}</span>
          <h2>{howItWorks.title} <em>{howItWorks.titleAccent}</em></h2>
          <p>{howItWorks.body}</p>
        </header>

        <div className="hc__win" data-reveal>
          <div className="hc__top"><Hash size={17} /> how-to-order</div>
          <ul className="hc__msgs">
            <li className="hc__msg">
              <span className="hc__ava hc__ava--user">Y</span>
              <div><p className="hc__who">you</p><p>{howItWorks.question}</p></div>
            </li>
            {howItWorks.steps.map((s, i) => (
              <li key={s.title} className="hc__msg">
                <span className="hc__ava"><img src="/ggboosts-mark.svg" alt="" /></span>
                <div>
                  {i === 0 && <p className="hc__who">GGBoosts <span className="hc__app">APP</span></p>}
                  <div className="hc__embed">
                    <span className="hc__step">Step {i + 1}</span>
                    <h3>{s.title}</h3>
                    <p>{s.text}</p>
                    <StepVisual step={i} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
