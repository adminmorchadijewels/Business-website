"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";

import { useCart } from "@/components/cart/cart-context";

/**
 * Header bag button with a live item-count badge, linking to /cart. Client
 * component (reads cart context); the count only appears once there's at least
 * one item (and after hydration), so SSR shows a clean bag with no badge.
 */
export function CartBagButton() {
  const { count } = useCart();
  return (
    <Link
      href="/cart"
      aria-label={count > 0 ? `Bag, ${count} item${count === 1 ? "" : "s"}` : "Bag"}
      className="relative rounded-full p-2 transition-colors hover:bg-surface-alt"
    >
      <ShoppingBag className="size-5" />
      {count > 0 ? (
        <span className="absolute -end-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 font-body text-xs font-semibold leading-none text-on-accent">
          {count}
        </span>
      ) : null}
    </Link>
  );
}
