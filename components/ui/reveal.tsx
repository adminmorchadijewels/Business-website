"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export interface RevealProps extends React.HTMLAttributes<HTMLElement> {
  /** Element to render (e.g. "section", "footer"). Defaults to a div. */
  as?: React.ElementType;
}

/**
 * Reveal — fades + slides a block up the first time it scrolls into view.
 *
 * IntersectionObserver-based (no animation library, to keep the Workers bundle
 * small). The motion itself lives in the `.reveal` / `.reveal-shown` utilities
 * in app/globals.css (opacity 0→1, translateY 20px→0, ~0.5s ease-out). Fires
 * once, then disconnects. Respects `prefers-reduced-motion`: those users (and
 * any environment without IntersectionObserver) get the content shown
 * immediately with no transform.
 */
export function Reveal({ as, className, children, ...props }: RevealProps) {
  const Tag = (as ?? "div") as React.ElementType;
  const ref = React.useRef<HTMLElement | null>(null);
  const [shown, setShown] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Reduced-motion users are handled entirely in CSS: the `.reveal` rule resets
    // to fully visible under prefers-reduced-motion, so no JS state change needed.
    if (!("IntersectionObserver" in window)) {
      // Extremely rare fallback (no IntersectionObserver) — just show it.
      const id = requestAnimationFrame(() => setShown(true));
      return () => cancelAnimationFrame(id);
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setShown(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={cn("reveal", shown && "reveal-shown", className)}
      {...props}
    >
      {children}
    </Tag>
  );
}
