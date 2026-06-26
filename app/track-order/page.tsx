"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { OrderDetail } from "@/components/orders/order-detail";
import { useOrders } from "@/components/orders/orders-context";

/**
 * /track-order — standalone order tracking. Accepts an optional ?orderId= to
 * prefill (from the confirmation page's deep link). Looks up Order ID + phone
 * through the shared OrdersContext (mock orders + the current session's placed
 * order, with any status overrides applied) so a cancelled order shows its
 * cancelled state here too. On any failure it shows a SINGLE generic error
 * (never revealing which field was wrong — deliberate security-conscious copy).
 */
export default function TrackOrderPage() {
  return (
    <React.Suspense fallback={<main className="flex-1 py-12" aria-busy />}>
      <TrackOrderInner />
    </React.Suspense>
  );
}

function TrackOrderInner() {
  const searchParams = useSearchParams();
  const orders = useOrders();

  const [orderId, setOrderId] = React.useState(
    () => searchParams.get("orderId") ?? "",
  );
  const [phone, setPhone] = React.useState("");
  // Remember the submitted credentials; the result is derived live from the
  // store on each render, so a cancellation reflects without re-submitting.
  const [query, setQuery] = React.useState<{ orderId: string; phone: string } | null>(
    null,
  );

  const result = query ? orders.findOrder(query.orderId, query.phone) : null;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setQuery({ orderId, phone });
  }

  return (
    <main className="flex-1 py-10 sm:py-12">
      <div className="mx-auto w-full max-w-2xl px-6">
        <SectionHeading
          as="h1"
          eyebrow="Track order"
          description="Enter your Order ID and the phone number on the order."
          className="mb-8"
        >
          Track your order
        </SectionHeading>

        <Reveal>
          <form
            onSubmit={onSubmit}
            noValidate
            className="flex flex-col gap-4 rounded-lg border border-keyline bg-card p-5"
          >
            <div>
              <label
                htmlFor="orderId"
                className="font-body text-sm text-text-primary"
              >
                Order ID
              </label>
              <input
                id="orderId"
                name="orderId"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="ORD-XXXX-XXXX"
                className="mt-1 h-10 w-full rounded-md border border-keyline bg-background px-3 font-body text-sm text-text-primary placeholder:text-text-secondary focus-visible:border-ring focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            </div>
            <div>
              <label
                htmlFor="phone"
                className="font-body text-sm text-text-primary"
              >
                Phone number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-digit mobile"
                className="mt-1 h-10 w-full rounded-md border border-keyline bg-background px-3 font-body text-sm text-text-primary placeholder:text-text-secondary focus-visible:border-ring focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            </div>
            <Button
              type="submit"
              size="lg"
              className="rounded-sm sm:w-auto sm:self-start"
              nativeButton
            >
              <Search />
              Track Order
            </Button>
          </form>
        </Reveal>

        {query && result ? (
          <OrderResult order={result} />
        ) : query && !result ? (
          <Reveal className="mt-6 rounded-lg border border-keyline bg-surface-warm p-5 text-center">
            <p className="font-body text-sm text-text-primary">
              We couldn&apos;t find an order with these details.
            </p>
            <p className="mt-1 font-body text-sm text-text-secondary">
              Please check your Order ID and phone number, or reach out to us on{" "}
              <Link
                href="/support"
                className="text-accent underline-offset-4 hover:underline"
              >
                WhatsApp / Support
              </Link>
              .
            </p>
          </Reveal>
        ) : null}
      </div>
    </main>
  );
}

function OrderResult({ order }: { order: React.ComponentProps<typeof OrderDetail>["order"] }) {
  return (
    <Reveal className="mt-8">
      <OrderDetail order={order} />

      <div className="mt-8">
        <Button
          variant="outline"
          size="lg"
          className="rounded-sm"
          render={<Link href="/shop" />}
        >
          Continue Shopping
          <ArrowRight />
        </Button>
      </div>
    </Reveal>
  );
}
