import * as React from "react";

import { cn } from "@/lib/utils";

export interface MarqueeProps extends React.ComponentProps<"div"> {
  /** Seconds for one full loop. Lower = faster. */
  durationSec?: number;
}

/**
 * Marquee — a continuous, seamless horizontal scroll.
 *
 * The track renders its children twice and animates by -50% (see the
 * `animate-marquee` utility + `@keyframes marquee` in globals.css), so the loop
 * has no visible seam. Pauses on hover; respects prefers-reduced-motion.
 * Pure CSS — no JS — so it can stay a server component.
 */
function Marquee({ className, children, durationSec = 30, ...props }: MarqueeProps) {
  return (
    <div
      data-slot="marquee"
      className={cn("marquee-pause group relative overflow-hidden", className)}
      {...props}
    >
      <div
        className="flex w-max animate-marquee"
        style={{ "--marquee-duration": `${durationSec}s` } as React.CSSProperties}
      >
        <div className="flex shrink-0 items-center">{children}</div>
        {/* Second copy completes the seamless loop; hidden from the a11y tree. */}
        <div className="flex shrink-0 items-center" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}

export { Marquee };
