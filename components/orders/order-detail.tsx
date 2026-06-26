"use client";

import * as React from "react";
import Link from "next/link";
import { Check, MapPin, Package, Sparkles, Truck, XCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatPriceFromPaise } from "@/lib/format";
import {
  ORDER_STATUS_STEPS,
  orderTotalInPaise,
  paymentLabelFor,
  type TrackedOrder,
} from "@/mock-data/orders";
import { Button } from "@/components/ui/button";
import { useOrders, type OrderMutation } from "@/components/orders/orders-context";

/**
 * OrderDetail — the ONE canonical, read-only order display, shared by every
 * order surface (Order Confirmation, Track Order, My Orders) so the order UI
 * lives in exactly one place. Fed a single `TrackedOrder` shape.
 *
 * Renders an evergreen "thank you" header + Order ID, the Pending→Confirmed→
 * Shipped→Delivered step tracker (or, for a cancelled order, a status banner
 * with dimmed items instead), the item list with per-line prices + an order
 * total, the branched payment summary, the delivery card, a "what happens next"
 * note, and — when eligible — the self-service cancellation action.
 *
 * Cancellation writes through the shared OrdersContext, so it's instantly
 * consistent across all three surfaces. Each caller still supplies its own
 * surrounding chrome (back link / continue CTA).
 */
export function OrderDetail({
  order,
  className,
}: {
  order: TrackedOrder;
  className?: string;
}) {
  const isCancelled = order.status === "cancelled";

  return (
    <div className={className}>
      {/* Evergreen header — identical regardless of entry point or order age */}
      <div className="flex items-center gap-3">
        <span
          className="grid size-10 shrink-0 place-items-center rounded-full bg-accent-soft text-accent"
          aria-hidden
        >
          <Sparkles className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="font-heading text-lg font-semibold text-text-primary">
            Thank you for shopping with us
          </p>
          <p className="font-body text-sm text-text-secondary">
            Order{" "}
            <span className="font-heading font-semibold tracking-wide text-text-primary">
              {order.orderId}
            </span>
          </p>
        </div>
      </div>

      {/* Status: step tracker, OR a banner for the terminal cancelled state */}
      {isCancelled ? (
        <CancellationBanner order={order} />
      ) : (
        <StepTracker status={order.status} />
      )}

      {/* Items — dimmed when the order is cancelled */}
      <section className="mt-8 rounded-lg border border-keyline bg-card p-5">
        <h2 className="flex items-center gap-2 font-heading text-base font-semibold text-text-primary">
          <Package className="size-4 text-accent" aria-hidden />
          Items
        </h2>
        <ul
          className={cn(
            "mt-4 flex flex-col gap-3",
            isCancelled && "opacity-50 grayscale",
          )}
        >
          {order.items.map((item) => (
            <li
              key={`${item.name}-${item.variantLabel ?? "default"}`}
              className="flex items-center gap-3"
            >
              <div className="relative size-12 shrink-0 overflow-hidden rounded-md bg-surface-alt">
                {item.imageSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.imageSrc}
                    alt={item.name}
                    width={96}
                    height={96}
                    className="h-full w-full object-cover"
                  />
                ) : null}
                <span className="absolute -end-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-text-primary px-1 font-body text-xs font-semibold leading-none text-on-accent">
                  {item.qty}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-body text-sm text-text-primary">
                  {item.name}
                </p>
                {item.variantLabel ? (
                  <p className="truncate font-body text-xs text-text-secondary">
                    {item.variantLabel}
                  </p>
                ) : null}
              </div>
              <p className="font-body text-sm font-medium tabular-nums text-text-primary">
                {formatPriceFromPaise(item.unitPriceInPaise * item.qty)}
              </p>
            </li>
          ))}
        </ul>
        <div
          className={cn(
            "mt-4 flex items-center justify-between border-t border-keyline pt-3 font-body text-sm",
            isCancelled && "opacity-50",
          )}
        >
          <span className="font-semibold text-text-primary">Order total</span>
          <span className="font-heading text-lg font-semibold tabular-nums text-text-primary">
            {formatPriceFromPaise(orderTotalInPaise(order))}
          </span>
        </div>
      </section>

      {/* Payment + delivery */}
      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <section className="rounded-lg border border-keyline bg-surface-warm p-5">
          <h2 className="font-heading text-base font-semibold text-text-primary">
            Payment
          </h2>
          <p className="mt-2 font-body text-sm text-text-secondary">
            {paymentLabelFor(order)}
          </p>
          {/* Richer breakdown for a deposit/partial-payment order */}
          {order.method === "deposit" ? (
            <dl className="mt-3 flex flex-col gap-1.5 border-t border-keyline pt-3 font-body text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-text-secondary">Paid now</dt>
                <dd className="font-semibold tabular-nums text-text-primary">
                  {formatPriceFromPaise(order.paidNowInPaise)}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-text-secondary">Balance on delivery</dt>
                <dd className="tabular-nums text-text-primary">
                  {formatPriceFromPaise(order.balanceDueInPaise)}
                </dd>
              </div>
            </dl>
          ) : null}
        </section>
        <section className="rounded-lg border border-keyline bg-card p-5">
          <h2 className="flex items-center gap-2 font-heading text-base font-semibold text-text-primary">
            <MapPin className="size-4 text-accent" aria-hidden />
            Delivery
          </h2>
          <address className="mt-2 font-body text-sm not-italic leading-relaxed text-text-secondary">
            <span className="font-medium text-text-primary">
              {order.address.fullName}
            </span>
            <br />
            {order.address.line1}
            {order.address.line2 ? `, ${order.address.line2}` : ""}
            <br />
            {order.address.city}, {order.address.state} {order.address.pincode}
          </address>
          {!isCancelled ? (
            <p className="mt-3 font-body text-sm font-medium text-text-primary">
              {order.estimatedDelivery}
            </p>
          ) : null}
        </section>
      </div>

      {/* What happens next — only while the order is still in progress */}
      {order.status === "pending" || order.status === "confirmed" ? (
        <section className="mt-6 flex gap-3 rounded-lg border border-keyline bg-card p-5">
          <Truck className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
          <div>
            <p className="font-body text-sm font-medium text-text-primary">
              What happens next
            </p>
            <p className="mt-1 font-body text-sm text-text-secondary">
              {order.hasCustomised
                ? "We'll begin crafting your piece. You'll get a WhatsApp update once it ships."
                : "We're getting your order ready. You'll get a WhatsApp update once it ships."}
            </p>
          </div>
        </section>
      ) : null}

      {/* Self-service cancellation action / messaging */}
      <CancellationAction order={order} />
    </div>
  );
}

