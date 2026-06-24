# Session log

Running log of work sessions. Newest at the bottom.

---

## 2026-06-24 — Session 1: scaffolding + design system

**Goal:** Project scaffolding and the design system only, using dummy/mock data.
No Supabase / DB / real APIs yet.

**Done:**
- Researched the Cloudflare adapter question → chose OpenNext (`@opennextjs/
  cloudflare`); `next-on-pages` is deprecated/edge-only. (See `decisions.md`.)
- Scaffolded Next.js 16.2.9 + React 19.2, App Router, TypeScript, Tailwind v4,
  ESLint, import alias `@/*`, into the repo root.
- Installed + configured the OpenNext Cloudflare adapter: `wrangler.jsonc`
  (ASSETS + IMAGES bindings, self-service ref), `open-next.config.ts`,
  `initOpenNextCloudflareForDev()` hook in `next.config.ts`, `public/_headers`,
  `.dev.vars`, and `preview`/`deploy`/`upload`/`cf-typegen` scripts.
- Installed shadcn/ui (`base-nova` style, Base UI). Added Button, Card, Badge;
  extended Badge with a Daylight `soft` (accent-soft) pill variant.
- Built the Daylight design-token system in `styles/tokens.css` (palette, fonts,
  radius, spacing extras) mapped via `@theme inline`; wired shadcn semantic
  tokens onto it. Loaded Fraunces + Inter via `next/font`.
- Created folder structure: `app/`, `components/ui/`, `lib/`, `types/`,
  `mock-data/`, `styles/`, `docs/`.
- Built base components: Button (shadcn, accent primary + outline secondary),
  ProductCard (matted-frame pattern), Badge pill (`soft`/NEW), SectionHeading
  (heading font + accent marker).
- Added `types/product.ts`, `mock-data/products.ts`, `lib/format.ts`
  (paise → ₹ formatter), `public/placeholder-product.svg`.
- Built `app/style-guide` — living reference page (palette swatches, fonts,
  radii, all components). Replaced the default home page with a branded landing.
- Wrote docs: root `CLAUDE.md`, `docs/frontend-conventions.md`, `decisions.md`,
  `logs.md`.

**Verified:**
- `npm run build` passes; `/` and `/style-guide` prerender as static.
- Token cascade test: changed `--accent` to `#c026d3`, rebuilt → compiled
  `:root --accent` updated and all utilities still resolved through `var(--accent)`
  (so every component followed). Reverted to `#4a57b8`.

**Next session (not done here):**
- Wire Supabase (data/auth), Cloudflare R2 (assets + ISR incremental cache),
  PhonePe (payments). Import the external business-requirements doc.
- Replace placeholder imagery; revisit `next/image` via Cloudflare Images.
- Build real store pages on top of the design system.
