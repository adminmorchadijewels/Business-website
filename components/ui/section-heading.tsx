import * as React from "react";

import { cn } from "@/lib/utils";

export interface SectionHeadingProps extends React.ComponentProps<"div"> {
  /** Small uppercase label above the title, in the accent colour. */
  eyebrow?: string;
  /** Optional supporting line beneath the title. */
  description?: string;
  align?: "start" | "center";
  as?: "h1" | "h2" | "h3";
}

/**
 * SectionHeading — heading font with the Daylight accent marker.
 * A short accent underline sits beneath the title; an optional accent eyebrow
 * sits above it. All colour / type / radius values are tokens.
 */
function SectionHeading({
  className,
  eyebrow,
  description,
  align = "start",
  as = "h2",
  children,
  ...props
}: SectionHeadingProps) {
  const Title = as;
  return (
    <div
      data-slot="section-heading"
      className={cn(
        "flex flex-col",
        align === "center" ? "items-center text-center" : "items-start",
        className
      )}
      {...props}
    >
      {eyebrow ? (
        <span className="font-body text-xs font-semibold uppercase tracking-[0.18em] text-accent">
          {eyebrow}
        </span>
      ) : null}

      <Title className="mt-2 font-heading text-2xl font-semibold leading-tight text-text-primary sm:text-3xl">
        {children}
      </Title>

      {/* Accent marker */}
      <span
        aria-hidden
        className="mt-3 block h-1 w-10 rounded-full bg-accent"
      />

      {description ? (
        <p className="mt-3 max-w-prose font-body text-sm text-text-secondary">
          {description}
        </p>
      ) : null}
    </div>
  );
}

export { SectionHeading };
