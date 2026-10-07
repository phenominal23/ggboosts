"use client";

import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { assertAttribution, HeadlessCheckoutError } from "@shoppexio/checkout-js/headless";
import type { CheckoutGatewayOption, CheckoutPaymentSession, CheckoutSessionView, StartPaymentSessionResult } from "@shoppexio/checkout-js/headless";
import { buildStorefrontCustomFieldPayload, isStorefrontCheckboxCustomFieldValueChecked, normalizeStorefrontCustomFields, validateStorefrontCustomFieldValue, type Product, type StorefrontCustomField } from "@shoppexio/storefront";
import { ArrowLeft, ArrowRight, Bitcoin, Check, CheckCircle2, CreditCard, Loader2, Lock, ShieldCheck, Tag, Wallet, XCircle, Zap } from "lucide-react";
import { GGMark } from "@/components/gg-navigation";
import { DiscordIcon, ShoppexEmbed, SiteBackground } from "@/components/home/site-chrome";
import {
  FAILED, PAID, SITE_URL, WAITING, fieldsForLine, forgetSession, friendlyError, gatewayGroup, getCheckoutClient, isEmail, isSetupError, money, recallSession, rememberSession, revealAttribution, usableGateways,
} from "@/components/checkout/checkout-client";
import { AddressPanel, AttributionBadge, ManualPanel, SquarePanel, WaitingPanel } from "@/components/checkout/payment-panels";
import { getCurrency, getUnitPrice, getVariant } from "@/lib/product-utils";
import { shoppexConfig } from "@/lib/shoppex-config";
import { loadStorefrontData } from "@/lib/storefront-data";
import { site } from "@/lib/site-content";

type Phase =
  | { name: "loading" }
  | { name: "no-product" }
  | { name: "fallback"; product: string; variant?: string; priceVariant: boolean }
  | { name: "error"; message: string }
  | { name: "details" }
  | { name: "form" }
  | { name: "pay"; payment: CheckoutPaymentSession }
  | { name: "waiting" }
  | { name: "done" }
  | { name: "failed"; message: string };

type Billing = { name: string; line1: string; city: string; country: string; postal_code: string };
const emptyBilling: Billing = { name: "", line1: "", city: "", country: "US", postal_code: "" };

const URL_RE = /(https?:\/\/[^\s)]+|(?:www\.)?ggboosts\.(?:com|vercel\.app)\/[\w-]+)/g;
function linkify(text: string) {
  return text.split(URL_RE).map((part, i) => {
    if (i % 2 === 0) return <Fragment key={i}>{part}</Fragment>;
    // Point any terms/privacy/refund link at our own pages.
    const path = part.match(/\/(terms|privacy|refund-policy)\b/)?.[0];
    const href = path ?? (part.startsWith("http") ? part : `https://${part}`);
    return <a key={i} href={href} target="_blank" rel="noreferrer">{path ? `${site.name} ${path.slice(1).replace("-", " ")}` : part}</a>;
  });
}

function fieldHint(field: StorefrontCustomField) {
  const n = field.name.toLowerCase();
  if (n.includes("invite")) return { placeholder: field.placeholder || "https://discord.gg/yourserver", help: "Set it to never expire with unlimited uses so we can deliver." };
  if (n.includes("username")) return { placeholder: field.placeholder || "yourname", help: "So we can reach you on Discord if anything needs your attention." };
  return { placeholder: field.placeholder, help: "" };
}

function MethodIcon({ g }: { g: CheckoutGatewayOption }) {
  if (g.presentation.icon_url) return <img src={g.presentation.icon_url} alt="" width={22} height={22} />;
  const group = gatewayGroup(g);
  return group === "card" ? <CreditCard size={20} /> : group === "crypto" ? <Bitcoin size={20} /> : <Wallet size={20} />;
}

