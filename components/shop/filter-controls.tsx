"use client";

import * as React from "react";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import type { ColourTone, ProductCategory } from "@/types/product";
import {
  CATEGORY_FACET,
  COLOUR_FACET,
  PRICE_FACET,
  type PriceBucket,
  type ShopFilters,
} from "@/lib/shop";
import {
  Accordion,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "@/components/ui/accordion";

/** The three multi-select facet groups handled here. */
export type FacetGroup = "categories" | "prices" | "colours";

export interface FacetCounts {
  categories: Partial<Record<ProductCategory, number>>;
  prices: Partial<Record<PriceBucket, number>>;
  colours: Partial<Record<ColourTone, number>>;
}

export interface FilterControlsProps {
  filters: ShopFilters;
  counts: FacetCounts;
  /** Hidden on category-locked pages (category implied by the URL). */
  showCategory: boolean;
  /** Category options to offer (those present in the dataset), in facet order. */
  availableCategories: ProductCategory[];
  onToggle: (group: FacetGroup, value: string) => void;
}

/** A single token-styled, controlled checkbox row with an optional count. */
function FilterCheckbox({
  label,
  checked,
  count,
  onChange,
}: {
  label: string;
  checked: boolean;
  count?: number;
  onChange: () => void;
}) {
  return (
    <label className="group/cb flex cursor-pointer items-center gap-2.5 py-1.5">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="peer sr-only"
      />
      <span
        className={cn(
          "grid size-4 shrink-0 place-items-center rounded-sm border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-ring/50",
          checked
            ? "border-accent bg-accent text-on-accent"
            : "border-keyline bg-card group-hover/cb:border-accent/50",
        )}
      >
        {checked ? <Check className="size-3" /> : null}
      </span>
      <span className="flex-1 font-body text-sm text-text-primary">{label}</span>
      {typeof count === "number" ? (
        <span className="font-body text-xs tabular-nums text-text-secondary">
          {count}
        </span>
      ) : null}
    </label>
  );
}

/** A collapsible facet group: the uppercase eyebrow title is the accordion
 *  trigger, the checkboxes live in the panel. */
function FacetAccordionItem({
  value,
  title,
  children,
}: {
  value: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <AccordionItem value={value}>
      <AccordionTrigger className="font-body text-xs font-semibold uppercase tracking-[0.18em] text-text-primary">
        {title}
      </AccordionTrigger>
      <AccordionPanel>
        <div className="flex flex-col">{children}</div>
      </AccordionPanel>
    </AccordionItem>
  );
}

/** Section keys used as the accordion's open-state values. */
const CATEGORY_SECTION = "category";
const PRICE_SECTION = "price";
const MATERIAL_SECTION = "material";

/**
 * FilterControls — the Category / Price / Material facet checkboxes, shared by
 * the desktop sidebar (commits immediately) and the mobile drawer (mutates
 * pending state). It is fully controlled: it renders `filters` and reports
 * toggles via `onToggle`; the parent decides when to apply.
 *
 * Each facet group is a collapsible accordion section (Base UI Accordion). All
 * sections start expanded (`defaultValue` lists them all) so the filters are
 * visible by default; collapsing is purely local UI and never touches filter
 * state. `multiple` lets any combination of groups stay open at once.
 */
export function FilterControls({
  filters,
  counts,
  showCategory,
  availableCategories,
  onToggle,
}: FilterControlsProps) {
  const defaultOpen = [
    ...(showCategory ? [CATEGORY_SECTION] : []),
    PRICE_SECTION,
    MATERIAL_SECTION,
  ];

  return (
    <Accordion multiple defaultValue={defaultOpen} className="flex flex-col">
      {showCategory ? (
        <FacetAccordionItem value={CATEGORY_SECTION} title="Category">
          {CATEGORY_FACET.filter((c) =>
            availableCategories.includes(c.value),
          ).map((c) => (
            <FilterCheckbox
              key={c.value}
              label={c.label}
              checked={filters.categories.includes(c.value)}
              count={counts.categories[c.value] ?? 0}
              onChange={() => onToggle("categories", c.value)}
            />
          ))}
        </FacetAccordionItem>
      ) : null}

      <FacetAccordionItem value={PRICE_SECTION} title="Price">
        {PRICE_FACET.map((p) => (
          <FilterCheckbox
            key={p.value}
            label={p.label}
            checked={filters.prices.includes(p.value)}
            count={counts.prices[p.value] ?? 0}
            onChange={() => onToggle("prices", p.value)}
          />
        ))}
      </FacetAccordionItem>

      <FacetAccordionItem value={MATERIAL_SECTION} title="Material / Colour">
        {COLOUR_FACET.map((c) => (
          <FilterCheckbox
            key={c.value}
            label={c.label}
            checked={filters.colours.includes(c.value)}
            count={counts.colours[c.value] ?? 0}
            onChange={() => onToggle("colours", c.value)}
          />
        ))}
      </FacetAccordionItem>
    </Accordion>
  );
}
