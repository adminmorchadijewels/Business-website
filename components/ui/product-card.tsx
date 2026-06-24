import * as React from "react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export interface ProductCardProps extends React.ComponentProps<"article"> {
  name: string;
  /** Pre-formatted price string, e.g. "₹ 24,800". */
  price: string;
  imageSrc?: string;
  imageAlt?: string;
  /** Optional pill, e.g. "NEW" — rendered with the accent-soft badge. */
  tag?: string;
}

/**
 * ProductCard — the Daylight "matted frame" pattern.
 * A thin keyline border (no shadow) frames a product image that sits inset
 * inside a warm surface "mat", like a gallery frame. Name in heading font,
 * price in body font / semibold. Every colour, radius and inset is a token.
 */
function ProductCard({
  className,
  name,
  price,
  imageSrc = "/placeholder-product.svg",
  imageAlt,
  tag,
  ...props
}: ProductCardProps) {
  return (
    <article
      data-slot="product-card"
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-lg border border-keyline bg-card p-mat transition-colors",
        "hover:border-accent/40",
        className
      )}
      {...props}
    >
      {tag ? (
        <Badge variant="soft" className="absolute end-mat top-mat z-10">
          {tag}
        </Badge>
      ) : null}

      {/* The mat: warm surface inset that frames the image. */}
      <div className="rounded-md bg-surface-warm p-mat">
        <div className="aspect-square overflow-hidden rounded-sm border border-keyline bg-surface-alt">
          {/* Plain <img>: placeholder art for the design system. Real product
              imagery + next/image handling arrives with the data layer. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageSrc}
            alt={imageAlt ?? name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        </div>
      </div>

      {/* Caption */}
      <div className="flex items-baseline justify-between gap-3 px-1 pt-4 pb-1">
        <h3 className="font-heading text-base leading-snug font-medium text-text-primary">
          {name}
        </h3>
        <p className="font-body text-sm font-semibold text-text-primary whitespace-nowrap">
          {price}
        </p>
      </div>
    </article>
  );
}

export { ProductCard };
