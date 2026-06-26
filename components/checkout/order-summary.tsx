"use client";

import { cn } from "@/lib/utils";
import { formatPriceFromPaise } from "@/lib/format";
import { useCart } from "@/components/cart/cart-context";

/**
 * OrderSummary — a compact, read-only recap of the active cart (collapsed line
 * items + price breakdown) for the checkout flow. Reads CartContext, so it stays
 * in sync; reused on the Address page (and the upcoming Payment page).
 */
export function OrderSummary({ className }: { className?: string }) {
  const cart = useCart();
  const { activeLines, totals } = cart;
  const itemCount = activeLines.reduce((n, l) => n + l.qty, 0);

  return (
    <div className={cn("rounded-lg border border-keyline bg-card p-5", className)}>
      <div className="flex items-baseline justify-between">
        <h2 className="font-heading text-lg font-semibold text-text-primary">
          Order summary
        </h2>
        <span className="font-body text-xs text-text-secondary">
          {itemCount} {itemCount === 1 ? "item" : "items"}
        </span>
      </div>

      <ul className="mt-4 flex flex-col gap-3">
        {activeLines.map((line) => (
          <li key={line.id} className="flex items-center gap-3">
            <div className="relative size-12 shrink-0 overflow-hidden rounded-md bg-surface-alt">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={line.imageSrc}
                alt={line.name}
                width={96}
                height={96}
                className="h-full w-full object-cover"
              />
              <span className="absolute -end-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-text-primary px-1 font-body text-xs font-semibold leading-none text-on-accent">
                {line.qty}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-body text-sm text-text-primary">
                {line.name}
              </p>
              {line.variantLabel ? (
                <p className="truncate font-body text-xs text-text-secondary">
                  {line.variantLabel}
                </p>
              ) : null}
            </div>
            <p className="font-body text-sm font-medium tabular-nums text-text-primary">
              {formatPriceFromPaise(line.unitPriceInPaise * line.qty)}
            </p>
          </li>
        ))}
      </ul>

      <dl className="mt-4 flex flex-col gap-2 border-t border-keyline pt-4 font-body text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-text-secondary">Subtotal</dt>
          <dd className="tabular-nums text-text-primary">
            {formatPriceFromPaise(totals.subtotalInPaise)}
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-text-secondary">Shipping</dt>
          <dd className="tabular-nums text-text-primary">
            {totals.shippingInPaise === 0
              ? "Free"
              : formatPriceFromPaise(totals.shippingInPaise)}
          </dd>
        </div>
        <div className="mt-2 flex items-center justify-between border-t border-keyline pt-3">
          <dt className="font-semibold text-text-primary">Total</dt>
          <dd className="font-heading text-lg font-semibold tabular-nums text-text-primary">
            {formatPriceFromPaise(totals.totalInPaise)}
          </dd>
        </div>
      </dl>
    </div>
  );
}
