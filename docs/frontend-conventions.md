# Frontend conventions

Conventions for working in this storefront. The non-negotiable rule (design
tokens only — no raw hex/px/font strings in components) lives in the root
`CLAUDE.md`; everything here builds on it.

## Where design tokens live

- **`styles/tokens.css`** is the single source of truth. It has two parts:
  1. `@theme inline { … }` — the **API**: maps Tailwind utility names to CSS
     variables (e.g. `--color-accent: var(--accent)` → enables `bg-accent`,
     `text-accent`, `border-accent`).
  2. `:root { … }` — the **values**: the only place raw hex / rem live. Edit
     here to re-theme.
- `app/globals.css` just imports Tailwind, shadcn, and `styles/tokens.css`, then
  sets base element styles. It is imported after shadcn so our tokens win.
- Token groups: colour (Daylight palette + derived + shadcn semantic aliases),
  typography (`font-heading` = Fraunces, `font-body` = Inter), radius
  (`rounded-sm/md/lg/xl`), spacing extra (`p-mat`, the product-image inset).

### The Daylight colour API (use these names)

| Token | Utility examples | Meaning |
| --- | --- | --- |
| `background` | `bg-background` | page background |
| `surface-alt` | `bg-surface-alt` | secondary neutral surface |
| `surface-warm` | `bg-surface-warm` | warm mat behind product images |
| `accent` | `bg-accent`, `text-accent` | brand indigo (primary action / markers) |
| `accent-soft` | `bg-accent-soft` | gold pill / highlight |
| `text-primary` | `text-text-primary` | primary ink |
| `text-secondary` | `text-text-secondary` | muted ink |
| `keyline` | `border-keyline` | thin 1px card border (Daylight separates with lines, not shadows) |

shadcn primitives are themed through semantic aliases (`primary` = `accent`,
`secondary`/`muted` = `surface-alt`, `border` = `keyline`, …), so a shadcn
`<Button>` is on-brand automatically.

### The one allowed arbitrary-value utility: letter-spacing (`tracking-[…]`)

`tracking-[0.18em]`-style letter-spacing on uppercase eyebrow/label text is the
**single intentional exception** to the "no arbitrary `[...]` values in
components" rule (see `CLAUDE.md`). Letter-spacing is a typographic
micro-property, not a themeable colour/spacing/radius token, and it doesn't
change on a re-skin — so there is no `--tracking-*` token scale by design.
Constraints when using it: always `em` units (scales with font-size) and only on
uppercase label/eyebrow text. Everything else (raw hex, raw px spacing,
font-family strings) stays forbidden — use named tokens.

## Component patterns

- Components are **function components**, named exports, typed props extending
  the relevant `React.ComponentProps<...>`.
- Reuse `cn()` from `@/lib/utils` to merge class names; keep variants in `cva`
  (see `button.tsx`, `badge.tsx`).
- Build on shadcn primitives where one exists; add Daylight-specific components
  (`product-card.tsx`, `section-heading.tsx`) alongside them in
  `components/ui/`.
- Headings use `font-heading`; body copy uses `font-body` (inherited on
  `<body>`, so usually only set it explicitly when overriding weight/size).
- Separation = `border border-keyline`, **not** shadows.
- Anything interactive that hooks into Base UI (e.g. `useRender`) is a client
  component — pages that compose many of them can opt into `"use client"`.

### Buttons vs. links (Base UI `nativeButton`)

`<Button>` is built on Base UI's button, which renders a **native `<button>`**.
Use it for **in-page actions** (form submit, add-to-cart, open a dialog) — these
stay real `<button>` elements:

```tsx
<Button type="submit">Subscribe</Button>
```

For anything that **navigates** to another route/section, keep the Button's look
but give it correct link semantics by rendering it as a Next.js `<Link>` via the
Base UI `render` prop:

```tsx
<Button render={<Link href="/shop" />}>Shop the collection</Button>
```

When `render` swaps the element for a non-button (a `<Link>` → `<a>`), Base UI
needs `nativeButton={false}`, or it logs *"A component that acts as a button
expected a native `<button>`…"*. **Our `Button` already defaults `nativeButton`
to `false` whenever a `render` prop is passed** (see `components/ui/button.tsx`),
so `render={<Link …/>}` just works — you do **not** need to set `nativeButton`
yourself. (Override it only in the rare case of rendering a real `<button>` via
`render`.) The result is an `<a role="button">` carrying all the button classes,
so it's visually identical and keyboard/SEO-correct.

Equivalent alternative (no Button component): style a `<Link>` directly with the
exported `buttonVariants` — handy when you don't want Base UI button machinery at
all:

```tsx
<Link href="/shop" className={cn(buttonVariants({ variant: "outline" }))}>
  Shop the collection
</Link>
```

Rule of thumb: **action → `<Button>`; navigation → `<Button render={<Link/>}>`
(or a `buttonVariants`-styled `<Link>`).**

## File naming

- Files: **kebab-case** (`product-card.tsx`, `section-heading.tsx`, `format.ts`).
- React components: **PascalCase** (`ProductCard`). Hooks: `useThing`.
- Types/interfaces: PascalCase in `types/` (`Product`, `ProductCategory`).
- Route folders under `app/` follow Next conventions (`style-guide/page.tsx`).
- Import alias: `@/*` → repo root (e.g. `@/components/ui/button`,
  `@/mock-data/products`).

## Mock data structure

- Real data (Supabase) is not wired yet. Until then, typed dummy data lives in
  `mock-data/` and must satisfy the shapes in `types/`.
- Prices are stored as **integer paise** (`priceInPaise`) and formatted for
  display with `formatPriceFromPaise()` in `lib/format.ts` — never format money
  inline.
- Images currently point at `/placeholder-product.svg`. Swap for real assets
  (served from R2 / Cloudflare Images) later.

## The style guide

- `app/style-guide/page.tsx` is a **living reference**, not a real store page.
  It renders the palette, fonts, and every base component from tokens. Keep it;
  use it to verify the token cascade after any theme change.
