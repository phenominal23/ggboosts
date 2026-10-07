"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { assertAttribution, HeadlessCheckoutError } from "@shoppexio/checkout-js/headless";
import type { CheckoutPaymentSession, CheckoutSessionView, StartPaymentSessionResult } from "@shoppexio/checkout-js/headless";
import { buildStorefrontCustomFieldPayload, isStorefrontCheckboxCustomFieldValueChecked, normalizeStorefrontCustomFields, validateStorefrontCustomFieldValue, type Product, type StorefrontCustomField } from "@shoppexio/storefront";
import { ArrowLeft, ArrowRight, CheckCircle2, ChevronDown, Loader2, Lock, XCircle, Zap } from "lucide-react";
import { GGMark } from "@/components/gg-navigation";
import { DiscordIcon, ShoppexEmbed, SiteBackground } from "@/components/home/site-chrome";
import {
  FAILED, PAID, SITE_URL, WAITING, fieldsForLine, forgetSession, friendlyError, gatewayGroup, getCheckoutClient, isEmail, isSetupError, money, recallSession, rememberSession, revealAttribution, usableGateways,
} from "@/components/checkout/checkout-client";
import { AcceptedLogos, CoinIcon, CoinStack, coinInfo, methodInfo, policyLabel } from "@/components/checkout/checkout-ui";
import { AddressPanel, AttributionBadge, ManualPanel, SquarePanel, WaitingPanel } from "@/components/checkout/payment-panels";
import { getCurrency, getQuantityBounds, getUnitPrice, getVariant } from "@/lib/product-utils";
import { categoryOf, unitName } from "@/lib/catalog";
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

