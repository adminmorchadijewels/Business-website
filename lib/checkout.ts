/**
 * Checkout (delivery address) domain logic — pure, framework-free.
 *
 * Validation is client-side only for now (no backend). Pincode → City/State
 * auto-fill is deliberately OUT of scope for v1: City/State are plain manual
 * text inputs (see decisions.md). The captured `Address` is carried forward via
 * CheckoutContext so the Payment page can read it without re-entry.
 */

export type AddressType = "" | "Home" | "Work" | "Other";

export interface Address {
  fullName: string;
  phone: string;
  email: string;
  line1: string;
  line2: string; // optional
  landmark: string; // optional
  city: string;
  state: string;
  pincode: string;
  addressType: AddressType; // optional
  createAccount: boolean; // optional opt-in; never gates the form
}

export const EMPTY_ADDRESS: Address = {
  fullName: "",
  phone: "",
  email: "",
  line1: "",
  line2: "",
  landmark: "",
  city: "",
  state: "",
  pincode: "",
  addressType: "",
  createAccount: false,
};

export type AddressErrors = Partial<Record<keyof Address, string>>;

/** Required fields that gate "Continue to Payment". */
export const REQUIRED_FIELDS: (keyof Address)[] = [
  "fullName",
  "phone",
  "email",
  "line1",
  "city",
  "state",
  "pincode",
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Strip non-digits and a country/trunk prefix to the bare 10-digit mobile
 * number — but ONLY when the length proves it's a prefix, never unconditionally.
 * A bare 10-digit number that happens to start with "91" or "0" (e.g.
 * 9112345678) is left untouched; we only strip "91" off a 12-digit input and a
 * leading "0" off an 11-digit input. Anything else is returned digits-only.
 */
export function normalisePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) return digits.slice(1);
  return digits;
}

/** Field-level validation. Returns a map of field → message (empty = valid). */
export function validateAddress(a: Address): AddressErrors {
  const e: AddressErrors = {};

  if (!a.fullName.trim()) e.fullName = "Enter your full name.";

  if (!a.phone.trim()) {
    e.phone = "Enter a phone number.";
  } else if (!/^[6-9]\d{9}$/.test(normalisePhone(a.phone))) {
    e.phone = "Enter a valid 10-digit mobile number.";
  }

  if (!a.email.trim()) {
    e.email = "Enter an email address.";
  } else if (!EMAIL_RE.test(a.email.trim())) {
    e.email = "Enter a valid email address.";
  }

  if (!a.line1.trim()) e.line1 = "Enter your address.";
  if (!a.city.trim()) e.city = "Enter your city.";
  if (!a.state.trim()) e.state = "Enter your state.";

  if (!a.pincode.trim()) {
    e.pincode = "Enter your pincode.";
  } else if (!/^[1-9]\d{5}$/.test(a.pincode.trim())) {
    e.pincode = "Enter a valid 6-digit pincode.";
  }

  return e;
}

export function isAddressValid(a: Address): boolean {
  return Object.keys(validateAddress(a)).length === 0;
}

// ---------------------------------------------------------------- Order / payment

/** Placeholder delivery estimate — TBD pending real fulfilment SLAs. */
export const ESTIMATED_DELIVERY = "5–7 business days";

export type PaymentMethod = "full-online" | "cod" | "deposit";

/** A line snapshot stored on the order, so confirmation/tracking don't depend
 *  on the (soon-cleared) cart still holding items. */
export interface OrderLineSnapshot {
  name: string;
  variantLabel?: string;
  imageSrc: string;
  qty: number;
  unitPriceInPaise: number;
  isCustomisable: boolean;
}

export interface PlacedOrder {
  orderId: string;
  placedAt: string; // ISO timestamp (stamped at place time)
  method: PaymentMethod;
  /** Amount paid online now (full or deposit; 0 for COD). */
  paidNowInPaise: number;
  /** Amount still due — on delivery (COD) or as the balance after a deposit. */
  balanceDueInPaise: number;
  totalInPaise: number;
  lines: OrderLineSnapshot[];
  address: Address;
  /** True if any line is a made-to-order item (drives "what happens next" copy). */
  hasCustomised: boolean;
  estimatedDelivery: string;
}

/** Split a total into paid-now / balance-due for the chosen method. */
export function paymentSplit(
  method: PaymentMethod,
  totalInPaise: number,
  depositInPaise: number,
): { paidNowInPaise: number; balanceDueInPaise: number } {
  switch (method) {
    case "full-online":
      return { paidNowInPaise: totalInPaise, balanceDueInPaise: 0 };
    case "cod":
      return { paidNowInPaise: 0, balanceDueInPaise: totalInPaise };
    case "deposit":
      return {
        paidNowInPaise: depositInPaise,
        balanceDueInPaise: Math.max(0, totalInPaise - depositInPaise),
      };
  }
}

const ID_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous 0/O/1/I

/** Mock order reference, e.g. "ORD-7K2P-9QX4". Prefix is a placeholder until
 *  real brand initials are decided. */
export function generateOrderId(): string {
  const block = () =>
    Array.from(
      { length: 4 },
      () => ID_ALPHABET[Math.floor(Math.random() * ID_ALPHABET.length)],
    ).join("");
  return `ORD-${block()}-${block()}`;
}
