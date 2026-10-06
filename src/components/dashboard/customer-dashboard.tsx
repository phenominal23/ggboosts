"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { HeadlessCustomerMe, HeadlessCustomerOrder, HeadlessCustomerOrderSummary } from "@shoppexio/storefront/customer";
import { ArrowLeft, ArrowRight, Check, ChevronRight, Clock, Copy, Download, Headphones, Home, LifeBuoy, LogOut, MessageSquare, Package, Plus, Receipt, RotateCw, Send, ShoppingBag, Wallet } from "lucide-react";
import { GGMark } from "@/components/gg-navigation";
import { DiscordIcon, SiteBackground } from "@/components/home/site-chrome";
import { PortalLogin } from "@/components/dashboard/login";
import {
  deliveryStatus, errorMessage, formatDate, formatMoney, getPortalClient, isAuthError, isPaid, orderStatus, ticketStatus,
  type PortalDashboard, type PortalTicket,
} from "@/components/dashboard/portal-client";
import { site } from "@/lib/site-content";

type View =
  | { name: "home" }
  | { name: "orders" }
  | { name: "order"; id: string }
  | { name: "support" }
  | { name: "new-ticket"; invoiceId?: string }
  | { name: "ticket"; id: string };

function viewFromUrl(): View {
  if (typeof window === "undefined") return { name: "home" };
  const q = new URLSearchParams(window.location.search);
  if (q.get("order")) return { name: "order", id: q.get("order")! };
  if (q.get("ticket")) return { name: "ticket", id: q.get("ticket")! };
  if (q.get("tab") === "orders") return { name: "orders" };
  if (q.get("tab") === "support") return q.get("new") ? { name: "new-ticket", invoiceId: q.get("invoice") ?? undefined } : { name: "support" };
  return { name: "home" };
}

function urlForView(v: View) {
  switch (v.name) {
    case "orders": return "/dashboard?tab=orders";
    case "order": return `/dashboard?order=${encodeURIComponent(v.id)}`;
    case "support": return "/dashboard?tab=support";
    case "new-ticket": return `/dashboard?tab=support&new=1${v.invoiceId ? `&invoice=${encodeURIComponent(v.invoiceId)}` : ""}`;
    case "ticket": return `/dashboard?ticket=${encodeURIComponent(v.id)}`;
    default: return "/dashboard";
  }
}

const toneClass = (tone: string) => `dash-badge dash-badge--${tone}`;

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

function orderTitle(o: HeadlessCustomerOrderSummary) {
  const first = o.lineItems[0]?.productTitle ?? "Order";
  return o.lineItems.length > 1 ? `${first} + ${o.lineItems.length - 1} more` : first;
}

function CopyButton({ value, label = "Copy" }: { value: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button type="button" className="dash-copy" aria-label={`${label}: ${value}`} onClick={async () => {
      try { await navigator.clipboard.writeText(value); setDone(true); window.setTimeout(() => setDone(false), 1500); } catch { /* clipboard blocked */ }
    }}>{done ? <Check size={13} /> : <Copy size={13} />}</button>
  );
}

function Loading({ label = "Loading…" }: { label?: string }) {
  return <div className="dash-loading" role="status"><span className="dash-spinner" />{label}</div>;
}

