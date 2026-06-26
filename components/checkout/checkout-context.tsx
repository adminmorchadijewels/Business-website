"use client";

import * as React from "react";

import type { Address, PlacedOrder } from "@/lib/checkout";

/**
 * CheckoutContext — holds the delivery address captured on the Address page
 * (read by Payment) and the PlacedOrder produced by Payment (read by the Order
 * Confirmation page). Kept adjacent to (not merged into) CartContext: the cart
 * is the line-item concern, checkout is the fulfilment concern. sessionStorage-
 * backed, same as the cart; replaced by server-side checkout state once the
 * backend lands.
 */

const STORAGE_KEY = "daylight-checkout-v1";

interface PersistShape {
  address: Address | null;
  order: PlacedOrder | null;
}

export interface CheckoutApi {
  hydrated: boolean;
  address: Address | null;
  setAddress: (address: Address) => void;
  clearAddress: () => void;
  /** The most recently placed order (snapshot) — for the confirmation page. */
  order: PlacedOrder | null;
  setOrder: (order: PlacedOrder) => void;
  clearOrder: () => void;
}

const CheckoutContext = React.createContext<CheckoutApi | null>(null);

export function CheckoutProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddressState] = React.useState<Address | null>(null);
  const [order, setOrderState] = React.useState<PlacedOrder | null>(null);
  const [hydrated, setHydrated] = React.useState(false);

  // One-time hydration from sessionStorage (post-mount to avoid SSR mismatch).
  React.useEffect(() => {
    let restored: Partial<PersistShape> = {};
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) restored = JSON.parse(raw) as Partial<PersistShape>;
    } catch {
      // Corrupt/unavailable storage — start empty.
    }
    /* eslint-disable react-hooks/set-state-in-effect -- one-time hydration from web storage */
    setAddressState(restored.address ?? null);
    setOrderState(restored.order ?? null);
    setHydrated(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  React.useEffect(() => {
    if (!hydrated) return;
    try {
      const payload: PersistShape = { address, order };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore quota / privacy-mode failures.
    }
  }, [hydrated, address, order]);

  const setAddress = React.useCallback((next: Address) => setAddressState(next), []);
  const clearAddress = React.useCallback(() => setAddressState(null), []);
  const setOrder = React.useCallback((next: PlacedOrder) => setOrderState(next), []);
  const clearOrder = React.useCallback(() => setOrderState(null), []);

  const value = React.useMemo<CheckoutApi>(
    () => ({
      hydrated,
      address,
      setAddress,
      clearAddress,
      order,
      setOrder,
      clearOrder,
    }),
    [hydrated, address, setAddress, clearAddress, order, setOrder, clearOrder],
  );

  return (
    <CheckoutContext.Provider value={value}>{children}</CheckoutContext.Provider>
  );
}

export function useCheckout(): CheckoutApi {
  const ctx = React.useContext(CheckoutContext);
  if (!ctx) throw new Error("useCheckout must be used within <CheckoutProvider>");
  return ctx;
}
