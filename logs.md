


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

---

## 2026-06-24 — Session 2: Home page

**Goal:** Build the storefront Home page on the existing Daylight design system,
mock data only (no Supabase / APIs).

**Done:**
- Extended `types/product.ts`: added the `bangles` category, `isNew` /
  `isBestseller` flags (drive the New Arrivals / Bestsellers rails), and a
  `ProductVariantGroup` type (`colour` / `stone` / `size`) on `variants` to
  mirror the spec's variant system.
- Expanded `mock-data/products.ts` to 26 products across earrings / necklaces /
  bangles / rings, priced ₹299–₹2,099. 7 flagged new, 6 flagged bestseller
  (disjoint sets). 6 products carry variants (colour/stone/size, incl. one ring
  with two groups). Added `placeholderImage` / `placeholderPhoto` helpers +
  exported `newArrivals` / `bestsellers` selectors.
- Added `mock-data/home.ts` — all home-page placeholder content (hero,
  announcements, trust claims, video thumbs, category tiles, brand story,
  testimonials, Instagram grid). Trust claims + video clips clearly flagged as
  placeholders pending business confirmation / real assets.
- New reusable components in `components/ui/`:
  - `marquee.tsx` — pure-CSS seamless marquee (server component); paired with a
    new `animate-marquee` utility + `@keyframes marquee` in `globals.css`.
  - `announcement-bar.tsx` — client; auto-rotating promo strip with prev/next
    arrows, aria-live, reduced-motion aware.
  - `newsletter-form.tsx` — client; email capture UI, `console.log` on submit
    (no backend yet) + confirmation state.
- Built `app/page.tsx` (now a server component) with all 12 sections in order:
  announcement bar, sticky header/wordmark, hero (full-bleed image + restrained
  `animate-in` entrance), trust marquee, video-thumbnail rail, category tiles,
  New Arrivals rail, Bestsellers rail, brand story, testimonials, Instagram
  grid, newsletter, footer. Reusable `ProductRail` (horizontal scroll on mobile,
  4-up grid from `lg`) for the two product rows.
- Imagery: temporary LoremFlickr placeholders (keyword-based, per-item `lock`
  for stability) since `source.unsplash.com` is retired. Plain `<img>` per the
  Cloudflare-Images-not-yet-provisioned note in CLAUDE.md.

**Verified:**
- `npm run build` passes; `/` and `/style-guide` still prerender static.
- `npx eslint` clean on app/components/mock-data/types.
- Dev smoke test: `GET /` → 200, every section + `animate-marquee` + product
  names present in the HTML.
- Token rule: grep found no raw hex, no px-spacing, no font-family strings in
  components/pages. Remaining `[…]` utilities are letter-spacing (`em`),
  transform-scale, and aspect-ratio only — matching existing repo conventions
  (`section-heading.tsx`, `product-card.tsx`).

**Still placeholder / pending:**
- Trust claims (waterproof / anti-tarnish / skin-friendly …) need business
  sign-off before launch.
- Video gallery uses still thumbnails; real clips to be dropped in later.
- Social icons use generic lucide glyphs (lucide v1 dropped brand logos);
  payment badges are text labels — real logos later.
- `[BrandName]` placeholder kept in header, hero, footer, metadata, Instagram
  handle for one-pass find-and-replace.

---

## 2026-06-24 — Session 3: Home page design-feedback pass

**Goal:** Work through a round of design feedback on the Home page. Mock data
only, no backend changes.

**Done:**
- **Removed sections:** deleted the Brand Story snippet and the Newsletter
  signup section from `app/page.tsx` (and their now-unused imports). The
  `newsletter-form.tsx` component file is retained but no longer used on Home.
  Dropped the duplicate tint so Bestsellers/Testimonials don't visually merge.
- **Video gallery → vertical:** changed the "Watch the Sparkle in Action" cards
  from `aspect-video` to portrait `aspect-[9/16]` (reels framing), narrower
  cards; kept the play-overlay and scroll row. `object-cover` re-crops the
  placeholder.
- **Carousels — hidden scrollbar + drag/momentum:** new
  `components/ui/drag-scroll.tsx` client component — `overflow-x-auto` +
  cross-browser `.scrollbar-hide` utility (added to `globals.css`), `snap-x`,
  native touch momentum kept, mouse click-drag panning on desktop with a
  grab cursor and click-suppression after a drag. Used on the video rail and
  both product rails (drag auto-disables at the `lg:grid` breakpoint).
- **"View All" CTAs:** added an outlined, rectangular (`rounded-sm`) View All
  button at the end of New Arrivals (`/shop?category=new`) and Bestsellers
  (`/shop?filter=bestsellers`); removed the old duplicate ghost "View all" in
  those section headers.
- **ProductCard redesign:** borderless card — image floats on a padded
  near-white `bg-card` surface, name over price stacked left-aligned, no frame.
  Added strikethrough sale-price support (new `originalPriceInPaise` on the
  `Product` type; 5 mock products given a "was" price across both rails). See
  `decisions.md`.
- **Hover micro-interactions:** product cards + category tiles lift
  (`-translate-y-1`) with a soft hover shadow and image zoom on hover; bumped the
  shared Button transition to `duration-200 ease-out`.
- **Scroll-in animations:** new `components/ui/reveal.tsx` client component —
  IntersectionObserver fade + slide-up (opacity 0→1, translateY 20px→0, ~0.5s
  ease-out, fire-once) on each major section (Trust strip → Footer; Hero
  excluded). Motion in `.reveal`/`.reveal-shown` utilities; `prefers-reduced-
  motion` handled in CSS. Chose IO over Framer Motion to keep the Workers bundle
  small (see `decisions.md`).
- **Smooth scroll:** `scroll-behavior: smooth` + `scroll-padding-top` on `html`
  (reduced-motion aware) for in-page anchor navigation.

**Verified:**
- `npm run build` passes; `/` and `/style-guide` still prerender static (the new
  `DragScroll`/`Reveal` client components hydrate; the page stays a server
  component, section content rendered as server children).
- `npx eslint app components mock-data types` clean.
- Dev smoke test `GET /` → 200: 4 vertical video cards, 3 scrollbar-hidden
  rails, 8 reveal sections, 5 strikethrough sale prices, both View All buttons
  with correct query routes; Brand Story / Newsletter copy absent.
- Token rule: grep found no raw hex / px / font-family strings in the changed
  components. Remaining `[...]` utilities are letter-spacing (`em`),
  transform-scale, and aspect-ratio (`aspect-[9/16]`) only — matching existing
  repo convention. Shadows used only as hover affordances (resting separation
  still uses keylines).

**Still placeholder / pending (unchanged from Session 2):**
- Trust claims need business sign-off; video gallery uses still thumbnails;
  social/payment glyphs are generic; `[BrandName]` placeholder retained.
- Shop routes (`/shop?category=new`, `/shop?filter=bestsellers`) are structural
  placeholders — the Shop page doesn't exist yet.

---

## 2026-06-24 — Session 4: Home page visual-review fix pass

**Goal:** A consolidated round of design fixes from a visual review of the Home
page. Mock data only, no backend changes.

**Done:**
- **Curated image set (root-cause fix):** new `mock-data/images.ts` — a FIXED,
  hand-verified set of ~29 specific Unsplash CDN photo ids grouped by category
  (earrings/necklaces/rings/bangles+bracelets/general), replacing the unreliable
  keyword-based LoremFlickr endpoint that returned off-topic photos / error
  blocks. `categoryImage(category, i)` cycles a category's pool for products +
  tiles; `galleryImage(i, w, h)` serves the hero / video rail / Instagram from a
  flat pool. Each id was downloaded and visually confirmed to show jewellery; a
  throwaway Playwright/Chromium screenshot pass verified the rendered page (no
  broken/red images) at desktop + mobile. `products.ts` + `home.ts` rewired to the
  new helpers; old `placeholderImage`/`placeholderPhoto` (LoremFlickr) removed.