/** Linear Pending→Confirmed→Shipped→Delivered tracker (non-cancelled orders). */
function StepTracker({ status }: { status: TrackedOrder["status"] }) {
  const currentIndex = ORDER_STATUS_STEPS.findIndex((s) => s.key === status);

  return (
    <ol className="mt-5 flex items-center">
      {ORDER_STATUS_STEPS.map((step, i) => {
        const done = i <= currentIndex;
        return (
          <React.Fragment key={step.key}>
            <li className="flex flex-col items-center gap-2">
              <span
                className={cn(
                  "grid size-8 place-items-center rounded-full border font-body text-xs font-semibold tabular-nums",
                  done
                    ? "border-accent bg-accent text-on-accent"
                    : "border-keyline bg-card text-text-secondary",
                )}
              >
                {done ? <Check className="size-4" /> : i + 1}
              </span>
              <span
                className={cn(
                  "font-body text-xs",
                  i === currentIndex
                    ? "font-semibold text-text-primary"
                    : done
                      ? "text-accent"
                      : "text-text-secondary",
                )}
              >
                {step.label}
              </span>
            </li>
            {i < ORDER_STATUS_STEPS.length - 1 ? (
              <span
                aria-hidden
                className={cn(
                  "mx-2 mb-6 h-0.5 flex-1 rounded-full",
                  i < currentIndex ? "bg-accent" : "bg-keyline",
                )}
              />
            ) : null}
          </React.Fragment>
        );
      })}
    </ol>
  );
}

/** Terminal-state banner shown in place of the tracker for a cancelled order. */
function CancellationBanner({ order }: { order: TrackedOrder }) {
  return (
    <div className="mt-5 flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4">
      <XCircle className="mt-0.5 size-5 shrink-0 text-destructive" aria-hidden />
      <p className="font-body text-sm font-medium text-destructive">
        {cancellationBannerText(order)}
      </p>
    </div>
  );
}

