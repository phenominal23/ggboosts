"use client";

import { useRef, type CSSProperties, type PointerEvent } from "react";
import { AudioLines, Check, ChevronDown, Hash, Headphones, Radio, Sparkles, Users, Volume2, Zap } from "lucide-react";

export function ServerScene({ compact = false, count = 14 }: { compact?: boolean; count?: number }) {
  const scene = useRef<HTMLDivElement>(null);
  function tilt(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--rx", `${(event.clientY - bounds.top - bounds.height / 2) / -65}deg`);
    event.currentTarget.style.setProperty("--ry", `${(event.clientX - bounds.left - bounds.width / 2) / 65}deg`);
  }
  return <div className={`server-scene ${compact ? "scene-compact" : ""}`} ref={scene} onPointerMove={tilt} onPointerLeave={() => { scene.current?.style.setProperty("--rx", "0deg"); scene.current?.style.setProperty("--ry", "0deg"); }} aria-label="Illustration of a customized gaming community server">
    <div className="scene-halo"/><div className="scene-orbit orbit-a"/><div className="scene-orbit orbit-b"/>
    <div className="scene-particles" aria-hidden="true">{Array.from({length:18},(_,i)=><i key={i} style={{"--i":i, left:`${(i*37+9)%100}%`, top:`${(i*23+7)%100}%`} as CSSProperties}/>)}</div>
    <div className="scene-depth">
      <div className="server-window">
        <div className="window-top"><span/><span/><span/><small>YOUR COMMUNITY / REIMAGINED</small><Radio size={12}/></div>
        <div className="server-window-body">
          <div className="guild-rail"><b><Zap size={20}/></b><i>G</i><i><Sparkles size={18}/></i><i>+</i><span/></div>
          <div className="server-channels"><strong>THE GG LOUNGE <ChevronDown size={10}/></strong><small>YOUR SPACE</small><span><Hash/> welcome</span><span className="channel-active"><Hash/> the-hangout</span><span><Hash/> highlights</span><small>VOICE CHANNELS</small><span><Volume2/> The lobby</span><span><Volume2/> Party up</span><div className="voice-members"><i/><i/><i/><AudioLines size={12}/></div><div className="voice-status"><Headphones size={15}/><div>In your element<small>YOUR COMMUNITY</small></div></div></div>
          <div className="server-main"><div className="server-channel-name"><Hash size={15}/> the-hangout <Users size={14}/></div><div className="server-banner"><div className="banner-mountain"/><span>GOOD GAMES.<br/><b>GREAT COMPANY.</b></span><div className="banner-monogram">GG</div></div><div className="server-welcome"><span className="welcome-icon"><Zap size={20}/></span><div><strong>This is your place.</strong><p>Make it unmistakably yours.</p></div></div><div className="server-boost-message"><Sparkles size={16}/><div>Your next chapter starts here.<small>A little more room to stand out.</small></div></div><div className="mock-message"><i className="avatar violet"/><div><b>Your community</b><span/><span/></div></div><div className="mock-message"><i className="avatar mint"/><div><b>Your kind of energy</b><span/></div></div><div className="message-input"><span>+</span> Message #the-hangout <Sparkles size={12}/></div></div>
        </div>
      </div>
      <div className="floating-boost"><div className="crystal"><Zap fill="currentColor" strokeWidth={1}/></div><div><small>THE NEXT CHAPTER</small><strong>Boost your world.</strong><span>DISCORD SERVER BOOSTS</span></div></div>
      <div className="floating-signal"><span><AudioLines size={16}/> YOUR SERVER, AMPLIFIED</span><div className="signal-bars">{Array.from({length:22},(_,i)=><i key={i} style={{"--i":i,"--bar":`${20+(i*17)%65}%`} as CSSProperties}/>)}</div><small>MORE OF YOUR ENERGY</small></div>
      <div className="floating-count"><span><Zap size={14}/> BOOST CONCEPT</span><strong key={count}>{count}<small>×</small></strong><div className="count-pips">{Array.from({length:7},(_,i)=><i key={i}/>)}</div><small>PACKAGE VISUALIZATION</small></div>
      <span className="scene-spark spark-a">✦</span><span className="scene-spark spark-b">✦</span>
    </div>
    <div className="scene-label"><span/><small>ILLUSTRATIVE SERVER PREVIEW</small><Check size={11}/></div>
  </div>;
}