- **ProductCard → square, edge-to-edge, denser:** dropped the `p-6` inner mat; the
  image now fills a square (1:1) `object-cover` frame directly on `bg-card`
  (`rounded-md`, no border, no padding). Tightened the name/price caption. Stays
  minimal (image, NEW/SALE badge, name, price + strikethrough) — no ratings /
  wishlist / hover-cart.
- **Category tiles → borderless:** removed the bordered warm-mat inset + inner
  keyline; image is now flush on a clean near-white frame, label + arrow kept
  below. Curated images applied.
- **Video gallery:** removed the caption text under each card; kept portrait
  (9:16); converted the row from `DragScroll` to the pure-CSS `Marquee` for a
  **seamless infinite loop** with equal `mx-2.5` spacing between every card; curated
  images applied; expanded to 6 thumbs for a richer loop.
- **Product rows responsive flip:** `ProductRail` is now a 2-row × 4-column grid on
  mobile (`grid-cols-4`, no scroll) and a single-row horizontal drag/scroll
  carousel from `lg`. Seeded `isNew`/`isBestseller` to 8 products each (disjoint)
  so the mobile grid shows a clean 4×2.
- **Density:** reduced section padding (`py-16 sm:py-20` → `py-12 sm:py-16`),
  heading margins (`mb-8` → `mb-6`), product-grid gaps and card caption padding —
  all via existing token/scale values (no arbitrary spacing).
- **Carousels:** confirmed no visible scrollbar on any row (`.scrollbar-hide` on
  `DragScroll`; `Marquee` has no scroll element).
- **Already done in Session 3 (re-confirmed present):** Brand Story + Newsletter
  sections absent; outlined rectangular "View All" CTAs on both product rows.

**Verified:**
- `npm run build` passes; `/` + `/style-guide` still prerender static.
  `npx eslint app components mock-data types` clean.
- HTML smoke test: 0 `loremflickr` refs, all imagery on `images.unsplash.com`.
- **Visual (Playwright screenshots, desktop 1280 + mobile 390):** all product
  images square & on-topic; no broken/red placeholders; product + category cards
  borderless; video cards captionless with equal spacing and bleeding off both
  edges (infinite loop); desktop product rows = single scrollable row (5th card
  clipped = overflow), mobile = 2×4 grid; no visible scrollbars; NEW/SALE badges +
  strikethrough sale prices render. Hover-lift / image-zoom / reveal / smooth-scroll
  classes left intact (Session 3 interactions preserved).
- Token rule: no raw hex, no arbitrary px / `bg-[#…]` in touched files. Remaining
  `[...]` utilities are letter-spacing (`em`), `aspect-[9/16]`, and transform-scale
  only — matching existing repo convention.
- Playwright was installed only to capture verification screenshots and then
  **removed**; `package.json` / `package-lock.json` are unchanged from before the
  session.

**Still placeholder / pending (unchanged):**
- Trust claims need business sign-off; video gallery uses still thumbnails; curated
  Unsplash photos are temporary stand-ins for real product photography (R2 /
  Cloudflare Images); social/payment glyphs generic; `[BrandName]` retained; Shop
  routes are structural placeholders.

---

## 2026-06-24 — Session 5: Home page carousel/grid refinements

**Goal:** A second visual-review pass on the Home page. Mock data only, no
backend changes.

**Done:**
- **Video gallery → exactly 4 unique cards:** trimmed `videoThumbs` from 6 to 4
  entries. The `Marquee` still loops infinitely (it renders the set twice), so the
  loop now cycles through only 4 distinct cards. Verified the rendered section has
  4 unique image URLs (×2 marquee copies = 8 `<img>`).
- **Mobile product grid 8 → 4 (2×2):** `ProductRail` mobile layout changed from
  `grid-cols-4` (8 items) to `grid-cols-2` showing the first 4 products only;
  products beyond index 3 get `hidden lg:flex` so they vanish on mobile but rejoin
  the unchanged desktop horizontal carousel. "View All" CTA unchanged.
- **Testimonials → horizontal carousel on mobile:** the "Loved by thousands" cards
  now sit in a `DragScroll` that is a free-flowing horizontal swipe/drag carousel
  on mobile (`flex overflow-x-auto`, fixed `w-72` cards so one shows with a peek of
  the next, no visible scrollbar) and collapses to the existing static 3-up grid
  from `sm` (`sm:grid sm:grid-cols-3 sm:overflow-visible`; drag auto-disables).
- **Shop by Category → conditional carousel (> 4 categories):** extracted a
  `CategoryTile` helper and made the section render a `DragScroll` carousel when
  `categoryTiles.length > 4`, else the existing static responsive grid. Expanded
  the mock categories from 4 to **6** (added Pendants + Bracelets) so the carousel
  branch is actually exercised. Added `pendants` to `ProductCategory` and aliased
  its image pool (pendants→necklaces, bracelets→bangles) in `mock-data/images.ts`;
  used offset image indices so no two tiles repeat a photo.

**Verified:**
- `npm run build` passes; `/` + `/style-guide` still prerender static.
  `npx eslint app components mock-data types` clean.
- **Visual (Playwright screenshots, mobile 390 + desktop 1280):** New Arrivals /
  Bestsellers show a 2×2 (4 items) on mobile; testimonials scroll horizontally with
  a peek of the next card; Shop by Category is a single-row carousel (6 tiles, no
  wrap to extra rows); video gallery loops through 4 unique cards. Desktop product
  rows + behaviours unchanged.
- Token rule: no raw hex / arbitrary px / `bg-[#…]` in touched files. New width
  utilities (`w-72`, `w-40`, `w-56`) are Tailwind's built-in scale.
- Playwright was reinstalled only to capture verification screenshots, then
  **removed**; `package.json` / `package-lock.json` are unchanged.

---

## 2026-06-24 — Session 6: Shop page (catalog, filters, sort, pagination)

**Goal:** Build the Shop page on the existing Daylight design system, carrying
forward every Home-page convention. Mock data only, no backend.

**Done:**
- **Shared site chrome:** extracted the header (announcement bar + sticky nav +
  utility icons) and footer out of `app/page.tsx` into
  `components/layout/site-header.tsx` + `site-footer.tsx`, now rendered once in
  the root layout so Home and Shop share identical chrome (the Home page lost its
  inline copies; `<main>` gets `flex-1` so the footer sits at the bottom). Header
  search icon links to `/shop`; nav links go to `/shop/[category]`.
- **Mock data (Step 1):** added `colour: ColourTone` (`gold-tone` / `silver-tone`
  / `rose-gold`) to `Product` for the Material/Colour facet, plus derived sort
  signals `popularity` (Bestselling) and `createdAt` (Newest). Expanded the
  catalogue 26 → **36** products: added 5 Pendants + 5 Bracelets so all six Home
  categories are populated, with a deliberate spread across the price buckets
  (several under ₹500, many ₹500–₹1,000, many ₹1,000+). `productsByCategory()`
  selector added.
