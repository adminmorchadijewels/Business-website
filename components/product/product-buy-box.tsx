"use client";

import * as React from "react";
import Link from "next/link";
import { Check, Info, Minus, Plus } from "lucide-react";

import { formatPriceFromPaise } from "@/lib/format";
import { useCart } from "@/components/cart/cart-context";
import { lineKey } from "@/lib/cart";
import type { Product, VariantAxis } from "@/types/product";
import {
  type Selection,
  applySelection,
  canAddToCart,
  findVariant,
  isOptionAvailable,
  resolvePrice,
  selectionAxes,
} from "@/lib/product";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VariantSelector } from "@/components/product/variant-selector";
import { trustClaims } from "@/mock-data/home";

export interface ProductBuyBoxProps {
  product: Product;
}

// PLACEHOLDER trust claims (same caveat as the Home page trust strip): the
// waterproof / anti-tarnish / skin-friendly claims MUST be confirmed with the
// business and verified before launch.
const PDP_TRUST = trustClaims.slice(0, 3);

/**
 * ProductBuyBox — the interactive purchase column (sections 3–7): title, price
 * (range → exact per selection), variant selectors, the customisation/partial-
 * payment note, Add to Cart (disabled until a valid in-stock combination is
 * chosen), and the trust-badges row. Owns the selection state and all price /
 * availability resolution (logic in lib/product.ts).
 */
