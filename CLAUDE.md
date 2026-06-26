@AGENTS.md

# Jewellery storefront — project facts

A frontend e-commerce **storefront for a fine-jewellery brand** (brand name
still **TBD** — not yet decided). Use the placeholder `[BrandName]` in UI text
(page titles, logo/wordmark, metadata) wherever the real brand name will go, so
it's easy to find-and-replace later.

> **"Daylight" is the name of the design system / visual theme, NOT the brand.**
> It's fine to keep "Daylight" in design-system contexts (the token palette,
> theme/component naming, the `/style-guide` reference). Just don't let it stand
> in as the storefront's brand name.

This repository is the web frontend.

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
- **One explicit exemption — letter-spacing (`tracking-[…]`).** Arbitrary
  `tracking-[0.18em]`-style values (always in `em`, on uppercase eyebrows /
  small-caps labels) are an **intentionally allowed exception**, not a token
  violation: letter-spacing is a typographic micro-property, not a themeable
  colour/spacing/radius, and it doesn't change on a re-skin. Keep them in `em`
  units (so tracking scales with font-size) and only on uppercase label text.
  This is the *only* arbitrary-value utility that's exempt — colours, raw px
  spacing, and font-family strings remain forbidden in components.

## Image optimization & ISR on Cloudflare (gotchas)

- Next.js's default `next/image` optimizer is not available on the Workers
  runtime. Optimization is routed through **Cloudflare Images** via the `IMAGES`
  binding in `wrangler.jsonc` (handled by OpenNext). Until that is provisioned,
  prefer plain `<img>` for placeholders or `images.unoptimized`.
- Time-based ISR / the incremental cache needs an **R2** override in
  `open-next.config.ts` (commented out until R2 exists). Don't assume
  Vercel-style ISR behaviour.
- Never add `export const runtime = "edge"` — OpenNext targets the Node runtime.

## What's built so far

The full storefront flow exists end-to-end (mock data + sessionStorage, no
backend yet): **Home → Shop (`/shop`, `/shop/[category]`) → Product
(`/products/[slug]`) → Cart → Checkout (`/checkout/address`,
`/checkout/payment`) → Order Confirmation → Order Tracking (`/track-order`)**,
plus **Login/Signup (`/login`)** and the **Account** area (`/account/profile`,
`/account/orders`). This is no longer just "scaffold + design system" — it's a
working (frontend-only) e-commerce flow.

## State management / sessionStorage contexts (established convention)

Client state lives in **four React Context providers**, all mounted in
`app/layout.tsx` (order: `AuthProvider` → `CartProvider` → `CheckoutProvider` →
`OrdersProvider`, outermost first) and each backed by **`sessionStorage`**. This
is the established pattern — **follow it for any new client state; don't reinvent
or contradict it.**

- `components/cart/cart-context.tsx` — `CartProvider` / `useCart`. Line items,
  quantities, totals, and the partial-payment eligibility flag.
- `components/auth/auth-context.tsx` — `AuthProvider` / `useAuth`. The mock
  signed-in user + saved addresses (gates the account nav).
- `components/checkout/checkout-context.tsx` — `CheckoutProvider` /
  `useCheckout`. The delivery address and the placed-order snapshot.
- `components/orders/orders-context.tsx` — `OrdersProvider` / `useOrders`. The
  single source of truth for order-**status** mutations (cancellation): a
  per-order override map layered over the immutable mocks + the session's placed
  order, so a cancellation is consistent across Confirmation / Track Order / My
  Orders. **Mock-data-era stand-in** to be replaced by Supabase order reads/writes
  (see decisions.md). Nested inside `CheckoutProvider` so it can fold in the
  session order.

Conventions these share (match them):

- **`sessionStorage`, not `localStorage`** — a mock session/cart shouldn't linger
  across browser sessions. Each is a deliberate throwaway stand-in for
  server-side state once **Supabase** lands.
- **Hydrate post-mount in a `useEffect`** (never in a lazy `useState`
  initializer) and expose a `hydrated` flag. Reading web storage during render
  would cause an SSR/client hydration mismatch; consumers render the empty/
  signed-out state until `hydrated` is true.
- **Pure domain logic lives in `lib/`, not the context** — the provider wires
  React state to the pure helpers (e.g. totals + eligibility come from
  `lib/cart.ts`), so the same logic survives the move to a real backend.

## Key paths

- `app/` — routes (App Router). `app/style-guide` — living design-system
  reference. Route groups: `app/shop`, `app/products/[slug]`, `app/cart`,
  `app/checkout/{address,payment}`, `app/order-confirmation`, `app/track-order`,
  `app/login`, `app/account/{profile,orders}`.
- `components/ui/` — shadcn primitives + Daylight components (Button, Badge,
  ProductCard, SectionHeading, Card, plus AnnouncementBar, Marquee, Reveal,
  DragScroll, ExpandableText, NewsletterForm).
- `components/` (feature folders) — page-specific components grouped by feature:
  `account/`, `auth/` (AuthContext), `cart/` (CartContext + bag button),
  `checkout/` (CheckoutContext, steps, order summary), `layout/` (site header/
  footer, account nav), `orders/` (OrdersContext + the shared `OrderDetail`
  renderer used by **all three** of Order Confirmation, Track Order and My
  Orders), `product/` (buy box, gallery, variant selector), `shop/` (browser,
  filters, skeleton).
- `lib/` — pure, framework-free helpers: `utils.ts` (`cn`), `format.ts` (price
  formatting), `product.ts` (variant/SKU/price resolution), `cart.ts` (cart
  lines, totals, partial-payment eligibility), `checkout.ts` (order id, payment
  split, address types), `auth.ts` (mock user/address types), `shop.ts` (catalog
  filtering/sorting/faceting).
- `types/` — domain types (`product.ts`).
- `mock-data/` — typed dummy data (no DB yet): `products.ts`, `home.ts`,
  `images.ts`, `orders.ts`, `users.ts`.
- `styles/tokens.css` — **the design tokens. Edit the theme here.**

## Commands

- `npm run dev` — local dev (Node runtime; Cloudflare bindings via OpenNext hook).
- `npm run build` — Next production build.
- `npm run preview` — build with OpenNext + preview in the Workers runtime.
- `npm run deploy` — build + deploy to Cloudflare.
- `npm run cf-typegen` — regenerate `cloudflare-env.d.ts` binding types.

See `docs/frontend-conventions.md` for component/file conventions.
