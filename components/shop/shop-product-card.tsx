"use client";

import * as React from "react";
import Link from "next/link";
import { Check, Clock } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatPriceFromPaise } from "@/lib/format";
import { resolveSale, formatCountdown } from "@/lib/sale";
import type { Product, VariantAxis } from "@/types/product";
import {
  type Selection,
  applySelection,
  canAddToCart,
  isOptionAvailable,
  resolvePrice,
} from "@/lib/product";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/cart/cart-context";

/** How long each image is shown while cycling on hover. */
const HOVER_CYCLE_MS = 900;

export interface ShopProductCardProps {
  product: Product;
}

/**
 * ShopProductCard — the richer Shop-grid card. On top of the plain
 * `ProductCard` (image / name / price) it adds, inline on every card:
 *  - an always-visible variant picker (reusing the PDP's `VariantSelector`
 *    swatches/pills) — colour/stone swatches always, the size pills only when
 *    the product has a size axis, mirroring the Product page's conditional logic;
 *  - an Add to Cart button, disabled until a valid in-stock combination is
 *    selected (same `canAddToCart` rule as the PDP), wired to the SAME cart;
 *  - a live, time-bound sale countdown + sale price while the product's sale
 *    window is open (real time comparison; reverts to the regular price after);
 *  - hover-to-cycle through the gallery images on pointer devices.
 *
 * This deliberately makes cards taller than the compact `ProductCard` — the
 * reduced row density is the accepted trade-off for in-grid buying (see
 * decisions.md). The plain `ProductCard` is still used elsewhere (home rails,
 * related products) where the compact treatment is wanted.
 */
