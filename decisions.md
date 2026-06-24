# Decision log

Append-only. Newest entries at the bottom. Each entry: date, decision, rationale,
and alternatives considered.

---

## 2026-06-24 — Scaffolding & design-token architecture

### Deployment adapter: OpenNext Cloudflare (not next-on-pages, not Vercel)
- **Decision:** Deploy via `@opennextjs/cloudflare` (OpenNext adapter) +
  Wrangler, targeting Cloudflare Workers with static assets.
- **Rationale:** As of 2026, OpenNext is Cloudflare's recommended way to run
  Next.js. It reached 1.0 GA (Feb 2026), supports the App Router on the **Node**
  runtime, and supports ISR + image optimization. Next.js 16.2's stable
  Deployment Adapters API is what it builds on.
- **Alternatives:** `@cloudflare/next-on-pages` — rejected: deprecated and
  edge-runtime-only, missing many App Router features. Vercel — out of scope
  (target is Cloudflare).

### Framework versions
- **Decision:** Next.js 16.2.9 + React 19.2 (create-next-app defaults). Kept,
  not downgraded.
- **Rationale:** OpenNext supports all Next.js 16 minor/patch versions; no reason
  to pin to 15.x.

### Tailwind v4 (CSS-first) instead of v3 + tailwind.config.ts
- **Decision:** Use Tailwind v4. Tokens live in `styles/tokens.css` via
  `@theme inline` + CSS variables; there is no `tailwind.config.ts`.
- **Rationale:** v4 is the current default for both create-next-app and
  shadcn/ui. It satisfies the "swap the whole theme by editing ONE place"
  requirement even better than the v3 two-file approach — every value lives in a
  single CSS file. (User confirmed this choice over the v3 pattern their brief
  originally referenced.)
- **Alternatives:** Tailwind v3 + `tailwind.config.ts` colour mapping — rejected:
  would mean fighting the v4 defaults of the current toolchain for no functional
  gain.

### Single source of truth for the theme
- **Decision:** `styles/tokens.css` holds the entire Daylight palette, fonts,
  radii, and spacing extras. `:root` holds values; `@theme inline` maps them to
  named Tailwind utilities. shadcn's semantic tokens (`primary`, `secondary`,
  `muted`, `border`, …) are aliased onto Daylight tokens so shadcn primitives
  inherit the theme.
- **Rationale:** One file re-skins everything. Verified: changing `--accent` and
  rebuilding recoloured every accent-driven utility (`bg-accent`, `text-accent`,
  `bg-primary`/buttons, badges, section markers) with no component edits.
- **Note / trade-off:** The brief's token name `accent` collides with shadcn's
  internal `accent` (hover highlight). We unified them: shadcn's hover/active
  highlight is the brand accent. Acceptable and documented; revisit if neutral
  hovers are wanted later (would re-point shadcn's `accent` to `surface-alt`).

### Fonts
- **Decision:** Fraunces (heading, `--font-fraunces`, optical-sizing axis) and
  Inter (body, `--font-inter`), both via `next/font/google` (self-hosted at build
  time → works on Cloudflare).

### Folder structure
- **Decision:** `app/`, `components/` + `components/ui/`, `lib/`, `types/`,
  `mock-data/`, `styles/`, `docs/`. Scaffolded into the repo root (app at root,
  no `src/`).

### Image optimization strategy
- **Decision:** `wrangler.jsonc` declares the `IMAGES` binding so OpenNext can
  route `next/image` through Cloudflare Images. For now (placeholder SVGs) the
  ProductCard uses a plain `<img>`, so no optimizer is exercised yet. ISR/R2
  incremental cache is deferred (commented in `open-next.config.ts`).
