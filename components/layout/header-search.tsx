"use client";

import * as React from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";

import { formatPriceFromPaise } from "@/lib/format";
import { CATEGORY_FACET } from "@/lib/shop";
import { products } from "@/mock-data/products";

/** Max results shown in the dropdown (the rest are reachable via the Shop page). */
const MAX_RESULTS = 8;

function categoryLabel(value: string): string {
  return CATEGORY_FACET.find((c) => c.value === value)?.label ?? value;
}

/**
 * HeaderSearch — the global product search behind the header's search icon.
 * Opens an overlay panel (works from any page since the header is global) with a
 * live text box that matches product NAMES across the full mock catalogue; each
 * result links to its PDP. Closes on Escape, backdrop click, or selecting a
 * result. Catalogue search moves server-side once Supabase lands; the matching
 * is intentionally simple (case-insensitive substring) for the mock layer.
 */
export function HeaderSearch() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  const results = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return products
      .filter((p) => p.name.toLowerCase().includes(q))
      .slice(0, MAX_RESULTS);
  }, [query]);

  // Focus the input when the overlay opens.
  React.useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Close on Escape + lock body scroll while open.
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  function close() {
    setOpen(false);
    setQuery("");
  }

  const trimmed = query.trim();

  return (
    <>
      <button
        type="button"
        aria-label="Search"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="rounded-full p-2 text-text-primary transition-colors hover:bg-surface-alt"
      >
        <Search className="size-5" />
      </button>

      {open ? (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Close search"
            onClick={close}
            className="absolute inset-0 bg-text-primary/40"
          />

          {/* Panel */}
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Search products"
            className="absolute inset-x-0 top-0 mx-auto mt-16 w-[calc(100%-2rem)] max-w-xl rounded-lg border border-keyline bg-background shadow-lg sm:mt-20"
          >
            <div className="flex items-center gap-2 border-b border-keyline px-4">
              <Search className="size-5 shrink-0 text-text-secondary" aria-hidden />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for jewellery…"
                aria-label="Search products"
                className="h-12 flex-1 bg-transparent font-body text-sm text-text-primary outline-none placeholder:text-text-secondary"
              />
              <button
                type="button"
                onClick={close}
                aria-label="Close search"
                className="rounded-full p-1.5 text-text-secondary transition-colors hover:bg-surface-alt hover:text-text-primary"
              >
                <X className="size-5" />
              </button>
            </div>

            {trimmed ? (
              results.length > 0 ? (
                <ul className="max-h-[60vh] overflow-y-auto py-2">
                  {results.map((p) => (
                    <li key={p.id}>
                      <Link
                        href={`/products/${p.slug}`}
                        onClick={close}
                        className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-surface-alt"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={p.imageSrc}
                          alt=""
                          width={48}
                          height={48}
                          className="size-12 shrink-0 rounded-md object-cover"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-heading text-sm font-medium text-text-primary">
                            {p.name}
                          </span>
                          <span className="block font-body text-xs text-text-secondary">
                            {categoryLabel(p.category)}
                          </span>
                        </span>
                        <span className="shrink-0 font-body text-sm font-semibold text-text-primary">
                          {formatPriceFromPaise(p.priceInPaise)}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="px-4 py-8 text-center font-body text-sm text-text-secondary">
                  No products match “{trimmed}”.
                </p>
              )
            ) : (
              <p className="px-4 py-8 text-center font-body text-sm text-text-secondary">
                Start typing to search the collection.
              </p>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