function cancellationBannerText(o: TrackedOrder): string {
  switch (o.cancellationOutcome) {
    case "refunded":
      return `Order cancelled · Refund of ${formatPriceFromPaise(
        o.refundAmountInPaise ?? 0,
      )} processed`;
    case "forfeited":
      return `Order cancelled · ${formatPriceFromPaise(
        o.forfeitedAmountInPaise ?? 0,
      )} deposit forfeited, no refund`;
    case "no_charge":
      return "Order cancelled · not charged";
    default:
      return "Order cancelled";
  }
}

/**
 * The cancellation surface, gated on order state:
 * - single-item & pending/confirmed → a "Cancel order" button (+ policy modal)
 * - multi-item & pending/confirmed  → "Contact support" (no self-service)
 * - shipped / delivered / cancelled → nothing
 */
function CancellationAction({ order }: { order: TrackedOrder }) {
  const orders = useOrders();
  const [modalOpen, setModalOpen] = React.useState(false);

  const inCancellableWindow =
    order.status === "pending" || order.status === "confirmed";
  if (!inCancellableWindow) return null;

  // Multi-item orders aren't self-service cancellable — route to support.
  if (order.items.length > 1) {
    return (
      <p className="mt-6 font-body text-sm text-text-secondary">
        Need to cancel an item?{" "}
        <Link
          href="/support"
          className="text-accent underline-offset-4 hover:underline"
        >
          Contact support
        </Link>
      </p>
    );
  }

  function confirmCancel() {
    orders.cancelOrder(order.orderId, buildCancellation(order));
    setModalOpen(false);
  }

  return (
    <div className="mt-6">
      <Button
        variant="outline"
        size="lg"
        className="rounded-sm"
        onClick={() => setModalOpen(true)}
        nativeButton
      >
        Cancel order
      </Button>
      {modalOpen ? (
        <CancelModal
          order={order}
          onConfirm={confirmCancel}
          onClose={() => setModalOpen(false)}
        />
      ) : null}
    </div>
  );
}

/** Build the cancellation outcome from the order's payment method (Phase 1 data). */
function buildCancellation(order: TrackedOrder): OrderMutation {
  switch (order.method) {
    case "full-online":
      // Regular order paid online → full refund of what was paid.
      return {
        status: "cancelled",
        cancellationOutcome: "refunded",
        refundAmountInPaise: order.paidNowInPaise,
      };
    case "cod":
      // Regular COD order → never charged, nothing to refund.
      return { status: "cancelled", cancellationOutcome: "no_charge" };
    case "deposit":
      // Customised/partial-payment order → the deposit is forfeited.
      return {
        status: "cancelled",
        cancellationOutcome: "forfeited",
        forfeitedAmountInPaise: order.depositInPaise,
      };
  }
}

/** Policy-specific confirmation copy, branched by payment method. */
function cancelPolicyCopy(order: TrackedOrder): string {
  switch (order.method) {
    case "full-online":
      return "You'll receive a full refund to your original payment method within 5–7 business days.";
    case "cod":
      return "This order hasn't been charged yet. It will simply be cancelled.";
    case "deposit":
      return `This order was confirmed with a ${formatPriceFromPaise(
        order.depositInPaise,
      )} deposit, which is non-refundable once cancelled. Are you sure you want to proceed?`;
  }
}

/**
 * Lightweight confirmation modal (no dialog dependency — same "a few lines over
 * a library" precedent as Marquee/Reveal). Esc + backdrop close; focuses itself
 * on open so the keyboard lands inside the dialog.
 */
function CancelModal({
  order,
  onConfirm,
  onClose,
}: {
  order: TrackedOrder;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const dialogRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    dialogRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      <button
        type="button"
        aria-hidden
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 bg-text-primary/50"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cancel-order-title"
        tabIndex={-1}
        className="relative w-full max-w-md rounded-lg border border-keyline bg-card p-6 shadow-lg outline-none motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 motion-safe:duration-200"
      >
        <h2
          id="cancel-order-title"
          className="font-heading text-lg font-semibold text-text-primary"
        >
          Cancel this order?
        </h2>
        <p className="mt-2 font-body text-sm text-text-secondary">
          {cancelPolicyCopy(order)}
        </p>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            size="lg"
            className="rounded-sm"
            onClick={onClose}
            nativeButton
          >
            Keep order
          </Button>
          <Button
            variant="destructive"
            size="lg"
            className="rounded-sm"
            onClick={onConfirm}
            nativeButton
          >
            Cancel order
          </Button>
        </div>
      </div>
    </div>
  );
}
