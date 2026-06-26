import type { Product } from "@/types/product";

/**
 * Time-bound sale logic — pure, framework-free. Resolves whether a product's
 * sale window is currently open and what price/countdown to display, given the
 * caller's notion of "now" (passed in, never read here — so this stays pure and
 * testable, and the caller owns the hydration-safe clock). Framework-free so the
 * same rule survives the move to backend-driven promotions.
 */

export interface SaleStatus {
  /** True only when a sale window + sale price exist AND now ∈ [start, end). */
  active: boolean;
  /** Live price to show: the sale price while active, else the regular price. */
  currentInPaise: number;
  /** Struck-through "was" price — only set while the sale is active. */
  wasInPaise?: number;
  /** Milliseconds until the sale ends (0 when not active). */
  msRemaining: number;
}

/**
 * Resolve a product's sale state at instant `nowMs` (epoch ms). A sale is only
 * "active" when it has a start, an end, a sale price, and now falls inside
 * [start, end). Outside the window the product reverts to its regular
 * `priceInPaise` with no "was" price and no countdown.
 */
export function resolveSale(product: Product, nowMs: number): SaleStatus {
  const { saleStartsAt, saleEndsAt, salePriceInPaise, priceInPaise } = product;
  if (saleStartsAt == null || saleEndsAt == null || salePriceInPaise == null) {
    return { active: false, currentInPaise: priceInPaise, msRemaining: 0 };
  }
  const start = Date.parse(saleStartsAt);
  const end = Date.parse(saleEndsAt);
  // Guard against malformed dates or an inverted window.
  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) {
    return { active: false, currentInPaise: priceInPaise, msRemaining: 0 };
  }
  if (nowMs < start || nowMs >= end) {
    return { active: false, currentInPaise: priceInPaise, msRemaining: 0 };
  }
  return {
    active: true,
    currentInPaise: salePriceInPaise,
    wasInPaise: priceInPaise,
    msRemaining: end - nowMs,
  };
}

/**
 * Format a positive millisecond remainder as a compact two-unit countdown, e.g.
 * "2d 3h", "14h 22m", "8m 30s". Always shows the two largest non-zero-leading
 * units so the label stays short. Returns "0s" for non-positive input.
 */
export function formatCountdown(msRemaining: number): string {
  const totalSeconds = Math.max(0, Math.floor(msRemaining / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}
