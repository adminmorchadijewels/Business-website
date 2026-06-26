"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { Product, ProductCategory } from "@/types/product";
import { Button } from "@/components/ui/button";
import { ShopProductCard } from "@/components/shop/shop-product-card";
import { Reveal } from "@/components/ui/reveal";
import {
  CATEGORY_FACET,
  COLOUR_FACET,
  EMPTY_FILTERS,
  PRICE_FACET,
  SORT_OPTIONS,
  type ShopFilters,
  type SortKey,
  browse,
  filterProducts,
  filtersToQuery,
  parseFilters,
} from "@/lib/shop";
import {
  FilterControls,
  type FacetCounts,
  type FacetGroup,
} from "@/components/shop/filter-controls";

export interface ShopBrowserProps {
  /** Dataset to browse (full catalogue, or one category's products). */
  products: Product[];
  /** When set, the category facet is hidden (category implied by the URL). */
  lockedCategory?: ProductCategory;
}

/** Toggle a value within a multi-select facet group; always resets to page 1. */
function toggleValue(
  base: ShopFilters,
  group: FacetGroup,
  value: string,
): ShopFilters {
  const current = base[group] as string[];
  const next = current.includes(value)
    ? current.filter((v) => v !== value)
    : [...current, value];
  return { ...base, [group]: next, page: 1 } as ShopFilters;
}

const labelFor = {
  categories: (v: string) => CATEGORY_FACET.find((c) => c.value === v)?.label ?? v,
  prices: (v: string) => PRICE_FACET.find((p) => p.value === v)?.label ?? v,
  colours: (v: string) => COLOUR_FACET.find((c) => c.value === v)?.label ?? v,
} as const;

/**
 * ShopBrowser — the client browsing engine. The URL query string is the single
 * source of truth for filters/sort/page (parsed via `useSearchParams`); every
 * control rewrites the URL. Desktop shows a sticky sidebar (filters apply
 * immediately); mobile shows a slide-up drawer with pending state + a live
 * result count and Apply / Clear All. All filtering runs client-side against the
 * mock catalogue. The product grid is a static 2-up (mobile) / 3-up (tablet,
 * `md`) / 4-up (desktop, `lg`) grid — deliberately NOT a carousel (the Shop page
 * is for deliberate browsing).
 */
