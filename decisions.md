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

---

## 2026-06-24 — Naming: "Daylight" is the design system, not the brand

### Brand name is TBD; "Daylight" names only the theme
- **Decision:** "Daylight" refers exclusively to the **design system / visual
  theme** (token palette, theme + component naming, the `/style-guide`
  reference). It is **not** the brand or storefront name, which is **still
  undecided**.
- **Decision:** In user-facing brand slots (page `<title>`, logo/wordmark,
  metadata) use the literal placeholder **`[BrandName]`** until the real name is
  chosen, so it can be found-and-replaced in one pass.
- **Rationale:** Earlier scaffolding used "Daylight" as a working brand name in a
  few UI/doc spots; that conflated the theme with the brand. Corrected the
  brand-name usages (`CLAUDE.md`, `app/layout.tsx` title, `app/page.tsx`
  hero wordmark) to `[BrandName]`.
- **Scope / left intact:** Design-system uses of "Daylight" are correct and were
  *not* changed — e.g. `styles/tokens.css` palette comments, the "Daylight
  palette/theme/components" references in docs, and the `/style-guide` masthead.
  No files, folders, or component names were renamed.

---

## 2026-06-24 — Home page build (mock data)

### Scrolling marquee: pure CSS, no library
- **Decision:** The trust strip + any continuous scroll use a `Marquee` server
  component backed by a single `@keyframes marquee` + `.animate-marquee` utility
  in `app/globals.css`. The track renders its children twice and translates
  `-50%` for a seamless, JS-free loop; duration is tunable via a
  `--marquee-duration` custom property; pauses on hover and is disabled under
  `prefers-reduced-motion`.
- **Rationale:** No runtime JS, so it stays a server component (better perf, no
  hydration). A timing custom property is not a themeable colour/spacing/radius
  value, so it correctly lives in `globals.css`, **not** `styles/tokens.css`.
- **Alternatives:** A carousel/marquee npm package — rejected as overkill for a
  one-line CSS animation and an extra client bundle.

### Announcement bar: React state, no carousel lib
- **Decision:** `AnnouncementBar` is a small client component that rotates
  messages on a `setInterval` with fade (`animate-in`) and manual prev/next
  arrows; `aria-live="polite"`, reduced-motion aware.
- **Rationale:** Only this strip needs interactivity; isolating it keeps the page
  itself a server component. No dependency needed for 3 rotating strings.

### Placeholder imagery: LoremFlickr (not source.unsplash.com)
- **Decision:** Mock images use keyword-based LoremFlickr URLs
  (`loremflickr.com/<w>/<h>/<keywords>?lock=<n>`) via the `placeholderImage` /
  `placeholderPhoto` helpers, a fixed `lock` per item for stable photos.
- **Rationale:** The brief suggested `source.unsplash.com`, but that endpoint was
  retired in 2024 and now fails. LoremFlickr is the equivalent free, hotlinkable,
  query-based service the brief explicitly allowed. Fetched only by the browser
  (plain `<img>`), so it never blocks the build. Clearly temporary; swap for real
  product photography (R2 / Cloudflare Images) later.

### Product model: flags + variants
- **Decision:** Added `isNew` / `isBestseller` booleans (drive the two rails,
  kept disjoint) alongside the existing single `tag` (the visible badge pill),
  plus a `ProductVariantGroup[]` (`colour` / `stone` / `size`) on `variants`, and
  a `bangles` category. Variant *selection UI* is deferred to the product page;
  the home page only needs the data shape to exist.
- **Rationale:** Keeps the badge concern (`tag`) separate from rail membership,
  and lands the real variant shape now so later pages don't need a data migration.

### Social / payment glyphs are placeholders
- **Decision:** Footer + Instagram use generic lucide icons (`Camera`,
  `MessageCircle`, `Send`); payment methods are text chips ("PhonePe", "UPI"…).
- **Rationale:** lucide-react v1 removed brand logos (Instagram/Facebook/etc. are
  no longer exported). Generic glyphs + text labels are honest placeholders until
  real brand/payment logos are sourced. Noted in code comments.

---

## 2026-06-24 — Home page design-feedback pass (mock data)

### ProductCard: drop the "matted frame", go borderless
- **Decision:** Replaced the signature Daylight "gallery mat" ProductCard (thin
  keyline border framing a warm `surface-warm` inset around the image) with a
  cleaner, conventional e-commerce card: **no border/frame**, the image floats on
  a generously padded near-white surface (`bg-card`, `p-6`), with the product
  name over price stacked simply below, left-aligned, no decoration. Added
  **sale-price** support — when a product has `originalPriceInPaise`, the card
  shows it struck-through next to the current price (e.g. ~~₹900~~ ₹650).
- **Rationale:** Per design feedback, the bordered-mat treatment read as more
  "gallery" than "shop". A cleaner borderless card is the more conventional,
  scannable e-commerce pattern and lets the product photography carry the card.
  Still fully token-driven — only the *visual treatment / structure* changed; all
  colour/radius/spacing remain Daylight tokens (`bg-card`, `rounded-lg`,
  `text-text-primary`, etc.), so a re-skin still cascades from `styles/tokens.css`.
- **Trade-off / note:** This deliberately retires the earlier card's "signature"
  framing. The matted-frame pattern is still documented in the original Session-2
  notes; the `p-mat` token (image inset) is now used only by the category tiles.
- **Alternatives:** Keep the mat but thin it / drop the inner border — rejected as
  half-measures; the feedback asked for a clean borderless card.

### Data shape: `originalPriceInPaise` for sales
- **Decision:** Added optional `originalPriceInPaise` to the `Product` type
  (paise integer, like `priceInPaise`). When set and greater than the current
  price, it's the struck-through "was" price. A handful of mock products carry it
  so both rails show sale states.
- **Rationale:** Keeps the existing paise-integer money convention (formatted via
  `formatPriceFromPaise`), and lands the real sale shape now so the product/listing
  pages don't need a later migration. Current price stays `priceInPaise`.

### Scroll-in section animations: IntersectionObserver, no library (not Framer Motion)
- **Decision:** Each major home section (Trust strip → Footer; Hero excluded, it
  animates on load) fades + slides up the first time it enters the viewport, via a
  small `Reveal` client component using **IntersectionObserver**. The motion
  (opacity 0→1, translateY 20px→0, ~0.5s ease-out, fire-once) lives in
  `.reveal` / `.reveal-shown` utilities in `globals.css`. `prefers-reduced-motion`
  is honoured purely in CSS (the `.reveal` rule resets to visible, transition
  none), so reduced-motion users need no JS state change.
- **Rationale:** The brief offered Framer Motion *or* IntersectionObserver and
  flagged bundle size on Cloudflare Workers. IO + a CSS class is a few lines, zero
  dependencies, and keeps the page a server component (only the thin `Reveal`
  wrapper is client; the section content stays server-rendered as children).
  Framer Motion would add a client runtime for an effect a dozen CSS lines cover.
- **Alternatives:** Framer Motion (`whileInView`) — rejected: bundle cost not
  justified for a subtle fade/slide. `tw-animate-css` `animate-in` (already a dep)
  — it's load-time, not scroll-triggered, so it doesn't fit "on first scroll into
  view".

