/**
 * Mock auth domain logic — pure, framework-free. There's no real Supabase Auth /
 * OTP-SMS provider yet (a future session), so the whole login flow is simulated:
 * any phone can request an OTP and the single fixed `MOCK_OTP` verifies it. The
 * captured user is held in AuthContext (sessionStorage), the same throwaway
 * pattern as the cart/checkout state; replaced by real auth once the backend lands.
 */

import { normalisePhone } from "@/lib/checkout";

/** The only OTP that "verifies" in demo mode. Surfaced in the UI hint. */
export const MOCK_OTP = "123456";

/** Resend cooldown (seconds) — cosmetic countdown in this mock version. */
export const OTP_RESEND_SECONDS = 30;

/** A shipping address saved on the user's profile (distinct from a checkout entry). */
export interface SavedAddress {
  id: string;
  /** Optional short label, e.g. "Home" / "Work". */
  label: string;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export interface MockUser {
  id: string;
  name: string;
  /** Normalised 10-digit phone — tied to OTP auth, so it's read-only in the UI. */
  phone: string;
  email: string;
  addresses: SavedAddress[];
}

export { normalisePhone };

/** True when a string is a plausible 10-digit Indian mobile (post-normalise). */
export function isValidPhone(raw: string): boolean {
  return /^[6-9]\d{9}$/.test(normalisePhone(raw));
}

/** True when the entered code matches the mock OTP (ignores spaces). */
export function isValidOtp(code: string): boolean {
  return code.replace(/\s/g, "") === MOCK_OTP;
}

const ID_ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";

function randomId(prefix: string): string {
  const block = Array.from(
    { length: 8 },
    () => ID_ALPHABET[Math.floor(Math.random() * ID_ALPHABET.length)],
  ).join("");
  return `${prefix}_${block}`;
}

/** Build a fresh user record for a first-time (mock) signup. */
export function makeNewUser(phone: string, name: string): MockUser {
  return {
    id: randomId("usr"),
    name: name.trim(),
    phone: normalisePhone(phone),
    email: "",
    addresses: [],
  };
}

/** Generate an id for a newly-added saved address. */
export function newAddressId(): string {
  return randomId("adr");
}
