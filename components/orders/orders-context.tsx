"use client";

import * as React from "react";

import {
  mockOrders,
  placedToTracked,
  ordersForPhone as filterForPhone,
  findOrder as findInPool,
  type TrackedOrder,
  type OrderStatus,
  type CancellationOutcome,
} from "@/mock-data/orders";
import { useCheckout } from "@/components/checkout/checkout-context";

/**
 * OrdersContext — the single source of truth for order-STATUS mutations (today
 * just cancellation) across every order surface: Order Confirmation, Track
 * Order, and My Orders all read and write through here, so a cancellation made
 * from any one of them is immediately consistent in the others with no reload.
 *
 * ⚠️ MOCK-DATA-ERA PATTERN — see decisions.md ("Shared order-state ownership").
 * There is no backend yet, so the static `mockOrders` array + the session's
 * just-placed order are immutable. To make status mutable we keep a small map of
 * per-order OVERRIDES (keyed by orderId), persisted to sessionStorage, and layer
 * it over the base pool at read time. When Supabase lands, this whole provider
 * is replaced by real order reads + an UPDATE on the orders row; the override
 * map and its sessionStorage persistence go away.
 */

const STORAGE_KEY = "daylight-orders-v1";

/** A status mutation layered over a base order (the only writable bits today). */
export interface OrderMutation {
  status: OrderStatus;
  cancellationOutcome?: CancellationOutcome;
  refundAmountInPaise?: number;
  forfeitedAmountInPaise?: number;
}

type Overrides = Record<string, OrderMutation>;

export interface OrdersApi {
  hydrated: boolean;
  /** The full visible pool (session order + mocks) with overrides applied. */
  allOrders: TrackedOrder[];
  /** This phone's orders, most recent first (overrides applied). */
  ordersForPhone: (phone: string) => TrackedOrder[];
  /** Lookup by id + phone (overrides applied) — the Track Order match. */
  findOrder: (orderId: string, phone: string) => TrackedOrder | null;
  /** Lookup by id alone (overrides applied) — the Confirmation page read. */
  getOrder: (orderId: string) => TrackedOrder | null;
  /** Apply a cancellation (or any status mutation) and persist it. */
  cancelOrder: (orderId: string, mutation: OrderMutation) => void;
}

const OrdersContext = React.createContext<OrdersApi | null>(null);

/** Layer a stored mutation over a base order (returns the base unchanged if none). */
function applyOverride(o: TrackedOrder, m?: OrderMutation): TrackedOrder {
  if (!m) return o;
  return {
    ...o,
    status: m.status,
    cancellationOutcome: m.cancellationOutcome,
    refundAmountInPaise: m.refundAmountInPaise,
    forfeitedAmountInPaise: m.forfeitedAmountInPaise,
  };
}

export function OrdersProvider({ children }: { children: React.ReactNode }) {
  // The session's placed order lives in CheckoutContext (provider is nested
  // inside it in the layout), so we can fold it into the readable pool here.
  const checkout = useCheckout();
  const [overrides, setOverrides] = React.useState<Overrides>({});
  const [hydrated, setHydrated] = React.useState(false);

  // One-time hydration from sessionStorage (post-mount to avoid SSR mismatch).
  React.useEffect(() => {
    let restored: Overrides = {};
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) restored = JSON.parse(raw) as Overrides;
    } catch {
      // Corrupt/unavailable storage — start empty.
    }
    /* eslint-disable react-hooks/set-state-in-effect -- one-time hydration from web storage */
    setOverrides(restored);
    setHydrated(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  React.useEffect(() => {
    if (!hydrated) return;
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
    } catch {
      // Ignore quota / privacy-mode failures.
    }
  }, [hydrated, overrides]);

  // Base pool: the session's just-placed order (normalised) + the static mocks.
  const basePool = React.useMemo<TrackedOrder[]>(() => {
    const session = checkout.order ? [placedToTracked(checkout.order)] : [];
    return [...session, ...mockOrders];
  }, [checkout.order]);

  // The readable pool, with status overrides applied.
  const allOrders = React.useMemo<TrackedOrder[]>(
    () => basePool.map((o) => applyOverride(o, overrides[o.orderId])),
    [basePool, overrides],
  );

  const cancelOrder = React.useCallback(
    (orderId: string, mutation: OrderMutation) => {
      setOverrides((prev) => ({ ...prev, [orderId]: mutation }));
    },
    [],
  );

  const value = React.useMemo<OrdersApi>(
    () => ({
      hydrated,
      allOrders,
      ordersForPhone: (phone) => filterForPhone(allOrders, phone),
      findOrder: (orderId, phone) => findInPool(allOrders, orderId, phone),
      getOrder: (orderId) =>
        allOrders.find(
          (o) => o.orderId.toUpperCase() === orderId.trim().toUpperCase(),
        ) ?? null,
      cancelOrder,
    }),
    [hydrated, allOrders, cancelOrder],
  );

  return (
    <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>
  );
}

export function useOrders(): OrdersApi {
  const ctx = React.useContext(OrdersContext);
  if (!ctx) throw new Error("useOrders must be used within <OrdersProvider>");
  return ctx;
}
