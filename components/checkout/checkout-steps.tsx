import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

export type CheckoutStep = "cart" | "address" | "payment";

const STEPS: { key: CheckoutStep; label: string; href: string }[] = [
  { key: "cart", label: "Cart", href: "/cart" },
  { key: "address", label: "Address", href: "/checkout/address" },
  { key: "payment", label: "Payment", href: "/checkout/payment" },
];

/**
 * CheckoutSteps — a small Cart › Address › Payment progress indicator. Completed
 * steps link back; the current step is highlighted; upcoming steps are muted.
 */
export function CheckoutSteps({ current }: { current: CheckoutStep }) {
  const currentIndex = STEPS.findIndex((s) => s.key === current);

  return (
    <nav
      aria-label="Checkout progress"
      className="flex flex-wrap items-center gap-1.5 font-body text-sm"
    >
      {STEPS.map((step, i) => {
        const done = i < currentIndex;
        const active = i === currentIndex;
        const label = (
          <span
            className={cn(
              "tabular-nums",
              active
                ? "font-semibold text-text-primary"
                : done
                  ? "text-accent"
                  : "text-text-secondary",
            )}
            aria-current={active ? "step" : undefined}
          >
            {i + 1}. {step.label}
          </span>
        );
        return (
          <span key={step.key} className="flex items-center gap-1.5">
            {done ? (
              <Link href={step.href} className="underline-offset-4 hover:underline">
                {label}
              </Link>
            ) : (
              label
            )}
            {i < STEPS.length - 1 ? (
              <ChevronRight className="size-3.5 text-text-secondary" aria-hidden />
            ) : null}
          </span>
        );
      })}
    </nav>
  );
}