- **Shop logic (`lib/shop.ts`):** pure, framework-free facet definitions
  (category/price-bucket/colour/sort), `parseFilters`/`filtersToQuery` (URL query
  ⇄ typed state), and `filterProducts`/`sortProducts`/`paginate`/`browse`
  (PAGE_SIZE 24). Shared by the (currently client-only) browser; the URL query
  string is the single source of truth.
- **`ShopBrowser` (client):** reads state from `useSearchParams`, filters/sorts/
  paginates client-side, and rewrites the URL on every change. Desktop = sticky
  sidebar (filters apply immediately); mobile = slide-up drawer with **pending
  state + a live result count + Apply / Clear All**. Sort `<select>`, result
  count ("Showing 1–24 of 36"), wrap-style active-filter chips (no horizontal
  scrollbar), facet counts per option, and page-based pagination where **each
  page is its own URL** (`?page=2`). Reuses the existing `ProductCard`, `Button`
  (outline rectangular), and `Reveal` (scroll-in) exactly — no card redesign.
- **Routes:** `app/shop/page.tsx` (full catalogue, category facet shown) and
  `app/shop/[category]/page.tsx` (category-locked: facet hidden, breadcrumb back
  to /shop, `generateStaticParams` for all 6 categories, `notFound()` for unknown
  slugs). `params` is awaited (Next 16 Promise API). Both wrap `ShopBrowser` in
  `<Suspense>` (required by `useSearchParams`) with a token-styled `ShopSkeleton`.
- **Grid:** static 2-up (mobile) / 4-up (desktop) browsing grid — deliberately
  NOT a carousel (Shop is for deliberate browsing).

**Verified:**
- `npm run build` passes: `/` + `/shop` static, `/shop/[category]` SSG (6 paths
  prerendered), `/style-guide` static. `npx eslint app components lib mock-data
  types` clean.
- **Functional (Playwright, 18/18 checks):** default count 36 / 24 per page;
  `?page=2` → "25–36 of 36" + 12 cards; `sort=price-asc`/`price-desc` ordered
  correctly; `colour=gold-tone` → 16; `price=under-500` → all < ₹500; `/shop/
  earrings` → 7 with Category facet hidden + breadcrumb present; `/shop/rings?
  colour=gold-tone` → 3; unknown category → HTTP 404; mobile drawer opens, live
  count updates on toggle (36 → 7), Apply writes `?price=under-500`.
- **Visual (screenshots):** desktop sidebar + 4-up grid; mobile 2-up grid + slide-
  up drawer with facet counts summing to 36; product cards/images/hover identical
  to Home (borderless square). Home page re-checked after the chrome refactor: one
  header, one footer, announcement bar + nav intact, no regression.
- Token rule: no raw hex / arbitrary px / hardcoded colour utilities in any new
  file (sidebar width uses the built-in `w-60` scale, not an arbitrary grid
  template). Playwright installed only for verification, then removed
  (`package.json`/`package-lock.json` unchanged).

**Still placeholder / pending:**
- Filtering is client-side against mock data (no Supabase). Cart/wishlist/search
  icons and policy/product-detail routes are still stubs. Curated Unsplash photos
  remain temporary stand-ins. `[BrandName]` retained.

---

## 2026-06-24 — Session 7: Product page (variants, pricing, customisation)

**Goal:** Build `/products/[slug]` on the Daylight system, carrying forward all
Home/Shop conventions. Mock data only.

**Done:**
- **Variant/price model (types):** replaced the old display-only
  `ProductVariantGroup` with a real option-matrix + SKU model — `VariantGroup`
  (axis `colour`/`stone`/`size`, options with an optional `swatch` colour) +
  `ProductVariant` (one option per axis, its OWN `priceInPaise` /
  `originalPriceInPaise` / `inStock`). Added `images: string[]`,
  `longDescription`, `isCustomisable`, `depositInPaise`. Product `priceInPaise`
  is now the derived "from" (min variant) price for listings.
- **Mock data (Step 1):** multi-image galleries via new `categoryImageSet`
  (3–4 per product, first = card image); long descriptions derived for every
  product. Variant states covered: colour-only (Aria Hoops, Luna Choker, Cygne
  stone swatches), colour×size (Aurora ring stone×size, Serra bangle colour×size),
  size-only/single-colour (Rosé Cuff — no colour selector), sold-out combos
  (Aurora Blush+8, Serra Rose+L), and customisable (Initial Ring — Letter A with
  size + ₹500 deposit; Custom Name Necklace, no variants, ₹700 deposit). Catalogue
  now 38 products. Listing price/stock derived from variants.
- **Logic (`lib/product.ts`):** pure `priceRange`, `findVariant`,
  `isOptionAvailable` (disable a sold-out combo, not hide), `applySelection`
  (drops now-incompatible other-axis picks), `resolvePrice` (range → exact;
  collapses a degenerate equal min/max range to a single price), `canAddToCart`.
- **Components:** `ProductGallery` (desktop thumbnail rail + main image; mobile
  swipe carousel w/ dots, no scrollbar), `VariantSelector` (colour/stone swatches
  + conditional size pills; sold-out disabled), `ProductBuyBox` (orchestrates
  selection → price → deposit note → Add to Cart + trust badges),
  `ExpandableText` (SEO-safe: full text always in DOM, CSS `line-clamp` + fade,
  single See more/See less — not an accordion).
- **Page + links:** `app/products/[slug]/page.tsx` with the locked section order
  (breadcrumb → gallery → title/price → variants → customisation note → add to
  cart → trust → description → related). `generateStaticParams` per product,
  `generateMetadata`, `notFound()` for unknown slugs. Added an optional `href` to
  `ProductCard` and wired Home rails, Shop grid and the Related row to
  `/products/[slug]` (previously dead links).
- **Site chrome:** Product page inherits the shared layout header/footer.

**Verified:**
- `npm run build` passes: `/products/[slug]` SSG (38 paths), `/shop/[category]`
  SSG (6), `/` + `/shop` static. ESLint clean.
- **Functional (Playwright, 24/24):** colour-only range (₹ 849 – ₹ 949) →
  exact on select (Gold ₹ 899 + ₹ 1,099 strike; Silver ₹ 849); cart disabled
  until a complete selection; Aurora range → Blush makes size 8 show DISABLED
  (sold out) → Blush+7 = ₹ 2,199 + cart enabled; size-only product shows no
  colour selector; customisable notes + ₹ 500 / ₹ 700 deposits; no-variant
  customisable adds to cart immediately; description full text in DOM while
  collapsed (SEO) + See more⇄See less; 4 gallery thumbnails; related row
  populated; breadcrumb Home › Shop › Earrings › name; Shop cards link to
  `/products/[slug]`.
- **Visual:** desktop (gallery rail + buy box + trust + description fade +
  related), mobile (swipe carousel + dots), customisable (made-to-order note +
  deposit) all correct.
- Token rule: no raw hex / px in components. Swatch colours are product DATA
  (physical piece colour, not a theme token) stored in mock data and applied via
  inline style — confirmed zero hex literals in any product component.
- Playwright installed only for verification, then removed; package files
  unchanged.

**Still placeholder / pending:**
- No real cart/checkout (Add to Cart logs to console); Supabase/payments/partial-
  payment flow pending. Customisation is modelled as separate catalogue products
  per the brand's model (no free-text field). `[BrandName]` retained; curated
  Unsplash photos remain temporary.

---

## 2026-06-24 — Session 8: Cart page + cart state

**Goal:** Build `/cart` + the client-side cart state it needs, on the existing
system and the Product/Variant model. Mock data only.

