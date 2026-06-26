import type { Product, ProductCategory } from "@/types/product";
import { findVariant, type Selection } from "@/lib/product";

/**
 * Cart domain logic — pure, framework-free. The cart stores a denormalised
 * snapshot per line (enough to render without a catalogue lookup), since the
 * real cart will be persisted/served by the backend later. Totals + the
 * partial-payment eligibility rule live here so the context (and the future
 * Payment page) share one implementation.
 */

// PLACEHOLDER commerce config — TBD pending the real business decision.
export const FREE_SHIPPING_THRESHOLD_PAISE = 99900; // ₹999 free-shipping threshold (TBD)
export const FLAT_SHIPPING_PAISE = 4900; // ₹49 flat shipping under threshold (TBD)

export interface CartLine {
  /** Stable key: `${productId}:${variantId ?? "default"}`. */
  id: string;
  productId: string;
  slug: string;
  name: string;
  imageSrc: string;
  category: ProductCategory;
  /** Partial-payment eligibility flag carried from the product. */
  isCustomisable: boolean;
  /** Deposit per unit (paise) for a customisable line — used by the Payment page. */
  depositInPaise?: number;
  /** SKU id when the product has variants; undefined for single-SKU products. */
  variantId?: string;
  /** Human label of the chosen options, e.g. "Rose Gold, Ring size 7". */
  variantLabel?: string;
  /** The VARIANT-specific unit price (not a generic product price). */
  unitPriceInPaise: number;
  qty: number;
}

export function lineKey(productId: string, variantId?: string): string {
  return `${productId}:${variantId ?? "default"}`;
}

/** Build a readable label of the selected options, in axis order. */
export function buildVariantLabel(
  product: Product,
  selected: Selection,
): string | undefined {
  const groups = product.optionGroups ?? [];
  const parts = groups
    .map((g) => {
      const opt = g.options.find((o) => o.value === selected[g.axis]);
      if (!opt) return null;
      // Prefix size with its group label ("Ring size 7"); colour/stone stand alone.
      return g.axis === "size" ? `${g.label} ${opt.label}` : opt.label;
    })
    .filter(Boolean) as string[];
  return parts.length ? parts.join(", ") : undefined;
}

/** Build a cart line from a product + selection (assumes it's addable). */
export function makeLine(
  product: Product,
  selected: Selection,
  qty: number,
): CartLine {
  const variant = findVariant(product, selected);
  return {
    id: lineKey(product.id, variant?.id),
    productId: product.id,
    slug: product.slug,
    name: product.name,
    imageSrc: product.imageSrc,
    category: product.category,
    isCustomisable: !!product.isCustomisable,
    depositInPaise: product.depositInPaise,
    variantId: variant?.id,
    variantLabel: buildVariantLabel(product, selected),
    unitPriceInPaise: variant ? variant.priceInPaise : product.priceInPaise,
    qty,
  };
}

export interface CartTotals {
  subtotalInPaise: number;
  shippingInPaise: number;
  totalInPaise: number;
  freeShippingMet: boolean;
  remainingForFreeInPaise: number;
  /** 0–100, for the free-shipping progress bar. */
  progressPct: number;
}

/** Totals from the ACTIVE (available, non-excluded) lines only. */
export function computeTotals(activeLines: CartLine[]): CartTotals {
  const subtotal = activeLines.reduce(
    (sum, l) => sum + l.unitPriceInPaise * l.qty,
    0,
  );
  const met = subtotal >= FREE_SHIPPING_THRESHOLD_PAISE;
  // No items → no shipping charge; otherwise free over the threshold, else flat.
  const shipping = met || subtotal === 0 ? 0 : FLAT_SHIPPING_PAISE;
  return {
    subtotalInPaise: subtotal,
    shippingInPaise: shipping,
    totalInPaise: subtotal + shipping,
    freeShippingMet: met,
    remainingForFreeInPaise: Math.max(0, FREE_SHIPPING_THRESHOLD_PAISE - subtotal),
    progressPct: Math.min(
      100,
      Math.round((subtotal / FREE_SHIPPING_THRESHOLD_PAISE) * 100),
    ),
  };
}

/**
 * Total deposit due now for the eligible (customisable) lines: the SUM of each
 * line's per-unit deposit × quantity. Used by the Payment page's deposit option.
 */
export function computeDepositTotal(activeLines: CartLine[]): number {
  return activeLines.reduce(
    (sum, l) =>
      sum + (l.isCustomisable && l.depositInPaise ? l.depositInPaise * l.qty : 0),
    0,
  );
}

export type PartialPaymentReason = "none" | "eligible" | "mixed";

export interface PartialPaymentState {
  /** True only when EVERY active line is partial-payment eligible. */
  eligible: boolean;
  reason: PartialPaymentReason;
}

/**
 * Partial-payment eligibility — the critical mixed-cart rule. Computed over the
 * ACTIVE lines only (sold-out/excluded lines don't count):
 * - all active lines customisable → eligible ("eligible")
 * - some customisable but mixed with non-eligible → NOT eligible ("mixed")
 * - no customisable items (or empty) → not applicable ("none")
 */
export function computePartialPayment(
  activeLines: CartLine[],
): PartialPaymentState {
  if (activeLines.length === 0) return { eligible: false, reason: "none" };
  const allCustom = activeLines.every((l) => l.isCustomisable);
  if (allCustom) return { eligible: true, reason: "eligible" };
  const anyCustom = activeLines.some((l) => l.isCustomisable);
  return { eligible: false, reason: anyCustom ? "mixed" : "none" };
}
