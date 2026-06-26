import { categoryImage } from "@/mock-data/images";
import { formatPriceFromPaise } from "@/lib/format";
import {
  normalisePhone,
  type PaymentMethod,
  type PlacedOrder,
} from "@/lib/checkout";

/**
 * Mock "placed orders" for the order pages. There's no backend yet, so the
 * order pages look up against this small fixed set (plus the current session's
 * just-placed order, normalised by `placedToTracked`). Replace with a real
 * orders query once Supabase lands.
 *
 * `TrackedOrder` is the ONE canonical order shape every order surface renders
 * (Confirmation, Track Order, My Orders) — see `components/orders/order-detail`.
 */

/**
 * `cancelled` is a terminal/off-track state — deliberately NOT one of the four
 * linear tracker steps (see `ORDER_STATUS_STEPS`). A cancelled order replaces
 * the step tracker with a status banner instead.
 */
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled";

/** Ordered tracker stages — the linear progression only (no `cancelled`). */
export const ORDER_STATUS_STEPS: { key: OrderStatus; label: string }[] = [
  { key: "pending", label: "Pending" },
  { key: "confirmed", label: "Confirmed" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
];

/**
 * What happened to the money when an order was cancelled. Stored as structured
 * data (outcome + numeric amount) so the post-cancel banner renders real numbers
 * rather than re-deriving them from a display string.
 */
export type CancellationOutcome = "refunded" | "forfeited" | "no_charge";

export interface TrackedItem {
  name: string;
  variantLabel?: string;
  imageSrc?: string;
  qty: number;
  unitPriceInPaise: number;
}

export interface TrackedOrder {
  orderId: string;
  /** Normalised 10-digit phone used for the lookup match. */
  phone: string;
  /** ISO date the order was placed — drives the My Orders date + sort. */
  placedAt: string;
  status: OrderStatus;
  items: TrackedItem[];
  // --- Structured payment fields (the source of truth for amounts) -----------
  // These carry the same real numbers PlacedOrder/CartLine already compute, so
  // every surface can render exact figures (and the cancellation flow can decide
  // refund/forfeit amounts) without parsing a display string.
  method: PaymentMethod;
  /** Deposit paid up-front on a partial-payment order (paise); 0 otherwise. */
  depositInPaise: number;
  /** Amount paid online now (full or deposit; 0 for COD). */
  paidNowInPaise: number;
  /** Amount still due on delivery — the balance (or full total for COD). */
  balanceDueInPaise: number;
  /** True if any line is a made-to-order item (drives "what happens next" copy). */
  hasCustomised: boolean;
  // --- Cancellation outcome (set only once status === "cancelled") -----------
  cancellationOutcome?: CancellationOutcome;
  /** Refund issued on cancel (paise) — set when outcome === "refunded". */
  refundAmountInPaise?: number;
  /** Deposit forfeited on cancel (paise) — set when outcome === "forfeited". */
  forfeitedAmountInPaise?: number;
  address: {
    fullName: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
  };
  estimatedDelivery: string;
}

export const mockOrders: TrackedOrder[] = [
  {
    orderId: "ORD-7K2P-9QX4",
    phone: "9876543210",
    placedAt: "2026-06-18",
    status: "shipped",
    items: [
      {
        name: "Aria Huggie Hoops",
        variantLabel: "Rose Gold",
        imageSrc: categoryImage("earrings", 1),
        qty: 1,
        unitPriceInPaise: 94900,
      },
      {
        name: "Mira Pearl Drops",
        imageSrc: categoryImage("earrings", 4),
        qty: 1,
        unitPriceInPaise: 134900,
      },
    ],
    method: "full-online",
    depositInPaise: 0,
    paidNowInPaise: 229800,
    balanceDueInPaise: 0,
    hasCustomised: false,
    address: {
      fullName: "Aisha Rahman",
      line1: "12 Marine Drive",
      line2: "Flat 4B",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400020",
    },
    estimatedDelivery: "Arriving in 2–3 days",
  },
  {
    orderId: "ORD-3F8M-2WL7",
    phone: "9123456780",
    placedAt: "2026-06-10",
    status: "confirmed",
    items: [
      {
        name: "Initial Ring — Letter A",
        variantLabel: "Ring size 7",
        imageSrc: categoryImage("rings", 3),
        qty: 1,
        unitPriceInPaise: 159900,
      },
    ],
    method: "deposit",
    depositInPaise: 50000,
    paidNowInPaise: 50000,
    balanceDueInPaise: 109900,
    hasCustomised: true,
    address: {
      fullName: "Priya Menon",
      line1: "88 Residency Road",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560025",
    },
    estimatedDelivery: "5–7 business days",
  },
  {
    orderId: "ORD-5T9C-6HB1",
    phone: "9988776655",
    placedAt: "2026-04-15",
    status: "delivered",
    items: [
      {
        name: "Halo Bangle",
        imageSrc: categoryImage("bangles", 0),
        qty: 2,
        unitPriceInPaise: 119900,
      },
    ],
    method: "cod",
    depositInPaise: 0,
    paidNowInPaise: 0,
    balanceDueInPaise: 239800,
    hasCustomised: false,
    address: {
      fullName: "Neha Kapoor",
      line1: "5 Civil Lines",
      city: "Jaipur",
      state: "Rajasthan",
      pincode: "302006",
    },
    estimatedDelivery: "Delivered",
  },
  {
    orderId: "ORD-2A4D-8KP3",
    phone: "9000000001",
    placedAt: "2026-06-23",
    status: "pending",
    items: [
      {
        name: "Custom Name Necklace",
        imageSrc: categoryImage("necklaces", 0),
        qty: 1,
        unitPriceInPaise: 189900,
      },
    ],
    method: "deposit",
    depositInPaise: 70000,
    paidNowInPaise: 70000,
    balanceDueInPaise: 119900,
    hasCustomised: true,
    address: {
      fullName: "Riya Shah",
      line1: "27 Satellite Road",
      city: "Ahmedabad",
      state: "Gujarat",
      pincode: "380015",
    },
    estimatedDelivery: "5–7 business days",
  },
  // --- Orders owned by the signed-in mock user (Aisha, 9876543210) -----------
  // Together with ORD-7K2P above, these populate /account/orders for Aisha.
  {
    orderId: "ORD-9M3X-4RT8",
    phone: "9876543210",
    placedAt: "2026-06-22",
    status: "confirmed",
    items: [
      {
        name: "Lumen Drop Earrings",
        variantLabel: "Yellow Gold",
        imageSrc: categoryImage("earrings", 2),
        qty: 1,
        unitPriceInPaise: 174900,
      },
    ],
    method: "full-online",
    depositInPaise: 0,
    paidNowInPaise: 174900,
    balanceDueInPaise: 0,
    hasCustomised: false,
    address: {
      fullName: "Aisha Rahman",
      line1: "12 Marine Drive",
      line2: "Flat 4B",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400020",
    },
    estimatedDelivery: "5–7 business days",
  },
  {
    orderId: "ORD-6B1Q-3ZN5",
    phone: "9876543210",
    placedAt: "2026-05-02",
    status: "delivered",
    items: [
      {
        name: "Petal Stud Earrings",
        imageSrc: categoryImage("earrings", 5),
        qty: 1,
        unitPriceInPaise: 84900,
      },
      {
        name: "Halo Bangle",
        imageSrc: categoryImage("bangles", 0),
        qty: 1,
        unitPriceInPaise: 119900,
      },
    ],
    method: "full-online",
    depositInPaise: 0,
    paidNowInPaise: 204800,
    balanceDueInPaise: 0,
    hasCustomised: false,
    address: {
      fullName: "Aisha Rahman",
      line1: "12 Marine Drive",
      line2: "Flat 4B",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400020",
    },
    estimatedDelivery: "Delivered",
  },
];

/** Total of an order's line items (paise) — for the My Orders summary row. */
export function orderTotalInPaise(order: TrackedOrder): number {
  return order.items.reduce((sum, i) => sum + i.unitPriceInPaise * i.qty, 0);
}

/**
 * Human-readable payment status line, DERIVED from the structured payment
 * fields (never the source of truth for amounts). Used by the My Orders list
 * row and the OrderDetail payment card.
 */
export function paymentLabelFor(o: TrackedOrder): string {
  switch (o.method) {
    case "full-online":
      return `Paid ${formatPriceFromPaise(o.paidNowInPaise)} via PhonePe.`;
    case "deposit":
      return `Paid ${formatPriceFromPaise(
        o.depositInPaise,
      )} deposit. Balance ${formatPriceFromPaise(
        o.balanceDueInPaise,
      )} due on delivery (COD).`;
    case "cod":
      // Past tense once delivered (it's been paid), future tense before then.
      return o.status === "delivered"
        ? `Paid ${formatPriceFromPaise(o.balanceDueInPaise)} on delivery (COD).`
        : `Pay ${formatPriceFromPaise(o.balanceDueInPaise)} on delivery (COD).`;
  }
}

/** Display label for a status, incl. the off-track "Cancelled" terminal state. */
export function orderStatusLabel(status: OrderStatus): string {
  if (status === "cancelled") return "Cancelled";
  return ORDER_STATUS_STEPS.find((s) => s.key === status)?.label ?? status;
}

/** Format an ISO order date as e.g. "18 Jun 2026" (deterministic — UTC). */
export function formatOrderDate(iso: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
}

/**
 * Normalise the session's just-placed order (a `PlacedOrder`) into the canonical
 * `TrackedOrder` shape, so the same renderer + the same lookup work for it. The
 * single conversion point — used by both OrdersContext and the order pages.
 */
export function placedToTracked(o: PlacedOrder): TrackedOrder {
  return {
    orderId: o.orderId,
    phone: normalisePhone(o.address.phone),
    placedAt: o.placedAt,
    // Mock: online-paid orders are "confirmed"; COD-only starts "pending".
    status: o.method === "cod" ? "pending" : "confirmed",
    items: o.lines.map((l) => ({
      name: l.name,
      variantLabel: l.variantLabel,
      imageSrc: l.imageSrc,
      qty: l.qty,
      unitPriceInPaise: l.unitPriceInPaise,
    })),
    method: o.method,
    // For a deposit order the amount paid now IS the deposit; 0 otherwise.
    depositInPaise: o.method === "deposit" ? o.paidNowInPaise : 0,
    paidNowInPaise: o.paidNowInPaise,
    balanceDueInPaise: o.balanceDueInPaise,
    hasCustomised: o.hasCustomised,
    address: {
      fullName: o.address.fullName,
      line1: o.address.line1,
      line2: o.address.line2 || undefined,
      city: o.address.city,
      state: o.address.state,
      pincode: o.address.pincode,
    },
    estimatedDelivery: o.estimatedDelivery,
  };
}

/** A user's orders within a pool, most recent first (matched by normalised phone). */
export function ordersForPhone(
  orders: TrackedOrder[],
  phone: string,
): TrackedOrder[] {
  const ph = normalisePhone(phone);
  return orders
    .filter((o) => o.phone === ph)
    .sort((a, b) => (a.placedAt < b.placedAt ? 1 : -1));
}

/**
 * Look up an order by id + phone within a pool. Single match required on BOTH
 * (the page shows one generic error on any failure — never revealing which field
 * was wrong).
 */
export function findOrder(
  orders: TrackedOrder[],
  orderId: string,
  phone: string,
): TrackedOrder | null {
  const id = orderId.trim().toUpperCase();
  const ph = normalisePhone(phone);
  if (!id || !ph) return null;
  return (
    orders.find((o) => o.orderId.toUpperCase() === id && o.phone === ph) ?? null
  );
}
