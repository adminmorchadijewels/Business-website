"use client";

import * as React from "react";
import { Play } from "lucide-react";

import { cn } from "@/lib/utils";
import type { GalleryMedia } from "@/types/product";
import { DragScroll } from "@/components/ui/drag-scroll";

export interface ProductGalleryProps {
  /** Mixed-media gallery: image and/or video items, in display order. */
  media: GalleryMedia[];
  alt: string;
}

/** The still image to show for a gallery item (the poster for a video). */
function thumbSrc(item: GalleryMedia): string {
  return item.type === "video" ? (item.poster ?? "") : item.src;
}

/**
 * GalleryVideo — the PDP main-viewer video. While it's the ACTIVE gallery item
 * it autoplays and loops, MUTED by default (browsers only permit muted
 * autoplay), with the native volume/unmute, play/pause and fullscreen controls
 * kept visible so a shopper can turn sound on manually. It's poster-framed (no
 * blank flash) and pauses whenever it isn't the active item (e.g. another slide
 * is showing in the mobile carousel). `muted` is set on the element itself, not
 * just as a prop, because React doesn't reliably reflect the `muted` attribute.
 */
function GalleryVideo({
  item,
  alt,
  active,
}: {
  item: GalleryMedia;
  alt: string;
  active: boolean;
}) {
  const ref = React.useRef<HTMLVideoElement | null>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.muted = true;
    if (active) {
      const playback = el.play();
      // Browsers reject play() if it's interrupted (e.g. the slide changes
      // before the file is ready) — that's expected, so swallow it.
      if (playback?.catch) playback.catch(() => {});
    } else {
      el.pause();
    }
  }, [active]);

  return (
    <video
      ref={ref}
      src={item.src}
      poster={item.poster}
      controls
      autoPlay={active}
      loop
      muted
      playsInline
      preload="metadata"
      aria-label={`${alt} — video`}
      className="h-full w-full object-cover"
    />
  );
}

/**
 * ProductGallery — main viewer + thumbnail rail on desktop; a free-flowing,
 * scrollbar-less swipe carousel (with dot indicators) on mobile. Same drag/
 * momentum scroll pattern (DragScroll) used elsewhere; no visible scrollbar.
 *
 * Mixed media: an item can be an image or a video. The main viewer renders a
 * `<video controls>` (poster-framed) for video items and an `<img>` for images;
 * thumbnails always show the still/poster image with a small play-icon overlay
 * marking the video ones so they're distinguishable before clicking.
 */
export function ProductGallery({ media, alt }: ProductGalleryProps) {
  const [active, setActive] = React.useState(0);
  const [mobileIndex, setMobileIndex] = React.useState(0);
  const current = media[active] ?? media[0];

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
          {media.map((item, i) => (
            <div
              key={i}
              className="aspect-square w-full shrink-0 snap-center overflow-hidden rounded-lg bg-card"
            >
              {item.type === "video" ? (
                <GalleryVideo item={item} alt={alt} active={i === mobileIndex} />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.src}
                  alt={`${alt} — view ${i + 1}`}
                  width={800}
                  height={800}
                  className="h-full w-full object-cover"
                />
              )}
            </div>
          ))}
        </DragScroll>
        {media.length > 1 ? (
          <div className="mt-3 flex justify-center gap-1.5">
            {media.map((_, i) => (
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

      {/* Desktop: thumbnail rail + main viewer */}
      <div className="hidden gap-4 lg:flex">
        <div className="flex flex-col gap-3">
          {media.map((item, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={
                item.type === "video" ? `Play video ${i + 1}` : `View image ${i + 1}`
              }
              aria-current={i === active}
              className={cn(
                "relative size-16 overflow-hidden rounded-md bg-card ring-1 transition",
                i === active
                  ? "ring-2 ring-accent"
                  : "ring-keyline hover:ring-accent/50",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={thumbSrc(item)}
                alt=""
                width={64}
                height={64}
                className="h-full w-full object-cover"
              />
              {item.type === "video" ? (
                <span
                  aria-hidden
                  className="absolute inset-0 grid place-items-center bg-text-primary/30"
                >
                  <span className="grid size-6 place-items-center rounded-full bg-background/90 text-text-primary">
                    <Play className="size-3 translate-x-px fill-current" />
                  </span>
                </span>
              ) : null}
            </button>
          ))}
        </div>
        <div className="group relative aspect-square flex-1 overflow-hidden rounded-lg bg-card">
          {current?.type === "video" ? (
            <GalleryVideo key={active} item={current} alt={alt} active />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={current?.src}
              alt={alt}
              width={800}
              height={800}
              className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
            />
          )}
        </div>
      </div>
    </div>
  );
}
