"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  Info,
  Minus,
  Plus,
  RotateCcw,
  ShoppingBag,
  Truck,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { formatPriceFromPaise } from "@/lib/format";
import type { CartLine } from "@/lib/cart";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { useCart } from "@/components/cart/cart-context";

/**
 * /cart — review line items, adjust quantities, see the price breakdown, the
 * free-shipping nudge, and the mixed-cart partial-payment eligibility message.
 * All state lives in CartContext (sessionStorage-backed); this page is purely a
 * view over it. Mock data — no real checkout yet.
 */
export default function CartPage() {
  const cart = useCart();

  // Undo affordance for removals — owned here (not in CartBody) so the toast
  // survives removing the LAST line, which swaps CartBody out for <EmptyCart>.
  const [undo, setUndo] = React.useState<{ line: CartLine; index: number } | null>(
    null,
  );
  const undoTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearUndoTimer = React.useCallback(() => {
    if (undoTimer.current) {
      clearTimeout(undoTimer.current);
      undoTimer.current = null;
    }
  }, []);
  React.useEffect(() => clearUndoTimer, [clearUndoTimer]);

  function requestRemove(line: CartLine) {
    const index = cart.lines.findIndex((l) => l.id === line.id);
    cart.remove(line.id);
    clearUndoTimer();
    setUndo({ line, index: index < 0 ? 0 : index });
    // Auto-dismiss; the removal stands if not undone in time.
    undoTimer.current = setTimeout(() => setUndo(null), 6000);
  }
  function undoRemove() {
    if (!undo) return;
    cart.restoreLine(undo.line, undo.index);
    clearUndoTimer();
    setUndo(null);
  }
  function dismissUndo() {
    clearUndoTimer();
    setUndo(null);
  }

  return (
    <main className="flex-1 py-10 sm:py-12">
      <div className="mx-auto w-full max-w-6xl px-6">
        <SectionHeading as="h1" eyebrow="Cart" className="mb-8">
          Your Cart
        </SectionHeading>

        {/* Avoid an empty-state flash before sessionStorage hydrates. */}
        {!cart.hydrated ? (
          <div className="min-h-64" aria-busy />
        ) : cart.lines.length === 0 ? (
          <EmptyCart />
        ) : (
          <CartBody onRequestRemove={requestRemove} />
        )}
      </div>

      {undo ? (
        <UndoToast line={undo.line} onUndo={undoRemove} onDismiss={dismissUndo} />
      ) : null}
    </main>
  );
}

/** Transient bottom-centre toast with an Undo for a just-removed cart line.
 *  No toast library — a small token-styled element, consistent with the
 *  project's "no dependency for a few lines of UI" precedent (Marquee, Reveal). */
