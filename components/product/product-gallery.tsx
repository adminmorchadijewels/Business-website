"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { DragScroll } from "@/components/ui/drag-scroll";

export interface ProductGalleryProps {
  images: string[];
  alt: string;
}

/**
 * ProductGallery — main image + thumbnail rail on desktop; a free-flowing,
 * scrollbar-less swipe carousel (with dot indicators) on mobile. Same drag/
 * momentum scroll pattern (DragScroll) used elsewhere; no visible scrollbar.
 */
export function ProductGallery({ images, alt }: ProductGalleryProps) {
  const [active, setActive] = React.useState(0);
  const [mobileIndex, setMobileIndex] = React.useState(0);

  return (
    <div>
      {/* Mobile: swipeable carousel + dots */}
      <div className="lg:hidden">
        <DragScroll
          className="flex snap-x snap-mandatory gap-3 overflow-x-auto"
          onScroll={(e) => {
            const el = e.currentTarget;
            setMobileIndex(Math.round(el.scrollLeft / Math.max(1, el.clientWidth)));
          }}
        >
          {images.map((src, i) => (
            <div
              key={i}
              className="aspect-square w-full shrink-0 snap-center overflow-hidden rounded-lg bg-card"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`${alt} — view ${i + 1}`}
                width={800}
                height={800}
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </DragScroll>
        {images.length > 1 ? (
          <div className="mt-3 flex justify-center gap-1.5">
            {images.map((_, i) => (
              <span
                key={i}
                aria-hidden
                className={cn(
                  "size-1.5 rounded-full transition-colors",
                  i === mobileIndex ? "bg-accent" : "bg-keyline",
                )}
              />
            ))}
          </div>
        ) : null}
      </div>

      {/* Desktop: thumbnail rail + main image */}
      <div className="hidden gap-4 lg:flex">
        <div className="flex flex-col gap-3">
          {images.map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1}`}
              aria-current={i === active}
              className={cn(
                "size-16 overflow-hidden rounded-md bg-card ring-1 transition",
                i === active
                  ? "ring-2 ring-accent"
                  : "ring-keyline hover:ring-accent/50",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt=""
                width={64}
                height={64}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
        <div className="group relative aspect-square flex-1 overflow-hidden rounded-lg bg-card">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[active]}
            alt={alt}
            width={800}
            height={800}
            className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
          />
        </div>
      </div>
    </div>
  );
}
