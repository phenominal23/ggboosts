import { siAmericanexpress, siApplepay, siBitcoin, siCashapp, siGooglepay, siLitecoin, siMastercard, siTether, siVisa, type SimpleIcon } from "simple-icons";

// Keys match the names in paymentLogos (src/lib/site-content.ts).
const icons: Record<string, SimpleIcon> = {
  Visa: siVisa,
  Mastercard: siMastercard,
  Amex: siAmericanexpress,
  "Apple Pay": siApplepay,
  "Google Pay": siGooglepay,
  "Cash App": siCashapp,
  Bitcoin: siBitcoin,
  Litecoin: siLitecoin,
  USDT: siTether,
};

// These logos already spell the name, so they show large without a text label.
const wordmarks = new Set(["Visa", "Apple Pay", "Google Pay"]);

// Brand colors too dark to read on the black background fall back to white on hover.
function hoverColor(hex: string) {
  const n = Number.parseInt(hex, 16);
  const lum = 0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255);
  return lum < 90 ? "#ffffff" : `#${hex}`;
}

export function PaymentLogo({ name }: { name: string }) {
  const icon = icons[name];
  const wordmark = icon && wordmarks.has(name);
  return (
    <span className={`pay-logo ${wordmark ? "pay-logo--wordmark" : ""}`} style={icon ? ({ "--brand": hoverColor(icon.hex) } as React.CSSProperties) : undefined} title={name}>
      {icon && <svg viewBox="0 0 24 24" role="img" aria-label={name}><path d={icon.path} /></svg>}
      {!wordmark && name}
    </span>
  );
}
