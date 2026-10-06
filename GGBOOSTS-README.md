# GGBoosts V4 — Liteboosts-style homepage (lime)

Sections: centered hero + stat row, numbered features + animated 3D gem, "How it works" with 3 live mockups
(working checkout widget, auto-cycling payment picker, Discord boost feed), pricing with vertical plan list,
reviews (Discord channel feed + carousel), price comparison, FAQ, final CTA, payment marquee footer.
Scroll-reveal and hover motion throughout; reduced-motion respected.

Where to edit:
- src/lib/site-content.ts  — all homepage copy, stats, Discord link, support email, payment methods
- src/lib/reviews.ts       — REAL reviews only. Empty = section hidden on the live site (examples show only in `npm run dev`)
- src/lib/competitors.ts   — competitor prices for the comparison table. A column only shows where you're actually cheaper.
- src/app/gg-home.css      — homepage styles (accent color = --lime)

Removed in V4: src/components/pricing-section.tsx, src/app/gg-v3.css (delete them from your project if present).

# GGBoosts V2 — completed frontend

This is the substantial V2 rebuild. It is also installed directly in `C:\Projects\ggboosts`. The original uploaded ZIP was not modified. The active preview uses http://localhost:3012.

## Design

Liteboosts.com was inspected visually before implementation: desktop hero, feature artwork, animated checkout walkthrough, package controls, navigation and mobile layout. The GGBoosts design uses original CSS/SVG artwork and its own copy: a layered community command deck, orbital lighting, particles, a single animated package instrument, a playable four-stage demonstration, alternating coverage/portal scenes, and a full-width finale. No Liteboosts assets were copied.

Mobile layouts recompose the hero, shorten the boost instrument and turn the walkthrough into a stage with compact step controls. Reduced-motion support disables animated effects and automatic demonstration playback; users can also pause ambient motion and the demonstration manually.

## Run or install

Use the active project at `C:\Projects\ggboosts`, or extract this ZIP and open its `ggboosts` folder. If replacing an existing project, copy the CONTENTS of the inner `ggboosts` folder into the folder containing your existing package.json. Do not nest a second ggboosts folder inside the project.

Node.js 20.9+ is required. Use `pnpm install --frozen-lockfile`, `pnpm dev`, or `pnpm build` followed by `pnpm start`. The active project also retains its original npm setup: `npm run dev`, `npm run build`, `npm start`. No dependency was added for motion. Restart an existing production server after rebuilding.

## Live Shoppex configuration

Keep your real environment settings. The supplied starter uses demo data and a demo customer-portal URL. Set `NEXT_PUBLIC_SHOPPEX_SHOP_SLUG`, `NEXT_PUBLIC_SHOPPEX_USE_SAMPLE_DATA=false` and `NEXT_PUBLIC_CUSTOMER_PORTAL_URL` for your real store. Keep existing API, checkout and webhook settings. No private credentials belong in NEXT_PUBLIC variables.

The homepage hides all starter sample offers and prices. Demo product routes remain available for development and are explicitly labeled; demo checkout does not create payments. Live payment, fulfillment and portal authentication require verification with the actual merchant configuration.

## Product mapping

The configurator recognizes explicit 8 / 14 / 20 / 30 boost labels in product or option titles. It maps explicit 1-month / 3-month / 12-month / 1-year labels across product and variant titles. Conflicting labels, missing prices and invalid prices are excluded. Unmapped products remain available in Full catalog. Selecting a count is exploration, not a stock claim. Unavailable durations are disabled; no pricing or availability is invented.

Product review links preserve the exact Shoppex variant ID using the `variant` query parameter. The product page validates that ID before using it. Stock, quantity bounds, cart, checkout, webhook handling and customer portal integration remain in place.

## Data-dependent social proof

`src/lib/gg-social-proof.ts` contains an empty typed review list. The entire review section stays hidden until verified, approved customer content is added. There are no invented reviews, customer counts, delivery times, transaction notifications or statistics. UI walkthroughs are marked as illustrations, not real orders.

## Verification

Completed in the active project, C:\Projects\ggboosts:
- TypeScript: passed.
- Tests: 24 passed in six suites, including mapping, cart, storefront, product utilities and webhook tests.
- Next.js production build: passed.
- Browser: desktop and 390px mobile inspected; checked package selection, mobile menu, walkthrough stage selection, selected product variant, add-to-cart and checkout continuity.
- Browser console: no errors in the V2 verification tab.
- The test cart was cleared. No payment or customer data was submitted.

Core V2 files: `gg-navigation.tsx`, `server-scene.tsx`, `boost-configurator.tsx`, `purchase-demo.tsx`, `storefront-home.tsx`, `gg-v2.css`, `boost-offers.ts`, and the restyled product/checkout components. V1 backups are kept separately in this chat's work folder.
