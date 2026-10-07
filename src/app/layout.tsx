import type { Metadata, Viewport } from "next";
import type { CSSProperties, ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { themeConfig } from "@/lib/theme-config";
import { JsonLd } from "@/components/seo/json-ld";
import { organizationJsonLd, SITE_URL, websiteJsonLd } from "@/lib/seo";
import "./globals.css";
import "./gg-v2.css";
import "./gg-home.css";
import "./gg-dashboard.css";
import "./gg-checkout.css";



export const metadata: Metadata = {
  // Absolute base for canonical and share-image links.
  metadataBase: new URL(SITE_URL),
  title: { default: "GGBoosts – Cheap Discord Server Boosts | Level 3 for Less", template: "%s | GGBoosts" },
  description: "Buy Discord server boosts with a one-time payment — 8, 14, 20 or 30 boosts, monthly to lifetime. No Discord login needed, warranty included. Plus members, aged accounts and Nitro.",
  openGraph: {
    title: "GGBoosts – Cheap Discord Server Boosts",
    description: "Level 3 for your server without the Nitro price. Automated delivery, warranty included, no Discord login required.",
    siteName: "GGBoosts",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = { themeColor: "#09090b" };

export default function RootLayout({ children }: { children: ReactNode }) {
  const themeStyle = {
    "--background": themeConfig.colors.background,
    "--foreground": themeConfig.colors.foreground,
    "--muted": themeConfig.colors.muted,
    "--surface": themeConfig.colors.surface,
    "--border": themeConfig.colors.border,
    "--accent": themeConfig.colors.accent,
    "--accent-strong": themeConfig.colors.accentStrong,
    "--danger": themeConfig.colors.danger,
    "--card": themeConfig.colors.surface,
    "--card-foreground": themeConfig.colors.foreground,
    "--popover": "#101012",
    "--popover-foreground": themeConfig.colors.foreground,
    "--primary": themeConfig.colors.accent,
    "--primary-foreground": "#ffffff",
    "--secondary": themeConfig.colors.surface,
    "--secondary-foreground": themeConfig.colors.foreground,
    "--muted-foreground": themeConfig.colors.muted,
    "--accent-foreground": "#ffffff",
    "--destructive": themeConfig.colors.danger,
    "--input": themeConfig.colors.border,
    "--ring": themeConfig.colors.accent,
  } as CSSProperties;

  return (
    <html data-scroll-behavior="smooth" lang="en" className="font-sans">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400..800&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body style={themeStyle}>
        <JsonLd data={[organizationJsonLd, websiteJsonLd]} />
        {children}
        <Toaster position="bottom-left" />
      </body>
    </html>
  );
}
