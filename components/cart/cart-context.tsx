"use client";

import * as React from "react";

import type { Product } from "@/types/product";
import type { Selection } from "@/lib/product";
import {
  type CartLine,
  type CartTotals,
  type PartialPaymentState,
  computePartialPayment,
  computeTotals,
  makeLine,
} from "@/lib/cart";

/**
 * Cart state — React Context backed by sessionStorage.
 *
 * Persistence: sessionStorage (a real Next.js app, so web storage is fine). We
 * use sessionStorage rather than localStorage so a mock cart doesn't linger
 * across browser sessions; this whole layer is replaced by server-side cart
 * persistence once Supabase lands. Keep it simple.
 *
 * Availability: `soldOut` holds line ids flipped unavailable AFTER being added
 * (driven by the dev "simulate sold out" toggle). Totals + partial-payment
 * eligibility are computed from ACTIVE (available) lines only and exposed here
 * so the Payment page can consume `partialPayment` directly.
 */

const STORAGE_KEY = "daylight-cart-v1";

interface PersistShape {
  lines: CartLine[];
  soldOut: string[];
}

export interface CartApi {
  hydrated: boolean;
  lines: CartLine[];
  /** Total quantity across AVAILABLE lines (for the header badge — matches the
   *  subtotal, which also excludes sold-out lines). */
  count: number;
  isAvailable: (id: string) => boolean;
  activeLines: CartLine[];
  totals: CartTotals;
  partialPayment: PartialPaymentState;
  add: (product: Product, selected: Selection, qty?: number) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  /** Re-insert a previously-removed line at `index` (for an undo affordance). */
  restoreLine: (line: CartLine, index: number) => void;
  /** Dev-only: flip a line's availability to simulate becoming sold out. */
  toggleSoldOut: (id: string) => void;
  clear: () => void;
}

const CartContext = React.createContext<CartApi | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = React.useState<CartLine[]>([]);
  const [soldOut, setSoldOut] = React.useState<string[]>([]);
  const [hydrated, setHydrated] = React.useState(false);

  // Load once from sessionStorage. This MUST run post-mount (not in a lazy
  // initializer) so the server-rendered HTML and the first client render both
  // start empty — reading storage during render would cause a hydration
  // mismatch. The synchronous setState here is the intended hydration pattern.
  React.useEffect(() => {
    let restored: PersistShape = { lines: [], soldOut: [] };
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<PersistShape>;
        restored = {
          lines: Array.isArray(parsed.lines) ? parsed.lines : [],
          soldOut: Array.isArray(parsed.soldOut) ? parsed.soldOut : [],
        };
      }
    } catch {
      // Corrupt/unavailable storage — start empty.
    }
    /* eslint-disable react-hooks/set-state-in-effect -- one-time hydration from web storage */
    setLines(restored.lines);
    setSoldOut(restored.soldOut);
    setHydrated(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  // Persist on change (after hydration, so we don't overwrite with the initial empty).
  React.useEffect(() => {
    if (!hydrated) return;
    try {
      const payload: PersistShape = { lines, soldOut };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore quota / privacy-mode failures.
    }
  }, [hydrated, lines, soldOut]);

  const add = React.useCallback(
    (product: Product, selected: Selection, qty = 1) => {
      const line = makeLine(product, selected, qty);
      setLines((prev) => {
        const existing = prev.find((l) => l.id === line.id);
        if (existing) {
          return prev.map((l) =>
            l.id === line.id ? { ...l, qty: l.qty + qty } : l,
          );
        }
        return [...prev, line];
      });
      // Re-adding clears any prior simulated sold-out flag for that line.
      setSoldOut((prev) => prev.filter((id) => id !== line.id));
    },
    [],
  );

  const setQty = React.useCallback((id: string, qty: number) => {
    const next = Math.max(1, Math.floor(qty) || 1);
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, qty: next } : l)));
  }, []);

  const remove = React.useCallback((id: string) => {
    setLines((prev) => prev.filter((l) => l.id !== id));
    setSoldOut((prev) => prev.filter((x) => x !== id));
  }, []);

  const restoreLine = React.useCallback((line: CartLine, index: number) => {
    setLines((prev) => {
      // Guard against a double-undo (or re-add in the meantime).
      if (prev.some((l) => l.id === line.id)) return prev;
      const next = [...prev];
      next.splice(Math.min(Math.max(0, index), next.length), 0, line);
      return next;
    });
  }, []);

  const toggleSoldOut = React.useCallback((id: string) => {
    setSoldOut((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }, []);

  const clear = React.useCallback(() => {
    setLines([]);
    setSoldOut([]);
  }, []);

  const value = React.useMemo<CartApi>(() => {
    const soldOutSet = new Set(soldOut);
    const isAvailable = (id: string) => !soldOutSet.has(id);
    const activeLines = lines.filter((l) => isAvailable(l.id));
    return {
      hydrated,
      lines,
      // Count only AVAILABLE items, matching what the subtotal actually charges
      // for — a sold-out (excluded) line shouldn't inflate the header badge.
      count: activeLines.reduce((n, l) => n + l.qty, 0),
      isAvailable,
      activeLines,
      totals: computeTotals(activeLines),
      partialPayment: computePartialPayment(activeLines),
      add,
      setQty,
      remove,
      restoreLine,
      toggleSoldOut,
      clear,
    };
  }, [hydrated, lines, soldOut, add, setQty, remove, restoreLine, toggleSoldOut, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartApi {
  const ctx = React.useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within <CartProvider>");
  return ctx;
}
