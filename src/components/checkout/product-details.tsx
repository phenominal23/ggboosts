"use client";

import { Fragment, useMemo } from "react";

// Shoppex descriptions may be rich-text HTML or plain text. We turn either into plain lines, then lay them out:
// "- " / "• " lines become bullet lists, a short line right before a list becomes its heading, and URLs become links.
// Rendering is plain React (no injected HTML), so nothing in a description can run code.

type Block = { kind: "heading" | "para"; text: string } | { kind: "list"; ordered: boolean; items: string[] };

function htmlToLines(raw: string): string[] {
  if (!/<\/?[a-z][\s\S]*>/i.test(raw) || typeof window === "undefined") return raw.split(/\r?\n/);
  const doc = new DOMParser().parseFromString(raw, "text/html");
  doc.querySelectorAll("script, style, noscript, iframe, template").forEach(n => n.remove());
  doc.querySelectorAll("br").forEach(n => n.replaceWith("\n"));
  doc.querySelectorAll("li").forEach(n => n.prepend("• "));
  doc.querySelectorAll("p, div, li, h1, h2, h3, h4, h5, h6, ul, ol, blockquote").forEach(n => n.append("\n"));
  return (doc.body.textContent ?? "").split("\n");
}

function toBlocks(raw: string): Block[] {
  const lines = htmlToLines(raw).map(l => l.trim());
  const blocks: Block[] = [];
  const bullet = /^([-•*–]|\d+[.)])\s+/;
  lines.forEach((line, i) => {
    if (!line) return;
    if (bullet.test(line)) {
      const item = line.replace(bullet, "");
      const ordered = /^\d/.test(line);
      const last = blocks[blocks.length - 1];
      if (last?.kind === "list" && last.ordered === ordered) last.items.push(item);
      else blocks.push({ kind: "list", ordered, items: [item] });
      return;
    }
    const next = lines.slice(i + 1).find(Boolean) ?? "";
    const isHeading = line.length <= 40 && !/[.!?:]$/.test(line) && bullet.test(next);
    blocks.push({ kind: isHeading ? "heading" : "para", text: line });
  });
  return blocks;
}

function Linkify({ text }: { text: string }) {
  const parts = text.split(/(https?:\/\/[^\s)]+)/g);
  return <>{parts.map((p, i) => /^https?:\/\//.test(p)
    ? <a key={i} href={p} target="_blank" rel="noopener noreferrer">{p.replace(/^https?:\/\//, "")}</a>
    : <Fragment key={i}>{p}</Fragment>)}</>;
}

/** The product's Shoppex description, laid out cleanly. */
export function ProductDescription({ html }: { html: string }) {
  const blocks = useMemo(() => toBlocks(html), [html]);
  if (!blocks.length) return null;
  return (
    <div className="co-desc">
      {blocks.map((b, i) => b.kind === "list"
        ? (b.ordered
          ? <ol key={i}>{b.items.map((t, j) => <li key={j}><Linkify text={t} /></li>)}</ol>
          : <ul key={i}>{b.items.map((t, j) => <li key={j}><Linkify text={t} /></li>)}</ul>)
        : b.kind === "heading" ? <h4 key={i}>{b.text}</h4>
          : <p key={i}><Linkify text={b.text} /></p>)}
    </div>
  );
}