function fieldHint(field: StorefrontCustomField) {
  const n = field.name.toLowerCase();
  if (n.includes("invite")) return { placeholder: field.placeholder || "https://discord.gg/your-invite", label: "Permanent Discord Server Invite" };
  if (n.includes("server id")) return { placeholder: field.placeholder || "123456789012345678", label: "Discord Server ID" };
  if (n.includes("username")) return { placeholder: field.placeholder || "discorduser123", label: "Discord Username" };
  return { placeholder: field.placeholder, label: field.name };
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
  const [inviteHelp, setInviteHelp] = useState(false);
  const [serverIdHelp, setServerIdHelp] = useState(false);
  const [cryptoOpen, setCryptoOpen] = useState(false);
  const [plan, setPlan] = useState<{ product: Product; variant?: string; priceVariant: boolean; quantity: number } | null>(null);
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
        // Safety net: if a boost product has no checkout fields set up in Shoppex, borrow them from another
        // boost product so we never take a boost order without a server invite. (Boosts only — accounts
        // and Nitro don't need an invite, and members/reactions have their own fields.)
        const own = normalizeStorefrontCustomFields(found.custom_fields);
        const isBoost = categoryOf(found) === "boosts";
        const donor = own.length || !isBoost || !data.success ? null
          : data.products.find(x => x.uniqid !== found.uniqid && categoryOf(x) === "boosts" && normalizeStorefrontCustomFields(x.custom_fields).length > 0);
        const chosen = donor ? { ...found, custom_fields: donor.custom_fields } : found;
        if (donor) console.warn(`[GGBoosts] "${found.title}" has no custom fields in Shoppex — using the ones from "${donor.title}". Add them to this product in Shoppex.`);
        // Quantity comes from the product card's picker; keep it inside the product's min/max.
        const { min, max } = getQuantityBounds(found, variant);
        const asked = Math.round(Number(q.get("qty") ?? min));
        const quantity = Math.min(max > 0 ? max : Number.MAX_SAFE_INTEGER, Math.max(min, Number.isFinite(asked) ? asked : min));
        setPlan({ product: chosen, variant, priceVariant, quantity });
        const defaults: Record<string, string> = {};
        normalizeStorefrontCustomFields(chosen.custom_fields).forEach(f => { if (f.defaultValue) defaults[f.name] = f.defaultValue; });
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
  const termsCovered = fields.some(f => f.type === "checkbox" && /terms/i.test(f.name) && isStorefrontCheckboxCustomFieldValueChecked(values[f.name]));
  const showTermsBox = needsTerms && !termsCovered;
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
      if (msg) next[`f:${f.name}`] = f.type === "checkbox" ? "Please tick this box to continue." : f.name.toLowerCase().includes("invite") && msg.includes("format") ? "That doesn't look like a Discord invite link (discord.gg/…)."
        : f.name.toLowerCase().includes("server id") && msg.includes("format") ? "A server ID is a long number, like 123456789012345678. See \"How do I find my Server ID?\" below."
        : msg;
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
        product_id: plan.product.uniqid, variant_id: plan.variant, quantity: plan.quantity, email: email.trim(),
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
    if (showTermsBox && !terms) next.terms = "Please accept the terms to continue.";
    if (needsConsent && !consent) next.consent = "Please tick this box to continue.";
    if (needsBilling) (["name", "line1", "city", "country", "postal_code"] as const).forEach(k => { if (!billing[k].trim()) next[`b:${k}`] = "Required"; });
    if (!method) next.method = cryptoOpen ? "Choose which coin you'll pay with." : "Choose how you'd like to pay.";
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

  // ---------- Shared pieces ----------
  const currency = view?.currency ?? getCurrency(plan?.product);
  const planPrice = plan ? getUnitPrice(plan.product, plan.variant) : 0;
  const itemTitle = view?.line_items[0]?.title ?? plan?.product.title ?? "Server Boosts";
  const itemSub = view?.line_items[0]?.variant_title ?? (plan ? getVariant(plan.product, plan.variant)?.title : null) ?? null;
  const positive = (...xs: (string | number | null | undefined)[]) => xs.find(x => Number(x) > 0);
  const qty = view?.line_items[0]?.quantity ?? plan?.quantity ?? 1;
  const perLine = (x: string | number | null | undefined) => (Number(x) > 0 ? Number(x) / qty : undefined);
  const itemPrice = String(positive(view?.line_items[0]?.unit_price, planPrice, perLine(view?.line_items[0]?.line_total), perLine(view?.breakdown.subtotal)) ?? 0);
  const lineTotal = Math.round(Number(itemPrice) * qty * 100) / 100;
  const units = plan && qty > 1 ? unitName(plan.product) : { one: "item", many: "items" };
  const total = view ? view.breakdown.total : String(lineTotal);
  const step = phase.name === "details" || !view ? "details" : phase.name === "form" ? "method" : "pay";
  const selectedInfo = selected ? (gatewayGroup(selected) === "crypto" ? { title: `Pay with ${coinInfo(selected).name}` } : methodInfo(selected)) : null;
  const cryptoGateways = gateways.filter(g => gatewayGroup(g) === "crypto");
  const groupCrypto = cryptoGateways.length > 1;
  const cryptoSelected = !!selected && gatewayGroup(selected) === "crypto";

  const orderCard = (
    <section className="co-card co-order">
      <div className="co-order__icon"><GGMark /></div>
      <div className="co-order__text">
        <strong>{itemTitle}{itemSub && <span> · {itemSub}</span>}{qty > 1 && <span> · {qty.toLocaleString()} {units.many}</span>}</strong>
        <small><Zap size={12} /> Instant delivery</small>
      </div>
      <b className="co-order__price">{money(qty > 1 ? lineTotal : itemPrice, currency)}</b>
    </section>
  );

  const cta = step === "details"
    ? <button form="co-form" type="submit" className="lb-btn lb-btn--primary co-cta" disabled={busy}>{busy ? <><Loader2 size={17} className="co-spin" /> Saving…</> : <>Continue to payment <ArrowRight size={17} /></>}</button>
    : step === "method"
      ? <button form="co-form" type="submit" className="lb-btn lb-btn--primary co-cta" disabled={busy || gateways.length === 0}>{busy ? <><Loader2 size={17} className="co-spin" /> Starting payment…</> : selected ? <>Pay {money(total, currency)} <ArrowRight size={17} /></> : <>Choose a payment method</>}</button>
      : null;

  const summary = (
    <aside className="co-side">
      <section className="co-card co-sum">
        <div className="co-sum__head">
          <h2>Order summary</h2>
          <p>{step === "details" ? "Fill in your details to continue" : step === "method" ? "Choose how you'd like to pay" : "Finish your payment"}</p>
        </div>
        <dl className="co-sum__rows">
          <div><dt>Item price</dt><dd>{money(itemPrice, currency)}</dd></div>
          <div><dt>Quantity</dt><dd>{qty.toLocaleString()} {qty === 1 ? units.one : units.many}</dd></div>
          {view?.breakdown.discount && Number(view.breakdown.discount) > 0 && <div className="is-disc"><dt>Discount</dt><dd>−{money(view.breakdown.discount, currency)}</dd></div>}
          {view?.breakdown.tax && Number(view.breakdown.tax) > 0 && <div><dt>Tax</dt><dd>{money(view.breakdown.tax, currency)}</dd></div>}
          {view?.breakdown.fee && Number(view.breakdown.fee) > 0 && <div><dt>Processing fee</dt><dd>{money(view.breakdown.fee, currency)}</dd></div>}
        </dl>
        <div className="co-sum__total">
          <span>Order total</span>
          <strong>{money(total, currency)}</strong>
          {step !== "pay" && <small>Any payment fee is shown before you pay.</small>}
        </div>
        {cta && <div className="co-sum__cta">{cta}</div>}
        {step === "method" && (
          <div className="co-sum__coupon">
            {couponOpen ? (
              <form className="co-coupon" onSubmit={e => { e.preventDefault(); if (coupon.trim()) void applyCoupon(coupon.trim()); }}>
                <input value={coupon} onChange={e => setCoupon(e.target.value)} placeholder="Discount code" aria-label="Discount code" autoFocus />
                <button type="submit" className="lb-btn lb-btn--ghost">Apply</button>
              </form>
            ) : (
              <button type="button" className="co-link" onClick={() => setCouponOpen(true)}>Add a discount code</button>
            )}
            {couponMsg && <p className={couponMsg.ok ? "co-ok" : "co-bad"}>{couponMsg.text}{couponMsg.ok && <> · <button type="button" className="co-link" onClick={() => void applyCoupon(null)}>Remove</button></>}</p>}
          </div>
        )}
        {step === "method" && view && <div className="co-sum__attrib"><AttributionBadge attribution={view.attribution} /></div>}
        {step === "details" && <p className="co-sum__secure"><Lock size={12} /> Secure checkout · nothing is charged yet</p>}
        <div className="co-sum__accept">
          <span>We accept</span>
          <AcceptedLogos />
        </div>
      </section>
      <section className="co-card co-help">
        <h2>Need help?</h2>
        <p>Open a ticket in our Discord — before or after you pay.</p>
        <a className="co-help__btn co-help__btn--discord" href={site.supportUrl} target="_blank" rel="noreferrer"><DiscordIcon size={16} /> Get help on Discord</a>
      </section>
    </aside>
  );

  const page = (main: React.ReactNode) => shell(
    <>
      <h1 className="co-h1">Checkout</h1>
      <div className="co-grid">
        <div className="co-main">{orderCard}{main}</div>
        {summary}
      </div>
    </>,
  );

  // ---------- Step 1: details (no Shoppex checkout yet) ----------
  if (step === "details") {
    const text = fields.filter(f => f.type !== "checkbox");
    const boxes = fields.filter(f => f.type === "checkbox");
    return page(
      <form id="co-form" className="co-card" noValidate onSubmit={e => { e.preventDefault(); void createCheckout(); }}>
        <div className="co-card__head">
          <h2>Delivery details</h2>
          <p>We send your receipt and order link here the moment your payment clears.</p>
        </div>
        <div className="co-fields">
          <label className="co-field co-field--half" data-err="email">
            <span>Email address <i>*</i></span>
            <input type="email" autoComplete="email" inputMode="email" value={email} placeholder="you@example.com" aria-invalid={!!errors.email}
              onChange={e => { setEmail(e.target.value); setErrors(x => ({ ...x, email: "" })); }} />
            {errors.email && <em role="alert">{errors.email}</em>}
          </label>
          <div className="co-field--break" />
          {text.map(f => {
            const hint = fieldHint(f);
            const err = errors[`f:${f.name}`];
            return (
              <label key={f.name} className={`co-field ${text.length > 1 ? "co-field--half" : ""}`} data-err={`f:${f.name}`}>
                <span>{hint.label}{f.required && <i> *</i>}</span>
                {f.type === "textarea"
                  ? <textarea rows={3} value={values[f.name] ?? ""} placeholder={hint.placeholder} aria-invalid={!!err} onChange={e => setField(f.name, e.target.value)} />
                  : <input value={values[f.name] ?? ""} placeholder={hint.placeholder} aria-invalid={!!err} autoComplete="off" spellCheck={false} onChange={e => setField(f.name, e.target.value)} />}
                {err && <em role="alert">{err}</em>}
              </label>
            );
          })}
        </div>
        {text.some(f => f.name.toLowerCase().includes("invite")) && (
          <div className="co-howto">
            <button type="button" className="co-howto__toggle" aria-expanded={inviteHelp} onClick={() => setInviteHelp(o => !o)}>How do I make a permanent invite? <ChevronDown size={14} /></button>
            {inviteHelp && (
              <ol>
                <li>In Discord, right-click your server icon → <b>Invite People</b>.</li>
                <li>Click <b>Edit invite link</b> at the bottom.</li>
                <li>Set <b>Expire After</b> to <b>Never</b> and <b>Max Number of Uses</b> to <b>No limit</b>, then copy the link.</li>
              </ol>
            )}
          </div>
        )}
        {text.some(f => f.name.toLowerCase().includes("server id")) && (
          <div className="co-howto">
            <button type="button" className="co-howto__toggle" aria-expanded={serverIdHelp} onClick={() => setServerIdHelp(o => !o)}>How do I find my Server ID? <ChevronDown size={14} /></button>
            {serverIdHelp && (
              <ol>
                <li>In Discord, open <b>User Settings</b> → <b>Advanced</b> and turn on <b>Developer Mode</b>.</li>
                <li>Right-click your server icon (long-press on mobile) → <b>Copy Server ID</b>.</li>
                <li>Paste it here — it's a long number like 123456789012345678.</li>
              </ol>
            )}
          </div>
        )}
        {boxes.length > 0 && (
          <div className="co-checks">
            {boxes.map(f => {
              const err = errors[`f:${f.name}`];
              return (
                <label key={f.name} className={`co-check ${err ? "is-bad" : ""}`} data-err={`f:${f.name}`}>
                  <input type="checkbox" checked={isStorefrontCheckboxCustomFieldValueChecked(values[f.name])} onChange={e => setField(f.name, e.target.checked ? "true" : "")} />
                  <span>{policyLabel(f.name)}{f.required && <i> *</i>}</span>
                </label>
              );
            })}
            {boxes.some(f => errors[`f:${f.name}`]) && <em className="co-err" role="alert">Please tick all the boxes above to continue.</em>}
          </div>
        )}
        {formError && <p className="co-alert" role="alert">{formError}</p>}
        {debug && plan && <pre className="co-debug">{JSON.stringify({ product: plan.product.uniqid, variant: plan.variant, fields: plan.product.custom_fields }, null, 2)}</pre>}
      </form>,
    );
  }

  if (!view) return null;

  // ---------- Step 3: pay ----------
  if (step === "pay") {
    const p = phase.name === "pay" ? phase.payment : null;
    let panel: React.ReactNode;
    if (phase.name === "waiting") panel = <WaitingPanel />;
    else if (phase.name === "failed") panel = <p className="co-alert" role="alert">{phase.message}</p>;
    else if (p?.kind === "embed" && p.provider === "square") panel = <SquarePanel view={view} payment={p} email={email} onResult={r => handleStart(view, r)} />;
    else if (p?.kind === "address") panel = <AddressPanel view={view} payment={p} />;
    else if (p?.kind === "manual") panel = <ManualPanel payment={p} />;
    else if (p?.kind === "final") panel = <WaitingPanel />;
    else panel = <p className="co-alert">This payment method isn&apos;t available here yet. Go back and pick another one.</p>;
    return page(
      <section className="co-card">
        <div className="co-card__head co-card__head--row">
          <div>
            <h2>{selectedInfo?.title ?? "Payment"}</h2>
            {email && <p>Receipt to {email}</p>}
          </div>
          <button type="button" className="co-link" onClick={() => { setPhase({ name: "form" }); setFormError(null); }}>Change method</button>
        </div>
        {panel}
        <div className="co-attrib-row"><AttributionBadge attribution={view.attribution} /></div>
      </section>,
    );
  }

  // ---------- Step 2: payment method ----------
  return page(
    <form id="co-form" className="co-card" noValidate onSubmit={e => { e.preventDefault(); void startPayment(); }}>
      <div className="co-card__head co-card__head--row">
        <div>
          <h2>Payment method</h2>
          {email && <p>Receipt to {email}</p>}
        </div>
        {plan && <button type="button" className="co-link" onClick={() => { setView(null); setMethod(null); setPhase({ name: "details" }); setFormError(null); }}>Edit details</button>}
      </div>
      {gateways.length === 0 && <p className="co-alert">No payment methods are available right now. Please contact support.</p>}
      <div className="co-methods" role="radiogroup" aria-label="Payment method" data-err="method">
        {gateways.filter((g, i) => !groupCrypto || gatewayGroup(g) !== "crypto" || gateways.findIndex(x => gatewayGroup(x) === "crypto") === i).map(g => {
          const isGroup = groupCrypto && gatewayGroup(g) === "crypto";
          const info = isGroup ? { title: "Cryptocurrency", sub: cryptoGateways.map(c => coinInfo(c).name.replace(/ \(.+\)$/, "")).filter((n, i, all) => all.indexOf(n) === i).join(", "), logos: <CoinStack /> } : methodInfo(g);
          const fee = !isGroup && g.fee_preview && Number(g.fee_preview) > 0 ? g.fee_preview : null;
          const on = isGroup ? cryptoOpen || cryptoSelected : method === g.gateway;
          return (
            <div key={g.gateway} className="co-method-wrap">
              <button type="button" role="radio" aria-checked={on} className={`co-method ${on ? "is-on" : ""}`}
                onClick={() => {
                  setErrors(x => ({ ...x, method: "" })); setFormError(null);
                  if (isGroup) { setCryptoOpen(true); if (!cryptoSelected) setMethod(null); }
                  else { setCryptoOpen(false); setMethod(g.gateway); }
                }}>
                <span className="co-radio" aria-hidden="true" />
                {info.logos && <span className="co-method__logos">{info.logos}</span>}
                <span className="co-method__text"><strong>{info.title}</strong>{info.sub && <small>{info.sub}</small>}</span>
                <span className={`co-fee ${fee ? "" : "co-fee--none"}`}>{fee ? `+${money(fee, currency)} fee` : "No fee"}</span>
              </button>
              {isGroup && on && (
                <div className="co-coins-pick" role="radiogroup" aria-label="Choose a coin">
                  {cryptoGateways.map(c => (
                    <button key={c.gateway} type="button" role="radio" aria-checked={method === c.gateway} className={`co-coin-btn ${method === c.gateway ? "is-on" : ""}`}
                      onClick={() => { setMethod(c.gateway); setErrors(x => ({ ...x, method: "" })); }}>
                      <CoinIcon g={c} /> {coinInfo(c).name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {errors.method && <em className="co-err" role="alert">{errors.method}</em>}

      {needsBilling && (
        <div className="co-billing">
          <span className="co-mini">Billing address</span>
          <div className="co-fields">
            {([["name", "Name on card", "name"], ["line1", "Address", "address-line1"], ["city", "City", "address-level2"], ["postal_code", "ZIP / Postal code", "postal-code"], ["country", "Country code (e.g. US)", "country"]] as const).map(([k, label, ac]) => (
              <label key={k} className={`co-field ${k === "name" || k === "line1" ? "" : "co-field--half"}`} data-err={`b:${k}`}>
                <span>{label}</span>
                <input autoComplete={ac} value={billing[k]} maxLength={k === "country" ? 2 : undefined} aria-invalid={!!errors[`b:${k}`]} onChange={e => setBilling(b => ({ ...b, [k]: e.target.value }))} />
                {errors[`b:${k}`] && <em role="alert">{errors[`b:${k}`]}</em>}
              </label>
            ))}
          </div>
        </div>
      )}

      {(showTermsBox || needsConsent) && (
        <div className="co-checks">
          {showTermsBox && (
            <label className={`co-check ${errors.terms ? "is-bad" : ""}`} data-err="terms">
              <input type="checkbox" checked={terms} onChange={e => { setTerms(e.target.checked); setErrors(x => ({ ...x, terms: "" })); }} />
              <span>I agree to the <a href="/terms" target="_blank" rel="noreferrer">Terms of Service</a> and <a href="/refund-policy" target="_blank" rel="noreferrer">Refund Policy</a>.</span>
            </label>
          )}
          {needsConsent && (
            <label className={`co-check ${errors.consent ? "is-bad" : ""}`} data-err="consent">
              <input type="checkbox" checked={consent} onChange={e => { setConsent(e.target.checked); setErrors(x => ({ ...x, consent: "" })); }} />
              <span>{view.withdrawal_consent.text}</span>
            </label>
          )}
          {(errors.terms || errors.consent) && <em className="co-err" role="alert">Please tick the box above to continue.</em>}
        </div>
      )}

      {formError && <p className="co-alert" role="alert">{formError}</p>}
      {debug && (
        <pre className="co-debug">{JSON.stringify({ gateways: view.gateways_available, fields: line?.custom_fields_config, saved: line?.custom_fields, terms: view.terms, buyer: view.buyer, consent: view.withdrawal_consent }, null, 2)}</pre>
      )}
    </form>,
  );
}
