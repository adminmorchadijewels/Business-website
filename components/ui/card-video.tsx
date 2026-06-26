"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export interface CardVideoProps {
  /** Video file URL — lazy-loaded only once the card scrolls into view. */
  src: string;
  /** Poster/first-frame still, shown until (and whenever) the video isn't playing. */
  poster: string;
  alt: string;
  className?: string;
}

/**
 * CardVideo — an ambient, poster-framed product video for grid/rail cards.
 *
 * Same IntersectionObserver-driven scroll-in pattern as `Reveal`, but instead of
 * a one-shot reveal it gates *playback*: the clip autoplays (muted + looped, no
 * controls) only while the card is in the viewport, and pauses + fully UNLOADS
 * its source the moment it scrolls out — so no more videos download or decode
 * than are actually on screen. Key performance choices:
 *
 *  - `preload="none"` + no initial `src`: nothing downloads on page load. The
 *    file URL is attached (and `load()`ed) the first time the card enters view.
 *  - On exit we `pause()`, drop the `src` and `load()` again, releasing the
 *    buffered video; the `poster` still frame stays as the fallback image, so
 *    there's never a blank/black flash before or after playback.
 *  - `muted` is set on the element (not just as a prop) because browser autoplay
 *    policies only allow muted autoplay, and React doesn't reliably reflect the
 *    `muted` attribute.
 *  - `prefers-reduced-motion` (and any environment without IntersectionObserver)
 *    short-circuits before any source is attached: those users only ever see the
 *    static poster frame — consistent with how `Reveal` drops its motion.
 */
export function CardVideo({ src, poster, alt, className }: CardVideoProps) {
  const ref = React.useRef<HTMLVideoElement | null>(null);
  const [inView, setInView] = React.useState(false);

  // Observe viewport intersection (skipped entirely under reduced-motion).
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Autoplay only works muted; set the property directly (the attribute alone
    // isn't reliably applied by React).
    el.muted = true;

    const prefersReduced = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReduced || !("IntersectionObserver" in window)) {
      // Poster-only: never attach/download the video source.
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => setInView(entries[0]?.isIntersecting ?? false),
      { threshold: 0.25 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Attach + play while in view; unload + reset to the poster while out of view.
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (inView) {
      if (el.getAttribute("src") !== src) {
        el.setAttribute("src", src);
        el.load();
      }
      el.muted = true;
      const playback = el.play();
      // Ignore the rejection browsers throw if playback is interrupted (e.g. the
      // card scrolls back out before the file is ready).
      if (playback?.catch) playback.catch(() => {});
    } else {
      el.pause();
      if (el.getAttribute("src")) {
        // Drop the buffered source so an off-screen card stops downloading; the
        // poster frame reappears as the fallback.
        el.removeAttribute("src");
        el.load();
      }
    }
  }, [inView, src]);

  return (
    <video
      ref={ref}
      poster={poster}
      aria-label={alt}
      muted
      loop
      playsInline
      preload="none"
      className={cn("h-full w-full object-cover", className)}
    />
  );
}
