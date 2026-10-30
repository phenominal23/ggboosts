"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Hash, Rocket, Volume2 } from "lucide-react";
import { useAnimationGate } from "@/components/home/use-animation-gate";
import { getServerLevel } from "@/lib/boost-packages";

// Illustration only: a pretend Discord server whose boost count climbs from 0 to 14 (Level 3), then loops.
const TARGET = 14;
const BOOSTERS = ["nova", "kai", "rex", "mila", "zed", "juno", "ash"];
const COLORS = ["#b8ff3c", "#5865f2", "#ff73fa", "#ffb547", "#4fd1c5", "#a78bfa", "#f87171"];

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const q = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setReduced(q.matches);
    on(); q.addEventListener("change", on);
    return () => q.removeEventListener("change", on);
  }, []);
  return reduced;
}

export function ServerWindow() {
  const ref = useRef<HTMLDivElement>(null);
  const active = useAnimationGate(ref);
  const reduced = useReducedMotion();
  const [boosts, setBoosts] = useState(0);

  useEffect(() => {
    if (reduced) { setBoosts(TARGET); return; }
    if (!active) return;
    // Two boosts per message, a short pause at Level 3, then start over.
    const t = window.setInterval(() => setBoosts(b => (b >= TARGET + 8 ? 0 : b + 2)), 700);
    return () => window.clearInterval(t);
  }, [active, reduced]);

  const shown = Math.min(boosts, TARGET);
  const level = getServerLevel(shown);
  const nextGoal = level >= 3 ? TARGET : level === 2 ? 14 : level === 1 ? 7 : 2;
  const messages = Array.from({ length: Math.floor(shown / 2) }, (_, i) => i).slice(-5);

  return (
    <div ref={ref} className="sw" role="img" aria-label="Illustration: a Discord server's boost count climbing from 0 to 14 boosts, reaching Level 3">
      <div className="sw__rail" aria-hidden="true">
        <span className="sw__srv is-active"><img src="/ggboosts-mark.svg" alt="" /></span>
        <i className="sw__sep" />
        <span className="sw__srv" style={{ background: "#5865f2" }}>A</span>
        <span className="sw__srv" style={{ background: "#3ba55c" }}>M</span>
        <span className="sw__srv sw__srv--add">+</span>
      </div>

      <div className="sw__side" aria-hidden="true">
        <div className="sw__server">Your Server <ChevronDown size={14} /></div>
        <div className="sw__goal">
          <div className="sw__goal-top"><b>Level {level}</b><span>{shown}/{nextGoal === TARGET && level >= 3 ? TARGET : nextGoal} boosts</span></div>
          <div className="sw__track"><i style={{ width: `${(shown / TARGET) * 100}%` }} /><em style={{ left: `${(2 / 14) * 100}%` }} /><em style={{ left: `${(7 / 14) * 100}%` }} /></div>
          <div className="sw__goal-lv"><span className={level >= 1 ? "on" : ""}>L1</span><span className={level >= 2 ? "on" : ""}>L2</span><span className={level >= 3 ? "on" : ""}>L3</span></div>
        </div>
        <div className="sw__cat">Text channels</div>
        <div className="sw__ch"><Hash size={15} /> welcome</div>
        <div className="sw__ch is-active"><Hash size={15} /> general</div>
        <div className="sw__ch"><Hash size={15} /> announcements</div>
        <div className="sw__cat">Voice</div>
        <div className="sw__ch"><Volume2 size={15} /> Lounge</div>
      </div>

      <div className="sw__chat" aria-hidden="true">
        <div className="sw__chat-top"><Hash size={17} /> general</div>
        <ul className="sw__msgs">
          <li className="sw__msg">
            <span className="sw__ava" style={{ background: "#5865f2" }}>Y</span>
            <div><p className="sw__who">you <time>Today</time></p><p>ok let&apos;s get this server to level 3 🚀</p></div>
          </li>
          {messages.map(i => (
            <li key={`${i}-${boosts < 2 ? "r" : ""}`} className="sw__sys">
              <Rocket size={15} />
              <p><b style={{ color: COLORS[i % COLORS.length] }}>{BOOSTERS[i % BOOSTERS.length]}</b> just boosted the server <b>×2</b>!</p>
            </li>
          ))}
          {shown >= TARGET && (
            <li className="sw__sys sw__sys--win"><span>🎉</span><p><b>Your Server</b> has reached <b>Level 3</b>!</p></li>
          )}
        </ul>
        <div className="sw__input">Message #general</div>
      </div>
    </div>
  );
}
