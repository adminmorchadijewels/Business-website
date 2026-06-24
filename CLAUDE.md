@AGENTS.md

# Jewellery storefront — project facts

A frontend e-commerce **storefront for a fine-jewellery brand** (brand name
working title: "Daylight"). This repository is the web frontend.

## Tech stack

- **Next.js (App Router) + TypeScript** — currently Next.js 16.x, React 19.
- **Tailwind CSS v4** — CSS-first config (`@theme` in CSS, no `tailwind.config.ts`).
- **shadcn/ui** — `base-nova` style (Base UI primitives), components in `components/ui`.
- **Deployment: Cloudflare** via the **OpenNext Cloudflare adapter**
  (`@opennextjs/cloudflare`) + Wrangler — i.e. Cloudflare Workers with static
  assets, the current successor to "Next.js on Cloudflare Pages". **Not Vercel.**
  The deprecated `@cloudflare/next-on-pages` is intentionally NOT used.

### Planned (not yet wired — later sessions)

- **Supabase** — database / auth.
- **Cloudflare R2** — object storage (incl. the OpenNext ISR incremental cache).
- **PhonePe** — payments.
- Full business requirements live in an **external reference doc not yet imported
  into this repo**. Treat product/UX requirements as TBD until that lands.

## The token rule (most important convention)

**ALL colours, fonts, spacing, and radii MUST reference design tokens. Never
hardcode a raw hex code, a raw font-family string, or a raw px value in a
component.**

- The single source of truth is **`styles/tokens.css`** (imported by
  `app/globals.css`). It holds every palette value and maps them to named
  Tailwind utilities via `@theme inline`.
- In components use named utilities only: `bg-background`, `bg-surface-warm`,
  `text-accent`, `text-text-primary`, `border-keyline`, `font-heading`,
  `font-body`, `rounded-lg`, `p-mat`, etc.
- Changing one value in `styles/tokens.css` must re-skin the entire app with no
  other edits. The `/style-guide` route exists to verify this visually.
- Allowed: Tailwind's built-in spacing/size scale (`p-4`, `h-1`, `gap-6`) — that
  scale *is* part of the token system. Not allowed: arbitrary values like
  `bg-[#4A57B8]`, `p-[13px]`, `text-[#1C1F22]`.

## Image optimization & ISR on Cloudflare (gotchas)

- Next.js's default `next/image` optimizer is not available on the Workers
  runtime. Optimization is routed through **Cloudflare Images** via the `IMAGES`
  binding in `wrangler.jsonc` (handled by OpenNext). Until that is provisioned,
  prefer plain `<img>` for placeholders or `images.unoptimized`.
- Time-based ISR / the incremental cache needs an **R2** override in
  `open-next.config.ts` (commented out until R2 exists). Don't assume
  Vercel-style ISR behaviour.
- Never add `export const runtime = "edge"` — OpenNext targets the Node runtime.

## Key paths

- `app/` — routes (App Router). `app/style-guide` — living design-system reference.
- `components/ui/` — shadcn primitives + Daylight components (Button, Badge,
  ProductCard, SectionHeading, Card).
- `lib/` — helpers (`utils.ts` → `cn`, `format.ts` → price formatting).
- `types/` — domain types (`product.ts`).
- `mock-data/` — typed dummy data (no DB yet).
- `styles/tokens.css` — **the design tokens. Edit the theme here.**

## Commands

- `npm run dev` — local dev (Node runtime; Cloudflare bindings via OpenNext hook).
- `npm run build` — Next production build.
- `npm run preview` — build with OpenNext + preview in the Workers runtime.
- `npm run deploy` — build + deploy to Cloudflare.
- `npm run cf-typegen` — regenerate `cloudflare-env.d.ts` binding types.

See `docs/frontend-conventions.md` for component/file conventions.
