"use client";

import { cn } from "@/lib/utils";
import type { VariantAxis, VariantGroup } from "@/types/product";
import type { Selection } from "@/lib/product";

export interface VariantSelectorProps {
  groups: VariantGroup[];
  selected: Selection;
  /** Is `value` on `axis` available given the current selection? */
  isAvailable: (axis: VariantAxis, value: string) => boolean;
  onSelect: (axis: VariantAxis, value: string) => void;
}

/**
 * VariantSelector — renders one block per axis. Colour/stone axes show visual
 * SWATCH circles (the swatch colour is product data, applied via inline style —
 * see decisions.md); size shows text pills. Sold-out options are DISABLED (shown
 * but not selectable), never hidden. Presentational: selection state +
 * availability are owned by the parent (ProductBuyBox).
 */
export function VariantSelector({
  groups,
  selected,
  isAvailable,
  onSelect,
}: VariantSelectorProps) {
  return (
    <div className="flex flex-col gap-5">
      {groups.map((group) => {
        const chosen = selected[group.axis];
        const chosenLabel = group.options.find((o) => o.value === chosen)?.label;
        const isSwatch = group.axis === "colour" || group.axis === "stone";

        return (
          <div key={group.axis}>
            <p className="mb-2 font-body text-sm text-text-primary">
              <span className="font-semibold">{group.label}</span>
              {chosenLabel ? (
                <span className="text-text-secondary">: {chosenLabel}</span>
              ) : null}
            </p>

            <div className="flex flex-wrap items-center gap-2.5">
              {group.options.map((opt) => {
                const isSelected = chosen === opt.value;
                const available = isAvailable(group.axis, opt.value);

                if (isSwatch) {
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      disabled={!available}
                      onClick={() => onSelect(group.axis, opt.value)}
                      aria-pressed={isSelected}
                      aria-label={`${opt.label}${available ? "" : " (sold out)"}`}
                      title={available ? opt.label : `${opt.label} — sold out`}
                      className={cn(
                        "relative grid size-9 place-items-center rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                        isSelected
                          ? "ring-2 ring-accent ring-offset-2 ring-offset-background"
                          : "ring-1 ring-keyline hover:ring-accent/50",
                        !available && "cursor-not-allowed opacity-40",
                      )}
                    >
                      <span
                        className="size-7 rounded-full border border-keyline"
                        // Swatch colour is product DATA, not a theme token.
                        style={{ backgroundColor: opt.swatch }}
                      />
                      {!available ? (
                        <span
                          aria-hidden
                          className="absolute h-px w-8 -rotate-45 bg-text-secondary"
                        />
                      ) : null}
                    </button>
                  );
                }

                return (
                  <button
                    key={opt.value}
                    type="button"
                    disabled={!available}
                    onClick={() => onSelect(group.axis, opt.value)}
                    aria-pressed={isSelected}
                    aria-label={`${opt.label}${available ? "" : " (sold out)"}`}
                    className={cn(
                      "min-w-9 rounded-sm border px-3 py-1.5 font-body text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                      isSelected
                        ? "border-accent bg-accent text-on-accent"
                        : "border-keyline text-text-primary hover:border-accent/50",
                      !available &&
                        "cursor-not-allowed text-text-secondary line-through opacity-50",
                    )}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
