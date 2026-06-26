"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

export interface AnnouncementBarProps {
  /** Rotating messages; each is shown in turn. */
  messages: string[];
  /** Auto-advance interval in ms. */
  intervalMs?: number;
  className?: string;
}

/**
 * AnnouncementBar — a slim accent strip at the very top of the page that
 * auto-rotates through promo messages with a fade, plus manual prev/next arrows.
 * Client component (rotation state + interval). aria-live announces changes.
 */
function AnnouncementBar({
  messages,
  intervalMs = 4000,
  className,
}: AnnouncementBarProps) {
  const [index, setIndex] = React.useState(0);
  const count = messages.length;

  const go = React.useCallback(
    (delta: number) => setIndex((i) => (i + delta + count) % count),
    [count],
  );

  // Auto-advance. Re-arms whenever the index changes (so a manual click also
  // resets the timer) or motion is allowed.
  React.useEffect(() => {
    if (count <= 1) return;
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;
    const id = window.setInterval(() => go(1), intervalMs);
    return () => window.clearInterval(id);
  }, [index, intervalMs, count, go]);

  if (count === 0) return null;

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-2 bg-accent px-4 py-2 text-on-accent",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => go(-1)}
        aria-label="Previous announcement"
        className="rounded-full p-1 text-on-accent/80 transition-colors hover:bg-on-accent/10 hover:text-on-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-on-accent/50"
      >
        <ChevronLeft className="size-4" />
      </button>

      <p
        key={index}
        aria-live="polite"
        className="animate-in fade-in min-w-0 text-center font-body text-xs font-medium tracking-wide duration-500 sm:text-sm"
      >
        {messages[index]}
      </p>

      <button
        type="button"
        onClick={() => go(1)}
        aria-label="Next announcement"
        className="rounded-full p-1 text-on-accent/80 transition-colors hover:bg-on-accent/10 hover:text-on-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-on-accent/50"
      >
        <ChevronRight className="size-4" />
      </button>
    </div>
  );
}

export { AnnouncementBar };
