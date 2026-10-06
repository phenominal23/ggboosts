"use client";

import { createCustomerClient, type HeadlessCustomerClient } from "@shoppexio/storefront/customer";
import { shoppexConfig } from "@/lib/shoppex-config";

let client: HeadlessCustomerClient | null = null;

// One shared Shoppex customer client for the /dashboard portal (browser only).
export function getPortalClient(): HeadlessCustomerClient {
  if (!client) {
    client = createCustomerClient({
      shop: shoppexConfig.shopSlug,
      publishableKey: shoppexConfig.publishableKey,
      apiBaseUrl: shoppexConfig.apiBaseUrl,
    });
  }
  return client;
}

// Shapes of the portal responses we use (the SDK's own types come from a package it doesn't ship).
export type PortalDashboard = {
  customer: { email: string; name: string };
  stats: { invoices_count: number; tickets_count: number };
  tickets: Array<{ uniqid: string; title: string; status: string; updated_at: string; created_at: string | null }>;
};

export type PortalTicket = {
  ticket: {
    uniqid: string;
    title: string;
    status: string;
    invoice_id: string | null;
    created_at: string;
    updated_at: string;
    messages: Array<{ id: string; role: "CUSTOMER" | "SHOP" | "SYSTEM"; message: string; created_at: string }>;
  };
};

export function formatMoney(amount: string | number, currency = "USD") {
  const n = typeof amount === "number" ? amount : Number(amount);
  if (!Number.isFinite(n)) return String(amount);
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(n);
  } catch {
    return `${n.toFixed(2)} ${currency}`;
  }
}

export function formatDate(value: string | null | undefined, withTime = false) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", withTime
    ? { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }
    : { month: "short", day: "numeric", year: "numeric" });
}

// Invoice (payment) status → label + tone.
export function orderStatus(status: string): { label: string; tone: "ok" | "wait" | "bad" | "neutral" } {
  const s = status.toUpperCase();
  if (s === "COMPLETED" || s === "PAID") return { label: "Paid", tone: "ok" };
  if (s === "PENDING" || s === "WAITING_FOR_CONFIRMATIONS" || s === "PARTIAL" || s === "PARTIALLY_PAID" || s === "PROCESSING") return { label: "Awaiting payment", tone: "wait" };
  if (s === "REFUNDED" || s === "PARTIALLY_REFUNDED") return { label: "Refunded", tone: "neutral" };
  if (s === "VOIDED" || s === "EXPIRED" || s === "CANCELLED" || s === "CANCELED") return { label: "Cancelled", tone: "bad" };
  return { label: titleCase(s), tone: "neutral" };
}

// Line item delivery status → label + tone.
export function deliveryStatus(status: string | null | undefined): { label: string; tone: "ok" | "wait" | "bad" | "neutral" } {
  switch (status) {
    case "DELIVERED": return { label: "Delivered", tone: "ok" };
    case "AWAITING_FULFILLMENT": return { label: "Awaiting delivery", tone: "wait" };
    case "PENDING": return { label: "Pending payment", tone: "neutral" };
    case "FAILED": return { label: "Delivery failed", tone: "bad" };
    default: return { label: "—", tone: "neutral" };
  }
}

export function ticketStatus(status: string): { label: string; tone: "ok" | "wait" | "bad" | "neutral" } {
  const s = status.toUpperCase();
  if (s === "OPEN" || s === "PENDING" || s === "WAITING") return { label: "Open", tone: "wait" };
  if (s === "ANSWERED" || s === "REPLIED") return { label: "Answered", tone: "ok" };
  if (s === "CLOSED" || s === "RESOLVED") return { label: "Closed", tone: "neutral" };
  return { label: titleCase(s), tone: "neutral" };
}

function titleCase(s: string) {
  return s.toLowerCase().replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

export function isPaid(status: string) {
  return orderStatus(status).tone === "ok";
}

export function errorMessage(error: unknown, fallback = "Something went wrong. Please try again.") {
  if (error && typeof error === "object" && "message" in error && typeof (error as { message: unknown }).message === "string") {
    const m = (error as { message: string }).message;
    if (m && m.length < 200) return m;
  }
  return fallback;
}

export function isAuthError(error: unknown) {
  return !!error && typeof error === "object" && "status" in error && (error as { status: number }).status === 401;
}
