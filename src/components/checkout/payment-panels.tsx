"use client";

import { useEffect, useRef, useState } from "react";
import { assertAttribution, mountSquareCard, registerAttributionBadge, type SquareCardController } from "@shoppexio/checkout-js/headless";
import type { CheckoutAttribution, CheckoutPaymentSession, CheckoutSessionView, StartPaymentSessionResult } from "@shoppexio/checkout-js/headless";
import { Check, Copy, ExternalLink, Loader2, Lock } from "lucide-react";
import { friendlyError, getCheckoutClient, money, revealAttribution } from "@/components/checkout/checkout-client";

// Shoppex requires a visible "Powered by Shoppex" link next to the pay button on headless checkouts.
export function AttributionBadge({ attribution }: { attribution: CheckoutAttribution }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!ref.current || !attribution.required) return;
    return registerAttributionBadge(ref.current, { label: attribution.label, href: attribution.href });
  }, [attribution.required, attribution.label, attribution.href]);
  if (!attribution.required) return null;
  return (
    <span ref={ref} className="co-attrib">
      <Lock size={12} /> Secured · <a href={attribution.href} target="_blank" rel="noopener noreferrer">{attribution.label}</a>
    </span>
  );
}

export function CopyField({ label, value }: { label: string; value: string }) {
  const [done, setDone] = useState(false);
  return (
    <div className="co-copy">
      <span className="co-copy__label">{label}</span>
      <div className="co-copy__row">
        <code>{value}</code>
        <button type="button" aria-label={`Copy ${label}`} onClick={async () => {
          try { await navigator.clipboard.writeText(value); setDone(true); setTimeout(() => setDone(false), 1600); } catch { /* clipboard blocked */ }
        }}>{done ? <Check size={15} /> : <Copy size={15} />}</button>
      </div>
    </div>
  );
}

type PanelProps = {
  view: CheckoutSessionView;
  payment: CheckoutPaymentSession;
  email: string;
  onResult: (result: StartPaymentSessionResult) => void;
};

/** Square card fields, mounted straight onto our page. */
export function SquarePanel({ view, payment, email, onResult }: PanelProps) {
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const controller = useRef<SquareCardController | null>(null);

  useEffect(() => {
    if (payment.kind !== "embed" || payment.provider !== "square") return;
    let cancelled = false;
    let mounted: SquareCardController | null = null;
    setReady(false); setError(null);
    mountSquareCard({ client: getCheckoutClient(), session_id: view.id, session: payment, selector: "#ggb-square-card", buyer_email: email })
      .then(c => { mounted = c; if (cancelled) { void c.destroy(); return; } controller.current = c; setReady(true); })
      .catch(e => { if (!cancelled) setError(friendlyError(e)); });
    return () => { cancelled = true; controller.current = null; if (mounted) void mounted.destroy().catch(() => {}); };
  }, [view.id, payment, email]);

  async function pay() {
    if (!controller.current || busy) return;
    setBusy(true); setError(null);
    try {
      await revealAttribution();
      assertAttribution(view.attribution.required);
      onResult(await controller.current.submit());
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="co-pay">
      <h3>Card details</h3>
      <div id="ggb-square-card" className="co-square" />
      {!ready && !error && <p className="co-muted co-inline"><Loader2 size={15} className="co-spin" /> Loading secure card form…</p>}
      {error && <p className="co-error" role="alert">{error}</p>}
      <button type="button" className="lb-btn lb-btn--primary lb-btn--lg co-full" disabled={!ready || busy} onClick={pay}>
        {busy ? <><Loader2 size={17} className="co-spin" /> Processing…</> : <>Pay {money(view.amount, view.currency)}</>}
      </button>
    </div>
  );
}

function qrSrc(qr: string | null | undefined) {
  if (!qr) return null;
  return /^(data:image|https?:)/.test(qr) ? qr : null;
}

function useCountdown(iso: string | null | undefined) {
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    if (!iso) { setLeft(null); return; }
    const end = new Date(iso).getTime();
    if (!Number.isFinite(end)) return;
    const tick = () => setLeft(Math.max(0, Math.floor((end - Date.now()) / 1000)));
    tick();
    const t = window.setInterval(tick, 1000);
    return () => window.clearInterval(t);
  }, [iso]);
  return left;
}

/** Crypto (and other "send to this address") methods. Status comes from polling. */
export function AddressPanel({ view, payment }: { view: CheckoutSessionView; payment: Extract<CheckoutPaymentSession, { kind: "address" }> }) {
  const left = useCountdown(payment.expires_at ?? view.payment_detail?.expires_at);
  const detail = view.payment_detail;
  const qr = qrSrc(payment.qr_code);
  const underpaid = view.payment_status === "UNDERPAID";
  const coin = (detail?.crypto_currency ?? payment.currency).toUpperCase();
  return (
    <div className="co-pay">
      <h3>Send {coin}</h3>
      <p className="co-muted">Send the exact amount below to this address. This page updates on its own once the payment is seen.</p>
      <div className="co-address">
        {qr && <img src={qr} alt={`QR code for the ${coin} payment address`} width={168} height={168} />}
        <div className="co-address__fields">
          <CopyField label="Amount" value={underpaid && detail?.remaining ? detail.remaining : payment.amount} />
          <CopyField label={`${coin} address`} value={payment.address} />
          {payment.note && <CopyField label="Memo / note (required)" value={payment.note} />}
        </div>
      </div>
      {underpaid && detail?.buyer_actionable !== false && detail?.remaining && (
        <p className="co-warn" role="status">We received part of the payment. Send the remaining <b>{detail.remaining} {coin}</b> to the same address.</p>
      )}
      {underpaid && detail?.buyer_actionable === false && (
        <p className="co-warn" role="status">We received part of the payment. Please don't send more — contact support with your order ID and we'll sort it out.</p>
      )}
      <div className="co-waiting">
        <Loader2 size={16} className="co-spin" />
        <span>
          {typeof detail?.confirmations_needed === "number" && (detail.confirmations ?? 0) > 0
            ? `Payment seen — ${detail.confirmations ?? 0}/${detail.confirmations_needed} confirmations`
            : "Waiting for payment…"}
        </span>
        {left !== null && <span className="co-timer">{left > 0 ? `${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")} left` : "Expired"}</span>}
      </div>
      {detail?.tx_explorer_url && <a className="co-textlink" href={detail.tx_explorer_url} target="_blank" rel="noreferrer">View transaction <ExternalLink size={13} /></a>}
    </div>
  );
}

export function ManualPanel({ payment }: { payment: Extract<CheckoutPaymentSession, { kind: "manual" }> }) {
  return (
    <div className="co-pay">
      <h3>Payment instructions</h3>
      {payment.instructions && <p className="co-pre">{payment.instructions}</p>}
      {payment.redirect_url && <a className="lb-btn lb-btn--primary co-full" href={payment.redirect_url} target="_blank" rel="noreferrer">Continue to payment <ExternalLink size={15} /></a>}
      <div className="co-waiting"><Loader2 size={16} className="co-spin" /><span>Waiting for confirmation…</span></div>
    </div>
  );
}

export function WaitingPanel({ text = "Confirming your payment…" }: { text?: string }) {
  return <div className="co-pay"><div className="co-waiting co-waiting--big"><Loader2 size={18} className="co-spin" /><span>{text}</span></div></div>;
}