**Done:**
- **Cart state:** `lib/cart.ts` (pure: `makeLine`, `buildVariantLabel`,
  `computeTotals`, `computePartialPayment`, placeholder shipping config) +
  `components/cart/cart-context.tsx` — a `CartProvider` (wraps the whole app in
  the root layout) backed by **sessionStorage** (loaded post-mount to avoid an
  SSR hydration mismatch). Exposes `lines`, `count`, `activeLines`, `totals`,
  `partialPayment`, and `add/setQty/remove/toggleSoldOut/clear` via `useCart`.
- **Wiring:** the Product page's Add to Cart now calls `cart.add(product,
  selected, 1)` (with a transient "Added ✓ — View cart" confirmation); the header
  Bag button became a client `CartBagButton` with a live item-count badge linking
  to `/cart`.
- **Cart page (`app/cart/page.tsx`):** line items (image, name, the specific
  variant label e.g. "Rose Gold", quantity stepper with live price, the
  VARIANT-specific price, remove); empty state with Continue Shopping → /shop;
  dynamic free-shipping nudge + progress bar (placeholder ₹999 threshold, marked
  TBD) flipping to "unlocked"; Subtotal / Shipping / Total breakdown; and the
  mixed-cart partial-payment message. Includes a per-line DEV "simulate sold out"
  toggle (clearly commented as temporary) → line shows "No longer available", is
  struck-through, excluded from totals and from eligibility.
- **Partial-payment eligibility:** computed over ACTIVE (non-excluded) lines only
  and exposed as `partialPayment { eligible, reason }` for the Payment page to
  consume directly. All active customisable → "eligible"; any non-eligible mixed
  in → "mixed" (shows the required full-payment message); no customisable →
  "none".

**Verified:**
- `npm run build` passes (`/cart` static; product/category SSG unchanged).
  ESLint clean.
- **Functional (Playwright, 18/18):** add from PDP → header badge + correct
  variant label + variant price; qty changes update line/subtotal; remove →
  empty state; free-shipping nudge "Add ₹ 700 more" → "unlocked" after crossing;
  only-customisable → "Partial payment available"; adding a non-eligible item →
  "full payment will be required"; **simulating the non-eligible line sold out
  recomputes eligibility back to available** (proves active-lines-only rule);
  sold-out line excluded from subtotal (₹ 1,548 → ₹ 1,249).
- **Visual:** badge, line items, made-to-order + no-longer-available states,
  unlocked-shipping summary, partial-payment note all correct.
- Token rule: no raw hex / px in any cart file (progress-bar width is a dynamic
  inline `%`, like the established marquee/swatch precedent). Playwright installed
  only for verification, then removed; package files unchanged.

**Still placeholder / pending:**
- Checkout/Payment page is next (the "Proceed to Checkout" CTA links to
  `/checkout`, not yet built). No real persistence (sessionStorage stand-in) or
  payment integration. The DEV "simulate sold out" toggle is temporary.

---

## 2026-06-24 — Session 9: Checkout flow (Address → Payment → Confirmation) + Order Tracking

**Goal:** Build the full mock checkout flow + a standalone order-tracking page on
the existing system. Mock data only.

**Done:**
- **Checkout state:** `lib/checkout.ts` (`Address` + `validateAddress` — phone/
  email/pincode checks; `PaymentMethod`, `PlacedOrder`, `paymentSplit`,
  `generateOrderId` → `ORD-XXXX-XXXX`) and `CheckoutContext` (sessionStorage,
  adjacent to CartContext) holding the entered `address` and the placed `order`.
  Provider added to the root layout (inside CartProvider). `lib/cart.ts` extended:
  lines carry `depositInPaise`; `computeDepositTotal` sums per-line deposit × qty.
- **Address (`/checkout/address`):** guest-default form (no forced login) — full
  name, phone, email, line1, line2(opt), landmark(opt), city, state, pincode,
  address-type pills(opt), optional "Create an account" checkbox (never gates).
  Live client validation; "Continue to Payment" disabled until valid; submits the
  address into CheckoutContext. Pincode→City/State auto-fill deliberately out of
  scope (manual inputs). Honest COD note. Reusable `OrderSummary` sidebar +
  `CheckoutSteps` (Cart › Address › Payment) indicator.
- **Payment (`/checkout/payment`):** branches by the cart's partial-payment
  `reason`: regular/`mixed` → Pay Full Online | Cash on Delivery; `eligible`
  (all customised) → "Pay ₹deposit now, ₹balance on delivery" | Pay full online
  (no pure COD). Deposit = Σ(line deposit × qty). Address recap. "Place Order"
  snapshots a `PlacedOrder` (self-contained: lines, address, amounts, method)
  into CheckoutContext and navigates to confirmation. Mock only — no real PhonePe.
- **Order Confirmation (`/order-confirmation`):** restrained motion-safe success
  entrance; prominent `ORD-XXXX-XXXX`; order/payment/address recap; payment text
  branched by method (full → "Paid ₹X via PhonePe"; deposit → "Paid ₹dep now.
  Balance ₹bal due on delivery (COD)"; cod → "Pay ₹X on delivery"); est. delivery
  + customised-vs-regular next-steps copy; Track Your Order (deep-links
  `?orderId=`) + Continue Shopping. Clears cart + saved address on arrival (keeps
  the order snapshot so a refresh still renders).
- **Order Tracking (`/track-order`):** `mock-data/orders.ts` (4 sample orders
  across statuses) + lookup by Order ID **and** phone (also matches the session's
  just-placed order). Query-param prefill of Order ID; visual Pending→Confirmed→
  Shipped→Delivered step tracker; items/payment/delivery on match; a SINGLE
  generic error (never revealing which field failed) → `/support`. Added "Track
  order" to the header nav.

**Verified:**
- `npm run build` passes (all new routes static; product/category SSG unchanged).
  ESLint clean.
- **End-to-end (Playwright, 25/25):** address validation gating (disabled →
  invalid phone still disabled → enabled when valid) + persistence into context;
  all THREE payment branches show the correct options (regular = Full/COD, no
  deposit; eligible = deposit/Full, no COD; mixed = Full/COD + "full payment
  required" note); confirmation payment text correct for each (via PhonePe /
  deposit+balance / pay on delivery); cart cleared after placing (header badge
  gone); customised next-steps copy; tracking match shows items + Shipped step,
  unknown → generic error, `?orderId=` prefills. Screenshots confirm visuals.
- Token rule: no raw hex / px in any new file. Playwright installed only for
  verification, then removed; package files unchanged.

**Still placeholder / pending:**
- Mock payment only (no PhonePe/Razorpay); sessionStorage stand-in for real
  checkout/order persistence; `/support` is a placeholder route; account creation
  is a no-op checkbox. `[BrandName]` retained.

## 2026-06-24 — Session 10: Mock auth (Login/Signup) + Account (Profile + Orders)

**Goal:** A unified phone-OTP login/signup with a mock AuthContext, plus the two
Account pages (My Profile, My Orders) that consume it. Mock data only — no real
Supabase Auth / SMS-OTP (a future session).

**Done:**
- **Auth domain (`lib/auth.ts`):** `MockUser` + `SavedAddress` types,
  `MOCK_OTP = "123456"`, `OTP_RESEND_SECONDS = 30`, `isValidPhone` / `isValidOtp`,
  `makeNewUser`, address-id helper. `mock-data/users.ts` is a tiny known-users
  registry (`findUserByPhone`) — `9876543210` (Aisha) is a returning user wired to
  several mock orders; everything else is treated as a new signup.
- **AuthContext (`components/auth/auth-context.tsx`):** sessionStorage-backed
  (same throwaway pattern as Cart/Checkout), nested OUTERMOST in the layout so the
  header reads it. Exposes `user`/`isLoggedIn`, `login`/`logout`,
  `updateProfile`, and saved-address CRUD (`addAddress`/`updateAddress`/
  `removeAddress`/`setDefaultAddress`) with a `normaliseDefault` invariant
  (exactly one default while any address exists).
- **Login (`/login`):** single unified flow — phone → Send OTP → OTP (4–6 digits)
  → verify → (name, only for unknown numbers) → signed in. Demo "toast" is an
  inline notice ("OTP sent — demo mode, use 123456"); a 30s cosmetic resend
  countdown; "change number"; wrong-OTP inline error. Value-prop messaging above
  the form. Returning users land on My Orders, new users on My Profile; an
  already-signed-in visitor sees account links instead of the form.
- **Shared `OrderDetail` (`components/orders/order-detail.tsx`):** extracted the
  tracker + items + payment/delivery display out of `/track-order` into one
  presentational component; both Track Order and My Orders render it (each keeps
  its own trailing CTA). `TrackedOrder` gained `placedAt`; helpers
  `ordersForPhone` (most-recent-first), `orderTotalInPaise`, `formatOrderDate`.
  Added two more Aisha orders so she has three.
- **My Orders (`/account/orders`):** list (thumbnails, Order ID, date, item count,
  status badge, payment line, total) → click opens the shared `OrderDetail`
  in-page with a "Back to orders" link. Empty state for users with no orders.
- **My Profile (`/account/profile`):** name + email editable (with a "Saved"
  confirmation), phone read-only (lock + "tied to your login"), saved-address
  list with add/edit/delete + "Set as default" and a Default badge, and Log out.
- **Account nav:** `components/layout/account-nav.tsx` (client) in the header —
  "Login" when signed out; an "Account" dropdown (My Profile / My Orders / Log
  out, outside-click + Esc to close) when signed in. `AccountShell` provides the
  shared Profile/Orders sub-nav + signed-out guard.

**Verified:**
- `npm run build` passes (`/login`, `/account/profile`, `/account/orders` all
  static); ESLint clean; TypeScript clean.
- **Logic (17/17, real lib fns):** phone/OTP validation, returning-user lookup
  (one default address), new-user creation, `ordersForPhone` count + recency sort,
  order total + date format.
- **End-to-end (Playwright, 20/20 core):** returning-user OTP flow → My Orders
  shows the 3 orders + account dropdown shows "Aisha"; wrong OTP rejected; opening
  an order renders the shared `OrderDetail`; dropdown nav; profile read-only phone
  + 2 addresses + default marker + prefilled email; logout → signed-out guard;
  new-number flow asks for a name → profile → empty Orders state. (Fixed an a11y
  gap found during the run: address-form labels now associate with inputs via
  `useId`.) Playwright installed only for the run, then removed — package files
  unchanged.
- Token rule: no raw hex / px in any new file (tokens only).

**Still placeholder / pending:**
- Mock OTP (any number "receives" one; `123456` verifies); no real Supabase Auth /
  SMS. sessionStorage stand-in for a real session; account state doesn't persist
  across browser sessions by design. Resend cooldown is cosmetic. Wishlist/search
  header icons and `/support` remain placeholders. `[BrandName]` retained.


## 2026-06-24 — Session 12: Post-audit cleanup (dev toggle gate + docs)

**Goal:** Act on the Session 11 full-storefront audit. The audit confirmed the
build is complete, consistent, and correctly wired; only two cleanup items + one
doc-drift fix were outstanding. Scope deliberately limited to those — no other
code touched.

**Done:**
- **Gated the dev "simulate sold out" toggle (`app/cart/page.tsx`):** the
  per-line `cart.toggleSoldOut` button was rendering for real users. Wrapped it
  in `process.env.NODE_ENV === "development"` so Next.js dead-code-eliminates it
  from production builds while it stays available under `npm run dev` for our own
  availability testing. (Underlying `toggleSoldOut`/`soldOut` cart-context logic
  left intact — only the UI affordance is gated.)
- **Newsletter form — confirmed orphaned, left as-is:** `components/ui/
  newsletter-form.tsx` is imported/rendered nowhere (the Home newsletter section
  was removed earlier in the project). Verified not reachable by a real user, so
  per instruction its `TODO` (no backend to wire to yet) was left untouched.
- **Updated `CLAUDE.md` to match the as-built architecture:** it still described
  the repo as "scaffold + design system". Added a "What's built so far" overview
  (full storefront flow), a "State management / sessionStorage contexts" section
  documenting the three providers (Auth/Cart/Checkout, mounted in `layout.tsx`,
  sessionStorage-backed, post-mount hydration + `hydrated` flag, pure logic in
  `lib/`) as the established convention, and rewrote "Key paths" to list the
  feature component folders, the new `lib/` modules (`auth`, `cart`, `checkout`,
  `product`, `shop`), and the new `mock-data` files.

**Verified:**
- `npm run build` (production) passes — 58 pages generated, TypeScript clean,
  exit 0.
- **Dev toggle gating confirmed against a real production build:** the string
  `"simulate sold out"` does NOT appear in any executable `.js` chunk under
  `.next/static` or `.next/server` (only in `.js.map` source maps, which are
  debug-only and not executed). It IS still present in the `.next/dev` build,
  confirming the gate keeps it for local development.

**Unchanged / still pending (as before):** no real backend (Supabase/R2/PhonePe);
sessionStorage stand-ins; mock OTP; `[BrandName]` placeholder. No new patterns
introduced — this session was cleanup + documentation only.


## 2026-06-24 — Session 13: Stress-test fix pass (bugs, a11y, responsive, polish)

**Goal:** Work through every issue from the stress-test report, in priority
order. Mock data only, no backend changes.

**Priority 1 — real bugs / correctness:**
- **1.1 `normalisePhone` over-stripping (`lib/checkout.ts`):** it unconditionally
  stripped a leading `91`/`0`, so a valid bare 10-digit mobile that happens to
  start with `91` (e.g. `9112345678`) was mangled to `12345678` and failed
  validation. Rewrote to strip a prefix **only when the length proves it's one**:
  `91` off a 12-digit input, a leading `0` off an 11-digit input; otherwise
  digits-only, untouched. One source of truth — auth (`isValidPhone`), the
  checkout address form, profile saved-addresses, and track-order phone matching
  all re-export/consume this function, so the fix lands everywhere at once.
- **3.1 stale pagination URL (`components/shop/shop-browser.tsx`):** when a filter
  narrowed results below the current `?page=N`, the grid clamped to page-1
  content but the URL kept the stale `page` param (wrong shareable links). Added
  an effect that `router.replace`s to the clamped `result.page` whenever it
  differs from the URL's `filters.page` (replace, not push, so history isn't
  polluted; `filtersToQuery` drops `?page` when it's 1). Pagination hrefs already
  build from the clamped `result.page`, so links were corrected too.

**Priority 2 — accessibility / responsive:**
- **2.1 `--text-secondary` failed WCAG AA (`styles/tokens.css`):** old `#6e747a`
  was only ~3.8:1 on `--surface-alt`. Darkened to **`#565c61`** in the ONE token
  file — now ≥4.5:1 on every surface (`--background` 6.13:1, `--surface-alt`
  5.49:1, `--surface-warm` 5.51:1, `--surface-card` 6.59:1). Re-skins every usage
  site-wide (captions, prices, placeholders, footer, payment chips) with zero
  component edits — confirmed by grep + build.
