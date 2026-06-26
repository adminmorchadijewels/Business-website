"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";

import { formatPriceFromPaise } from "@/lib/format";
import {
  formatOrderDate,
  orderStatusLabel,
  orderTotalInPaise,
  paymentLabelFor,
  type TrackedOrder,
} from "@/mock-data/orders";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/ui/reveal";
import { useAuth } from "@/components/auth/auth-context";
import { useOrders } from "@/components/orders/orders-context";
import { AccountShell } from "@/components/account/account-shell";
import { OrderDetail } from "@/components/orders/order-detail";

/**
 * /account/orders — the signed-in mock user's order history (most recent first).
 * Clicking a row opens the full order via the SAME <OrderDetail> used by
 * /track-order and /order-confirmation. Orders come from the shared
 * OrdersContext, so a cancellation made here (or anywhere) is reflected
 * consistently. Empty state when the user has no matching orders.
 */
export default function OrdersPage() {
  const auth = useAuth();
  return (
    <AccountShell title="My Orders">
      {auth.user ? <OrdersBody phone={auth.user.phone} /> : null}
    </AccountShell>
  );
}

function OrdersBody({ phone }: { phone: string }) {
  const ordersApi = useOrders();
  // Derived live from the store each render, so a cancellation updates the
  // list badge + the open detail without any manual refresh.
  const orders = ordersApi.ordersForPhone(phone);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const selected = orders.find((o) => o.orderId === selectedId) ?? null;

  if (selected) {
    return (
      <Reveal>
        <button
          type="button"
          onClick={() => setSelectedId(null)}
          className="font-body text-sm text-text-secondary underline-offset-4 hover:text-text-primary hover:underline"
        >
          ← Back to orders
        </button>
        <OrderDetail order={selected} className="mt-5" />
      </Reveal>
    );
  }

  if (orders.length === 0) {
    return (
      <Reveal className="rounded-lg border border-keyline bg-card px-6 py-16 text-center">
        <p className="font-heading text-lg text-text-primary">No orders yet</p>
        <p className="mt-2 font-body text-sm text-text-secondary">
          When you place an order, it&apos;ll show up here.
        </p>
        <Button size="lg" className="mt-6 rounded-sm" render={<Link href="/shop" />}>
          Start shopping
          <ArrowRight />
        </Button>
      </Reveal>
    );
  }

  return (
    <Reveal>
      <ul className="flex flex-col gap-4">
        {orders.map((order) => (
          <li key={order.orderId}>
            <OrderRow order={order} onOpen={() => setSelectedId(order.orderId)} />
          </li>
        ))}
      </ul>
    </Reveal>
  );
}

function OrderRow({
  order,
  onOpen,
}: {
  order: TrackedOrder;
  onOpen: () => void;
}) {
  const isCancelled = order.status === "cancelled";
  const itemCount = order.items.reduce((n, i) => n + i.qty, 0);

  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full items-center gap-4 rounded-lg border border-keyline bg-card p-4 text-left transition hover:border-accent/50"
    >
      {/* Item thumbnails (overlapped) */}
      <div className="flex shrink-0 -space-x-3">
        {order.items.slice(0, 3).map((item) => (
          <div
            key={`${item.name}-${item.variantLabel ?? "default"}`}
            className="size-11 overflow-hidden rounded-md bg-surface-alt ring-2 ring-card"
          >
            {item.imageSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.imageSrc}
                alt={item.name}
                width={88}
                height={88}
                className="h-full w-full object-cover"
              />
            ) : null}
          </div>
        ))}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="font-heading text-sm font-semibold tracking-wide text-text-primary">
            {order.orderId}
          </span>
          <Badge variant={isCancelled ? "destructive" : "soft"}>
            {orderStatusLabel(order.status)}
          </Badge>
        </div>
        <p className="mt-1 font-body text-xs text-text-secondary">
          {formatOrderDate(order.placedAt)} · {itemCount}{" "}
          {itemCount === 1 ? "item" : "items"}
        </p>
        <p className="mt-0.5 truncate font-body text-xs text-text-secondary">
          {paymentLabelFor(order)}
        </p>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1">
        <span className="font-body text-sm font-semibold tabular-nums text-text-primary">
          {formatPriceFromPaise(orderTotalInPaise(order))}
        </span>
        <ChevronRight className="size-4 text-text-secondary" aria-hidden />
      </div>
    </button>
  );
}
