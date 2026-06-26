"use client";

import * as React from "react";

import {
  type MockUser,
  type SavedAddress,
  newAddressId,
} from "@/lib/auth";

/**
 * AuthContext — the mock signed-in user. Holds the user produced by the Login
 * page's simulated OTP flow and exposes the profile/saved-address mutations the
 * Account pages consume. sessionStorage-backed, the same throwaway pattern as
 * CartContext / CheckoutContext (a mock session shouldn't linger across browser
 * sessions); replaced by real Supabase Auth + a server session later.
 */

const STORAGE_KEY = "daylight-auth-v1";

export interface AuthApi {
  hydrated: boolean;
  user: MockUser | null;
  isLoggedIn: boolean;
  /** Complete a (mock) sign-in / sign-up by setting the active user. */
  login: (user: MockUser) => void;
  logout: () => void;
  /** Patch editable profile fields (phone stays read-only — tied to OTP auth). */
  updateProfile: (patch: Partial<Pick<MockUser, "name" | "email">>) => void;
  addAddress: (address: Omit<SavedAddress, "id">) => void;
  updateAddress: (id: string, patch: Partial<Omit<SavedAddress, "id">>) => void;
  removeAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
}

const AuthContext = React.createContext<AuthApi | null>(null);

/** Guarantee exactly one default address (or none, when the list is empty). */
function normaliseDefault(addresses: SavedAddress[], preferId?: string): SavedAddress[] {
  if (addresses.length === 0) return addresses;
  const hasDefault = addresses.some((a) => a.isDefault);
  const defaultId =
    preferId ?? (hasDefault ? addresses.find((a) => a.isDefault)!.id : addresses[0].id);
  return addresses.map((a) => ({ ...a, isDefault: a.id === defaultId }));
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<MockUser | null>(null);
  const [hydrated, setHydrated] = React.useState(false);

  // One-time hydration from sessionStorage (post-mount, to avoid SSR mismatch).
  React.useEffect(() => {
    let restored: MockUser | null = null;
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) restored = JSON.parse(raw) as MockUser;
    } catch {
      // Corrupt/unavailable storage — start logged out.
    }
    /* eslint-disable react-hooks/set-state-in-effect -- one-time hydration from web storage */
    setUser(restored);
    setHydrated(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  React.useEffect(() => {
    if (!hydrated) return;
    try {
      if (user) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      else sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore quota / privacy-mode failures.
    }
  }, [hydrated, user]);

  const login = React.useCallback((next: MockUser) => {
    setUser({ ...next, addresses: normaliseDefault(next.addresses) });
  }, []);

  const logout = React.useCallback(() => setUser(null), []);

  const updateProfile = React.useCallback(
    (patch: Partial<Pick<MockUser, "name" | "email">>) =>
      setUser((prev) => (prev ? { ...prev, ...patch } : prev)),
    [],
  );

  const addAddress = React.useCallback((address: Omit<SavedAddress, "id">) => {
    setUser((prev) => {
      if (!prev) return prev;
      const entry: SavedAddress = { ...address, id: newAddressId() };
      // First address is always the default; respect an explicit isDefault flag.
      const makeDefault = prev.addresses.length === 0 || address.isDefault;
      const addresses = normaliseDefault(
        [...prev.addresses, entry],
        makeDefault ? entry.id : undefined,
      );
      return { ...prev, addresses };
    });
  }, []);

  const updateAddress = React.useCallback(
    (id: string, patch: Partial<Omit<SavedAddress, "id">>) => {
      setUser((prev) => {
        if (!prev) return prev;
        const addresses = normaliseDefault(
          prev.addresses.map((a) => (a.id === id ? { ...a, ...patch, id } : a)),
          patch.isDefault ? id : undefined,
        );
        return { ...prev, addresses };
      });
    },
    [],
  );

  const removeAddress = React.useCallback((id: string) => {
    setUser((prev) => {
      if (!prev) return prev;
      // Drop it, then re-establish a default if we removed the default one.
      const addresses = normaliseDefault(prev.addresses.filter((a) => a.id !== id));
      return { ...prev, addresses };
    });
  }, []);

  const setDefaultAddress = React.useCallback((id: string) => {
    setUser((prev) =>
      prev ? { ...prev, addresses: normaliseDefault(prev.addresses, id) } : prev,
    );
  }, []);

  const value = React.useMemo<AuthApi>(
    () => ({
      hydrated,
      user,
      isLoggedIn: !!user,
      login,
      logout,
      updateProfile,
      addAddress,
      updateAddress,
      removeAddress,
      setDefaultAddress,
    }),
    [
      hydrated,
      user,
      login,
      logout,
      updateProfile,
      addAddress,
      updateAddress,
      removeAddress,
      setDefaultAddress,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthApi {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
