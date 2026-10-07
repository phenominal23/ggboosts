import Link from "next/link";
import type { ReactNode } from "react";

// Tiny formatter for guide/category copy: supports **bold** and [text](/link). Nothing else.
export function RichText({ text }: { text: string }) {
  const out: ReactNode[] = [];
  const re = /\*\*(.+?)\*\*|\[(.+?)\]\((.+?)\)/g;
  let last = 0;
  let m: RegExpExecArray | null = re.exec(text);
  while (m) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[1]) out.push(<strong key={m.index}>{m[1]}</strong>);
    else if (m[3].startsWith("/")) out.push(<Link key={m.index} href={m[3]}>{m[2]}</Link>);
    else out.push(<a key={m.index} href={m[3]} target="_blank" rel="noreferrer">{m[2]}</a>);
    last = re.lastIndex;
    m = re.exec(text);
  }
  if (last < text.length) out.push(text.slice(last));
  return <>{out}</>;
}

/** Plain-text version for meta tags and structured data. */
export function plainText(text: string) {
  return text.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\[(.+?)\]\((.+?)\)/g, "$1");
}