### Carousels: hidden scrollbar + drag/momentum (`DragScroll`), no carousel lib
- **Decision:** Horizontal rows (video gallery + the two product rails) use a
  `DragScroll` client component: native `overflow-x-auto` with a cross-browser
  `.scrollbar-hide` utility (no visible scrollbar), `snap-x`/`snap-start` for a
  clean swipe, native touch momentum kept intact (we never intercept touch/pen
  pointers), and **mouse click-and-drag** panning on desktop with a grab cursor +
  a move-threshold that suppresses the click so a drag doesn't follow a card link.
- **Rationale:** Meets the "free-flowing native swipe + draggable on desktop, no
  scrollbar UI" requirement with ~80 lines and no dependency. A carousel library
  (Embla/Swiper) would add a client bundle for behaviour the platform already
  gives us. Drag-disables itself when the row isn't overflowing (e.g. the
  `lg:grid` breakpoint of the product rails).

### Smooth scroll + button hover timing
- **Decision:** `scroll-behavior: smooth` (+ `scroll-padding-top` for the sticky
  header) on `html` for in-page anchor links, disabled under
  `prefers-reduced-motion`. Bumped the shared Button transition to
  `duration-200 ease-out` for a smoother (not instant) hover. Product cards and
  category tiles get a subtle hover lift (`-translate-y-1` + soft shadow) with the
  image zooming on hover.
- **Rationale:** Small, token-respecting polish. Shadows are intentionally allowed
  here as a hover affordance (the "separate with lines not shadows" rule governs
  *resting* separation); the lift/zoom are transform/timing values, not themeable
  colour/spacing tokens.

---

## 2026-06-24 — Home page visual-review fix pass (mock data)

### Placeholder imagery: curated FIXED Unsplash photo set (dropped keyword queries)
- **Decision:** Replaced the keyword-based LoremFlickr endpoint (`loremflickr.com/
  <w>/<h>/<keywords>?lock=<n>`) with a **curated, hand-verified, fixed list of
  specific Unsplash CDN photos**, in a new `mock-data/images.ts`. ~29 photo ids
  grouped by category (earrings / necklaces / rings / bangles+bracelets / general
  flatlays); products and tiles cycle deterministically through their category's
  pool via `categoryImage(category, index)`, and non-category slots (hero, video
  rail, Instagram) use `galleryImage(index)` over a flat pool. URLs are the stable
  direct form `images.unsplash.com/photo-<id>?auto=format&fit=crop&w=<w>&h=<h>&q=80`
  (server-side crop sizes the bytes/framing per slot).
- **Rationale:** Both `source.unsplash.com` (Session 2) *and* keyword endpoints
  like LoremFlickr return **random, frequently off-topic** photos — the visual
  review found street scenes, statues, faces and solid red error blocks instead of
  jewellery, because keyword endpoints don't guarantee subject matter or
  availability. Pinning specific, individually verified photo ids is the only
  reliable way to keep the storefront looking like a jewellery store on mock data.
- **Verification:** Every candidate id was downloaded and **visually inspected**
  (a throwaway Playwright/Chromium pass was also used to screenshot the rendered
  home page at desktop + mobile widths and confirm no broken images); only ids
  that actually load and clearly show jewellery on a clean background were kept.
  Off-topic / face-dominant candidates were rejected.
- **Still temporary:** swap for real product photography (R2 / Cloudflare Images)
  later — the helpers give one place to change.
- **Alternatives:** keep keyword queries (rejected — unreliable subject matter);
  commit local image files to `public/` (rejected — heavier repo for throwaway
  placeholders; hotlinked CDN URLs are fine for mock data).

### ProductCard: square, edge-to-edge image (no inner mat / padding)
- **Decision:** The borderless card from Session 3 kept a generous `p-6` inset that
  still read as a soft "mat". Removed it: the image now fills a **square (1:1)
  `object-cover` frame edge-to-edge** on the near-white `bg-card` surface
  (`rounded-md`, no border, no padding), with the badge floated over the image and
  the name/price caption tightened below. Card content stays intentionally minimal
  (image, NEW/SALE badge, name, price + strikethrough) — no ratings, wishlist or
  hover-add-to-cart.
- **Rationale:** The review asked for the image to sit directly on the background
  for a denser, more shoppable (less gallery) feel. Square `object-cover` also
  guarantees a consistent grid regardless of source photo aspect — and explicitly
  rules out any circular/heavily-rounded crop. Category tiles got the same
  borderless, flush-image treatment (their bordered warm-mat inset was removed).
- **Token rule:** unchanged — only `bg-card`, `rounded-md`, token spacing utilities.

### Product rows: responsive carousel (desktop) vs. grid (mobile) — direction flipped
- **Decision:** `ProductRail` now renders a **2-row × 4-column grid on mobile**
  (`grid grid-cols-4`, no horizontal scroll; rails seeded to 8 products each so the
  grid is full) and a **single-row horizontal drag/scroll carousel from `lg`**
  (`lg:flex lg:overflow-x-auto`, cards `lg:w-56 lg:shrink-0`). This is the inverse
  of Session 3 (which scrolled on mobile, gridded on desktop).
- **Rationale:** The review specified desktop = one scrollable row, mobile = a
  compact 8-up grid (no mobile horizontal scroll for these sections). One
  `DragScroll` wrapper handles both: its drag auto-disables when the row isn't
  overflowing (the mobile grid), so the grid stays a plain grid and the desktop row
  stays a free-flowing, scrollbar-less swipe. Bumped `isNew`/`isBestseller` to 8
  each (still disjoint) so the mobile grid shows a clean 4×2.
- **Note:** The **video rail** is deliberately *not* a `DragScroll` — the review
  asked for a seamless infinite loop, so it uses the pure-CSS `Marquee` (renders
  the set twice, equal `mx` between cards, captions removed, pauses on hover).
- **Alternatives:** a JS carousel library for the infinite loop (rejected — the
  existing CSS `Marquee` already loops seamlessly with no bundle cost).

---

## 2026-06-24 — Home page carousel/grid refinements (mock data)

### Shop by Category: conditional carousel vs. grid, driven by category count
- **Decision:** The category section renders a horizontal drag/swipe `DragScroll`
  carousel **when `categoryTiles.length > 4`**, and the static responsive grid
  otherwise. The tile markup was extracted into a single `CategoryTile` helper
  (taking a `className`) so both branches share identical markup and only differ in
  layout wrapper + per-tile sizing (`w-40 sm:w-52 shrink-0 snap-start` in the
  carousel vs. grid cells). To actually exercise the carousel branch, the mock
  category list was expanded from 4 to **6** tiles.
- **Rationale:** The threshold lives in the page (a `length > 4` check), not baked
  into the data, so the same section degrades gracefully: 4-or-fewer categories
  stay a clean static grid; more than 4 become a single-row carousel rather than
  wrapping to ragged extra rows. One shared `CategoryTile` avoids markup drift
  between the two branches.
