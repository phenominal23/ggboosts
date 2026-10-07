"use client";

import { useMemo } from "react";

// Shoppex descriptions come from a rich-text editor (HTML) or plain text. We only keep simple formatting
// tags and safe links — never scripts, styles, images or event handlers.
const ALLOWED = new Set(["P", "BR", "STRONG", "B", "EM", "I", "U", "S", "UL", "OL", "LI", "H1", "H2", "H3", "H4", "A", "CODE", "BLOCKQUOTE", "HR", "SPAN", "DIV"]);

function clean(node: Node, doc: Document): Node | null {
  if (node.nodeType === Node.TEXT_NODE) return doc.createTextNode(node.textContent ?? "");
  if (node.nodeType !== Node.ELEMENT_NODE) return null;
  const el = node as Element;
  if (["SCRIPT", "STYLE", "NOSCRIPT", "IFRAME", "TEMPLATE", "OBJECT", "EMBED"].includes(el.tagName)) return null;
  const kids = Array.from(el.childNodes).map(c => clean(c, doc)).filter((c): c is Node => c !== null);
  if (!ALLOWED.has(el.tagName)) {
    const frag = doc.createDocumentFragment();
    kids.forEach(k => frag.appendChild(k));
    return frag;
  }
  const out = doc.createElement(el.tagName === "H1" || el.tagName === "H2" ? "h3" : el.tagName.toLowerCase());
  if (el.tagName === "A") {
    const href = el.getAttribute("href") ?? "";
    if (/^(https?:|mailto:)/i.test(href)) { out.setAttribute("href", href); out.setAttribute("target", "_blank"); out.setAttribute("rel", "noopener noreferrer"); }
  }
  kids.forEach(k => out.appendChild(k));
  return out;
}

function toSafeHtml(raw: string): string {
  if (typeof window === "undefined") return "";
  const looksHtml = /<\/?[a-z][\s\S]*>/i.test(raw);
  const doc = document.implementation.createHTMLDocument("");
  const body = doc.createElement("div");
  if (looksHtml) {
    const parsed = new DOMParser().parseFromString(raw, "text/html");
    Array.from(parsed.body.childNodes).forEach(n => { const c = clean(n, doc); if (c) body.appendChild(c); });
  } else {
    // Plain text: keep line breaks, turn URLs into links.
    raw.split("\n").forEach((line, i) => {
      if (i) body.appendChild(doc.createElement("br"));
      line.split(/(https?:\/\/\S+)/g).forEach(part => {
        if (/^https?:\/\//.test(part)) {
          const a = doc.createElement("a");
          a.href = part; a.target = "_blank"; a.rel = "noopener noreferrer"; a.textContent = part;
          body.appendChild(a);
        } else if (part) body.appendChild(doc.createTextNode(part));
      });
    });
  }
  return body.innerHTML;
}

/** The product's Shoppex description, safely rendered. */
export function ProductDescription({ html }: { html: string }) {
  const safe = useMemo(() => toSafeHtml(html), [html]);
  if (!safe.trim()) return null;
  // Safe: sanitized above with a strict tag allow-list.
  return <div className="co-desc" dangerouslySetInnerHTML={{ __html: safe }} />;
}