function ErrorBox({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return <div className="dash-errorbox" role="alert"><p>{message}</p>{onRetry && <button type="button" className="lb-btn lb-btn--ghost" onClick={onRetry}><RotateCw size={14} /> Try again</button>}</div>;
}

export function CustomerDashboard() {
  const [phase, setPhase] = useState<"checking" | "login" | "app">("checking");
  const [view, setView] = useState<View>({ name: "home" });
  const [me, setMe] = useState<HeadlessCustomerMe | null>(null);
  const [dash, setDash] = useState<PortalDashboard | null>(null);
  const [orders, setOrders] = useState<HeadlessCustomerOrderSummary[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const signOutLocal = useCallback(() => {
    getPortalClient().clearSession();
    setMe(null); setDash(null); setOrders(null);
    setPhase("login");
  }, []);

  const load = useCallback(async () => {
    setLoadError(null);
    const client = getPortalClient();
    try {
      // The dashboard summary only adds tickets and counts; if it fails, the page still works.
      const [profile, list, dashboard] = await Promise.all([
        client.me(),
        client.orders({ page: 1, limit: 50 }),
        (client.dashboard() as unknown as Promise<PortalDashboard>).catch(err => { if (isAuthError(err)) throw err; return null; }),
      ]);
      setMe(profile); setDash(dashboard); setOrders(list.invoices);
      setPhase("app");
    } catch (err) {
      if (isAuthError(err)) { signOutLocal(); return; }
      setLoadError(errorMessage(err, "We couldn't load your account."));
      setPhase("app");
    }
  }, [signOutLocal]);

  useEffect(() => {
    setView(viewFromUrl());
    const onPop = () => setView(viewFromUrl());
    window.addEventListener("popstate", onPop);
    if (getPortalClient().getSession()) void load(); else setPhase("login");
    return () => window.removeEventListener("popstate", onPop);
  }, [load]);

  const go = useCallback((v: View) => {
    setView(v);
    window.history.pushState(null, "", urlForView(v));
    window.scrollTo({ top: 0 });
  }, []);

  const signOut = async () => {
    try { await getPortalClient().logout(); } catch { /* session may already be gone */ }
    signOutLocal();
    window.history.replaceState(null, "", "/dashboard");
  };

  const tab = view.name === "order" || view.name === "orders" ? "orders" : view.name === "home" ? "home" : "support";

  return (
    <main className="lb dash">
      <SiteBackground />
      <header className="dash-top">
        <Link className="lb-brand" href="/" aria-label={`${site.name} home`}><GGMark /><span>GG<b>Boosts</b></span></Link>
        {phase === "app" && (
          <nav className="dash-tabs" aria-label="Account">
            <button type="button" aria-current={tab === "home" ? "page" : undefined} onClick={() => go({ name: "home" })}><Home size={15} /> Home</button>
            <button type="button" aria-current={tab === "orders" ? "page" : undefined} onClick={() => go({ name: "orders" })}><Package size={15} /> Orders</button>
            <button type="button" aria-current={tab === "support" ? "page" : undefined} onClick={() => go({ name: "support" })}><Headphones size={15} /> Support</button>
          </nav>
        )}
        <div className="dash-top__right">
          {phase === "app" && me && <span className="dash-top__email">{me.customer.email}</span>}
          <Link className="dash-top__store" href="/products"><ShoppingBag size={15} /> <span>Store</span></Link>
        </div>
      </header>

      {phase === "checking" && <Loading label="Checking your session…" />}
      {phase === "login" && <PortalLogin onSignedIn={() => { setPhase("checking"); void load(); }} />}
      {phase === "app" && (
        <div className="dash-body">
          {loadError ? <ErrorBox message={loadError} onRetry={() => void load()} /> : (
            <>
              {view.name === "home" && <HomeView me={me} dash={dash} orders={orders} go={go} onSignOut={signOut} />}
              {view.name === "orders" && <OrdersView initial={orders} go={go} />}
              {view.name === "order" && <OrderDetail id={view.id} go={go} onAuthLost={signOutLocal} />}
              {view.name === "support" && <SupportView dash={dash} go={go} />}
              {view.name === "new-ticket" && <NewTicket orders={orders} invoiceId={view.invoiceId} go={go} onCreated={() => void load()} />}
              {view.name === "ticket" && <TicketView id={view.id} go={go} onAuthLost={signOutLocal} />}
            </>
          )}
        </div>
      )}
    </main>
  );
}

/* ---------------- Home ---------------- */

function HomeView({ me, dash, orders, go, onSignOut }: { me: HeadlessCustomerMe | null; dash: PortalDashboard | null; orders: HeadlessCustomerOrderSummary[] | null; go: (v: View) => void; onSignOut: () => void }) {
  const list = orders ?? [];
  const paid = list.filter(o => isPaid(o.status));
  const waiting = list.filter(o => orderStatus(o.status).tone === "wait");
  const currency = list[0]?.currency ?? me?.shop.currency ?? "USD";
  const totalPaid = paid.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const latest = list[0];
  const name = me?.customer.name || me?.customer.email.split("@")[0] || "there";

  const [latestDetail, setLatestDetail] = useState<HeadlessCustomerOrder | null>(null);
  useEffect(() => {
    if (!latest) return;
    getPortalClient().order(latest.uniqid).then(setLatestDetail).catch(() => setLatestDetail(null));
  }, [latest]);
  const latestDelivery = latestDetail?.lineItems[0] ? deliveryStatus(latestDetail.lineItems[0].deliveryStatus) : null;

  return (
    <>
      <div className="dash-hello">
        <h1>{greeting()}, <em>{name}</em></h1>
        <p>Here's a summary of your account and recent orders.</p>
      </div>
      <div className="dash-home">
        <aside className="dash-card dash-profile">
          <div className="dash-profile__id">
            <span className="dash-avatar">{name.slice(0, 2).toUpperCase()}</span>
            <div><strong>{name}</strong><span>{me?.customer.email}</span>{me?.customer.joined_at && <small>Customer since {new Date(me.customer.joined_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</small>}</div>
          </div>
          <div className="dash-quick">
            <button type="button" onClick={() => go({ name: "orders" })}><Package size={18} /> Orders</button>
            <button type="button" onClick={() => go({ name: "support" })}><LifeBuoy size={18} /> Support</button>
            <Link href="/products"><ShoppingBag size={18} /> Shop</Link>
          </div>
          <a className="dash-linkrow" href={site.supportUrl} target="_blank" rel="noreferrer"><span className="dash-linkrow__icon dash-linkrow__icon--discord"><DiscordIcon size={16} /></span><div><strong>Discord</strong><small>The fastest way to reach us</small></div><ChevronRight size={16} /></a>
          <button type="button" className="dash-signout" onClick={onSignOut}><LogOut size={15} /> Sign out</button>
        </aside>

        <section className="dash-main">
          <div className="dash-stats">
            <div className="dash-card dash-stat"><span>Total orders</span><strong>{dash?.stats.invoices_count ?? list.length}</strong><small>All time</small><Receipt size={18} /></div>
            <div className="dash-card dash-stat"><span>Paid</span><strong>{paid.length}</strong><small>Payments confirmed</small><Check size={18} /></div>
            <div className="dash-card dash-stat"><span>In progress</span><strong>{waiting.length}</strong><small>Awaiting payment</small><Clock size={18} /></div>
            <div className="dash-card dash-stat"><span>Total paid</span><strong>{formatMoney(totalPaid, currency)}</strong><small>Across paid orders</small><Wallet size={18} /></div>
          </div>

          {latest ? (
            <div className="dash-card dash-latest">
              <div>
                <span className="dash-label">Latest order</span>
                <h2>{orderTitle(latest)}</h2>
                <p>{formatMoney(latest.total, latest.currency)} · {formatDate(latest.createdAt)}</p>
              </div>
              <div className="dash-latest__foot">
                <span className={toneClass((latestDelivery ?? orderStatus(latest.status)).tone)}>{(latestDelivery ?? orderStatus(latest.status)).label}</span>
                <button type="button" className="lb-btn lb-btn--ghost" onClick={() => go({ name: "order", id: latest.uniqid })}>View order <ArrowRight size={15} /></button>
              </div>
            </div>
          ) : (
            <div className="dash-card dash-empty">
              <Package size={26} />
              <h2>No orders yet</h2>
              <p>When you buy boosts with this email, your orders show up here.</p>
              <Link className="lb-btn lb-btn--primary" href="/products">Browse packages <ArrowRight size={15} /></Link>
            </div>
          )}

          {list.length > 0 && (
            <div className="dash-card dash-table-card">
              <div className="dash-card__head"><h2>Recent orders</h2><button type="button" className="dash-textbtn" onClick={() => go({ name: "orders" })}>View all <ArrowRight size={14} /></button></div>
              <OrderTable orders={list.slice(0, 5)} go={go} />
            </div>
          )}
        </section>
      </div>
    </>
  );
}

function OrderTable({ orders, go }: { orders: HeadlessCustomerOrderSummary[]; go: (v: View) => void }) {
  return (
    <div className="dash-table" role="table" aria-label="Orders">
      <div className="dash-table__row dash-table__row--head" role="row">
        <span role="columnheader">Order</span><span role="columnheader">Date</span><span role="columnheader">Amount</span><span role="columnheader">Status</span>
      </div>
      {orders.map(o => {
        const st = orderStatus(o.status);
        return (
          <button key={o.uniqid} type="button" className="dash-table__row" role="row" onClick={() => go({ name: "order", id: o.uniqid })}>
            <span role="cell" className="dash-table__order"><Package size={16} /><span><strong>{orderTitle(o)}</strong><code>{o.uniqid}</code></span></span>
            <span role="cell">{formatDate(o.createdAt)}</span>
            <span role="cell"><strong>{formatMoney(o.total, o.currency)}</strong></span>
            <span role="cell"><span className={toneClass(st.tone)}>{st.label}</span><ChevronRight size={16} className="dash-table__chev" /></span>
          </button>
        );
      })}
    </div>
  );
}

/* ---------------- Orders ---------------- */

function OrdersView({ initial, go }: { initial: HeadlessCustomerOrderSummary[] | null; go: (v: View) => void }) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [data, setData] = useState<{ invoices: HeadlessCustomerOrderSummary[]; hasMore: boolean } | null>(initial && page === 1 && !query ? { invoices: initial.slice(0, 20), hasMore: initial.length > 20 } : null);
  const [error, setError] = useState<string | null>(null);

  const fetchPage = useCallback(async () => {
    setError(null); setData(null);
    try {
      const res = await getPortalClient().orders({ page, limit: 20, ...(query ? { search: query } : {}) });
      setData({ invoices: res.invoices, hasMore: res.pagination.has_more });
    } catch (err) { setError(errorMessage(err, "We couldn't load your orders.")); }
  }, [page, query]);

  useEffect(() => { void fetchPage(); }, [fetchPage]);

  return (
    <>
      <div className="dash-pagehead">
        <div><h1>Orders</h1><p>Every order placed with your email.</p></div>
        <form className="dash-search" onSubmit={e => { e.preventDefault(); setPage(1); setQuery(search.trim()); }}>
          <input type="search" placeholder="Search by order ID" aria-label="Search orders by order ID" value={search} onChange={e => setSearch(e.target.value)} />
          <button type="submit" className="lb-btn lb-btn--ghost">Search</button>
        </form>
      </div>
      <div className="dash-card dash-table-card">
        {error ? <ErrorBox message={error} onRetry={() => void fetchPage()} /> : !data ? <Loading /> : data.invoices.length === 0 ? (
          <div className="dash-empty dash-empty--flat"><Package size={24} /><p>{query ? "No orders match that ID." : "No orders yet."}</p></div>
        ) : <OrderTable orders={data.invoices} go={go} />}
        {data && (page > 1 || data.hasMore) && (
          <div className="dash-pager">
            <button type="button" className="lb-btn lb-btn--ghost" disabled={page === 1} onClick={() => setPage(p => p - 1)}><ArrowLeft size={14} /> Previous</button>
            <span>Page {page}</span>
            <button type="button" className="lb-btn lb-btn--ghost" disabled={!data.hasMore} onClick={() => setPage(p => p + 1)}>Next <ArrowRight size={14} /></button>
          </div>
        )}
      </div>
    </>
  );
}

/* ---------------- Order detail ---------------- */

function fieldValue(v: unknown): string {
  if (v === true || v === "true" || v === "on") return "Yes";
  if (v === false || v === "false") return "No";
  if (v === null || v === undefined || v === "") return "—";
  return typeof v === "string" ? v : JSON.stringify(v);
}

function OrderDetail({ id, go, onAuthLost }: { id: string; go: (v: View) => void; onAuthLost: () => void }) {
  const [order, setOrder] = useState<HeadlessCustomerOrder | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pdfBusy, setPdfBusy] = useState(false);

  const fetchOrder = useCallback(async () => {
    setError(null); setOrder(null);
    try { setOrder(await getPortalClient().order(id)); }
    catch (err) { if (isAuthError(err)) onAuthLost(); else setError(errorMessage(err, "We couldn't load this order.")); }
  }, [id, onAuthLost]);
  useEffect(() => { void fetchOrder(); }, [fetchOrder]);

  const fields = useMemo(() => {
    if (!order) return [] as [string, string][];
    const merged: Record<string, unknown> = { ...(order.customFields ?? {}) };
    for (const item of order.lineItems) Object.assign(merged, item.customFields ?? {});
    return Object.entries(merged).map(([k, v]) => [k, fieldValue(v)] as [string, string]);
  }, [order]);

  async function downloadPdf() {
    if (!order) return;
    setPdfBusy(true);
    try {
      const file = await getPortalClient().invoicePdf(order.uniqid);
      const url = URL.createObjectURL(file.blob);
      const a = document.createElement("a");
      a.href = url; a.download = file.filename ?? `invoice-${order.uniqid}.pdf`; a.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 2000);
    } catch { /* invoice PDFs may be disabled for the shop */ } finally { setPdfBusy(false); }
  }

  return (
    <>
      <button type="button" className="dash-back" onClick={() => go({ name: "orders" })}><ArrowLeft size={15} /> All orders</button>
      {error ? <ErrorBox message={error} onRetry={() => void fetchOrder()} /> : !order ? <Loading /> : (
        <div className="dash-detail">
          <div className="dash-detail__main">
            <div className="dash-card">
              <div className="dash-detail__head">
                <div>
                  <span className="dash-label">Order</span>
                  <h1 className="dash-detail__id"><code>{order.uniqid}</code><CopyButton value={order.uniqid} label="Copy order ID" /></h1>
                  <p>Placed {formatDate(order.createdAt, true)}</p>
                </div>
                <span className={toneClass(orderStatus(order.status).tone)}>{orderStatus(order.status).label}</span>
              </div>
              {order.statusDetails && <p className="dash-note">{order.statusDetails}</p>}
            </div>

            {order.lineItems.map(item => {
              const ds = deliveryStatus(item.deliveryStatus);
              const delivered = item.deliveryText?.trim() || item.product?.serviceText?.trim() || null;
              return (
                <div key={item.id} className="dash-card dash-item">
                  <div className="dash-item__head">
                    <span className="dash-item__icon"><Package size={20} /></span>
                    <div><h2>{item.productTitle}</h2><span>{[item.variantTitle, `Qty ${item.quantity}`].filter(Boolean).join(" · ")}</span></div>
                    <strong>{formatMoney(item.total, order.currency)}</strong>
                  </div>
                  <div className="dash-item__status">
                    <span className={toneClass(ds.tone)}>{ds.label}</span>
                    {item.deliveredAt && <small>Delivered {formatDate(item.deliveredAt, true)}</small>}
                  </div>
                  {item.deliveryStatus === "AWAITING_FULFILLMENT" && <p className="dash-note">Your boosts are being applied. Most orders finish within minutes — if it's been longer than an hour, contact support below.</p>}
                  {item.deliveryStatus === "FAILED" && <p className="dash-note dash-note--bad">Delivery hit a problem. Open a support ticket and we'll sort it out.</p>}
                  {delivered && <div className="dash-delivery"><span className="dash-label">Delivery details</span><p>{delivered}</p></div>}
                  {item.deliverySummary?.notes.map((n, i) => <p key={i} className="dash-note">{n}</p>)}
                </div>
              );
            })}

            {fields.length > 0 && (
              <div className="dash-card">
                <h2 className="dash-card__title">Your details</h2>
                <dl className="dash-fields">
                  {fields.map(([k, v]) => (
                    <div key={k}><dt>{k}</dt><dd>{/^https?:\/\//.test(v) ? <a href={v} target="_blank" rel="noreferrer">{v}</a> : v}</dd></div>
                  ))}
                </dl>
              </div>
            )}
          </div>

          <aside className="dash-detail__side">
            <div className="dash-card">
              <h2 className="dash-card__title">Summary</h2>
              <dl className="dash-sum">
                <div><dt>Subtotal</dt><dd>{formatMoney(order.subtotal, order.currency)}</dd></div>
                {Number(order.discount) > 0 && <div><dt>Discount</dt><dd>−{formatMoney(order.discount, order.currency)}</dd></div>}
                {Number(order.tax) > 0 && <div><dt>Tax</dt><dd>{formatMoney(order.tax, order.currency)}</dd></div>}
                <div className="dash-sum__total"><dt>Total</dt><dd>{formatMoney(order.total, order.currency)}</dd></div>
                {order.currentPayment && <div><dt>Paid with</dt><dd>{order.currentPayment.displayName ?? order.currentPayment.gateway}</dd></div>}
              </dl>
              {isPaid(order.status) && <button type="button" className="lb-btn lb-btn--ghost dash-full" onClick={downloadPdf} disabled={pdfBusy}><Download size={15} /> {pdfBusy ? "Preparing…" : "Download invoice"}</button>}
            </div>
            <div className="dash-card dash-help">
              <h2 className="dash-card__title">Need help with this order?</h2>
              <p>Open a ticket and we'll reply here and by email.</p>
              <button type="button" className="lb-btn lb-btn--primary dash-full" onClick={() => go({ name: "new-ticket", invoiceId: order.uniqid })}><MessageSquare size={15} /> Get help</button>
              <a className="lb-btn lb-btn--discord dash-full" href={site.supportUrl} target="_blank" rel="noreferrer"><DiscordIcon size={15} /> Ask on Discord</a>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

/* ---------------- Support ---------------- */

function SupportView({ dash, go }: { dash: PortalDashboard | null; go: (v: View) => void }) {
  const tickets = dash?.tickets ?? [];
  return (
    <>
      <div className="dash-pagehead">
        <div><h1>Support</h1><p>Questions about an order? Open a ticket — replies show up here and by email.</p></div>
        <button type="button" className="lb-btn lb-btn--primary" onClick={() => go({ name: "new-ticket" })}><Plus size={15} /> New ticket</button>
      </div>
      <div className="dash-card dash-table-card">
        {tickets.length === 0 ? (
          <div className="dash-empty dash-empty--flat"><LifeBuoy size={24} /><p>No tickets yet.</p><a className="lb-btn lb-btn--discord" href={site.supportUrl} target="_blank" rel="noreferrer"><DiscordIcon size={15} /> Or reach us on Discord</a></div>
        ) : (
          <div className="dash-tickets">
            {tickets.map(t => {
              const st = ticketStatus(t.status);
              return (
                <button key={t.uniqid} type="button" className="dash-ticketrow" onClick={() => go({ name: "ticket", id: t.uniqid })}>
                  <MessageSquare size={17} />
                  <span><strong>{t.title}</strong><small>Updated {formatDate(t.updated_at, true)}</small></span>
                  <span className={toneClass(st.tone)}>{st.label}</span>
                  <ChevronRight size={16} />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

function NewTicket({ orders, invoiceId, go, onCreated }: { orders: HeadlessCustomerOrderSummary[] | null; invoiceId?: string; go: (v: View) => void; onCreated: () => void }) {
  const [title, setTitle] = useState(invoiceId ? "Help with my order" : "");
  const [order, setOrder] = useState(invoiceId ?? "");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || message.trim().length < 5) { setError("Add a subject and a short description of the problem."); return; }
    setBusy(true); setError(null);
    try {
      const res = await getPortalClient().createTicket({ title: title.trim(), message: message.trim(), ...(order ? { invoiceId: order } : {}) });
      onCreated();
      go({ name: "ticket", id: res.uniqid });
    } catch (err) { setError(errorMessage(err, "We couldn't create the ticket. Please try again.")); }
    finally { setBusy(false); }
  }

  return (
    <>
      <button type="button" className="dash-back" onClick={() => go({ name: "support" })}><ArrowLeft size={15} /> Support</button>
      <form className="dash-card dash-form" onSubmit={submit}>
        <h1>New support ticket</h1>
        <label className="dash-field"><span>Subject</span><input value={title} onChange={e => setTitle(e.target.value)} maxLength={120} placeholder="e.g. Boosts haven't arrived" required /></label>
        <label className="dash-field"><span>Related order (optional)</span>
          <select value={order} onChange={e => setOrder(e.target.value)}>
            <option value="">No specific order</option>
            {(orders ?? []).map(o => <option key={o.uniqid} value={o.uniqid}>{orderTitle(o)} — {formatDate(o.createdAt)} — {o.uniqid.slice(0, 8)}</option>)}
            {invoiceId && !(orders ?? []).some(o => o.uniqid === invoiceId) && <option value={invoiceId}>{invoiceId}</option>}
          </select>
        </label>
        <label className="dash-field"><span>Message</span><textarea value={message} onChange={e => setMessage(e.target.value)} rows={6} placeholder="Tell us what's going on. Include your server invite link if the problem is with delivery." required /></label>
        {error && <p className="dash-error" role="alert">{error}</p>}
        <button type="submit" className="lb-btn lb-btn--primary" disabled={busy}><Send size={15} /> {busy ? "Sending…" : "Send ticket"}</button>
      </form>
    </>
  );
}

function TicketView({ id, go, onAuthLost }: { id: string; go: (v: View) => void; onAuthLost: () => void }) {
  const [data, setData] = useState<PortalTicket | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [busy, setBusy] = useState(false);

  const fetchTicket = useCallback(async () => {
    setError(null);
    try { setData(await getPortalClient().ticket(id) as unknown as PortalTicket); }
    catch (err) { if (isAuthError(err)) onAuthLost(); else setError(errorMessage(err, "We couldn't load this ticket.")); }
  }, [id, onAuthLost]);
  useEffect(() => { void fetchTicket(); }, [fetchTicket]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!reply.trim()) return;
    setBusy(true);
    try { await getPortalClient().replyToTicket(id, reply.trim()); setReply(""); await fetchTicket(); }
    catch (err) { setError(errorMessage(err, "Your reply didn't send. Please try again.")); }
    finally { setBusy(false); }
  }

  const t = data?.ticket;
  const closed = t ? ticketStatus(t.status).label === "Closed" : false;

  return (
    <>
      <button type="button" className="dash-back" onClick={() => go({ name: "support" })}><ArrowLeft size={15} /> Support</button>
      {error && !t ? <ErrorBox message={error} onRetry={() => void fetchTicket()} /> : !t ? <Loading /> : (
        <div className="dash-card dash-thread">
          <div className="dash-detail__head">
            <div><span className="dash-label">Ticket</span><h1>{t.title}</h1><p>Opened {formatDate(t.created_at, true)}{t.invoice_id && <> · <button type="button" className="dash-textbtn" onClick={() => go({ name: "order", id: t.invoice_id! })}>View order</button></>}</p></div>
            <span className={toneClass(ticketStatus(t.status).tone)}>{ticketStatus(t.status).label}</span>
          </div>
          <ol className="dash-messages">
            {t.messages.map(m => (
              <li key={m.id} className={`dash-msg dash-msg--${m.role.toLowerCase()}`}>
                <div className="dash-msg__meta"><strong>{m.role === "CUSTOMER" ? "You" : m.role === "SHOP" ? site.name : "System"}</strong><time>{formatDate(m.created_at, true)}</time></div>
                <p>{m.message}</p>
              </li>
            ))}
          </ol>
          {closed ? <p className="dash-note">This ticket is closed. Open a new one if you still need help.</p> : (
            <form className="dash-reply" onSubmit={send}>
              <label className="dash-field"><span>Reply</span><textarea value={reply} onChange={e => setReply(e.target.value)} rows={3} placeholder="Write a reply…" /></label>
              {error && <p className="dash-error" role="alert">{error}</p>}
              <button type="submit" className="lb-btn lb-btn--primary" disabled={busy || !reply.trim()}><Send size={15} /> {busy ? "Sending…" : "Send reply"}</button>
            </form>
          )}
        </div>
      )}
    </>
  );
}