- **2.2 tablet breakpoint mismatch (`app/page.tsx`):** the Home `ProductRail`
  switched grid→carousel at `lg` while sibling rows go multi-up at `sm`, leaving a
  cramped 2-up product grid beside a 4-up category grid at ~768px. Moved the
  rail's switch to `md` (768px) so the tablet width shows the flowing carousel,
  consistent with the rest of the page.
- **2.3 focus rings:** added `focus-visible:ring-2 focus-visible:ring-ring/50`
  (the project's existing focus convention) to variant swatches + size pills
  (`variant-selector.tsx`), the address-type toggles (`checkout/address`), and the
  pagination links (`shop-browser.tsx`) — they previously had only the browser
  default outline. (Cart remove + the new undo-toast buttons got it too.)
- **2.4 explicit `<img>` width/height:** added `width`/`height` (encoding the
  aspect ratio; the aspect wrappers still drive layout) to **every** `<img>` —
  Home (hero/category/video/instagram), ProductCard, ProductGallery (×3), cart,
  order-summary, order-detail, order-confirmation, account/orders. Forward-proofs
  for when Cloudflare Images lands with variable-ratio real photography.
- **2.5 stable list keys:** replaced array-index `key={i}` with a stable composite
  (`name` + variant label) on the order line/thumbnail lists in `order-detail.tsx`,
  `order-confirmation/page.tsx`, and `account/orders/page.tsx`.

**Priority 3 — minor polish:**
- **1.3 undo toast on cart removal (`app/cart/page.tsx`):** removing a line now
  shows a bottom-centre toast with **Undo** (re-inserts the line at its original
  index) + dismiss, auto-clearing after 6s. Added a `restoreLine(line, index)`
  method to CartContext; the toast state is owned by `CartPage` (not `CartBody`)
  so it survives removing the LAST line, which swaps in `<EmptyCart>`. No toast
  library — a small token-styled element (same "no dep for a few lines" precedent
  as Marquee/Reveal).
- **1.4 header badge count (`cart-context.tsx`):** `count` now sums `activeLines`
  (matching the subtotal) instead of raw `lines`, so a sold-out/excluded line no
  longer inflates the bag badge.
- **1.5 profile "Saved" pill (`account/profile/page.tsx`):** dropped the
  per-keystroke `setSaved(false)`; the pill is now gated purely by `!dirty`
  (comparison against the saved `user` snapshot), so editing a field back to its
  original value correctly re-shows "Saved".
- **3.3 one empty/checkout predicate + missing message:** standardised
  `activeLines.length === 0` as the "can't proceed" predicate across cart +
  checkout, and added a distinct **"All items are unavailable"** message (vs
  "Your cart is empty") on the cart page banner and both checkout guards
  (address + payment), pointing back to `/cart` instead of `/shop`.
- **4.1 hover-zoom value:** standardised every image hover-zoom on
  `group-hover:scale-105` (was a mix of `scale-[1.03]` / `scale-[1.05]` /
  `scale-105`) — also removes three arbitrary-value utilities.
- **4.2 tracking exemption documented:** chose to **document** letter-spacing
  (`tracking-[…]` in `em`) as the single intentional arbitrary-value exception
  rather than add a token scale — noted in `CLAUDE.md` (token rule) and
  `docs/frontend-conventions.md`.
- **4.3 Shop grid intermediate step (`shop-browser.tsx`):** added `md:grid-cols-3`
  between `grid-cols-2` and `lg:grid-cols-4`, so 768–1023px is 3-up instead of
  stuck at 2-up.

**Verified:**
- `npm run build` passes — **58 routes** still generate, TypeScript clean, exit 0.
  `npx eslint app components lib` clean.
- **1.1** unit-checked: `9112345678` → `9112345678` (valid); `919112345678` /
  `09112345678` / `+91 98765 43210` all → correct 10-digit; bare valid numbers
  untouched.
- **2.1** contrast computed against all four surfaces (lowest 5.49:1 ≥ 4.5:1 AA).
- **3.1** logic: `paginate()` clamps `result.page`; the effect replaces the URL
  whenever it diverges from the param, and `filtersToQuery` omits `page=1`.

**Explicitly out of scope (confirmed acceptable):** two-tab independent carts
(sessionStorage-per-tab); `MOCK_OTP` + client-only auth gating; Track Order not
auto-filling phone. **Still pending (as before):** no real backend
(Supabase/R2/PhonePe); sessionStorage stand-ins; `[BrandName]` placeholder.


## 2026-06-24 — Session 14: Unified Order Detail + cancellation flow

**Goal:** Implement the unified order-detail page and a self-service cancellation
flow, in the four sequenced phases from the audit. Mock data only, no backend.

**Phase 1 — Data model (`mock-data/orders.ts`):**
- `OrderStatus` gained `"cancelled"`, kept OUT of `ORDER_STATUS_STEPS` (it's a
  terminal/off-track state, not a 5th linear step).
- Added a structured cancellation outcome: `cancellationOutcome`
  (`refunded | forfeited | no_charge`) + `refundAmountInPaise` /
  `forfeitedAmountInPaise`, so the post-cancel banner renders real numbers.
- Added structured numeric payment fields to `TrackedOrder` — `method`,
  `depositInPaise`, `paidNowInPaise`, `balanceDueInPaise` (+ `hasCustomised`) —
  carrying the same real figures `PlacedOrder`/`CartLine` already compute.
  Backfilled all 6 mock orders. Removed the stored free-text `paymentLabel`
  field; it's now derived via `paymentLabelFor(order)` FROM the structured fields.
- Added `placedToTracked(PlacedOrder)` (the single normalisation point) threading
  the real numbers through; `ordersForPhone`/`findOrder` now take an explicit pool
  (so the context can pass its override-applied list).

**Phase 2 — Shared order-state ownership (`components/orders/orders-context.tsx`):**
- New `OrdersProvider` / `useOrders`, mounted in the layout inside
  `CheckoutProvider`. Single source of truth for order-status mutations; all
  three surfaces read/write through it. Mechanism: a per-order **override map**
  keyed by `orderId`, sessionStorage-backed (`daylight-orders-v1`), layered over
  the immutable mock pool + the normalised session order at read time. Flagged
  (here, in `decisions.md`, and in a header code comment) as a **mock-data-era
  pattern to be replaced by real Supabase reads/writes** (an orders `UPDATE`).

**Phase 3 — Unify the renderer (`components/orders/order-detail.tsx`):**
- Consolidated Order Confirmation + Track Order + My Orders onto the ONE
  `OrderDetail`, fed by the single canonical `TrackedOrder` shape. Confirmation
  now normalises its `PlacedOrder` via `placedToTracked` and renders the same
  component.
- Ported Confirmation's richer features in: per-line prices + an order total, the
  branched payment summary (with a paid-now/balance breakdown for deposit
  orders), and the "what happens next" customised-vs-regular copy.
- Replaced the one-time success badge with an **evergreen header** (icon + "Thank
  you for shopping with us" + Order ID), shown identically everywhere. Added the
  **step tracker to all entry points** (Confirmation previously lacked one).
- Fixed the terminal-state tracker bug: for `cancelled`, `findIndex` returned -1
  and rendered as "all steps incomplete". Now a cancelled order replaces the
  tracker with a **status banner** (reads `cancellationOutcome`/amounts) and
  renders line items **dimmed**.

**Phase 4 — Cancellation action + surface treatment:**
- "Cancel order" shown only for **single-item** orders in **pending/confirmed**;
  **multi-item** pending/confirmed shows **"Need to cancel an item? Contact
  support"**; **shipped/delivered** show nothing.
- Confirmation modal copy + outcome branch by `method`: online → full refund
  (`refunded`, = `paidNowInPaise`); COD → not charged (`no_charge`); deposit →
  deposit non-refundable (`forfeited`, = `depositInPaise`). Confirm writes through
  `OrdersContext.cancelOrder` → instantly consistent across surfaces. Small
  token-styled modal (Esc/backdrop close, self-focus), no dialog dependency.
- My Orders list: `cancelled` now maps to the existing `destructive` Badge
  variant with a "Cancelled" label (via `orderStatusLabel`) instead of the raw
  status key.

**Verified:**
- `npm run build` passes — **58 routes** still generate, TypeScript clean, exit 0.
  `npx tsc --noEmit` clean; `npx eslint app components mock-data lib` clean.
- **End-to-end (Playwright, 26/26):** signed-in My Orders → open confirmed order
  shows evergreen header + tracker + Cancel; cancel → full-refund modal → banner
  "Refund of ₹ 1,749 processed", tracker gone, items dimmed, Cancel gone; list
  badge flips to **Cancelled (destructive)**; shipped + delivered orders show NO
  cancellation messaging; **Track Order lookup of the same order shows the
  identical cancelled state** (not a stale/incomplete tracker) — proving the
  shared store. Deposit order → "non-refundable ₹ 500" modal → "₹ 500 deposit
  forfeited" banner. **Fresh single-item COD order via the real checkout** →
  confirmation shows evergreen header + tracker (Pending) + Cancel → "hasn't been
  charged" modal → "not charged" banner. Multi-item order → "Contact support",
  no Cancel button. (All three cancellation-copy branches + amounts confirmed.)
- Playwright was installed only in the throwaway scratchpad for the run;
  `package.json` / `package-lock.json` are unchanged.

**Still placeholder / pending (unchanged):** the `OrdersContext` override store is
a mock-data-era stand-in to be replaced by Supabase order reads/writes; no real
backend (Supabase/R2/PhonePe); `/support` route is a placeholder; `[BrandName]`
retained.

---

## 2026-06-26 — Session: PDP Add-to-Cart → live quantity stepper

**Goal:** Product page interaction fix only. Mock data, no backend, no layout
reordering (page section order unchanged).

**Done:**
- `components/product/product-buy-box.tsx` — replaced the static "Added to your
  cart — View cart" confirmation line (and its `added`/`setTimeout` state) with
  a **live quantity stepper** that swaps in for the Add to Cart button once the
  selected variant is in the cart.
- The stepper reads/writes the **real cart context** (no separate local
  counter): quantity comes from `cart.lines` keyed by `lineKey(productId,
  variantId)` for the EXACT current selection; `+`/`−` call `cart.setQty` /
  `cart.remove` directly. Decrementing at qty 1 removes the line and reverts to
  the Add to Cart button.
- **Variant-aware:** each distinct variant combination has its own line, so
  switching the selection shows that variant's own quantity (often 0 → button
  again), consistent with how the Cart page treats variants as distinct lines.
  An incomplete selection has no resolved SKU, so it falls back to the disabled
  button.
- Header badge (`cart.count`) and the Cart page stay in lockstep automatically
  since the stepper uses the same context mutators the Cart page does.
- Kept a small "View cart" link beside the stepper.

**Verification:** `npm run build` clean (58 routes, TypeScript ok); `eslint`
clean; no raw hex/px in the file (tokens only — stepper reuses the same keyline/
surface-alt/text-primary utilities as the Cart-page stepper).

---

## 2026-06-26 — Session: Shop feature round (cards, sale timer, accordions, search, pagination, sorts)

**Goal:** A round of Shop-page feature additions + design changes from real
feedback. Mock data only, no backend changes.

**Done:**
- **In-grid variant picker + Add to Cart** — new `components/shop/shop-product-card.tsx`
  (a Shop-specific richer card; the plain `ProductCard` stays for home rails /
  related). Each card now shows, below image/name/price: the PDP's
  `VariantSelector` swatches (colour/stone) always, size pills only when a size
  axis exists, and an **Add to Cart** disabled until `canAddToCart` is satisfied
  — wired to the SAME `useCart` context (`cart.add(product, selected, 1)`), so
  grid adds land in the same cart as the PDP. Accepts taller cards as the
  deliberate trade-off (see decisions.md).
- **Time-bound sale countdown** — added `saleStartsAt` / `saleEndsAt` /
  `salePriceInPaise` to the `Product` type and to three mock products (one short
  active window, one long active window, one already-ended). New pure
  `lib/sale.ts` (`resolveSale` + `formatCountdown`); the card ticks a
  hydration-safe clock (`now` starts null → set post-mount) and shows a live
  "Sale ends in 14h 22m" + sale price (struck "was") **only within the real
  window**, reverting to the regular price once `saleEndsAt` passes. SALE pill
  reuses the existing `Badge variant="soft"`.
- **Filters → accordions** — new `components/ui/accordion.tsx` (shadcn base-nova
  wrapper over Base UI's Accordion). `FilterControls` now renders Category /
  Price / Material as collapsible accordion sections (desktop sidebar + mobile
  drawer), all open by default (`multiple` + `defaultValue`). Filter logic and
  preset price buckets unchanged — purely structural.
- **Global header search** — new `components/layout/header-search.tsx`; the
  header search icon now opens an overlay panel (Esc / backdrop / result-click to
  close) that matches product names across the full catalogue and links each
  result to its PDP. Works from any page (header is global). Replaced the old
  `Search` → `/shop` link.
- **Redesigned pagination** — `<<` first / `<` prev / windowed numbers (active in
  the **accent** colour) / `>` next / `>>` last, with a `pageWindow()` helper
  (ellipses for large counts). Kept `?page=N` routing and the stale-page clamp
  fix from the earlier stress-test session intact.
- **Expanded sort options** — added Availability (in-stock first), Oldest,
  Recently Listed, Popularity (High→Low / Low→High) alongside the existing sorts.
  New `popularityScore` mock field (placeholder for real order-count popularity)
  + `listedAt` (catalogue insertion order, distinct from the NEW-boosted
  `createdAt`).

**Verification:** `npm run build` clean (58 routes, TypeScript ok); `eslint`
clean; no raw hex/px in any new/edited file (tokens only). Smoke-tested via dev
server: all new sort URLs + page 2 return 200; pagination First/Prev disabled on
page 1 and Next/Last disabled on the last page; accordion panels render open by
default with filter labels present; sale countdown/SALE badge correctly ABSENT
in SSR (now=null) and the real time comparison resolves the three windows
correctly (two active, one reverted) against the live clock; category-locked page
hides the Category accordion.

**Known limitation (documented):** the time-bound sale price is a Shop-listing
display promo only — it does NOT yet flow into the cart/checkout unit price
(`makeLine` still uses the regular/variant price). Deferred with the backend so
shared cart/checkout money logic stays untouched (see decisions.md).

## Shop layout fixes — in-grid card alignment, sale badge, persistent search

- **Persistent Shop search input** — the Shop toolbar now carries an always-
  visible name-search field (separate from the global header search icon), above
  the result-count/sort row. Local input → debounced commit to `?q=` (URL stays
  the source of truth); `filterProducts` already matched on name, so the grid
  filters live as you type. Clear (`✕`) button resets it.
- **Sale countdown → image badge (top-left)** — the live countdown moved off the
  caption (plain text under the price) onto the product image itself, top-left,
  as a `Badge variant="soft"` with the Clock icon — sharing the badge language
  with the NEW/SALE pill opposite it (top-right). Same hydration-safe ticking
  clock + real time window.
- **Variant area: consistent card heights** — replaced the conditional full
  `VariantSelector` (which made variant cards taller and broke row alignment)
  with a fixed-height (`h-7`) swatch strip reserved on EVERY card — empty when a
  product has no colour/stone choice. Swatches are smaller/compact (`size-5`)
  and centered. The swatch strip + Add-to-cart sit in an `mt-auto` bottom-pinned
  group, so with the equal-height grid items the CTA lands at the SAME vertical
  position on every card in a row regardless of variant presence. Products that
  need a size (not pickable inline) get a "Select options" CTA linking to the
  PDP instead of a permanently-disabled add-to-cart.

**Verification:** `npm run build` clean (58 routes, TypeScript ok); no raw
  hex/px in edited files (tokens only; swatch `backgroundColor` is product data,
  per decisions.md). Fixed a pre-existing broken state in `shop-product-card`
  (undefined `VariantSelector` import + `hasVariants` reference) along the way.

## 2026-06-26 — Session: PDP description accordions, WhatsApp FAB, gallery video, gift add-ons

Product-page feature round + one global feature. Still mock-data only; no backend.

- **Description → three accordions (replaces single "Details" + See-more)** — the
  PDP's lone CSS-truncated `longDescription` block is now three independently
  collapsible **shadcn Accordion** sections (same Base UI primitive as the Shop
  filters): **Product Description** (narrative `longDescription`), **Product
  Details** (`material` + new derived `dimensions` + `care`), and **Return &
  Exchange** (clearly-marked placeholder policy text — 7-day, original packaging,
  made-to-order excluded). Position unchanged (still below trust badges). Every
  panel uses Base UI's `hiddenUntilFound`, so **all three sections' full text
  stays in the prerendered HTML even when collapsed** — verified by grepping the
  static `.html` (return/care/dimensions copy all present; collapsed panels carry
  `hidden`, the open one `data-open`). `ExpandableText` is retired from the PDP
  (kept as a `components/ui` primitive).
- **Global floating WhatsApp button** — `components/layout/whatsapp-button.tsx`,
  mounted once in the root layout so it's on **every** page (verified: home/shop/
  cart/login/track-order all carry the `wa.me/917014441952` link). Fixed
  bottom-right FAB at `z-30` — below the sticky header (`z-40`) and the search /
  mobile-filter overlays (`z-50`), so those cover it cleanly; the cart/utility
  icons live in the top header, so no collision. Glyph uses the real WhatsApp
  brand green (`#25D366`) via inline style — the documented third-party-brand
  exception to the token rule; the button chrome stays on tokens.
- **Video in the product gallery** — `Product` gained a `media: GalleryMedia[]`
  field (each item `{ type: "image" | "video"; src; poster? }`), derived from
  `images`. `ProductGallery` now renders a `<video controls>` for video items
  (main viewer + mobile carousel) and an `<img>` otherwise; video thumbnails show
  a **play-icon overlay** over the poster frame. Five mock products spread across
  categories — `p_001` Lumen Drop (earrings), `p_009` Aurelia (necklaces),
  `p_016` Serra Cuff (bangles), `p_021` Aurora Solitaire (rings), `p_033`
  Étincelle (bracelets) — mix in a placeholder sample clip (w3schools BBB +
  Google gtv-videos samples) at gallery position 2 (poster = first image, so the
  card image stays an image), mapped via `VIDEO_BY_PRODUCT`. Verified the video
  `src` appears on those PDPs and not on others.
- **Add-on system (gift hampers etc.)** — `Product` gained `isAddOnOnly` and
  `availableAddOnIds`. Three add-on-only products (`p_101` Gift Hamper, `p_102`
  Premium Gift Box, `p_103` Scented Soy Candle), attached to a few mains
  (`p_001`, `p_008`, `p_021`, `p_038`). New `shopProducts` (catalogue minus
  add-ons) now backs the Shop grid, category pages, search box and header search;
  `productsByCategory`/`relatedProducts`/`newArrivals`/`bestsellers` exclude them
  too, and they're dropped from `generateStaticParams` (no standalone PDP).
  `productBySlug` keeps the full set so `addOnsFor()` can resolve them. On the PDP
  a compact "Make it a gift" toggle-card section sits just above Add-to-Cart;
  ticking add-ons and clicking **Add to cart** adds the main variant **and** each
  selected add-on as its own independent cart line in one action (reuses
  `cart.add`; add-ons are single-SKU). A secondary "Add N gift extras" button
  covers the case where the main item is already in the cart (stepper showing).
  Verified add-ons appear on **no** browse surface (Shop/category HTML grep = 0)
  and no add-on static pages are generated.

**Verification:** `npm run build` clean (58 routes, 38 product pages — add-ons
  excluded; TypeScript + ESLint ok). No raw hex/px in edited files (tokens only;
  WhatsApp green is the noted brand exception in a named constant). SEO, video,
  and add-on-exclusion all confirmed against the prerendered HTML.

## Video playback refinements (PDP autoplay + scroll-into-view card video)

Two refinements to the mixed-media gallery (still mock data, no backend):

- **PDP gallery video — autoplay/loop/muted.** New `GalleryVideo` sub-component
  in `product-gallery.tsx`: while a video is the **active** gallery item it
  autoplays + loops, **muted** (required for browser autoplay policies; set on
  the element via ref, not just the attribute, since React doesn't reliably
  reflect `muted`). Native controls stay visible (volume/unmute, play/pause,
  fullscreen). It pauses whenever it isn't the active item (so the mobile
  carousel only plays the slide you're on). Replaced the old static
  `<video controls preload="metadata">` in both the desktop main viewer and the
  mobile carousel.
- **Card video — scroll-into-view autoplay.** New reusable
  `components/ui/card-video.tsx` (`CardVideo`): same IntersectionObserver pattern
  as `Reveal`, but it gates **playback** instead of a one-shot reveal. A card's
  video autoplays (muted, looped, no controls) only while in the viewport and
  **pauses + fully unloads its `src`** (then `load()`s back to the poster) on
  exit — so no more videos download/decode than are on screen. `preload="none"`
  + no initial `src` means nothing downloads on page load; the file URL attaches
  the first time the card enters view. Poster/first-frame is the fallback (no
  blank flash). `prefers-reduced-motion` (or no IntersectionObserver) →
  poster-only, source never attached.
  - New `firstVideo(product)` helper in `lib/product.ts`. `ProductCard` gained an
    optional `videoSrc` prop → renders `CardVideo` (poster = `imageSrc`) instead
    of the `<img>`; wired from the **home** rails (`app/page.tsx`) and **related
    products** (PDP). `ShopProductCard` (Shop grid + category pages) renders
    `CardVideo` for video products and, to avoid two competing motions, **skips
    the hover-to-cycle images** behaviour for those cards (`canCycle = !video &&
    …`); video-less cards keep hover-cycling unchanged.

**Verification:** `npm run build` clean (58 routes); ESLint clean. Headless
  Chromium (Playwright) against the dev server confirmed: (1) Shop grid — the
  in-viewport card plays muted+looped with `currentTime` advancing and only that
  card fetched its `.mp4`; scrolling away **unloaded** (`src` removed) + paused
  both off-screen videos. (2) PDP — clicking the video thumbnail autoplays
  muted+looped, time advancing. (3) `prefers-reduced-motion` — no `src` attached,
  nothing playing, **0** `.mp4` network requests (poster only). No raw hex/px in
  edited files (tokens only).
