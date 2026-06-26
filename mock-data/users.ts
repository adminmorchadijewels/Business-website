import type { MockUser } from "@/lib/auth";
import { normalisePhone } from "@/lib/checkout";

/**
 * Tiny registry of "known" mock users, so the login flow can demonstrate the
 * returning-user path (phone matches → log straight in) vs the new-user path
 * (unknown phone → ask for a name → create the account). No backend yet — this
 * stands in for a real users table until Supabase Auth lands.
 *
 * `9876543210` (Aisha) is wired to own several entries in `mock-data/orders.ts`,
 * so signing in with that number populates My Orders; any other number is treated
 * as a brand-new user with an empty order history.
 */
export const mockUsers: MockUser[] = [
  {
    id: "usr_aisha",
    name: "Aisha Rahman",
    phone: "9876543210",
    email: "aisha.rahman@example.com",
    addresses: [
      {
        id: "adr_aisha_home",
        label: "Home",
        fullName: "Aisha Rahman",
        phone: "9876543210",
        line1: "12 Marine Drive",
        line2: "Flat 4B",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400020",
        isDefault: true,
      },
      {
        id: "adr_aisha_work",
        label: "Work",
        fullName: "Aisha Rahman",
        phone: "9876543210",
        line1: "Nariman Point, Tower 2",
        line2: "9th Floor",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400021",
        isDefault: false,
      },
    ],
  },
];

/** Find a known user by phone (returns a deep copy so callers can't mutate the
 *  registry). Returns null for an unknown number → treated as a new signup. */
export function findUserByPhone(phone: string): MockUser | null {
  const ph = normalisePhone(phone);
  const found = mockUsers.find((u) => u.phone === ph);
  return found ? structuredClone(found) : null;
}