function UndoToast({
  line,
  onUndo,
  onDismiss,
}: {
  line: CartLine;
  onUndo: () => void;
  onDismiss: () => void;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-0 bottom-6 z-50 flex justify-center px-4 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-300"
    >
      <div className="flex items-center gap-3 rounded-lg border border-keyline bg-card px-4 py-3 shadow-lg">
        <p className="font-body text-sm text-text-primary">
          Removed <span className="font-medium">{line.name}</span>
        </p>
        <button
          type="button"
          onClick={onUndo}
          className="inline-flex items-center gap-1.5 rounded-sm font-body text-sm font-semibold text-accent underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <RotateCcw className="size-3.5" aria-hidden />
          Undo
        </button>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="-mr-1 rounded-full p-1 text-text-secondary transition-colors hover:bg-surface-alt hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}

function EmptyCart() {
  return (
    <Reveal className="flex flex-col items-center justify-center rounded-lg border border-keyline bg-card px-6 py-20 text-center">
      <span className="grid size-14 place-items-center rounded-full bg-surface-alt text-text-secondary">
        <ShoppingBag className="size-6" />
      </span>
      <p className="mt-5 font-heading text-lg text-text-primary">
        Your cart is empty
      </p>
      <p className="mt-2 max-w-sm font-body text-sm text-text-secondary">
        Nothing here yet — explore the collection and add a piece or two.
      </p>
      <Button
        variant="outline"
        size="lg"
        className="mt-6 rounded-sm"
        render={<Link href="/shop" />}
      >
        Continue Shopping
        <ArrowRight />
      </Button>
    </Reveal>
  );
}

function CartBody({
  onRequestRemove,
}: {
  onRequestRemove: (line: CartLine) => void;
}) {
  const cart = useCart();
  const { totals, partialPayment } = cart;
  const hasActive = cart.activeLines.length > 0;

  return (
    <div className="lg:flex lg:items-start lg:gap-10">
      {/* Line items */}
      <Reveal className="min-w-0 lg:flex-1">
        {/* There are lines, but every one is unavailable: state it plainly (the
            same "can't proceed" condition the checkout guards on — activeLines). */}
        {!hasActive ? (
          <div className="mb-4 flex gap-2.5 rounded-md border border-keyline bg-surface-alt p-3">
            <AlertCircle
              className="mt-0.5 size-4 shrink-0 text-text-secondary"
              aria-hidden
            />
            <p className="font-body text-sm leading-relaxed text-text-secondary">
              All items in your cart are currently unavailable. Remove them or add
              something else to continue.
            </p>
          </div>
        ) : null}
        <ul className="flex flex-col divide-y divide-keyline border-y border-keyline">
          {cart.lines.map((line) => (
            <CartLineRow
              key={line.id}
              line={line}
              onRemove={() => onRequestRemove(line)}
            />
          ))}
        </ul>
      </Reveal>

      {/* Order summary */}
      <Reveal className="mt-8 lg:mt-0 lg:w-80 lg:shrink-0">
        <div className="lg:sticky lg:top-24">
          <div className="rounded-lg border border-keyline bg-card p-5">
            <h2 className="font-heading text-lg font-semibold text-text-primary">
              Order summary
            </h2>

            {/* Free-shipping nudge + progress (shown when there are active items).
                Threshold is a PLACEHOLDER (₹999) — TBD pending business decision. */}
            {hasActive ? (
              <div className="mt-4 rounded-md bg-surface-warm p-3">
                {totals.freeShippingMet ? (
                  <p className="flex items-center gap-2 font-body text-sm font-medium text-text-primary">
                    <Truck className="size-4 text-accent" aria-hidden />
                    You&apos;ve unlocked free shipping!
                  </p>
                ) : (
                  <>
                    <p className="flex items-center gap-2 font-body text-sm text-text-primary">
                      <Truck className="size-4 text-accent" aria-hidden />
                      Add {formatPriceFromPaise(totals.remainingForFreeInPaise)}{" "}
                      more for FREE shipping!
                    </p>
                    <div
                      className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-alt"
                      role="progressbar"
                      aria-valuenow={totals.progressPct}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    >
                      <div
                        className="h-full rounded-full bg-accent transition-all duration-300"
                        style={{ width: `${totals.progressPct}%` }}
                      />
                    </div>
                  </>
                )}
              </div>
            ) : null}

            {/* Price breakdown */}
            <dl className="mt-5 flex flex-col gap-2 border-t border-keyline pt-4 font-body text-sm">
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

            {/* Partial-payment eligibility (computed on ACTIVE lines only) */}
            {partialPayment.reason === "eligible" ? (
              <div className="mt-4 flex gap-2.5 rounded-md border border-keyline bg-surface-warm p-3">
                <Info className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
                <p className="font-body text-xs leading-relaxed text-text-secondary">
                  <span className="font-semibold text-text-primary">
                    Partial payment available.
                  </span>{" "}
                  These are made-to-order items — pay a deposit now and the
                  balance before dispatch at checkout.
                </p>
              </div>
            ) : null}
            {partialPayment.reason === "mixed" ? (
              <div className="mt-4 flex gap-2.5 rounded-md border border-keyline bg-surface-alt p-3">
                <AlertCircle
                  className="mt-0.5 size-4 shrink-0 text-text-secondary"
                  aria-hidden
                />
                <p className="font-body text-xs leading-relaxed text-text-secondary">
                  Partial payment is available for customised items only when
                  ordered separately. This cart includes other products, so full
                  payment will be required.
                </p>
              </div>
            ) : null}

            {/* Checkout (next page in the sequence) */}
            {hasActive ? (
              <Button
                size="lg"
                className="mt-5 w-full rounded-sm"
                render={<Link href="/checkout/address" />}
              >
                Proceed to Checkout
                <ArrowRight />
              </Button>
            ) : (
              <Button
                size="lg"
                className="mt-5 w-full rounded-sm"
                disabled
                nativeButton
              >
                Proceed to Checkout
              </Button>
            )}

            <p className="mt-3 text-center font-body text-xs text-text-secondary">
              or{" "}
              <Link
                href="/shop"
                className="text-accent underline-offset-4 hover:underline"
              >
                continue shopping
              </Link>
            </p>
          </div>
        </div>
      </Reveal>
    </div>
  );
}

function CartLineRow({
  line,
  onRemove,
}: {
  line: CartLine;
  onRemove: () => void;
}) {
  const cart = useCart();
  const available = cart.isAvailable(line.id);

  return (
    <li className={cn("flex gap-4 py-5", !available && "opacity-60")}>
      <Link
        href={`/products/${line.slug}`}
        className="group size-20 shrink-0 overflow-hidden rounded-md bg-card sm:size-24"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={line.imageSrc}
          alt={line.name}
          width={96}
          height={96}
          className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
        />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link
              href={`/products/${line.slug}`}
              className="font-heading text-sm font-medium text-text-primary transition-colors hover:text-accent"
            >
              {line.name}
            </Link>
            {line.variantLabel ? (
              <p className="mt-0.5 font-body text-xs text-text-secondary">
                {line.variantLabel}
              </p>
            ) : null}
            {!available ? (
              <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-surface-alt px-2 py-0.5 font-body text-xs font-medium text-text-secondary">
                No longer available
              </span>
            ) : line.isCustomisable ? (
              <span className="mt-1.5 inline-flex items-center gap-1 font-body text-xs text-text-secondary">
                <Info className="size-3 text-accent" aria-hidden />
                Made to order
              </span>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove ${line.name}`}
            className="-mr-1.5 rounded-full p-1.5 text-text-secondary transition-colors hover:bg-surface-alt hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3">
          {/* Quantity stepper (disabled when unavailable) */}
          <div className="inline-flex items-center rounded-sm border border-keyline">
            <button
              type="button"
              onClick={() => cart.setQty(line.id, line.qty - 1)}
              disabled={!available || line.qty <= 1}
              aria-label="Decrease quantity"
              className="grid size-8 place-items-center text-text-primary transition-colors hover:bg-surface-alt disabled:pointer-events-none disabled:opacity-40"
            >
              <Minus className="size-3.5" />
            </button>
            <span className="w-8 text-center font-body text-sm tabular-nums text-text-primary">
              {line.qty}
            </span>
            <button
              type="button"
              onClick={() => cart.setQty(line.id, line.qty + 1)}
              disabled={!available}
              aria-label="Increase quantity"
              className="grid size-8 place-items-center text-text-primary transition-colors hover:bg-surface-alt disabled:pointer-events-none disabled:opacity-40"
            >
              <Plus className="size-3.5" />
            </button>
          </div>

          {/* Variant-specific price (line total) */}
          <div className="text-right">
            <p
              className={cn(
                "font-body text-sm font-semibold text-text-primary",
                !available && "line-through",
              )}
            >
              {formatPriceFromPaise(line.unitPriceInPaise * line.qty)}
            </p>
            {available && line.qty > 1 ? (
              <p className="font-body text-xs text-text-secondary">
                {formatPriceFromPaise(line.unitPriceInPaise)} each
              </p>
            ) : null}
          </div>
        </div>

        {/* DEV-ONLY: simulate a variant becoming sold out after it was added.
            Gated behind NODE_ENV so it never renders in a production build or to
            a real user; still available locally (`npm run dev`) for testing.
            Remove once real availability checks exist. */}
        {process.env.NODE_ENV === "development" ? (
          <button
            type="button"
            onClick={() => cart.toggleSoldOut(line.id)}
            className="mt-2 self-start font-body text-xs text-text-secondary underline-offset-2 hover:underline"
          >
            {available ? "Dev: simulate sold out" : "Dev: restore availability"}
          </button>
        ) : null}
      </div>
    </li>
  );
}
