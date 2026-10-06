"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Mail, ShieldCheck } from "lucide-react";
import { errorMessage, getPortalClient } from "@/components/dashboard/portal-client";

// Email → 6-digit code login (Shoppex one-time code).
export function PortalLogin({ onSignedIn }: { onSignedIn: () => void }) {
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [remember, setRemember] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const codeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = window.setTimeout(() => setCooldown(c => c - 1), 1000);
    return () => window.clearTimeout(t);
  }, [cooldown]);

  useEffect(() => { if (step === "code") codeRef.current?.focus(); }, [step]);

  async function sendCode(e?: React.FormEvent) {
    e?.preventDefault();
    const value = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) { setError("Enter a valid email address."); return; }
    setBusy(true); setError(null);
    try {
      await getPortalClient().requestOtp(value);
      setStep("code"); setCode(""); setCooldown(30);
    } catch (err) {
      setError(errorMessage(err, "We couldn't send a code right now. Please try again."));
    } finally { setBusy(false); }
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    const value = code.replace(/\D/g, "");
    if (value.length < 6) { setError("Enter the 6-digit code from your email."); return; }
    setBusy(true); setError(null);
    try {
      await getPortalClient().verifyOtp(email.trim(), value, { rememberMe: remember });
      onSignedIn();
    } catch (err) {
      setError(errorMessage(err, "That code didn't work. Check it and try again, or request a new one."));
    } finally { setBusy(false); }
  }

  return (
    <div className="dash-login">
      <div className="dash-login__card">
        <span className="dash-login__icon">{step === "email" ? <Mail size={22} /> : <ShieldCheck size={22} />}</span>
        {step === "email" ? (
          <form onSubmit={sendCode} noValidate>
            <h1>Sign in to your orders</h1>
            <p>Enter the email you used at checkout. We'll send you a one-time code — no password needed.</p>
            <label className="dash-field">
              <span>Email address</span>
              <input type="email" inputMode="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </label>
            {error && <p className="dash-error" role="alert">{error}</p>}
            <button className="lb-btn lb-btn--primary dash-login__submit" type="submit" disabled={busy}>{busy ? "Sending…" : <>Send code <ArrowRight size={16} /></>}</button>
          </form>
        ) : (
          <form onSubmit={verify} noValidate>
            <h1>Check your email</h1>
            <p>If <strong>{email.trim()}</strong> has orders with us, a 6-digit code is on its way. It can take a minute — check spam too.</p>
            <label className="dash-field">
              <span>6-digit code</span>
              <input ref={codeRef} className="dash-code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="••••••" value={code} onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} required />
            </label>
            <label className="dash-check">
              <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />
              <span>Keep me signed in for 30 days</span>
            </label>
            {error && <p className="dash-error" role="alert">{error}</p>}
            <button className="lb-btn lb-btn--primary dash-login__submit" type="submit" disabled={busy}>{busy ? "Verifying…" : <>Sign in <ArrowRight size={16} /></>}</button>
            <div className="dash-login__links">
              <button type="button" onClick={() => { setStep("email"); setError(null); }}><ArrowLeft size={14} /> Use a different email</button>
              <button type="button" onClick={() => sendCode()} disabled={busy || cooldown > 0}>{cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
