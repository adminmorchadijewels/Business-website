"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

const CLAMP: Record<number, string> = {
  3: "line-clamp-3",
  4: "line-clamp-4",
  5: "line-clamp-5",
};

export interface ExpandableTextProps {
  /** Full body text. ALWAYS rendered in the DOM (SEO) — only visually clipped. */
  text: string;
  /** Lines shown when collapsed (default 4). */
  lines?: 3 | 4 | 5;
  className?: string;
}

/**
 * ExpandableText — SEO-safe "See more / See less" truncation.
 *
 * The full text is always present in the rendered DOM; collapsing is purely
 * visual (CSS `line-clamp` + a fade-out gradient at the bottom edge). Expanding
 * removes the clamp instantly (no loading state). A single expand interaction —
 * deliberately NOT an accordion. Reusable on other pages later.
 */
export function ExpandableText({ text, lines = 4, className }: ExpandableTextProps) {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <div className={className}>
      <div className="relative">
        <p
          className={cn(
            "font-body text-sm leading-relaxed text-text-secondary",
            !expanded && CLAMP[lines],
          )}
        >
          {text}
        </p>
        {/* Fade-out over the last clamped line; hidden once expanded. */}
        {!expanded ? (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-background to-transparent"
          />
        ) : null}
      </div>
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        aria-expanded={expanded}
        className="mt-2 font-body text-sm font-medium text-accent underline-offset-4 hover:underline"
      >
        {expanded ? "See less" : "See more"}
      </button>
    </div>
  );
}