export function CheckoutPage() {
  const [phase, setPhase] = useState<Phase>({ name: "loading" });
  const [view, setView] = useState<CheckoutSessionView | null>(null);
  const [email, setEmail] = useState("");
  const [values, setValues] = useState<Record<string, string>>({});
  const [terms, setTerms] = useState(false);
  const [consent, setConsent] = useState(false);
  const [billing, setBilling] = useState<Billing>(emptyBilling);
  const [method, setMethod] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [couponOpen, setCouponOpen] = useState(false);
  const [couponMsg, setCouponMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [debug, setDebug] = useState(false);
  const [plan, setPlan] = useState<{ product: Product; variant?: string; priceVariant: boolean } | null>(null);
  const started = useRef(false);

  const client = getCheckoutClient();

  const finish = useCallback((v: CheckoutSessionView) => {
    setView(v); forgetSession(); setPhase({ name: "done" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Create (or resume) the checkout session once.
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const q = new URLSearchParams(window.location.search);
    setDebug(q.get("debug") === "1");
    const product = q.get("product");
    const variant = q.get("variant") ?? undefined;
    const priceVariant = q.get("vt") === "p";
    const returning = q.get("return") === "1" ? recallSession() : null;

    (async () => {
      try {
        if (returning) {
          const v = await client.getSession(returning);
          if (v.payment_status && PAID.includes(v.payment_status)) return finish(v);
          setView(v);
          setPhase(v.payment_status && WAITING.includes(v.payment_status) ? { name: "waiting" } : { name: "form" });
          return;
        }
        if (!product) { setPhase({ name: "no-product" }); return; }
        // Shoppex checks the product's required fields (invite link etc.) when the checkout is created,
        // so read the field list from the catalog and collect it before creating anything.
        const data = await loadStorefrontData();
        const found = data.success ? data.products.find(x => x.uniqid === product) : undefined;
        if (!found) { setPhase({ name: "error", message: "We couldn't find that plan. It may have changed — please pick it again from the plans page." }); return; }
        setPlan({ product: found, variant, priceVariant });
        const defaults: Record<string, string> = {};
        normalizeStorefrontCustomFields(found.custom_fields).forEach(f => { if (f.defaultValue) defaults[f.name] = f.defaultValue; });
        setValues(defaults);
        setPhase({ name: "details" });
      } catch (e) {
        if (product && isSetupError(e)) { setPhase({ name: "fallback", product, variant, priceVariant }); return; }
        setPhase({ name: "error", message: friendlyError(e) });
      }
    })();
  }, [client, finish]);

  // Poll the authoritative status while a payment is in flight.
  const pollId = (phase.name === "pay" || phase.name === "waiting") ? view?.id ?? null : null;
  useEffect(() => {
    if (!pollId) return;
    let stop = false;
    const tick = async () => {
      try {
        const v = await client.getSession(pollId);
        if (stop) return;
        setView(v);
        if (v.payment_status && PAID.includes(v.payment_status)) finish(v);
        else if (v.payment_status && FAILED.includes(v.payment_status)) setPhase({ name: "failed", message: "The payment didn't go through. No money was taken — you can try again or pick another method." });
      } catch { /* keep polling through network blips */ }
    };
    const t = window.setInterval(tick, 4000);
    return () => { stop = true; window.clearInterval(t); };
  }, [pollId, client, finish]);

  const planFields = useMemo(() => (plan ? normalizeStorefrontCustomFields(plan.product.custom_fields) : []), [plan]);
  const fields = useMemo(() => (planFields.length ? planFields : view ? fieldsForLine(view) : []), [planFields, view]);
  const gateways = useMemo(() => (view ? usableGateways(view) : []), [view]);
  const selected = gateways.find(g => g.gateway === method) ?? null;
  const line = view?.line_items[0];
  const needsTerms = !!view && (view.terms.required || !!selected?.requirements.terms_accepted) && !view.buyer.payment_method_terms_accepted;
  const needsConsent = !!view && view.withdrawal_consent.required && !view.withdrawal_consent.recorded_at;
  const needsBilling = !!view && !!selected?.requirements.billing_address && !view.buyer.billing_address_complete;

  function showErrors(next: Record<string, string>) {
    setErrors(next);
    const first = Object.keys(next)[0];
    if (first) document.querySelector<HTMLElement>(`[data-err="${CSS.escape(first)}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    return !first;
  }

  function validateDetails() {
    const next: Record<string, string> = {};
    if (!isEmail(email)) next.email = "Enter a valid email — your receipt and order link go here.";
    fields.forEach(f => {
      const msg = validateStorefrontCustomFieldValue(f, values[f.name] ?? "");
      if (msg) next[`f:${f.name}`] = f.type === "checkbox" ? "Please tick this box to continue." : f.name.toLowerCase().includes("invite") && msg.includes("format") ? "That doesn't look like a Discord invite link (discord.gg/…)." : msg;
    });
    return showErrors(next);
  }

  // Step 1 → 2: create the Shoppex checkout with the buyer's details attached.
  async function createCheckout() {
    if (!plan || busy || !validateDetails()) return;
    setBusy(true); setFormError(null);
    try {
      const origin = window.location.origin;
      const v = await client.createSession({
        product_id: plan.product.uniqid, variant_id: plan.variant, quantity: 1, email: email.trim(),
        custom_fields: buildStorefrontCustomFieldPayload(fields, values),
        return_url: `${origin}/checkout?return=1`, cancel_url: `${origin}/products`,
      });
      rememberSession(v.id);
      setView(v);
      const gws = usableGateways(v);
      if (gws.length === 1) setMethod(gws[0].gateway);
      setPhase({ name: "form" });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      if (isSetupError(e)) { setPhase({ name: "fallback", product: plan.product.uniqid, variant: plan.variant, priceVariant: plan.priceVariant }); return; }
      setFormError(friendlyError(e));
    } finally {
      setBusy(false);
    }
  }

  function validate() {
    const next: Record<string, string> = {};
    if (needsTerms && !terms) next.terms = "Please accept the terms to continue.";
    if (needsConsent && !consent) next.consent = "Please tick this box to continue.";
    if (needsBilling) (["name", "line1", "city", "country", "postal_code"] as const).forEach(k => { if (!billing[k].trim()) next[`b:${k}`] = "Required"; });
    if (!method) next.method = "Choose how you'd like to pay.";
    return showErrors(next);
  }

  async function startPayment() {
    if (!view || busy || !validate() || !method) return;
    setBusy(true); setFormError(null);
    try {
      let v = view;
      if (needsTerms || needsBilling || (email.trim() && !view.buyer.email.persisted)) {
        v = await client.updateSession(view.id, {
          ...(email.trim() && !view.buyer.email.persisted ? { email: email.trim() } : {}),
          ...(needsTerms ? { payment_method_terms_accepted: true } : {}),
          ...(needsBilling ? { billing_address: { ...billing, country: billing.country.trim().toUpperCase() } } : {}),
        });
      }
      if (needsConsent) v = await client.recordWithdrawalConsent(v.id, v.withdrawal_consent.text_version);
      setView(v);
      if (!v.payment_required) {
        await client.completeFreeCheckout(v.id);
        finish(await client.getSession(v.id));
        return;
      }
      await revealAttribution();
      assertAttribution(v.attribution.required);
      const result = await client.startPaymentSession(v.id, method);
      handleStart(v, result);
    } catch (e) {
      setFormError(friendlyError(e));
    } finally {
      setBusy(false);
    }
  }

  function handleStart(v: CheckoutSessionView, result: StartPaymentSessionResult) {
    if (result.payment_status && PAID.includes(result.payment_status)) { client.getSession(v.id).then(finish, () => finish(v)); return; }
    if (result.payment_status && FAILED.includes(result.payment_status)) { setPhase({ name: "failed", message: "Your bank or wallet declined the payment. No money was taken — try again or use another method." }); return; }
    const p = result.session;
    if (p.kind === "redirect") { rememberSession(v.id); window.location.href = p.redirect_url; return; }
    if (p.kind === "embed" && p.provider === "paypal" && p.approval_url) { rememberSession(v.id); window.location.href = p.approval_url; return; }
    setPhase({ name: "pay", payment: p });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function applyCoupon(code: string | null) {
    if (!view) return;
    setCouponMsg(null);
    try {
      const v = await client.applyCoupon(view.id, code);
      setView(v);
      setCouponMsg(code ? { ok: true, text: "Coupon applied." } : null);
      if (!code) setCoupon("");
    } catch (e) {
      setCouponMsg({ ok: false, text: e instanceof HeadlessCheckoutError && e.status < 500 ? "That code isn't valid for this order." : friendlyError(e) });
    }
  }

  const setField = (name: string, value: string) => { setValues(v => ({ ...v, [name]: value })); setErrors(e => { const n = { ...e }; delete n[`f:${name}`]; return n; }); };

  // ---------- Render ----------
  const header = (
    <header className="co-top">
      <Link className="lb-brand" href="/" aria-label={`${site.name} home`}><GGMark /><span>GG<b>Boosts</b></span></Link>
      <span className="co-top__secure"><Lock size={14} /> Secure checkout</span>
      <Link className="co-top__back" href="/products"><ArrowLeft size={15} /> Back to plans</Link>
    </header>
  );

  const shell = (body: React.ReactNode) => (
    <main className="lb co">
      <SiteBackground />
      {header}
      <div className="co-body">{body}</div>
    </main>
  );

  if (phase.name === "loading") return shell(<div className="co-center"><Loader2 size={22} className="co-spin" /> Preparing your checkout…</div>);

  if (phase.name === "no-product") return shell(
    <div className="co-state">
      <Zap size={28} />
      <h1>Pick a plan first</h1>
      <p>Choose how many boosts you need and for how long, then hit Buy.</p>
      <Link className="lb-btn lb-btn--primary" href="/products">See plans <ArrowRight size={16} /></Link>
    </div>,
  );

  if (phase.name === "fallback") {
    const variantAttr = phase.variant ? { [phase.priceVariant ? "data-shoppex-price-variant-id" : "data-shoppex-variant-id"]: phase.variant } : {};
    return shell(
      <div className="co-state">
        <ShoppexEmbed enabled />
        <Lock size={28} />
        <h1>Continue to secure payment</h1>
        <p>Your payment opens in a secure Shoppex window.</p>
        <button type="button" className="lb-btn lb-btn--primary lb-btn--lg" data-shoppex-shop-id={shoppexConfig.shopSlug} data-shoppex-product-id={phase.product} data-shoppex-theme="dark" data-shoppex-return-url={`${SITE_URL}/dashboard`} {...variantAttr}>
          Continue to payment <ArrowRight size={16} />
        </button>
      </div>,
    );
  }

  if (phase.name === "error" || (!view && phase.name !== "details")) return shell(
    <div className="co-state co-state--bad">
      <XCircle size={28} />
      <h1>Checkout couldn't load</h1>
      <p>{phase.name === "error" ? phase.message : "Please try again."}</p>
      <div className="lb-row co-state__actions">
        <button type="button" className="lb-btn lb-btn--primary" onClick={() => window.location.reload()}>Try again</button>
        <a className="lb-btn lb-btn--ghost" href={site.supportUrl} target="_blank" rel="noreferrer"><DiscordIcon size={16} /> Get help</a>
      </div>
    </div>,
  );

  if (phase.name === "done" && view) return shell(
    <div className="co-state co-state--ok">
      <CheckCircle2 size={44} />
      <h1>Payment received — you&apos;re all set</h1>
      <p>Your boosts are on the way to your server. We emailed your receipt, and you can follow delivery from My Orders.</p>
      <div className="co-done__id">Order ID <code>{view.invoice_uniqid}</code></div>
      <div className="lb-row co-state__actions">
        <Link className="lb-btn lb-btn--primary" href={`/dashboard?order=${encodeURIComponent(view.invoice_uniqid)}`}>Track my order <ArrowRight size={16} /></Link>
        <Link className="lb-btn lb-btn--ghost" href="/">Back to home</Link>
      </div>
    </div>,
  );

  // Order summary: Shoppex's numbers once the checkout exists, catalog numbers before that.
  const currency = view?.currency ?? getCurrency(plan?.product);
  const planPrice = plan ? getUnitPrice(plan.product, plan.variant) : 0;
  const rows = view
    ? view.line_items.map((l, i) => ({ key: l.line_item_id ?? String(i), title: l.title, sub: l.variant_title, total: l.line_total }))
    : plan ? [{ key: "plan", title: plan.product.title, sub: getVariant(plan.product, plan.variant)?.title ?? null, total: String(planPrice) }] : [];
  const totalNow = view ? view.breakdown.total : String(planPrice);
  const summary = (
    <aside className="co-summary" aria-label="Order summary">
      <span className="co-label">Your order</span>
      {rows.map(r => (
        <div key={r.key} className="co-item">
          <div className="co-item__icon"><GGMark /></div>
          <div className="co-item__text">
            <strong>{r.title}</strong>
            {r.sub && <span>{r.sub}</span>}
          </div>
          <b>{money(r.total, currency)}</b>
        </div>
      ))}
      <dl className="co-totals">
        <div><dt>Subtotal</dt><dd>{money(view ? view.breakdown.subtotal : planPrice, currency)}</dd></div>
        {view?.breakdown.discount && Number(view.breakdown.discount) > 0 && <div className="co-totals__disc"><dt>Discount</dt><dd>−{money(view.breakdown.discount, currency)}</dd></div>}
        {view?.breakdown.tax && Number(view.breakdown.tax) > 0 && <div><dt>Tax</dt><dd>{money(view.breakdown.tax, currency)}</dd></div>}
        {view?.breakdown.fee && Number(view.breakdown.fee) > 0 && <div><dt>Processing fee</dt><dd>{money(view.breakdown.fee, currency)}</dd></div>}
        <div className="co-totals__total"><dt>Total</dt><dd>{money(totalNow, currency)}</dd></div>
      </dl>
      {phase.name === "form" && (
        couponOpen ? (
          <form className="co-coupon" onSubmit={e => { e.preventDefault(); if (coupon.trim()) void applyCoupon(coupon.trim()); }}>
            <input value={coupon} onChange={e => setCoupon(e.target.value)} placeholder="Coupon code" aria-label="Coupon code" autoFocus />
            <button type="submit" className="lb-btn lb-btn--ghost">Apply</button>
          </form>
        ) : (
          <button type="button" className="co-textlink" onClick={() => setCouponOpen(true)}><Tag size={14} /> Have a coupon?</button>
        )
      )}
      {couponMsg && <p className={couponMsg.ok ? "co-ok" : "co-error"}>{couponMsg.text}{couponMsg.ok && <> · <button type="button" className="co-textlink" onClick={() => void applyCoupon(null)}>Remove</button></>}</p>}
      <ul className="co-perks">
        <li><Zap size={15} /> Delivery starts once payment clears</li>
        <li><ShieldCheck size={15} /> Warranty on every order</li>
        <li><Check size={15} /> One-time payment, nothing renews</li>
      </ul>
    </aside>
  );

  // ---------- Step 1: details (no Shoppex checkout yet) ----------
  if (phase.name === "details" || !view) return shell(
    <div className="co-grid">
      <form className="co-main" noValidate onSubmit={e => { e.preventDefault(); void createCheckout(); }}>
        <h1 className="co-h1">Checkout</h1>
        <p className="co-muted">Tell us where to send your boosts. You&apos;ll choose how to pay next.</p>

        <fieldset className="co-section">
          <legend><span>1</span> Contact</legend>
          <label className="co-field" data-err="email">
            <span>Email</span>
            <input type="email" autoComplete="email" inputMode="email" value={email} placeholder="you@example.com" aria-invalid={!!errors.email}
              onChange={e => { setEmail(e.target.value); setErrors(x => ({ ...x, email: "" })); }} />
            <small>Your receipt and order link are sent here.</small>
            {errors.email && <em role="alert">{errors.email}</em>}
          </label>
        </fieldset>

        {fields.length > 0 && (
          <fieldset className="co-section">
            <legend><span>2</span> Your server</legend>
            {fields.filter(f => f.type !== "checkbox").map(f => {
              const hint = fieldHint(f);
              const err = errors[`f:${f.name}`];
              return (
                <label key={f.name} className="co-field" data-err={`f:${f.name}`}>
                  <span>{f.name}{f.required && <i aria-hidden="true"> *</i>}</span>
                  {f.type === "textarea"
                    ? <textarea rows={3} value={values[f.name] ?? ""} placeholder={hint.placeholder} aria-invalid={!!err} onChange={e => setField(f.name, e.target.value)} />
                    : <input value={values[f.name] ?? ""} placeholder={hint.placeholder} aria-invalid={!!err} autoComplete="off" spellCheck={false} onChange={e => setField(f.name, e.target.value)} />}
                  {hint.help && <small>{hint.help}</small>}
                  {err && <em role="alert">{err}</em>}
                </label>
              );
            })}
            {fields.filter(f => f.type === "checkbox").map(f => {
              const err = errors[`f:${f.name}`];
              return (
                <label key={f.name} className={`co-check ${err ? "is-bad" : ""}`} data-err={`f:${f.name}`}>
                  <input type="checkbox" checked={isStorefrontCheckboxCustomFieldValueChecked(values[f.name])} onChange={e => setField(f.name, e.target.checked ? "true" : "")} />
                  <span>{linkify(f.name)}{err && <em role="alert">{err}</em>}</span>
                </label>
              );
            })}
          </fieldset>
        )}

        {formError && <p className="co-error" role="alert">{formError}</p>}
        <button type="submit" className="lb-btn lb-btn--primary lb-btn--lg co-full" disabled={busy}>
          {busy ? <><Loader2 size={17} className="co-spin" /> Saving…</> : <>Continue <ArrowRight size={17} /></>}
        </button>
        {debug && plan && <pre className="co-debug">{JSON.stringify({ product: plan.product.uniqid, variant: plan.variant, fields: plan.product.custom_fields }, null, 2)}</pre>}
      </form>
      {summary}
    </div>,
  );

  // ---------- Step 3: pay ----------
  if (phase.name === "pay" || phase.name === "failed" || phase.name === "waiting") {
    const p = phase.name === "pay" ? phase.payment : null;
    let panel: React.ReactNode;
    if (phase.name === "waiting") panel = <WaitingPanel />;
    else if (phase.name === "failed") panel = <div className="co-pay"><p className="co-error" role="alert">{phase.message}</p></div>;
    else if (p?.kind === "embed" && p.provider === "square") panel = <SquarePanel view={view} payment={p} email={email} onResult={r => handleStart(view, r)} />;
    else if (p?.kind === "address") panel = <AddressPanel view={view} payment={p} />;
    else if (p?.kind === "manual") panel = <ManualPanel payment={p} />;
    else if (p?.kind === "final") panel = <WaitingPanel />;
    else panel = <div className="co-pay"><p className="co-error">This payment method isn&apos;t available on this page yet. Please go back and pick another one.</p></div>;
    return shell(
      <div className="co-grid">
        <section className="co-main">
          <button type="button" className="co-back" onClick={() => { setPhase({ name: "form" }); setFormError(null); }}><ArrowLeft size={15} /> Change payment method</button>
          <h1 className="co-h1">Complete your payment</h1>
          <p className="co-muted">Paying with <b>{selected?.presentation.button_label ?? selected?.label ?? "your selected method"}</b>{email && <> · receipt to {email}</>}</p>
          {panel}
          <div className="co-attrib-row"><AttributionBadge attribution={view.attribution} /></div>
        </section>
        {summary}
      </div>,
    );
  }

  // ---------- Step 2: payment method ----------
  const invite = fields.find(f => f.name.toLowerCase().includes("invite"));
  return shell(
    <div className="co-grid">
      <form className="co-main" noValidate onSubmit={e => { e.preventDefault(); void startPayment(); }}>
        {plan && <button type="button" className="co-back" onClick={() => { setView(null); setMethod(null); setPhase({ name: "details" }); setFormError(null); }}><ArrowLeft size={15} /> Edit details</button>}
        <h1 className="co-h1">Payment</h1>
        {email && <p className="co-muted">Receipt to <b>{email}</b>{invite && values[invite.name] && <> · delivering to <b>{values[invite.name]}</b></>}</p>}

        <fieldset className="co-section">
          <legend><span>{fields.length > 0 ? 3 : 2}</span> Payment method</legend>
          {gateways.length === 0 && <p className="co-error">No payment methods are available right now. Please contact support.</p>}
          <div className="co-methods" role="radiogroup" aria-label="Payment method" data-err="method">
            {gateways.map(g => {
              const fee = g.fee_preview && Number(g.fee_preview) > 0 ? g.fee_preview : null;
              return (
                <button key={g.gateway} type="button" role="radio" aria-checked={method === g.gateway} className={`co-method ${method === g.gateway ? "is-selected" : ""}`}
                  onClick={() => { setMethod(g.gateway); setErrors(x => ({ ...x, method: "" })); }}>
                  <span className="co-method__icon"><MethodIcon g={g} /></span>
                  <span className="co-method__text"><strong>{g.presentation.button_label ?? g.label}</strong>{fee && <small>+{money(fee, currency)} fee</small>}</span>
                  <span className="co-method__radio">{method === g.gateway && <Check size={13} strokeWidth={3} />}</span>
                </button>
              );
            })}
          </div>
          {errors.method && <em className="co-inline-err" role="alert">{errors.method}</em>}

          {needsBilling && (
            <div className="co-billing">
              <span className="co-label">Billing address</span>
              <div className="co-billing__grid">
                {([["name", "Name on card", "name"], ["line1", "Address", "address-line1"], ["city", "City", "address-level2"], ["postal_code", "ZIP / Postal code", "postal-code"], ["country", "Country (2 letters, e.g. US)", "country"]] as const).map(([k, label, ac]) => (
                  <label key={k} className={`co-field ${k === "name" || k === "line1" ? "co-field--wide" : ""}`} data-err={`b:${k}`}>
                    <span>{label}</span>
                    <input autoComplete={ac} value={billing[k]} maxLength={k === "country" ? 2 : undefined} aria-invalid={!!errors[`b:${k}`]} onChange={e => setBilling(b => ({ ...b, [k]: e.target.value }))} />
                    {errors[`b:${k}`] && <em role="alert">{errors[`b:${k}`]}</em>}
                  </label>
                ))}
              </div>
            </div>
          )}
        </fieldset>

        {needsTerms && (
          <label className={`co-check ${errors.terms ? "is-bad" : ""}`} data-err="terms">
            <input type="checkbox" checked={terms} onChange={e => { setTerms(e.target.checked); setErrors(x => ({ ...x, terms: "" })); }} />
            <span>I agree to the <a href="/terms" target="_blank" rel="noreferrer">Terms of Service</a> and <a href="/refund-policy" target="_blank" rel="noreferrer">Refund Policy</a>.{errors.terms && <em role="alert">{errors.terms}</em>}</span>
          </label>
        )}
        {needsConsent && (
          <label className={`co-check ${errors.consent ? "is-bad" : ""}`} data-err="consent">
            <input type="checkbox" checked={consent} onChange={e => { setConsent(e.target.checked); setErrors(x => ({ ...x, consent: "" })); }} />
            <span>{view.withdrawal_consent.text}{errors.consent && <em role="alert">{errors.consent}</em>}</span>
          </label>
        )}

        {formError && <p className="co-error" role="alert">{formError}</p>}
        <button type="submit" className="lb-btn lb-btn--primary lb-btn--lg co-full" disabled={busy || gateways.length === 0}>
          {busy ? <><Loader2 size={17} className="co-spin" /> Starting payment…</> : <>Continue to payment · {money(view.breakdown.total, currency)} <ArrowRight size={17} /></>}
        </button>
        <div className="co-attrib-row"><AttributionBadge attribution={view.attribution} /></div>

        {debug && (
          <pre className="co-debug">{JSON.stringify({ gateways: view.gateways_available, fields: line?.custom_fields_config, saved: line?.custom_fields, terms: view.terms, buyer: view.buyer, consent: view.withdrawal_consent }, null, 2)}</pre>
        )}
      </form>
      {summary}
    </div>,
  );
}