export function ShopBrowser({ products, lockedCategory }: ShopBrowserProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const ignoreCategory = lockedCategory !== undefined;

  const filters = React.useMemo(
    () => parseFilters(searchParams),
    [searchParams],
  );

  const availableCategories = React.useMemo(() => {
    const present = new Set(products.map((p) => p.category));
    return CATEGORY_FACET.map((c) => c.value).filter((v) => present.has(v));
  }, [products]);

  const result = React.useMemo(
    () => browse(products, filters, { ignoreCategory }),
    [products, filters, ignoreCategory],
  );

  // Facet counts: for each option, how many products match if that option were
  // the only selection in its group (other groups intact) — standard facet UX.
  const computeCounts = React.useCallback(
    (state: ShopFilters): FacetCounts => {
      const countWith = (override: Partial<ShopFilters>) =>
        filterProducts(products, { ...state, ...override }, { ignoreCategory })
          .length;
      const categories: FacetCounts["categories"] = {};
      if (!ignoreCategory) {
        for (const v of availableCategories) {
          categories[v] = filterProducts(
            products,
            { ...state, categories: [v] },
            { ignoreCategory: false },
          ).length;
        }
      }
      const prices: FacetCounts["prices"] = {};
      for (const p of PRICE_FACET) prices[p.value] = countWith({ prices: [p.value] });
      const colours: FacetCounts["colours"] = {};
      for (const c of COLOUR_FACET) colours[c.value] = countWith({ colours: [c.value] });
      return { categories, prices, colours };
    },
    [products, ignoreCategory, availableCategories],
  );

  const counts = React.useMemo(
    () => computeCounts(filters),
    [computeCounts, filters],
  );

  // Push filter state into the URL (replace category on locked pages with none).
  // `replace` swaps the current history entry instead of pushing a new one —
  // used by the debounced search box so each keystroke-burst doesn't pollute
  // the back button.
  const commit = React.useCallback(
    (next: ShopFilters, opts?: { replace?: boolean }) => {
      const safe = ignoreCategory ? { ...next, categories: [] } : next;
      const qs = filtersToQuery(safe);
      const url = qs ? `${pathname}?${qs}` : pathname;
      if (opts?.replace) router.replace(url, { scroll: false });
      else router.push(url, { scroll: false });
    },
    [router, pathname, ignoreCategory],
  );

  // ----- Shop-page search box (name match) -----
  // Local input state mirrors the URL's ?q=; we debounce committing it so the
  // grid filters as you type without a navigation per keystroke. The URL stays
  // the single source of truth (sync effect pulls it back on Clear all / nav).
  const [searchInput, setSearchInput] = React.useState(filters.search);
  // Pull the URL's value back into the box when it changes from OUTSIDE typing
  // (Clear all, back/forward, nav). Done as a render-time adjustment keyed on the
  // previous URL value — React's approved "reset state on prop change" pattern —
  // rather than an effect, which would cascade-render. Typing doesn't trigger it:
  // local edits leave `filters.search` untouched until the debounce below commits.
  const [prevUrlSearch, setPrevUrlSearch] = React.useState(filters.search);
  if (filters.search !== prevUrlSearch) {
    setPrevUrlSearch(filters.search);
    setSearchInput(filters.search);
  }
  React.useEffect(() => {
    if (searchInput === filters.search) return;
    const id = setTimeout(() => {
      commit({ ...filters, search: searchInput, page: 1 }, { replace: true });
    }, 250);
    return () => clearTimeout(id);
  }, [searchInput, filters, commit]);

  const activeCount =
    filters.categories.length + filters.prices.length + filters.colours.length;

  const pageHref = React.useCallback(
    (n: number) => {
      const next = ignoreCategory
        ? { ...filters, categories: [], page: n }
        : { ...filters, page: n };
      const qs = filtersToQuery(next);
      return qs ? `${pathname}?${qs}` : pathname;
    },
    [filters, pathname, ignoreCategory],
  );

  // Keep the address bar in sync with what's actually rendered. When a filter
  // narrows results to fewer pages than the URL's ?page=N, `browse()` clamps the
  // shown page (result.page) but the stale param lingers — desyncing the URL and
  // producing wrong shareable links. Replace (not push) to the clamped page so
  // history isn't polluted; filtersToQuery drops ?page entirely when it's 1.
  React.useEffect(() => {
    if (result.page === filters.page) return;
    const safe = ignoreCategory
      ? { ...filters, categories: [], page: result.page }
      : { ...filters, page: result.page };
    const qs = filtersToQuery(safe);
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [result.page, filters, ignoreCategory, pathname, router]);

  // ----- Mobile drawer: pending state, live count, apply/clear -----
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [pending, setPending] = React.useState<ShopFilters>(filters);
  const pendingCount = React.useMemo(
    () => filterProducts(products, pending, { ignoreCategory }).length,
    [products, pending, ignoreCategory],
  );
  const pendingCounts = React.useMemo(
    () => computeCounts(pending),
    [computeCounts, pending],
  );

  function openDrawer() {
    setPending(filters);
    setDrawerOpen(true);
  }

  React.useEffect(() => {
    if (!drawerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [drawerOpen]);

  const chips = [
    ...filters.categories.map((v) => ({ group: "categories" as const, value: v })),
    ...filters.prices.map((v) => ({ group: "prices" as const, value: v })),
    ...filters.colours.map((v) => ({ group: "colours" as const, value: v })),
  ];

  return (
    <div className="mx-auto w-full max-w-6xl px-6 pb-16">
      {/* Toolbar: persistent name search, then result count + sort + (mobile)
          Filters trigger. The search box is always visible (separate from the
          header search icon) and filters the grid by product name. */}
      <div className="flex flex-col gap-3 border-b border-keyline pb-4">
        <div className="relative w-full">
          <Search
            aria-hidden
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-secondary"
          />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search products by name…"
            aria-label="Search products by name"
            className="w-full rounded-sm border border-keyline bg-card py-2 pl-9 pr-9 font-body text-sm text-text-primary placeholder:text-text-secondary transition-colors hover:border-accent/50 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          />
          {searchInput ? (
            <button
              type="button"
              onClick={() => setSearchInput("")}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-text-secondary transition-colors hover:text-accent"
            >
              <X className="size-4" />
            </button>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-body text-sm text-text-secondary">
            {result.total === 0
              ? "No products"
              : `Showing ${result.from}–${result.to} of ${result.total}`}
          </p>
          <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="lg"
            className="rounded-sm lg:hidden"
            onClick={openDrawer}
            nativeButton
          >
            <SlidersHorizontal />
            Filters{activeCount > 0 ? ` (${activeCount})` : ""}
          </Button>

          <label className="relative flex items-center">
            <span className="sr-only">Sort by</span>
            <select
              value={filters.sort}
              onChange={(e) =>
                commit({ ...filters, sort: e.target.value as SortKey, page: 1 })
              }
              className="appearance-none rounded-sm border border-keyline bg-card py-2 pl-3 pr-9 font-body text-sm text-text-primary transition-colors hover:border-accent/50 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <ChevronDown
              aria-hidden
              className="pointer-events-none absolute right-2.5 size-4 text-text-secondary"
            />
          </label>
          </div>
        </div>
      </div>

      {/* Active filter chips (wrap; never a horizontal scrollbar) */}
      {activeCount > 0 ? (
        <div className="flex flex-wrap items-center gap-2 pt-4">
          {chips.map((chip) => (
            <button
              key={`${chip.group}:${chip.value}`}
              type="button"
              onClick={() => commit(toggleValue(filters, chip.group, chip.value))}
              className="group inline-flex items-center gap-1.5 rounded-full border border-keyline bg-card py-1 pl-3 pr-2 font-body text-xs text-text-primary transition-colors hover:border-accent/50"
            >
              {labelFor[chip.group](chip.value)}
              <X className="size-3 text-text-secondary transition-colors group-hover:text-accent" />
            </button>
          ))}
          <button
            type="button"
            onClick={() => commit({ ...EMPTY_FILTERS, sort: filters.sort })}
            className="font-body text-xs font-medium text-accent underline-offset-4 hover:underline"
          >
            Clear all
          </button>
        </div>
      ) : null}

      <div className="mt-6 lg:flex lg:gap-10">
        {/* Desktop sidebar (filters apply immediately) */}
        <aside className="hidden lg:block lg:w-60 lg:shrink-0">
          <div className="lg:sticky lg:top-24">
            <div className="flex items-center justify-between pb-1">
              <h2 className="font-heading text-lg font-semibold text-text-primary">
                Filters
              </h2>
              {activeCount > 0 ? (
                <button
                  type="button"
                  onClick={() => commit({ ...EMPTY_FILTERS, sort: filters.sort })}
                  className="font-body text-xs font-medium text-accent underline-offset-4 hover:underline"
                >
                  Clear all
                </button>
              ) : null}
            </div>
            <FilterControls
              filters={filters}
              counts={counts}
              showCategory={!ignoreCategory}
              availableCategories={availableCategories}
              onToggle={(g, v) => commit(toggleValue(filters, g, v))}
            />
          </div>
        </aside>

        {/* Results */}
        <Reveal className="min-w-0 lg:flex-1">
          {result.total === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-keyline bg-card px-6 py-20 text-center">
              <p className="font-heading text-lg text-text-primary">
                Nothing matches those filters
              </p>
              <p className="mt-2 font-body text-sm text-text-secondary">
                Try removing a filter to see more.
              </p>
              <Button
                variant="outline"
                size="lg"
                className="mt-6 rounded-sm"
                onClick={() => commit({ ...EMPTY_FILTERS, sort: filters.sort })}
                nativeButton
              >
                Clear all filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-5 lg:gap-y-10">
              {result.items.map((p) => (
                <ShopProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

          {/* Pagination — each page has its own URL (?page=N). First/last
              double-chevrons, prev/next single-chevrons, windowed numbers with
              the active page in the Daylight accent. */}
          {result.totalPages > 1 ? (
            <nav
              aria-label="Pagination"
              className="mt-12 flex items-center justify-center gap-1.5"
            >
              <PageArrow
                href={pageHref(1)}
                disabled={result.page === 1}
                label="First page"
                icon={<ChevronsLeft className="size-4" />}
              />
              <PageArrow
                href={pageHref(result.page - 1)}
                disabled={result.page === 1}
                label="Previous page"
                icon={<ChevronLeft className="size-4" />}
              />
              {pageWindow(result.page, result.totalPages).map((item, i) =>
                item === "ellipsis" ? (
                  <span
                    key={`gap-${i}`}
                    aria-hidden
                    className="grid size-9 place-items-center font-body text-sm text-text-secondary"
                  >
                    …
                  </span>
                ) : (
                  <PageNumber
                    key={item}
                    href={pageHref(item)}
                    page={item}
                    active={item === result.page}
                  />
                ),
              )}
              <PageArrow
                href={pageHref(result.page + 1)}
                disabled={result.page === result.totalPages}
                label="Next page"
                icon={<ChevronRight className="size-4" />}
              />
              <PageArrow
                href={pageHref(result.totalPages)}
                disabled={result.page === result.totalPages}
                label="Last page"
                icon={<ChevronsRight className="size-4" />}
              />
            </nav>
          ) : null}
        </Reveal>
      </div>

      {/* Mobile filter drawer (slide-up) */}
      <div
        className={cn("fixed inset-0 z-50 lg:hidden", !drawerOpen && "pointer-events-none")}
        aria-hidden={!drawerOpen}
      >
        <button
          type="button"
          tabIndex={drawerOpen ? 0 : -1}
          aria-label="Close filters"
          onClick={() => setDrawerOpen(false)}
          className={cn(
            "absolute inset-0 bg-text-primary/40 transition-opacity duration-300",
            drawerOpen ? "opacity-100" : "opacity-0",
          )}
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Filters"
          className={cn(
            "absolute inset-x-0 bottom-0 flex max-h-[85vh] flex-col rounded-t-xl border-t border-keyline bg-background transition-transform duration-300 ease-out",
            drawerOpen ? "translate-y-0" : "translate-y-full",
          )}
        >
          <div className="flex items-center justify-between border-b border-keyline px-5 py-4">
            <h2 className="font-heading text-lg font-semibold text-text-primary">
              Filters
            </h2>
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              aria-label="Close filters"
              className="rounded-full p-1.5 text-text-secondary transition-colors hover:bg-surface-alt hover:text-text-primary"
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-1">
            <FilterControls
              filters={pending}
              counts={pendingCounts}
              showCategory={!ignoreCategory}
              availableCategories={availableCategories}
              onToggle={(g, v) => setPending((prev) => toggleValue(prev, g, v))}
            />
          </div>

          <div className="flex items-center gap-3 border-t border-keyline px-5 py-4">
            <Button
              variant="outline"
              size="lg"
              className="flex-1 rounded-sm"
              onClick={() => setPending({ ...EMPTY_FILTERS, sort: pending.sort })}
              nativeButton
            >
              Clear All
            </Button>
            <Button
              size="lg"
              className="flex-1 rounded-sm"
              onClick={() => {
                commit({ ...pending, page: 1 });
                setDrawerOpen(false);
              }}
              nativeButton
            >
              Show {pendingCount} {pendingCount === 1 ? "result" : "results"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Build the windowed list of page tokens: always the first and last page, the
 * current page with one neighbour either side, and an "ellipsis" marker where a
 * run is skipped. First/last are still always one tap away via the double-
 * chevron arrows. Small page counts (≤ 7) render every number.
 */
function pageWindow(
  current: number,
  total: number,
): (number | "ellipsis")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages = new Set<number>([1, total, current]);
  if (current - 1 > 1) pages.add(current - 1);
  if (current + 1 < total) pages.add(current + 1);
  const sorted = [...pages].sort((a, b) => a - b);

  const out: (number | "ellipsis")[] = [];
  let prev = 0;
  for (const n of sorted) {
    if (n - prev > 1) out.push("ellipsis");
    out.push(n);
    prev = n;
  }
  return out;
}

function PageArrow({
  href,
  disabled,
  label,
  icon,
}: {
  href: string;
  disabled: boolean;
  label: string;
  icon: React.ReactNode;
}) {
  const cls =
    "grid size-9 place-items-center rounded-sm border border-keyline font-body text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50";
  if (disabled) {
    return (
      <span
        aria-disabled
        className={cn(cls, "cursor-not-allowed text-text-secondary opacity-40")}
      >
        {icon}
      </span>
    );
  }
  return (
    <Link
      href={href}
      aria-label={label}
      className={cn(cls, "text-text-primary hover:border-accent/50 hover:text-accent")}
    >
      {icon}
    </Link>
  );
}

function PageNumber({
  href,
  page,
  active,
}: {
  href: string;
  page: number;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-label={`Page ${page}`}
      aria-current={active ? "page" : undefined}
      className={cn(
        "grid size-9 place-items-center rounded-sm border font-body text-sm tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
        active
          ? "border-accent bg-accent text-on-accent"
          : "border-keyline text-text-primary hover:border-accent/50 hover:text-accent",
      )}
    >
      {page}
    </Link>
  );
}
