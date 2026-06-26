"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Info } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatPriceFromPaise } from "@/lib/format";
import {
  ESTIMATED_DELIVERY,
  type PaymentMethod,
  type PlacedOrder,
  generateOrderId,
  paymentSplit,
} from "@/lib/checkout";
import { computeDepositTotal } from "@/lib/cart";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { useCart } from "@/components/cart/cart-context";
import { useCheckout } from "@/components/checkout/checkout-context";
import { OrderSummary } from "@/components/checkout/order-summary";
import { CheckoutSteps } from "@/components/checkout/checkout-steps";

/**
 * /checkout/payment — payment method selection, branched by cart composition via
 * the partial-payment eligibility already computed on the cart:
 *  - reason "none"/"mixed" (any regular item) → Pay Full Online | Cash on Delivery
 *  - reason "eligible" (all customised)        → Pay deposit now | Pay full online
 *    (no pure COD — customised items always need some online payment)
 * Mock payment only: "Place Order" snapshots a PlacedOrder into CheckoutContext
 * and navigates to the confirmation page. No real PhonePe/Razorpay yet.
 */
export default function PaymentPage() {
  const cart = useCart();
  const checkout = useCheckout();
  const router = useRouter();
  const [picked, setPicked] = React.useState<PaymentMethod | null>(null);

  if (!cart.hydrated || !checkout.hydrated) {
    return <main className="flex-1 py-10 sm:py-12" aria-busy />;
  }

  const total = cart.totals.totalInPaise;
  const deposit = computeDepositTotal(cart.activeLines);
  const reason = cart.partialPayment.reason;

  // Branch the available methods by cart composition.
  const options: PaymentMethod[] =
    reason === "eligible" ? ["deposit", "full-online"] : ["full-online", "cod"];
  const method: PaymentMethod =
    picked && options.includes(picked) ? picked : options[0];
  const split = paymentSplit(method, total, deposit);

  // Guards. "Can this order proceed?" uses the same predicate as the cart button
  // and the Address page: are there any AVAILABLE (active) lines? Distinguish a
  // truly-empty cart from one where every item became unavailable.
  if (cart.activeLines.length === 0) {
    const allUnavailable = cart.lines.length > 0;
    return (
      <CheckoutShell>
        <Notice
          title={allUnavailable ? "All items are unavailable" : "Your cart is empty"}
          body={
            allUnavailable
              ? "Every item in your cart became unavailable. Head back to your cart to update it before checking out."
              : "Add something before checking out."
          }
          ctaHref={allUnavailable ? "/cart" : "/shop"}
          ctaLabel={allUnavailable ? "Back to Cart" : "Continue Shopping"}
        />
      </CheckoutShell>
    );
  }
  if (!checkout.address) {
    return (
      <CheckoutShell>
        <Notice
          title="Add a delivery address first"
          body="We need somewhere to send your order."
          ctaHref="/checkout/address"
          ctaLabel="Add address"
        />
      </CheckoutShell>
    );
  }

  const address = checkout.address;

  function placeOrder() {
    const order: PlacedOrder = {
      orderId: generateOrderId(),
      placedAt: new Date().toISOString(),
      method,
      paidNowInPaise: split.paidNowInPaise,
      balanceDueInPaise: split.balanceDueInPaise,
      totalInPaise: total,
      lines: cart.activeLines.map((l) => ({
        name: l.name,
        variantLabel: l.variantLabel,
        imageSrc: l.imageSrc,
        qty: l.qty,
        unitPriceInPaise: l.unitPriceInPaise,
        isCustomisable: l.isCustomisable,
      })),
      address,
      hasCustomised: cart.activeLines.some((l) => l.isCustomisable),
      estimatedDelivery: ESTIMATED_DELIVERY,
    };
    checkout.setOrder(order);
    router.push("/order-confirmation");
  }

  return (
    <CheckoutShell>
      <div className="lg:flex lg:items-start lg:gap-10">
        {/* Method selection + address recap */}
        <Reveal className="min-w-0 lg:flex-1">
          <h2 className="font-heading text-lg font-semibold text-text-primary">
            Payment method
          </h2>
          {reason === "mixed" ? (
            <p className="mt-2 font-body text-sm text-text-secondary">
              This cart mixes customised and regular items, so full payment is
              required for the whole order.
            </p>
          ) : null}

          <div className="mt-4 flex flex-col gap-3">
            {options.map((opt) => (
              <MethodCard
                key={opt}
                selected={method === opt}
                onSelect={() => setPicked(opt)}
                title={methodTitle(opt, total, deposit)}
                subtitle={methodSubtitle(opt, total)}
              />
            ))}
          </div>

          {/* Address recap */}
          <div className="mt-8 rounded-lg border border-keyline bg-card p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-base font-semibold text-text-primary">
                Delivering to
              </h3>
              <Link
                href="/checkout/address"
                className="font-body text-xs font-medium text-accent underline-offset-4 hover:underline"
              >
                Edit
              </Link>
            </div>
            <address className="mt-2 font-body text-sm not-italic leading-relaxed text-text-secondary">
              <span className="font-medium text-text-primary">
                {address.fullName}
              </span>
              {address.addressType ? ` · ${address.addressType}` : ""}
              <br />
              {address.line1}
              {address.line2 ? `, ${address.line2}` : ""}
              {address.landmark ? `, ${address.landmark}` : ""}
              <br />
              {address.city}, {address.state} {address.pincode}
              <br />
              {address.phone} · {address.email}
            </address>
          </div>
        </Reveal>

        {/* Summary + place order */}
        <Reveal className="mt-8 lg:mt-0 lg:w-80 lg:shrink-0">
          <div className="lg:sticky lg:top-24">
            <OrderSummary />

            <div className="mt-4 rounded-lg border border-keyline bg-card p-5">
              <dl className="flex flex-col gap-2 font-body text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-text-secondary">Paying now</dt>
                  <dd className="font-semibold tabular-nums text-text-primary">
                    {formatPriceFromPaise(split.paidNowInPaise)}
                  </dd>
                </div>
                {split.balanceDueInPaise > 0 ? (
                  <div className="flex items-center justify-between">
                    <dt className="text-text-secondary">Balance on delivery</dt>
                    <dd className="tabular-nums text-text-primary">
                      {formatPriceFromPaise(split.balanceDueInPaise)}
                    </dd>
                  </div>
                ) : null}
              </dl>

              {method === "cod" ? (
                <p className="mt-3 flex gap-2 font-body text-xs leading-relaxed text-text-secondary">
                  <Info className="mt-0.5 size-3.5 shrink-0 text-accent" aria-hidden />
                  Cash on Delivery available in most locations. We&apos;ll confirm
                  via call/WhatsApp if there&apos;s an issue with your area.
                </p>
              ) : (
                <p className="mt-3 font-body text-xs text-text-secondary">
                  You&apos;ll be taken to PhonePe to pay securely.{" "}
                  <span className="italic">(Mock — no real payment is taken.)</span>
                </p>
              )}

              <Button
                size="lg"
                className="mt-4 w-full rounded-sm"
                onClick={placeOrder}
                nativeButton
              >
                Place Order
                <ArrowRight />
              </Button>
            </div>
          </div>
        </Reveal>
      </div>
    </CheckoutShell>
  );
}

function CheckoutShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex-1 py-10 sm:py-12">
      <div className="mx-auto w-full max-w-6xl px-6">
        <CheckoutSteps current="payment" />
        <SectionHeading as="h1" eyebrow="Checkout" className="mt-6 mb-8">
          Payment
        </SectionHeading>
        {children}
      </div>
    </main>
  );
}

function Notice({
  title,
  body,
  ctaHref,
  ctaLabel,
}: {
  title: string;
  body: string;
  ctaHref: string;
  ctaLabel: string;
}) {
  return (
    <Reveal className="rounded-lg border border-keyline bg-card px-6 py-16 text-center">
      <p className="font-heading text-lg text-text-primary">{title}</p>
      <p className="mt-2 font-body text-sm text-text-secondary">{body}</p>
      <Button
        variant="outline"
        size="lg"
        className="mt-6 rounded-sm"
        render={<Link href={ctaHref} />}
      >
        {ctaLabel}
        <ArrowRight />
      </Button>
    </Reveal>
  );
}

function MethodCard({
  selected,
  onSelect,
  title,
  subtitle,
}: {
  selected: boolean;
  onSelect: () => void;
  title: string;
  subtitle: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "flex w-full gap-3 rounded-lg border p-4 text-left transition",
        selected
          ? "border-accent ring-1 ring-accent"
          : "border-keyline hover:border-accent/50",
      )}
    >
      <span
        className={cn(
          "mt-0.5 grid size-4 shrink-0 place-items-center rounded-full border",
          selected ? "border-accent" : "border-keyline",
        )}
      >
        {selected ? <span className="size-2 rounded-full bg-accent" /> : null}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-body text-sm font-semibold text-text-primary">
          {title}
        </span>
        <span className="mt-0.5 block font-body text-xs text-text-secondary">
          {subtitle}
        </span>
      </span>
    </button>
  );
}

function methodTitle(
  method: PaymentMethod,
  total: number,
  deposit: number,
): string {
  switch (method) {
    case "full-online":
      return "Pay Full Online";
    case "cod":
      return "Cash on Delivery";
    case "deposit":
      return `Pay ${formatPriceFromPaise(deposit)} now, ${formatPriceFromPaise(
        Math.max(0, total - deposit),
      )} on delivery`;
  }
}

function methodSubtitle(method: PaymentMethod, total: number): string {
  switch (method) {
    case "full-online":
      return `Pay ${formatPriceFromPaise(total)} now via PhonePe.`;
    case "cod":
      return `Pay ${formatPriceFromPaise(total)} in cash when your order arrives.`;
    case "deposit":
      return "Confirm your made-to-order pieces with a deposit now; pay the balance on delivery.";
  }
}
