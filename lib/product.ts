import type {
  GalleryMedia,
  Product,
  ProductVariant,
  VariantAxis,
} from "@/types/product";

/**
 * Product variant logic — pure helpers for the Product page. Resolves price
 * ranges, the exact SKU for a selection, and per-option availability (so a
 * sold-out colour×size combination can be disabled, not hidden). Framework-free
 * so the same logic survives the move to a real backend.
 */

/** A partial selection: chosen option value per axis (may be incomplete). */
export type Selection = Partial<Record<VariantAxis, string>>;

export interface PriceRange {
  min: number;
  max: number;
}

/**
 * The product's first gallery video, if it has one. This is the card's primary
 * motion visual (autoplayed muted on scroll-into-view); products without a video
 * keep the still-image card (with hover-cycling on the Shop grid). See
 * components/ui/card-video.tsx.
 */
export function firstVideo(p: Product): GalleryMedia | undefined {
  return p.media.find((m) => m.type === "video");
}

/** The axes a product offers selectors for, in declared order. */
export function selectionAxes(p: Product): VariantAxis[] {
  return p.optionGroups?.map((g) => g.axis) ?? [];
}

export function hasVariants(p: Product): boolean {
  return !!p.variants?.length;
}

/** Min/max variant price (or the single price when there are no variants). */
export function priceRange(p: Product): PriceRange {
  if (!p.variants?.length) {
    return { min: p.priceInPaise, max: p.priceInPaise };
  }
  const prices = p.variants.map((v) => v.priceInPaise);
  return { min: Math.min(...prices), max: Math.max(...prices) };
}

/** True once every axis has a chosen value. */
export function isSelectionComplete(p: Product, sel: Selection): boolean {
  return selectionAxes(p).every((a) => sel[a] != null);
}

/** The exact SKU for a complete selection (undefined if incomplete/none). */
export function findVariant(
  p: Product,
  sel: Selection,
): ProductVariant | undefined {
  if (!p.variants?.length) return undefined;
  const axes = selectionAxes(p);
  if (!axes.every((a) => sel[a] != null)) return undefined;
  return p.variants.find((v) => axes.every((a) => v.options[a] === sel[a]));
}

/**
 * Whether choosing `value` on `axis` — keeping the current selections on the
 * OTHER axes — yields at least one in-stock SKU. Drives disabling sold-out
 * options. Unselected other axes act as wildcards.
 */
export function isOptionAvailable(
  p: Product,
  axis: VariantAxis,
  value: string,
  sel: Selection,
): boolean {
  if (!p.variants?.length) return true;
  const otherAxes = selectionAxes(p).filter((a) => a !== axis);
  return p.variants.some(
    (v) =>
      v.inStock &&
      v.options[axis] === value &&
      otherAxes.every((a) => sel[a] == null || v.options[a] === sel[a]),
  );
}

/**
 * Apply a selection on `axis`, then drop any now-incompatible selections on the
 * OTHER axes (e.g. picking a colour whose only in-stock size differs from the
 * one currently chosen clears that size, so the user can't be stuck on an
 * impossible combination).
 */
export function applySelection(
  p: Product,
  sel: Selection,
  axis: VariantAxis,
  value: string,
): Selection {
  const next: Selection = { ...sel, [axis]: value };
  for (const other of selectionAxes(p)) {
    if (other === axis) continue;
    const chosen = next[other];
    if (chosen != null && !isOptionAvailable(p, other, chosen, next)) {
      delete next[other];
    }
  }
  return next;
}

export interface ResolvedPrice {
  /** True when collapsed to a single exact price; false when showing a range. */
  exact: boolean;
  priceInPaise: number;
  /** Upper bound of the range (equals priceInPaise when exact). */
  maxInPaise: number;
  originalPriceInPaise?: number;
}

/**
 * The price to display for the current selection:
 * - no variants → the single price (exact)
 * - variants, incomplete selection → the range (min–max)
 * - variants, complete selection → that SKU's exact price
 */
export function resolvePrice(p: Product, sel: Selection): ResolvedPrice {
  if (!p.variants?.length) {
    return {
      exact: true,
      priceInPaise: p.priceInPaise,
      maxInPaise: p.priceInPaise,
      originalPriceInPaise: p.originalPriceInPaise,
    };
  }
  const variant = findVariant(p, sel);
  if (variant) {
    return {
      exact: true,
      priceInPaise: variant.priceInPaise,
      maxInPaise: variant.priceInPaise,
      originalPriceInPaise: variant.originalPriceInPaise,
    };
  }
  const range = priceRange(p);
  // Collapse a degenerate range (all variants same price) to a single price.
  if (range.min === range.max) {
    return { exact: true, priceInPaise: range.min, maxInPaise: range.min };
  }
  return { exact: false, priceInPaise: range.min, maxInPaise: range.max };
}

/**
 * Can this be added to cart? A product with variants requires a complete
 * selection resolving to an in-stock SKU; otherwise it just needs to be in
 * stock. (Customisable products still add to cart — the deposit note is shown
 * separately.)
 */
export function canAddToCart(p: Product, sel: Selection): boolean {
  if (p.variants?.length) {
    const variant = findVariant(p, sel);
    return !!variant && variant.inStock;
  }
  return p.inStock;
}