- **Data change:** added `pendants` to `ProductCategory` (so there are 6 demo
  categories: earrings, necklaces, pendants, rings, bangles, bracelets). Category
  tiles are navigation only and need no backing products, so no mock products were
  added for it. In `mock-data/images.ts`, `pendants` aliases the necklace image
  pool and `bracelets` the bangle pool; tiles use offset indices so no two tiles
  show the same photo.
- **Alternatives:** always-carousel (rejected — overkill / worse for ≤4); a CSS-only
  `flex-wrap` grid (rejected — wraps to extra rows, which is exactly what the review
  asked us to avoid past 4 items).

### Mobile-only carousels reuse the existing `DragScroll` (testimonials + product rows)
- **Decision:** Testimonials are a horizontal `DragScroll` carousel on mobile
  (fixed `w-72` cards → one card + a peek of the next) that collapses to the
  existing static 3-up grid from `sm` (`sm:grid sm:grid-cols-3 sm:overflow-visible`).
  Product rows now show a 2×2 (first 4 products) on mobile via `grid-cols-2` with
  `hidden lg:flex` on items past index 3, keeping the unchanged desktop carousel.
- **Rationale:** Reusing `DragScroll` (drag auto-disables when the row isn't
  overflowing, e.g. at the desktop grid breakpoint) keeps the swipe/momentum/
  no-scrollbar behaviour consistent across every carousel on the page with no new
  component. Hiding overflow products with a responsive utility (rather than
  `slice`-ing the array) means the same `ProductRail` feeds both the mobile 2×2 and
  the full desktop row from one list.

### Video gallery: 4 unique cards is a data cap, behaviour unchanged
- **Decision:** Limited the loop to 4 distinct cards by trimming the `videoThumbs`
  data to 4 entries; the `Marquee` (renders the set twice) is untouched.
- **Rationale:** The "only 4 unique items in the cycle" requirement is a property of
  the data, not the animation — capping the array is the smallest correct change and
  keeps the seamless-loop component generic.

---

## 2026-06-24 — Shop page (catalog / filters / sort / pagination, mock data)

### Site chrome extracted to the root layout (shared header/footer)
- **Decision:** Moved the header (announcement bar + sticky nav) and footer out of
  the inline Home page into `components/layout/site-header.tsx` +
  `site-footer.tsx`, rendered once in `app/layout.tsx`. Pages now render only their
  `<main className="flex-1">`.
- **Rationale:** The brief required "no visual drift between the two pages."
  Duplicating the chrome markup on the Shop page would invite exactly that drift;
  one shared copy in the layout is the conventional App Router pattern and
  guarantees parity. Verified the Home page still renders a single header/footer
  with no regression after the move.

### URL is the single source of truth for filter/sort/page state
- **Decision:** Clean paths for category (`/shop`, `/shop/[category]`); price,
  colour, sort and page layer on as query params (`?price=under-500&colour=gold-
  tone&sort=price-asc&page=2`). `lib/shop.ts` holds pure `parseFilters` /
  `filtersToQuery` + `filterProducts`/`sortProducts`/`paginate`. The client
  `ShopBrowser` reads state via `useSearchParams` and rewrites the URL on every
  change (`router.push`, `scroll:false` for filters; `<Link>` for pagination so
  each page is a real, shareable URL that scrolls to top).
- **Rationale:** Bookmarkable/shareable filtered views and real back/forward
  behaviour, matching the spec's "page-based pagination with its own URL per page."
  Keeping the logic pure in `lib/shop.ts` means the same code can later run
  server-side (for SSR/SEO) without a rewrite. Filtering is client-side for now
  (explicitly allowed) — fine for a 36-item mock catalogue.
- **Next 16 note:** `params`/`searchParams` are Promises (awaited in the server
  route pages); `useSearchParams` forces a `<Suspense>` boundary in production, so
  `ShopBrowser` is wrapped in `<Suspense>` with a token-styled `ShopSkeleton`
  fallback. (Confirmed against the bundled `node_modules/next/dist/docs`.)

### Category facet is conditional on route; counts are facet-aware
- **Decision:** The category facet is shown only on `/shop`; on `/shop/[category]`
  it's hidden and the category is locked by the URL (`ShopBrowser` takes a
  `lockedCategory` and passes `ignoreCategory` to the filter logic, stripping any
  stray `category` query param on commit). Each facet option shows a count computed
  as "matches if this were the only selection in its group" (other groups intact) —
  the standard facet-count convention — and the mobile drawer shows a live total
  before Apply.
- **Rationale:** Matches the spec (category filter "only shown on the unfiltered
  /shop view"). Facet counts + a live drawer count make the filters feel real and
  prevent users selecting a combination that yields zero results blindly.

### Desktop sidebar vs. mobile slide-up drawer (pending state)
- **Decision:** Desktop renders a sticky sidebar whose checkboxes commit to the URL
  immediately. Mobile renders a `Filters` button → slide-up drawer holding **local
  pending state**; toggles only update pending (with a live count), and Apply
  commits to the URL / Clear All resets. Both reuse one controlled `FilterControls`
  component.
- **Rationale:** The spec asked for exactly this split (immediate desktop sidebar;
  mobile drawer with Apply/Clear + live count). A single controlled `FilterControls`
  avoids divergence between the two surfaces. Built the checkbox/drawer/sort-select
  as small token-styled primitives rather than pulling additional shadcn/Base-UI
  components, to keep the bundle and dependency surface minimal.

### Mock data: `colour` facet + derived sort signals; catalogue → 36
- **Decision:** Added `colour: ColourTone` (gold/silver/rose, the Material/Colour
  facet, kept separate from the display `material` string) and derived
  `popularity`/`createdAt` (deterministic — NEW items dated recent so "Newest"
  aligns with the badge; bestsellers boosted for "Bestselling"). Grew the catalogue
  to 36 across all six categories with a deliberate price-bucket spread.
- **Rationale:** Clean fields to filter/sort on without overloading `material`;
  36 products (> PAGE_SIZE 24) exercises pagination, and populating Pendants +
  Bracelets means every Home category tile / nav link lands on a non-empty page.
  Signals are derived (not hand-authored per row) to stay DRY and clearly mock.

---

## 2026-06-24 — Product page (variants, per-variant pricing, customisation)

### Variant model: option matrix + SKU table (NOT option-groups-with-shared-price)
- **Decision:** A product describes its selectable axes in `optionGroups`
  (`VariantGroup` = axis `colour`/`stone`/`size` + options) and its purchasable
  SKUs in `variants` (`ProductVariant` = one option value per axis +
  `priceInPaise` + optional `originalPriceInPaise` + `inStock`). The old
  display-only `ProductVariantGroup { name, type, options[] }` was removed.
- **Rationale (matters for the real backend):** this is exactly the shape a
  commerce backend exposes — an **option/axis definition** plus a **SKU/variant
  table** keyed by the option combination. Price and stock live on the SKU, so:
  (a) price genuinely differs per combination, and (b) a single colour×size combo
  can be out of stock independently. When Supabase lands, `optionGroups` maps to
  an options/option_values schema and `variants` to a `product_variants` table
  (variant_id, option_value_ids[], price, stock) — the UI logic in
  `lib/product.ts` consumes that shape unchanged. The product-level `priceInPaise`
  is a DERIVED "from" (min variant) price for listing cards/sort only — never the
  source of truth for a selected variant.
- **Resolution logic (pure, in `lib/product.ts`):** `resolvePrice` shows a range
  until the selection is complete, then collapses to the SKU's exact price (and
  collapses a degenerate equal-min/max range to a single price);
  `isOptionAvailable` disables (never hides) any option whose only matching SKUs —
  given the other current selections — are out of stock; `applySelection` clears a
  now-incompatible other-axis pick so the user can't get stuck on an impossible
  combination; `canAddToCart` requires a complete, in-stock SKU.
