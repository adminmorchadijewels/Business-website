"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useCart } from "@/components/cart/cart-context";
import { useCheckout } from "@/components/checkout/checkout-context";
import { useOrders } from "@/components/orders/orders-context";
import { OrderDetail } from "@/components/orders/order-detail";

/**
 * /order-confirmation — the "order placed" moment. The just-placed order lives
 * in CheckoutContext (self-contained, so it survives clearing the cart); we read
 * its canonical, override-aware form back out of OrdersContext and render it
 * through the SAME <OrderDetail> as Track Order / My Orders — so a freshly placed
 * order, a tracked order, and a historical order all look identical (and can be
 * cancelled in place). On arrival the cart + saved address are cleared (the order
 * is placed), but the order snapshot is kept so a refresh still shows it.
 */
export default function OrderConfirmationPage() {
  const cart = useCart();
  const checkout = useCheckout();
  const orders = useOrders();

  // Clear cart + address once, on first arrival with a placed order.
  const cleared = React.useRef(false);
  React.useEffect(() => {
    if (!checkout.hydrated || cleared.current || !checkout.order) return;
    cleared.current = true;
    cart.clear();
    checkout.clearAddress();
  }, [checkout.hydrated, checkout.order, cart, checkout]);

  if (!checkout.hydrated || !orders.hydrated) {
    return <main className="flex-1 py-12" aria-busy />;
  }

  // Canonical order (with any status override, e.g. a cancellation) applied.
  const order = checkout.order ? orders.getOrder(checkout.order.orderId) : null;

  if (!order) {
    return (
      <main className="flex-1 py-16">
        <div className="mx-auto w-full max-w-md px-6 text-center">
          <p className="font-heading text-xl text-text-primary">
            No recent order
          </p>
          <p className="mt-2 font-body text-sm text-text-secondary">
            Looks like there&apos;s nothing to confirm here.
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
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 py-12 sm:py-16">
      <div className="mx-auto w-full max-w-2xl px-6">
        <OrderDetail order={order} />

        {/* Track + continue */}
        <div className="mt-8 flex flex-col items-center gap-3">
          <Button
            size="lg"
            className="w-full rounded-sm sm:w-auto"
            render={<Link href={`/track-order?orderId=${order.orderId}`} />}
          >
            Track Your Order
            <ArrowRight />
          </Button>
          <Link
            href="/shop"
            className="font-body text-sm text-text-secondary underline-offset-4 hover:text-text-primary hover:underline"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </main>
  );
}
