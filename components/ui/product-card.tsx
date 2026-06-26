import * as React from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export interface ProductCardProps extends React.ComponentProps<"article"> {
  name: string;
  /** Pre-formatted current price string, e.g. "₹ 24,800". */
  price: string;
  /** Pre-formatted original price, struck-through when the product is on sale. */
  originalPrice?: string;
  imageSrc?: string;
  imageAlt?: string;
  /** Optional pill, e.g. "NEW" — rendered with the accent-soft badge. */
  tag?: string;
  /** When set, the whole card links here (e.g. /products/[slug]). */
  href?: string;
}

/**
 * ProductCard — clean, borderless e-commerce card.
 *
 * The product image sits directly on a clean near-white surface in a SQUARE
 * (1:1) frame, object-cover cropped — no border, no matted inset, no circular
 * crop. Name and price stack simply below, left-aligned; on sale the original
 * price is struck-through next to the current price. Hover lifts the card
 * slightly (translateY + soft shadow) and gently zooms the image. Intentionally
 * minimal: no ratings, wishlist or hover-add-to-cart.
 *
 * Every colour, radius and inset references a Daylight token — only the visual
 * treatment changed from the earlier "matted frame" pattern (see decisions.md).
 */
function ProductCard({
  className,
  name,
  price,
  originalPrice,
  imageSrc = "/placeholder-product.svg",
  imageAlt,
  tag,
  href,
  ...props
}: ProductCardProps) {
  const body = (
    <>
      {/* Square near-white frame; the image fills it edge-to-edge (no mat). */}
      <div className="relative aspect-square overflow-hidden rounded-md bg-card transition-shadow duration-200 ease-out group-hover:shadow-lg">
        {tag ? (
          <Badge variant="soft" className="absolute end-2 top-2 z-10">
            {tag}
          </Badge>
        ) : null}

        {/* Plain <img>: placeholder art for the design system. Real product
            imagery + next/image handling arrives with the data layer. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageSrc}
          alt={imageAlt ?? name}
          width={600}
          height={600}
          className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
        />
      </div>

      {/* Caption: name over price, left-aligned, no decoration. */}
      <div className="flex flex-col gap-0.5 px-0.5 pt-2.5">
        <h3 className="font-heading text-sm leading-snug font-medium text-text-primary">
          {name}
        </h3>
        <p className="flex items-baseline gap-2 font-body text-sm">
          {originalPrice ? (
            <span className="text-text-secondary line-through">
              {originalPrice}
            </span>
          ) : null}
          <span className="font-semibold text-text-primary">{price}</span>
        </p>
      </div>
    </>
  );

  return (
    <article
      data-slot="product-card"
      className={cn(
        "group flex flex-col transition duration-200 ease-out hover:-translate-y-1",
        className,
      )}
      {...props}
    >
      {href ? (
        <Link href={href} className="flex flex-col">
          {body}
        </Link>
      ) : (
        body
      )}
    </article>
  );
}

export { ProductCard };
