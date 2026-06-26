"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, LogOut, Package, User, UserCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth/auth-context";

/**
 * AccountNav — the header's account control. Shows a "Login" link when signed out
 * and an "Account" dropdown (My Profile / My Orders / Logout) when the mock
 * AuthContext reports a signed-in user. Until hydration it renders the signed-out
 * state (matching SSR) to avoid a hydration mismatch.
 */
export function AccountNav() {
  const auth = useAuth();
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement | null>(null);

  // Close on outside click or Escape.
  React.useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!auth.hydrated || !auth.isLoggedIn) {
    return (
      <Link
        href="/login"
        className="flex items-center gap-1.5 rounded-full p-2 font-body text-sm text-text-primary transition-colors hover:bg-surface-alt"
      >
        <User className="size-5" />
        <span className="hidden sm:inline">Login</span>
      </Link>
    );
  }

  const firstName = auth.user?.name.split(" ")[0] ?? "Account";

  function logout() {
    setOpen(false);
    auth.logout();
    router.push("/");
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 rounded-full p-2 font-body text-sm text-text-primary transition-colors hover:bg-surface-alt"
      >
        <UserCircle className="size-5" />
        <span className="hidden max-w-24 truncate sm:inline">{firstName}</span>
        <ChevronDown
          className={cn("size-4 transition-transform", open && "rotate-180")}
          aria-hidden
        />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute end-0 z-50 mt-2 w-48 overflow-hidden rounded-lg border border-keyline bg-popover p-1 shadow-lg"
        >
          <MenuLink href="/account/profile" onClick={() => setOpen(false)}>
            <UserCircle className="size-4 text-text-secondary" aria-hidden />
            My Profile
          </MenuLink>
          <MenuLink href="/account/orders" onClick={() => setOpen(false)}>
            <Package className="size-4 text-text-secondary" aria-hidden />
            My Orders
          </MenuLink>
          <div className="my-1 border-t border-keyline" />
          <button
            type="button"
            role="menuitem"
            onClick={logout}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left font-body text-sm text-destructive transition-colors hover:bg-surface-alt"
          >
            <LogOut className="size-4" aria-hidden />
            Log out
          </button>
        </div>
      ) : null}
    </div>
  );
}

function MenuLink({
  href,
  onClick,
  children,
}: {
  href: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      onClick={onClick}
      className="flex items-center gap-2 rounded-md px-3 py-2 font-body text-sm text-text-primary transition-colors hover:bg-surface-alt"
    >
      {children}
    </Link>
  );
}