- **Conditional selectors:** a selector renders only for axes with > 1 option, so
  a single-colour product (e.g. the size-only Rosé Cuff) shows just the size
  selector and a single-option axis is auto-selected. Size is therefore shown only
  when the product's data actually offers sizes.
- **Alternatives:** one price per product + non-priced option groups (rejected —
  can't express per-combination price or stock, the core requirement); a flat
  price-delta per option (rejected — real catalogues price the SKU, not a sum of
  deltas, and deltas can't express combo-level stock).

### Swatch colours are product DATA, not theme tokens
- **Decision:** Colour/stone swatch colours are stored as CSS hex strings in the
  mock product data (`VariantOption.swatch`) and applied via inline
  `style={{ backgroundColor }}` in `VariantSelector`. They are deliberately NOT
  added to `styles/tokens.css`.
- **Rationale:** The token rule governs *theme* colours — values that should
  change on a re-skin. A physical product's gold/rose/onyx swatch must NOT change
  when the brand palette changes; it's content/data, like an image URL. Keeping it
  in data (never as a hardcoded hex inside a component) honours the spirit of the
  token rule — verified: zero hex literals in any product component.

### Customisation = separate catalogue products + deposit field (no free-text)
- **Decision:** Each customisation is its own `Product` (e.g. "Initial Ring —
  Letter A"), flagged `isCustomisable` with a per-product `depositInPaise`. The
  PDP shows a "Made to order — partial payment required" note + the deposit amount
  near the price. No free-text customisation input exists.
- **Rationale:** Matches the brand's stated model (each variant of a custom piece
  is a real SKU/order, and made-to-order requires a partial payment to confirm).
  A per-product deposit (not a global %) lets each item set its own confirm
  amount, ready for the PhonePe partial-payment flow later.

### SEO-safe description truncation (CSS clamp, full text in DOM)
- **Decision:** `ExpandableText` always renders the full text in the DOM and
  truncates **visually** with CSS `line-clamp` + a fade gradient; "See more"
  removes the clamp instantly. It is a single expand control, not an accordion,
  and is a reusable `components/ui` primitive.
- **Rationale:** The brief requires the full body copy in the initial HTML for
  SEO — so no lazy-load / conditional render. CSS-only clipping keeps the text
  crawlable while giving the compact default view.

---

## 2026-06-24 — Cart page + cart state

### Cart state: React Context + sessionStorage (denormalised line snapshots)
- **Decision:** Cart state is a `CartProvider` (React Context) wrapping the whole
  app in the root layout, persisted to **sessionStorage** (key `daylight-cart-v1`).
  Each line stores a denormalised snapshot (product id/slug/name/image/category,
  `isCustomisable`, variant id + label, the variant unit price, qty) rather than
  just an id+ref.
- **Rationale:** Context is enough for one app-wide concern (no need for a state
  library); sessionStorage (not localStorage) matches "persists for the session"
  and avoids stale carts lingering across browser sessions — and it's all thrown
  away when the real backend cart lands, so simplicity wins. Storing a snapshot
  means the cart renders without re-querying the catalogue (mirrors how a real
  cart API returns line data) and price is locked to the variant chosen at add
  time. Loaded post-mount (not a lazy initializer) so SSR and first client render
  both start empty — reading storage during render would cause a hydration
  mismatch.
- **Availability / "sold out after adding":** simulated via a `soldOut` id set in
  context (toggled by a per-line DEV button). Active lines = lines not in that
  set; totals + eligibility use active lines only. When the real backend exists,
  `soldOut` is replaced by a live availability check on the stored variant id.

### Partial-payment eligibility computed on ACTIVE lines + exposed for the Payment page
- **Decision:** `computePartialPayment(activeLines)` (in `lib/cart.ts`) returns
  `{ eligible, reason }` where `reason ∈ none|eligible|mixed`: eligible only when
  EVERY active line is `isCustomisable`; `mixed` when some-but-not-all are
  (→ show the "full payment required" message); `none` when there are no
  customisable items. It runs over ACTIVE (available, non-excluded) lines — so
  excluding a sold-out non-eligible line can flip the cart back to eligible. The
  result is exposed on the cart context as `partialPayment` so the next
  (Payment) page consumes it directly without recomputing.
- **Rationale:** This is the most important rule on the page; centralising it as
  a pure function keeps the Cart message, the exposed context value, and the
  future Payment-page gate in lockstep. `isCustomisable` IS the partial-payment-
  eligible flag (the spec allowed either name); documented here so the Payment
  page reads `partialPayment.eligible` rather than re-deriving from line flags.

### Shipping/threshold are placeholder config
- **Decision:** `FREE_SHIPPING_THRESHOLD_PAISE` (₹999) and `FLAT_SHIPPING_PAISE`
  (₹49) are constants in `lib/cart.ts`, clearly marked TBD pending the real
  business decision. Free over the threshold, flat under it, zero when the cart
  has no active items.

---

## 2026-06-24 — Checkout flow (Address → Payment → Confirmation) + Order Tracking

### CheckoutContext is adjacent to CartContext (not merged)
- **Decision:** A separate `CheckoutProvider` (sessionStorage, nested inside
  `CartProvider` in the layout) holds the delivery `address` and the placed
  `order`. Cart = line-item concern; checkout = fulfilment concern.
- **Rationale:** Keeps each context small and single-purpose; the Payment page
  reads cart (lines/eligibility) + checkout (address), the Confirmation page reads
  only the order. Same sessionStorage rationale/throwaway-ness as the cart.

### PlacedOrder is a self-contained snapshot
- **Decision:** On "Place Order", Payment builds a `PlacedOrder` containing a
  snapshot of the line items, the address, the amounts (paid-now / balance /
  total), the method, and metadata (order id, est. delivery, `hasCustomised`),
  and stores it in CheckoutContext. The Confirmation page renders from THAT, then
  clears the cart + saved address (but keeps the order).
- **Rationale:** Confirmation must survive the cart being emptied (the order is
  placed) and a page refresh. Snapshotting also mirrors how a real orders API
  returns an immutable order record, independent of the now-changed cart.

### Payment options branch off the cart's computed eligibility (not recomputed)
- **Decision:** The Payment page reads `cart.partialPayment.reason` (computed +
  exposed by the cart session) and maps it directly to method sets:
  `eligible` → [deposit, full-online]; `none`/`mixed` → [full-online, cod].
  Deposit total = Σ(line `depositInPaise` × qty). `paymentSplit(method, total,
  deposit)` (pure, in `lib/checkout.ts`) derives paid-now/balance for every
  surface (Payment summary, PlacedOrder, Confirmation text).
- **Rationale:** Single source of truth for the most important rule on the site —
  the cart already decided eligibility on ACTIVE lines; the Payment page must not
  re-derive it (risking divergence). Customised-only carts always require some
  online payment (deposit), so no pure-COD option there; mixed carts hide partial
  entirely, consistent with the cart-page message.

### Address: guest-default, client-only validation, no pincode lookup (v1)
- **Decision:** Guest checkout is the default; "Create an account" is an optional,
  non-gating checkbox. Validation is client-only (`validateAddress`): required
  fields + a 10-digit Indian-mobile check (`normalisePhone` strips +91/0) + a
  6-digit pincode check. City/State are plain manual text — pincode → City/State
  auto-fill is explicitly OUT of scope for v1 (a decision, not an omission). The
  "Continue to Payment" button is gated on `isAddressValid`.

### Mock order id + tracking lookup (security-conscious single error)
- **Decision:** `generateOrderId()` makes `ORD-XXXX-XXXX` from an unambiguous
  alphabet (no 0/O/1/I). `/track-order` looks up Order ID **and** phone against
  `mock-data/orders.ts` PLUS the current session's placed order; any failure
  shows ONE generic error (never revealing which field was wrong) linking to
  `/support`.
- **Rationale:** The single generic error is a deliberate enumeration-resistant
  pattern. Including the session order makes the Confirmation → Track deep-link
  resolve end-to-end even though the just-placed order isn't in the static mock
  set. `/support` and the per-order statuses remain placeholders.

## 2026-06-24 — Mock auth (Login/Signup) + Account section

### Single phone-OTP flow, no separate login vs signup
- **Decision:** One `/login` flow (phone → OTP → name-if-new). Verifying the mock
  OTP looks the number up in `mock-data/users.ts`: a known number signs straight
  in; an unknown number is treated as a new user and asked only for a name. There
  is no password and no distinct signup form.
- **Rationale:** Matches how Indian D2C storefronts actually onboard (OTP-first,
  phone = identity). Collapsing login/signup removes a decision the user shouldn't
  have to make. The known-users registry lets the demo show BOTH paths (and a
  populated vs empty order history) without a backend.
- **Mock contract:** `MOCK_OTP = "123456"` verifies any number; the inline "demo
  mode — use 123456" hint stands in for a real SMS; the 30s resend timer is
  cosmetic. All of this is swapped for Supabase Auth + a real OTP provider later.

### AuthContext is a third sessionStorage provider, outermost in the layout
- **Decision:** `AuthProvider` sits alongside Cart/Checkout (its own
  sessionStorage key `daylight-auth-v1`) and wraps them in the layout so
  `SiteHeader` can render the account control. It owns the user + saved-address
  mutations; a `normaliseDefault` helper guarantees exactly one default address.
- **Rationale:** Same small-single-purpose-context rationale as Cart vs Checkout.
  sessionStorage (not localStorage) keeps the mock session from lingering — a
  deliberate choice flagged for revisiting once real auth wants persistence.
- **Phone is read-only on the profile:** it's the OTP-auth identity, so only name
  + email are editable. Changing a phone would mean re-verification — out of scope
  for the mock.

### One shared `OrderDetail`, used by Track Order and My Orders
- **Decision:** Extracted the order display (step tracker + items + payment +
  delivery) from `/track-order` into `components/orders/order-detail.tsx`; both
  pages render it and supply their own surrounding chrome/CTA. My Orders opens an
  order via in-page state (list ↔ detail) rather than a new dynamic route.
- **Rationale:** The spec explicitly required not rebuilding the order UI twice.
  In-page detail avoids an `[orderId]` route + a second lookup for a mock that has
  no deep-link requirement; `ordersForPhone` keys order ownership off the user's
  phone (the same field Track Order matches on), so the two stay consistent.

---

## 2026-06-24 — Stress-test fix pass (phone, contrast, predicates, tracking)

### `normalisePhone` strips a prefix only when the LENGTH proves it's one
- **Decision:** `normalisePhone` (`lib/checkout.ts`) now strips `91` only from a
  12-digit input and a leading `0` only from an 11-digit input; any other input
  (including a bare 10-digit number that happens to start with `91`/`0`) is
  returned digits-only, untouched. The exact logic: `digits = raw.replace(/\D/g,
  "")`; `if (len===12 && starts "91") slice(2)`; `else if (len===11 && starts
  "0") slice(1)`; `else digits`.
- **Rationale:** The old `replace(/^(91|0)/, "")` stripped unconditionally, so a
  valid mobile like `9112345678` became `12345678` and failed the `^[6-9]\d{9}$`
  check. Gating on the resulting length means we only remove a genuine country
  code (`+91…` → 12 digits) or trunk prefix (`0…` → 11 digits), never digits that
  are part of a real 10-digit subscriber number. This is the single source used by
  checkout validation, `lib/auth` (`isValidPhone`), profile saved-addresses, and
  track-order matching, so correctness is consistent everywhere.
- **Alternatives:** a stricter `^(\+?91|0)?(\d{10})$` capture — equivalent, but the
  length-gated form is clearer about *why* a prefix is (or isn't) removed and
  keeps the digits-only fallback for partially-typed input.

### `--text-secondary` darkened to `#565c61` for WCAG AA (token-only change)
- **Decision:** Changed `--text-secondary` from `#6e747a` to **`#565c61`** in
  `styles/tokens.css` only. Chose the lightest value that still clears 4.5:1 with
  a comfortable margin on *every* surface it's used over (computed: `--background`
  6.13:1, `--surface-alt` 5.49:1, `--surface-warm` 5.51:1, `--surface-card`
  6.59:1) — staying as muted as the "secondary ink" role intends while passing AA.
- **Rationale:** The old value was ~3.8:1 on `--surface-alt` (below AA), and the
  token is used widely (captions, prices, placeholders, footer, payment chips).
  Fixing it in the one token file re-skins all of them with no component edits —
  exactly what the token architecture promises. `#565c61` over the report's
  suggested `#4f555b` because it passes AA on all surfaces *and* preserves more of
  the muted look (`#4f555b` is darker than needed).

### Tablet breakpoint: Home product rail switches at `md`, not `lg`
- **Decision:** The Home `ProductRail` grid→carousel switch moved from `lg`
  (1024px) to `md` (768px), aligning it with the page's sibling rows
  (category/testimonial grids go multi-up at `sm`/`md`). At 768px the rail is now
  the flowing carousel rather than a cramped 2-up grid beside a 4-up category grid.
- **Rationale:** `768px` is exactly the tablet width the report flagged and the
  `md` breakpoint, so switching there is the most direct fix; below `md` it stays
  the deliberate mobile 2×2 grid. (Separately, the Shop browsing grid gained a
  `md:grid-cols-3` step so 768–1023px is 3-up instead of 2-up.)

### One "can't proceed" predicate (`activeLines.length === 0`) + an unavailable message
- **Decision:** Standardised `activeLines.length === 0` (no AVAILABLE items) as
  the single "this order can't proceed" predicate across the cart's checkout
  button and both checkout guards (address + payment). Where that state is reached
  with `lines.length > 0` (everything went sold-out), the UI now shows a distinct
  **"All items are unavailable"** message that links back to `/cart`, separate from
  the truly-empty "Your cart is empty" → `/shop`. The cart page's top-level
  "is there anything at all" check stays `lines.length` (so sold-out rows remain
  visible to edit) — a genuinely different question from "can we check out".
- **Rationale:** Previously the cart keyed off `lines.length` and checkout off
  `activeLines.length`, and the all-unavailable case had no messaging on the
  checkout path. Unifying the *proceed* predicate and adding the explicit message
  removes the divergence and the dead-end.

### Undo toast for cart removals: no library, context gains `restoreLine`
- **Decision:** Removing a cart line shows a small bottom-centre toast with Undo
  (re-inserts the line at its original index) + dismiss, auto-dismissing after 6s.
  Added `restoreLine(line, index)` to CartContext (re-inserts, guarding against a
  double-undo); the toast state lives in `CartPage` so it survives removing the
  last line (which swaps in `<EmptyCart>`).
- **Rationale:** Makes removal recoverable without pulling in a toast dependency —
  consistent with the project's "a few lines of token-styled UI over a library"
  precedent (Marquee, Reveal, DragScroll). Re-inserting by index (vs re-`add`,
  which needs the original product+selection) keeps the line's variant/price
  snapshot exactly as it was.

### Letter-spacing (`tracking-[…]`) documented as the one allowed arbitrary value
- **Decision:** Rather than introduce a `--tracking-*` token scale, documented
  `tracking-[…]` (in `em`, on uppercase eyebrow/label text) as the single
  intentional exception to the "no arbitrary `[...]` in components" rule, in both
  `CLAUDE.md` and `docs/frontend-conventions.md`.
- **Rationale:** Letter-spacing is a typographic micro-property, not a themeable
  colour/spacing/radius, and doesn't change on a re-skin — so a token scale would
  add ceremony without the "one place re-skins everything" benefit that justifies
  tokens. Documenting it closes the previously-undocumented gap the report flagged
  while keeping all *other* arbitrary values (hex, px, font strings) forbidden.
  (Also standardised image hover-zooms on the built-in `scale-105`, removing the
  stray `scale-[1.03]`/`scale-[1.05]` arbitrary values.)

---

## 2026-06-24 — Unified Order Detail + cancellation flow + shared order-state ownership

### Shared order-state ownership: a reactive `OrdersContext` (MOCK-DATA-ERA PATTERN)
- **Decision:** Introduced a dedicated **`OrdersProvider` / `useOrders`**
  (`components/orders/orders-context.tsx`), mounted in the layout **inside**
  `CheckoutProvider` (so it can fold in the session's just-placed order), as the
  **single source of truth for order-STATUS mutations** (today: cancellation).
  All three order surfaces — **Order Confirmation, Track Order, My Orders** —
  read *and* write through it, so a cancellation performed from any one of them
  is immediately consistent in the others **with no reload**.
- **How (the mock mechanism):** the static `mockOrders` array and the session's
  placed order are immutable. To make status mutable without a backend, the
  context keeps a small map of per-order **overrides** keyed by `orderId`,
  persisted to **sessionStorage** (`daylight-orders-v1`, same post-mount
  hydration + `hydrated`-flag pattern as Cart/Checkout/Auth), and layers it over
  the base pool at read time (`allOrders = basePool.map(applyOverride)`). The API
  exposes `ordersForPhone` / `findOrder` / `getOrder` (overrides applied) and
  `cancelOrder(orderId, mutation)`.
- **⚠️ Flagged for replacement by Supabase:** this whole provider — the override
  map, its sessionStorage persistence, and the "layer over immutable mocks" trick
  — is a **deliberate mock-data-era stand-in**. When Supabase lands it becomes a
  real orders read + an `UPDATE` on the orders row; the override map goes away.
  Flagged both here and in a header comment in `orders-context.tsx`.
- **Alternatives:** (a) each page reading its own copy of `mockOrders` — rejected,
  the original problem: a cancellation in one place wouldn't show in another.
  (b) Extending `CheckoutContext` — rejected: checkout is the *fulfilment-in-
  progress* concern (address + the one placed order); order *history + status
  mutation across many orders* is a distinct concern, kept in its own small
  single-purpose context (same Cart-vs-Checkout rationale used earlier).

### `TrackedOrder` is the ONE canonical order shape (one shape → one renderer)
- **Decision:** Consolidated Order Confirmation, Track Order, and My Orders onto
  the SAME `OrderDetail` component, fed by a single shape — **`TrackedOrder`**.
  The Confirmation page no longer renders bespoke markup from `PlacedOrder`;
  instead `placedToTracked(PlacedOrder)` normalises the session order into a
  `TrackedOrder` (the one conversion point, used by both the context and the
  pages), and `OrderDetail` renders it.
- **Rationale:** there was drift risk in maintaining two order layouts.
  Normalising to `TrackedOrder` (rather than inventing a third view-model) is the
  least-churn option because Track/My-Orders already used it and it's the shape a
  real orders API returns.

### Structured numeric payment fields are the source of truth; `paymentLabel` is derived
- **Decision:** `TrackedOrder` gained structured payment fields — `method`
  (`full-online | cod | deposit`), `depositInPaise`, `paidNowInPaise`,
  `balanceDueInPaise` — plus `hasCustomised`. All 6 mock orders were backfilled,
  and `placedToTracked` threads the real numbers through from `PlacedOrder`. The
  old free-text `paymentLabel` **field was removed**; it's now a **derived**
  `paymentLabelFor(order)` generated FROM the structured fields.
- **Rationale:** the post-cancel banner and the cancellation outcomes need real
  numbers (full refund = `paidNowInPaise`, forfeited deposit = `depositInPaise`),
  not figures parsed back out of a display string. Same paise-integer money
  convention as `CartLine` / `PlacedOrder`; one place computes, every surface
  formats.

### `cancelled` is a terminal, OFF-TRACK state (not a 5th tracker step) + tracker bug fix
- **Decision:** `OrderStatus` gained `"cancelled"`, kept **out of**
  `ORDER_STATUS_STEPS` (still the four linear stages). Cancellation outcome is
  stored structurally: `cancellationOutcome` (`refunded | forfeited | no_charge`)
  + `refundAmountInPaise` / `forfeitedAmountInPaise`.
- **Bug fixed:** the step tracker did `findIndex(status)` → for `cancelled` that
  returned **-1**, silently rendering every step as incomplete. `OrderDetail` now
  branches: a cancelled order replaces the tracker entirely with a **status
  banner** reading the structured outcome (e.g. "Order cancelled · Refund of ₹X
  processed" / "· ₹X deposit forfeited, no refund" / "· not charged") and renders
  its line items **dimmed** (`opacity-50 grayscale`).

### Evergreen header replaces the one-time success badge; Confirmation richness ported
- **Decision:** the Confirmation page's one-time "Order Placed!" zoom-in success
  badge was replaced by an **evergreen header** in `OrderDetail` — a small icon +
  "Thank you for shopping with us" + Order ID — shown identically regardless of
  entry point or order age. Confirmation's richer features were ported INTO
  `OrderDetail` so nothing was lost: **per-line prices + an order total**, the
  **branched payment summary** (incl. a paid-now / balance-due breakdown for
  deposit orders), and the **"what happens next" customised-vs-regular copy**
  (shown only while pending/confirmed). The **step tracker is now shown for all
  entry points**, including Confirmation (which previously lacked one).

### Cancellation action: method-driven policy + visibility rules
- **Decision:** `OrderDetail` owns the self-service cancellation surface, gated on
  order state: **single-item & pending/confirmed → "Cancel order"** button;
  **multi-item & pending/confirmed → "Need to cancel an item? Contact support"**
  (no self-service multi-item cancel); **shipped/delivered/cancelled → nothing**.
  The confirmation modal's copy and the resulting outcome are **branched by
  `method`**: `full-online` → full refund of `paidNowInPaise` (`refunded`);
  `cod` → "hasn't been charged" (`no_charge`); `deposit` → the deposit is
  non-refundable (`forfeited`, amount = `depositInPaise`). On confirm it writes
  through `OrdersContext.cancelOrder`, so all surfaces update at once.
- **Modal:** a small token-styled confirmation dialog (Esc + backdrop close,
  self-focus, `role="dialog"`) rather than a dialog dependency — the same "a few
  lines over a library" precedent as Marquee/Reveal/the cart undo-toast.
- **My Orders list badge:** the `cancelled` status now maps to the existing
  (previously unused) **`destructive`** Badge variant with a proper "Cancelled"
  label (via `orderStatusLabel`), instead of falling back to the raw lowercase
  status key.

---

## 2026-06-26 — Shop feature round (in-grid cards, sale timer, accordions, search, pagination, sorts)

### In-grid card density: a separate richer `ShopProductCard` (accepted taller cards)
- **Decision:** The Shop grid uses a NEW `components/shop/shop-product-card.tsx`
  carrying an always-visible variant picker + Add to Cart + sale countdown +
  hover-cycle, rather than bloating the shared `components/ui/product-card.tsx`.
  The plain `ProductCard` (image/name/price only) stays in use for the home rails
  and PDP "related" rail, where the compact treatment is wanted.
- **Trade-off accepted:** putting variant swatches/size pills + an Add to Cart
  button on every card makes Shop cards **noticeably taller**, reducing rows
  per viewport. This is the deliberate trade-off for in-grid buying (per the
  feedback) — density is sacrificed for one-tap add-to-cart without a PDP visit.
- **Rationale:** keeping it a distinct component avoids forcing the generic card
  to take a full `Product` + cart context (it's a pure presentational card used
  in server contexts), and keeps the blast radius off the home page. The new card
  reuses the PDP's `VariantSelector` and `lib/product` helpers verbatim, so the
  swatch styling and the `canAddToCart` rule are identical to the Product page.
- **Alternatives:** (a) extend `ProductCard` with optional buy controls — rejected
  (overloads a shared primitive, pulls cart/client concerns into home/related
  usages); (b) a hover-reveal quick-add overlay — rejected (the feedback asked for
  always-visible pickers, and hover-only fails on touch).

### Time-bound sale: new data fields + a display-only promo layer (real time comparison)
- **Decision:** added `saleStartsAt` / `saleEndsAt` (ISO datetimes) +
  `salePriceInPaise` to `Product`. A sale is "active" only when now ∈
  [start, end) **and** a sale price exists; the card then shows the sale price
  (with the regular price struck through) and a live countdown to the end. Once
  `saleEndsAt` passes, the sale price + countdown disappear and the card reverts
  to the regular `priceInPaise`. Logic is the pure `lib/sale.ts`
  (`resolveSale(product, nowMs)` — `now` is passed in, never read inside, so it
  stays pure); the card owns a **hydration-safe clock** (`now` starts `null` on
  SSR + first client render → set post-mount, then ticks every 1s), matching the
  storage-context hydration convention. This is a **real time comparison**, not a
  decorative timer.
- **Why `salePriceInPaise` rather than overloading `originalPriceInPaise`:** the
  existing `originalPriceInPaise` is a permanent "was" price shown always; a
  dedicated sale price keeps the time-bound promo orthogonal to that and to the
  per-variant pricing, and makes "revert to regular price" a clean fall-through to
  `priceInPaise`.
- **Scoping / known limitation:** the sale price is currently a **Shop-listing
  display promo only**. It does NOT flow into the cart/checkout unit price
  (`lib/cart.ts:makeLine` still uses the regular/variant price), because cart +
  checkout money logic is shared domain code that the backend will own, and this
  round is explicitly "no backend changes". The active sale products are all
  non-variant, so sale pricing never collides with the variant range/SKU price.
  Wiring the effective sale price through the cart is deferred to the backend.

### Mock sort signals: `popularityScore` placeholder + `listedAt`, and new sort keys
- **Decision:** added `popularityScore` (0–99, deterministic `(i*37)%100`) and
  `listedAt` (catalogue insertion order) to `Product`, and five sort keys:
  Availability (in-stock first), Oldest, Recently Listed, Popularity High→Low,
  Popularity Low→High.
- **`popularityScore` is an explicit PLACEHOLDER** standing in for real,
  order-count-based popularity once Supabase order data exists — the `*37` spread
  just scatters values so the popularity sorts visibly reorder the grid; it
  carries no real meaning. Kept SEPARATE from the existing derived `popularity`
  (which blends bestseller/new/order for "Bestselling") so the two concepts don't
  get conflated when the real metric lands.
- **`listedAt` vs `createdAt`:** "Recently Listed" needed an order independent of
  the NEW-badge boost baked into `createdAt` (so it reflects pure catalogue
  insertion). `createdAt` still drives Newest/Oldest. Availability/popularity ties
  rely on `Array.prototype.sort` stability to preserve catalogue (featured) order.

### Accordion primitive added (Base UI), filters made collapsible (logic unchanged)
- **Decision:** added `components/ui/accordion.tsx` (shadcn base-nova wrapper over
  `@base-ui/react/accordion`, same primitive family as Button/Badge) since the
  project had no Accordion yet (the PDP description uses `ExpandableText`, a
  different pattern). `FilterControls` now wraps each facet group (Category /
  Price / Material) in an accordion section — `multiple` open, all open by
  `defaultValue` so filters stay visible. Collapsing is **local UI only**; it
  never touches filter state, and all filter logic + preset price buckets are
  unchanged. Panel height animates via Base UI's `--accordion-panel-height` var
  (resolves to `auto` at rest, so open content is never clipped).

### Global header search: overlay panel over a route navigation
- **Decision:** the header search icon opens an in-page **overlay panel**
  (`components/layout/header-search.tsx`) with a live name-substring search across
  the full catalogue, each result linking to its PDP — replacing the previous
  icon→`/shop` link. Closes on Esc / backdrop / result selection; body scroll
  locked while open (same modal conventions as the cancellation dialog + mobile
  filter drawer). Matching is intentionally simple (case-insensitive substring,
  capped at 8 results); real catalogue search moves server-side with Supabase.
- **Rationale:** an overlay works identically from any page (the header is global)
  and keeps users in context, vs. bouncing to a dedicated search route.

---

## 2026-06-26 — PDP description accordions, gift add-ons, gallery video, WhatsApp FAB

### Description restructured into three accordions (REVERSES the earlier no-accordion choice)
- **Decision:** the PDP description block is now three independent **shadcn
  Accordion** sections — **Product Description** (narrative `longDescription`),
  **Product Details** (`material` + new derived `dimensions` + `care`), and
  **Return & Exchange** (placeholder policy) — replacing the single `ExpandableText`
  ("See more / See less") block. Each panel uses Base UI's **`hiddenUntilFound`**
  so the full text of all three sections stays in the rendered HTML even while
  collapsed; "Product Description" is open by default.
- **This reverses** the *"SEO-safe description truncation (CSS clamp…)"* decision
  above (2026-06-24), which deliberately chose **"a single expand control, not an
  accordion."** Reasoning for the reversal: **client preference for more
  organised, scannable product information** — material/care/returns are distinct
  concerns shoppers scan for individually, which a single run-on description
  buries. The original decision's hard constraint (full copy in the initial HTML
  for SEO) is **preserved** — `hiddenUntilFound` keeps every panel's content in
  the DOM (verified against the prerendered `.html`), so the accordion hides
  content from the initial *visual* view only, never from crawlers. `dimensions`
  and `care` are PLACEHOLDER mock content (derived per-category / shared copy)
  until real spec + final policy copy land. `ExpandableText` is retired from the
  PDP but kept as a reusable `components/ui` primitive.

### Add-on (gift) data model: catalogue flag + per-product reference list
- **Decision:** model add-ons as ordinary `Product`s carrying two new fields —
  `isAddOnOnly: boolean` (gift hamper / box / candle, etc.) and
  `availableAddOnIds: string[]` on "main" products listing the add-ons they offer.
  Rather than filter add-ons out at every call site, the catalogue exposes a
  single derived **`shopProducts`** (all products minus `isAddOnOnly`) that backs
  **every** browse surface — Shop grid, category pages, the Shop search box, and
  the global header search — and `productsByCategory` / `relatedProducts` /
  `newArrivals` / `bestsellers` are derived from it. Add-on-only products are also
  dropped from the PDP's `generateStaticParams` (no standalone catalogue page).
  The full `products` array is retained for `productBySlug` and the new
  `addOnsFor(product)` resolver (which defensively keeps only ids that exist *and*
  are flagged `isAddOnOnly`).
- **Rationale:** add-ons are real purchasable line items (own price, own image,
  own cart line), so they belong in the product model — not a bolted-on side
  type — which keeps them ready for the Supabase move. Centralising the exclusion
  in `shopProducts` makes "reachable only via the add-on selector" a single
  invariant instead of a rule each page must remember. Add-ons are treated as
  **single-SKU** (no variants/options) for now. On the PDP, ticking add-ons and
  clicking **Add to cart** issues the main `cart.add` plus one `cart.add` per
  selected add-on — each its own independent line (`lineKey` differs) — reusing
  the existing cart mechanics with **no new cart concepts**.
- **Alternatives considered:** (a) a separate `AddOn` type / separate mock list —
  rejected: duplicates price/image/cart-line plumbing and a parallel data path to
  migrate later; (b) filtering inline at each page — rejected: easy to forget a
  surface (e.g. header search), which is exactly the leak the flag must prevent.

### Gallery media: mixed image/video via a typed `media[]` (images[] kept)
- **Decision:** added `media: GalleryMedia[]` to `Product` — each item is
  `{ type: "image" | "video"; src; poster? }` — derived from the existing
  `images` array (image-only, still used by cards and as the video poster). The
  PDP gallery renders `<video controls>` for video items and `<img>` otherwise,
  with a play-icon overlay on video thumbnails. A couple of mock products mix in
  a placeholder clip; `imageSrc` (the card image) stays the first *image*.
- **Rationale:** a typed media list is the shape a real backend would expose and
  avoids overloading `images: string[]` with sentinel URLs; keeping `images`
  intact means cards/search/fallbacks need no change. Video URL is a clearly
  temporary public sample, swapped for R2 / Cloudflare Stream later.

### Floating WhatsApp button: brand-green glyph as a documented token exception
- **Decision:** a global fixed bottom-right FAB (root layout, every page) linking
  to `wa.me/917014441952`, at `z-30` so it sits below the sticky header (`z-40`)
  and the search / mobile-filter overlays (`z-50`). The glyph uses the real
  WhatsApp brand green `#25D366` via inline style (named constant) — an explicit,
  documented exception to the token-only colour rule, on the same basis as the
  product swatch colours: it's a fixed third-party **brand mark**, not a themeable
  Daylight site colour, so it must not change on a re-skin. The button's own
  chrome (background, border, ring) stays on tokens.
- **Rationale:** bottom-right is the conventional, expected placement; `z-30`
  guarantees no collision with the existing fixed UI (header cart/utility icons
  are top-anchored; overlays must cover the FAB, not the reverse). No scroll-to-
  top button exists to conflict with.

### Autoplaying product-card video: visual richness over raw page-load perf
- **Decision (client-accepted trade-off):** product cards whose gallery has a
  video play it **autoplaying** (muted, looped) as the card's primary visual on
  the Shop grid, category pages and Home rows, triggered when the card scrolls
  into the viewport. This is a deliberate choice of **visual richness over raw
  page-load performance** — a grid of autoplaying video is heavier than one of
  static images — and is **explicitly accepted by the client**.
- **How the cost is bounded (so the trade-off stays reasonable):** the
  `CardVideo` component (`components/ui/card-video.tsx`) keeps only the videos
  *currently on screen* active — IntersectionObserver play/pause, and on exit it
  **unloads the `src`** (resets to the poster), so off-screen cards stop
  downloading/decoding. Sources are **lazy** (`preload="none"`, no `src` until
  the card nears the viewport — nothing on initial load), the **poster** is the
  fallback (no blank flash), and `prefers-reduced-motion` users get the **static
  poster only** (the file is never fetched). So the cost scales with what's
  visible, not with catalogue size.
- **Conflict avoidance:** a card shows EITHER the autoplaying video OR the
  existing hover-to-cycle images, never both — `ShopProductCard` disables
  hover-cycling for video products so two motion behaviours never fight on one
  card. The video is the motion; video-less cards keep hover-cycling.
- **PDP gallery:** the main viewer autoplays the active video muted+looped (browser
  autoplay needs muted) while keeping the volume/unmute, play/pause and fullscreen
  controls, so a shopper can opt into sound. Distinct from the cards (which are
  ambient — muted, looped, no controls). Placeholder sample clips swap for real product
  video (R2 / Cloudflare Stream) later — unchanged from the prior gallery work.