export function ProductBuyBox({ product }: ProductBuyBoxProps) {
  const cart = useCart();

  // Pre-select any single-option axes so their SKU resolves automatically.
  const [selected, setSelected] = React.useState<Selection>(() => {
    const init: Selection = {};
    for (const g of product.optionGroups ?? []) {
      if (g.options.length === 1) init[g.axis] = g.options[0].value;
    }
    return init;
  });

  // Only render selectors for axes with a real choice (>1 option).
  const groups = (product.optionGroups ?? []).filter((g) => g.options.length > 1);
  const price = resolvePrice(product, selected);
  const addable = canAddToCart(product, selected);
  const soldOut = !product.inStock;

  // Live cart state for the EXACT variant currently selected. Each distinct
  // variant combination is its own line (same key the cart context uses), so
  // switching the selection swaps which line's quantity the stepper reflects —
  // possibly 0, which falls back to the Add to Cart button. Only meaningful for
  // an addable selection; an incomplete one has no resolved SKU to look up.
  const lineId = addable
    ? lineKey(product.id, findVariant(product, selected)?.id)
    : null;
  const qtyInCart = lineId
    ? (cart.lines.find((l) => l.id === lineId)?.qty ?? 0)
    : 0;

  const remainingAxes = selectionAxes(product).filter((a) => selected[a] == null);
  const remainingLabels = remainingAxes.map(
    (a) => product.optionGroups?.find((g) => g.axis === a)?.label.toLowerCase() ?? a,
  );

  function handleSelect(axis: VariantAxis, value: string) {
    setSelected((prev) => applySelection(product, prev, axis, value));
  }

  const ctaLabel = soldOut
    ? "Sold out"
    : !addable
      ? "Select options"
      : "Add to cart";

  return (
    <div className="mt-8 lg:mt-0">
      {/* 3 — Title + price */}
      {product.tag ? (
        <Badge variant="soft" className="mb-3">
          {product.tag}
        </Badge>
      ) : null}
      <h1 className="font-heading text-2xl font-semibold leading-tight text-text-primary sm:text-3xl">
        {product.name}
      </h1>
      <p className="mt-1 font-body text-sm text-text-secondary">
        {product.material}
      </p>

      <div className="mt-4 flex items-baseline gap-3">
        {price.exact ? (
          <>
            {price.originalPriceInPaise ? (
              <span className="font-body text-base text-text-secondary line-through">
                {formatPriceFromPaise(price.originalPriceInPaise)}
              </span>
            ) : null}
            <span className="font-heading text-2xl font-semibold text-text-primary">
              {formatPriceFromPaise(price.priceInPaise)}
            </span>
          </>
        ) : (
          // Range shown until a full combination is selected.
          <span className="font-heading text-2xl font-semibold text-text-primary">
            {formatPriceFromPaise(price.priceInPaise)} –{" "}
            {formatPriceFromPaise(price.maxInPaise)}
          </span>
        )}
      </div>

      {/* 4 — Variant selectors (swatches always; size only when applicable) */}
      {groups.length > 0 ? (
        <div className="mt-6">
          <VariantSelector
            groups={groups}
            selected={selected}
            isAvailable={(axis, value) =>
              isOptionAvailable(product, axis, value, selected)
            }
            onSelect={handleSelect}
          />
        </div>
      ) : null}

      {/* 5 — Customisation / partial-payment note */}
      {product.isCustomisable ? (
        <div className="mt-6 flex gap-3 rounded-md border border-keyline bg-surface-warm p-4">
          <Info className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
          <div>
            <p className="font-body text-sm font-semibold text-text-primary">
              Made to order — partial payment required
            </p>
            <p className="mt-1 font-body text-sm text-text-secondary">
              {product.depositInPaise
                ? `${formatPriceFromPaise(product.depositInPaise)} deposit to confirm this order; the balance is collected before dispatch.`
                : "A deposit is required to confirm this made-to-order piece."}
            </p>
          </div>
        </div>
      ) : null}

      {/* 6 — Add to Cart → live quantity stepper once this variant is in the
          cart. The stepper writes straight to the cart context (no separate
          local counter), so the header badge and Cart page stay in lockstep;
          decrementing to 0 removes the line and reverts to the button. */}
      <div className="mt-6">
        {qtyInCart > 0 && lineId ? (
          <div className="flex items-center justify-between gap-4">
            <div className="inline-flex items-center rounded-sm border border-keyline">
              <button
                type="button"
                onClick={() =>
                  qtyInCart <= 1
                    ? cart.remove(lineId)
                    : cart.setQty(lineId, qtyInCart - 1)
                }
                aria-label="Decrease quantity"
                className="grid size-12 place-items-center text-text-primary transition-colors hover:bg-surface-alt"
              >
                <Minus className="size-4" />
              </button>
              <span
                aria-live="polite"
                className="w-12 text-center font-body text-base font-semibold tabular-nums text-text-primary"
              >
                {qtyInCart}
              </span>
              <button
                type="button"
                onClick={() => cart.setQty(lineId, qtyInCart + 1)}
                aria-label="Increase quantity"
                className="grid size-12 place-items-center text-text-primary transition-colors hover:bg-surface-alt"
              >
                <Plus className="size-4" />
              </button>
            </div>
            <Link
              href="/cart"
              className="inline-flex items-center gap-1.5 font-body text-sm font-medium text-accent underline-offset-4 hover:underline"
            >
              <Check className="size-4" aria-hidden />
              View cart
            </Link>
          </div>
        ) : (
          <Button
            size="lg"
            className="w-full rounded-sm"
            disabled={!addable}
            onClick={() => cart.add(product, selected, 1)}
            nativeButton
          >
            {ctaLabel}
          </Button>
        )}
        {!soldOut && !addable && remainingLabels.length > 0 ? (
          <p className="mt-2 text-center font-body text-xs text-text-secondary">
            Select a {remainingLabels.join(" and ")} to continue.
          </p>
        ) : null}
      </div>

      {/* 7 — Trust badges (placeholder claims; see caveat above) */}
      <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 border-t border-keyline pt-5">
        {PDP_TRUST.map((claim) => (
          <li
            key={claim}
            className="inline-flex items-center gap-1.5 font-body text-xs font-medium uppercase tracking-[0.14em] text-text-secondary"
          >
            <Check className="size-3.5 text-accent" aria-hidden />
            {claim}
          </li>
        ))}
      </ul>
    </div>
  );
}