export function ShopProductCard({ product }: ShopProductCardProps) {
  const cart = useCart();
  const href = `/products/${product.slug}`;

  // ----- Variant selection (mirrors ProductBuyBox) -----
  const [selected, setSelected] = React.useState<Selection>(() => {
    const init: Selection = {};
    for (const g of product.optionGroups ?? []) {
      if (g.options.length === 1) init[g.axis] = g.options[0].value;
    }
    return init;
  });
  // Compact in-card pickers: only the visual swatch axes (colour/stone) that
  // actually offer a choice. Size axes are NOT shown inline — a product needing
  // a size sends the shopper to the PDP to choose (see `needsPdp`).
  const swatchGroups = (product.optionGroups ?? []).filter(
    (g) => (g.axis === "colour" || g.axis === "stone") && g.options.length > 1,
  );
  // A multi-option size (or any non-swatch axis) can't be resolved on the card,
  // so its CTA links to the PDP instead of adding straight to the cart.
  const needsPdp = (product.optionGroups ?? []).some(
    (g) => g.options.length > 1 && g.axis !== "colour" && g.axis !== "stone",
  );

  function handleSelect(axis: VariantAxis, value: string) {
    setSelected((prev) => applySelection(product, prev, axis, value));
  }

  // ----- Live sale window (hydration-safe clock) -----
  // `now` stays null on the server and first client render so both produce the
  // same (regular-price) markup; the countdown/sale pricing appear post-mount.
  // The ticking interval only runs for products that actually carry a window.
  const [now, setNow] = React.useState<number | null>(null);
  React.useEffect(() => {
    if (!product.saleEndsAt) return;
    // One-time clock hydration post-mount (same pattern as the storage-backed
    // contexts) — reading the wall clock during render would mismatch SSR.
    /* eslint-disable-next-line react-hooks/set-state-in-effect -- post-mount clock hydration */
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [product.saleEndsAt]);
  const sale = now == null ? null : resolveSale(product, now);

  // ----- Hover-to-cycle images (pointer devices only) -----
  const [imgIndex, setImgIndex] = React.useState(0);
  const cycleRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const canCycle = product.images.length > 1;

  const stopCycle = React.useCallback(() => {
    if (cycleRef.current) {
      clearInterval(cycleRef.current);
      cycleRef.current = null;
    }
    setImgIndex(0);
  }, []);

  function startCycle() {
    if (!canCycle || cycleRef.current) return;
    cycleRef.current = setInterval(() => {
      setImgIndex((i) => (i + 1) % product.images.length);
    }, HOVER_CYCLE_MS);
  }

  React.useEffect(() => stopCycle, [stopCycle]);

  // ----- Add to cart -----
  const [added, setAdded] = React.useState(false);
  const addedTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  React.useEffect(
    () => () => {
      if (addedTimer.current) clearTimeout(addedTimer.current);
    },
    [],
  );
  const soldOut = !product.inStock;
  const addable = canAddToCart(product, selected);
  const ctaLabel = soldOut
    ? "Sold out"
    : !addable
      ? "Select options"
      : "Add to cart";

  function handleAdd() {
    cart.add(product, selected, 1);
    setAdded(true);
    if (addedTimer.current) clearTimeout(addedTimer.current);
    addedTimer.current = setTimeout(() => setAdded(false), 2500);
  }

  // ----- Price to show -----
  const resolved = resolvePrice(product, selected);
  const badgeLabel = sale?.active ? "SALE" : product.tag;

  return (
    <article
      data-slot="shop-product-card"
      className="group flex h-full flex-col transition duration-200 ease-out hover:-translate-y-1"
    >
      {/* Image — links to the PDP; cycles the gallery while hovered (desktop). */}
      <Link
        href={href}
        className="relative block aspect-square overflow-hidden rounded-md bg-card transition-shadow duration-200 ease-out group-hover:shadow-lg"
        onMouseEnter={startCycle}
        onMouseLeave={stopCycle}
      >
        {/* Top-left: live sale countdown as a pill, sharing the badge treatment
            with the NEW/SALE badge opposite it (top-right). */}
        {sale?.active ? (
          <Badge variant="soft" className="absolute start-2 top-2 z-10 gap-1">
            <Clock aria-hidden />
            {formatCountdown(sale.msRemaining)}
          </Badge>
        ) : null}

        {badgeLabel ? (
          <Badge variant="soft" className="absolute end-2 top-2 z-10">
            {badgeLabel}
          </Badge>
        ) : null}

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.images[imgIndex] ?? product.imageSrc}
          alt={product.name}
          width={600}
          height={600}
          className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
        />
      </Link>

      {/* Caption: name + price (with live sale pricing when active). */}
      <div className="flex flex-col gap-0.5 px-0.5 pt-2.5">
        <Link href={href}>
          <h3 className="font-heading text-sm leading-snug font-medium text-text-primary">
            {product.name}
          </h3>
        </Link>

        <p className="flex flex-wrap items-baseline gap-x-2 font-body text-sm">
          {sale?.active ? (
            <>
              {sale.wasInPaise ? (
                <span className="text-text-secondary line-through">
                  {formatPriceFromPaise(sale.wasInPaise)}
                </span>
              ) : null}
              <span className="font-semibold text-accent">
                {formatPriceFromPaise(sale.currentInPaise)}
              </span>
            </>
          ) : resolved.exact ? (
            <>
              {resolved.originalPriceInPaise ? (
                <span className="text-text-secondary line-through">
                  {formatPriceFromPaise(resolved.originalPriceInPaise)}
                </span>
              ) : null}
              <span className="font-semibold text-text-primary">
                {formatPriceFromPaise(resolved.priceInPaise)}
              </span>
            </>
          ) : (
            <span className="font-semibold text-text-primary">
              {formatPriceFromPaise(resolved.priceInPaise)} –{" "}
              {formatPriceFromPaise(resolved.maxInPaise)}
            </span>
          )}
        </p>
      </div>

      {/* Bottom-pinned action group. `mt-auto` pushes it to the card's lower
          edge so — with the equal-height grid items — the swatch strip and the
          Add-to-cart button land at the SAME vertical position on every card in
          a row, whether or not the product has variants. */}
      <div className="mt-auto pt-3">
        {/* Swatch strip — reserved on EVERY card (left empty when the product has
            no colour/stone choice) so cards keep a consistent height. Compact
            swatches, centered within the reserved row. */}
        <div className="flex h-7 items-center justify-center gap-1.5">
          {swatchGroups.flatMap((group) =>
            group.options.map((opt) => {
              const isSelected = selected[group.axis] === opt.value;
              const available = isOptionAvailable(
                product,
                group.axis,
                opt.value,
                selected,
              );
              return (
                <button
                  key={`${group.axis}:${opt.value}`}
                  type="button"
                  disabled={!available}
                  onClick={() => handleSelect(group.axis, opt.value)}
                  aria-pressed={isSelected}
                  aria-label={`${opt.label}${available ? "" : " (sold out)"}`}
                  title={available ? opt.label : `${opt.label} — sold out`}
                  className={cn(
                    "relative grid size-5 place-items-center rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                    isSelected
                      ? "ring-2 ring-accent ring-offset-1 ring-offset-background"
                      : "ring-1 ring-keyline hover:ring-accent/50",
                    !available && "cursor-not-allowed opacity-40",
                  )}
                >
                  <span
                    className="size-3.5 rounded-full border border-keyline"
                    // Swatch colour is product DATA, not a theme token.
                    style={{ backgroundColor: opt.swatch }}
                  />
                  {!available ? (
                    <span
                      aria-hidden
                      className="absolute h-px w-5 -rotate-45 bg-text-secondary"
                    />
                  ) : null}
                </button>
              );
            }),
          )}
        </div>

        {/* CTA — a PDP link when an in-card pick can't complete (e.g. size),
            otherwise a direct add-to-cart, disabled until a valid in-stock
            combination is chosen. Same vertical position on every card. */}
        {needsPdp ? (
          <Button
            size="lg"
            variant="outline"
            className="mt-2 w-full rounded-sm"
            render={<Link href={href} />}
          >
            Select options
          </Button>
        ) : (
          <Button
            size="lg"
            variant="outline"
            className="mt-2 w-full rounded-sm"
            disabled={!addable}
            onClick={handleAdd}
            nativeButton
          >
            {added ? (
              <>
                <Check className="text-accent" aria-hidden />
                Added
              </>
            ) : (
              ctaLabel
            )}
          </Button>
        )}
      </div>
    </article>
  );
}
