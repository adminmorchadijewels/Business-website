import type { ColourTone, Product, ProductCategory } from "@/types/product";

/**
 * Shop browsing logic — pure, framework-free helpers shared by the server route
 * pages and the client `ShopBrowser`. Filtering/sorting/pagination all run
 * against the in-memory mock catalogue (no backend yet); the URL query string is
 * the single source of truth for filter state.
 */

export const PAGE_SIZE = 24;

// ---------------------------------------------------------------- Facets
/** Category facet, in display order. Only categories present in a dataset show. */
export const CATEGORY_FACET: { value: ProductCategory; label: string }[] = [
  { value: "earrings", label: "Earrings" },
  { value: "necklaces", label: "Necklaces" },
  { value: "pendants", label: "Pendants" },
  { value: "rings", label: "Rings" },
  { value: "bangles", label: "Bangles" },
  { value: "bracelets", label: "Bracelets" },
];

/** Metal / colour facet. */
export const COLOUR_FACET: { value: ColourTone; label: string }[] = [
  { value: "gold-tone", label: "Gold-tone" },
  { value: "silver-tone", label: "Silver-tone" },
  { value: "rose-gold", label: "Rose Gold" },
];

export type PriceBucket = "under-500" | "500-1000" | "1000-plus";
/** Preset price buckets (paise; `max` exclusive). ₹500 = 50000 paise. */
export const PRICE_FACET: {
  value: PriceBucket;
  label: string;
  min: number;
  max: number;
}[] = [
  { value: "under-500", label: "Under ₹500", min: 0, max: 50000 },
  { value: "500-1000", label: "₹500 – ₹1,000", min: 50000, max: 100000 },
  { value: "1000-plus", label: "₹1,000 & above", min: 100000, max: Infinity },
];

export type SortKey =
  | "featured"
  | "newest"
  | "oldest"
  | "recently-listed"
  | "bestselling"
  | "availability"
  | "popularity-asc"
  | "popularity-desc"
  | "price-asc"
  | "price-desc"
  | "alpha";
export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "availability", label: "Availability" },
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "recently-listed", label: "Recently Listed" },
  { value: "bestselling", label: "Bestselling" },
  { value: "popularity-desc", label: "Popularity: High to Low" },
  { value: "popularity-asc", label: "Popularity: Low to High" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "alpha", label: "Alphabetical" },
];

// ---------------------------------------------------------------- Filter state
export interface ShopFilters {
  /** Selected categories (ignored on a category-locked page). */
  categories: ProductCategory[];
  prices: PriceBucket[];
  colours: ColourTone[];
  /** Free-text name search (Shop-page search box; matches product name). */
  search: string;
  sort: SortKey;
  page: number;
}

export const EMPTY_FILTERS: ShopFilters = {
  categories: [],
  prices: [],
  colours: [],
  search: "",
  sort: "featured",
  page: 1,
};

const CATEGORY_VALUES = new Set(CATEGORY_FACET.map((c) => c.value));
const COLOUR_VALUES = new Set(COLOUR_FACET.map((c) => c.value));
const PRICE_VALUES = new Set(PRICE_FACET.map((p) => p.value));
const SORT_VALUES = new Set(SORT_OPTIONS.map((s) => s.value));

/** Minimal read interface satisfied by both URLSearchParams and Next's
 *  ReadonlyURLSearchParams (from `useSearchParams`). */
interface ParamReader {
  get(name: string): string | null;
}

function splitParam(reader: ParamReader, key: string): string[] {
  return (reader.get(key) ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Parse the URL query into typed, validated filter state. */
export function parseFilters(reader: ParamReader): ShopFilters {
  const categories = splitParam(reader, "category").filter((v) =>
    CATEGORY_VALUES.has(v as ProductCategory),
  ) as ProductCategory[];
  const prices = splitParam(reader, "price").filter((v) =>
    PRICE_VALUES.has(v as PriceBucket),
  ) as PriceBucket[];
  const colours = splitParam(reader, "colour").filter((v) =>
    COLOUR_VALUES.has(v as ColourTone),
  ) as ColourTone[];
  const search = (reader.get("q") ?? "").trim();
  const sortRaw = reader.get("sort") ?? "featured";
  const sort = (SORT_VALUES.has(sortRaw as SortKey) ? sortRaw : "featured") as SortKey;
  const page = Math.max(1, Number.parseInt(reader.get("page") ?? "1", 10) || 1);
  return { categories, prices, colours, search, sort, page };
}

/** Serialise filter state to a query string, omitting empties + defaults. */
export function filtersToQuery(f: ShopFilters): string {
  const params = new URLSearchParams();
  if (f.categories.length) params.set("category", f.categories.join(","));
  if (f.prices.length) params.set("price", f.prices.join(","));
  if (f.colours.length) params.set("colour", f.colours.join(","));
  if (f.search) params.set("q", f.search);
  if (f.sort !== "featured") params.set("sort", f.sort);
  if (f.page > 1) params.set("page", String(f.page));
  return params.toString();
}

// ---------------------------------------------------------------- Filtering
export interface FilterOpts {
  /** On category-locked pages the category facet is ignored entirely. */
  ignoreCategory?: boolean;
}

export function filterProducts(
  all: Product[],
  f: ShopFilters,
  opts: FilterOpts = {},
): Product[] {
  const query = f.search.trim().toLowerCase();
  return all.filter((p) => {
    if (query && !p.name.toLowerCase().includes(query)) return false;
    if (
      !opts.ignoreCategory &&
      f.categories.length &&
      !f.categories.includes(p.category)
    ) {
      return false;
    }
    if (f.colours.length && !f.colours.includes(p.colour)) return false;
    if (f.prices.length) {
      const inBucket = f.prices.some((b) => {
        const def = PRICE_FACET.find((x) => x.value === b);
        return def ? p.priceInPaise >= def.min && p.priceInPaise < def.max : false;
      });
      if (!inBucket) return false;
    }
    return true;
  });
}

export function sortProducts(list: Product[], sort: SortKey): Product[] {
  const arr = [...list];
  switch (sort) {
    case "price-asc":
      return arr.sort((a, b) => a.priceInPaise - b.priceInPaise);
    case "price-desc":
      return arr.sort((a, b) => b.priceInPaise - a.priceInPaise);
    case "newest":
      return arr.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    case "oldest":
      return arr.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    case "recently-listed":
      // Catalogue insertion order (newest listing first), independent of the
      // NEW-badge boost folded into `createdAt`.
      return arr.sort((a, b) => b.listedAt.localeCompare(a.listedAt));
    case "bestselling":
      return arr.sort((a, b) => b.popularity - a.popularity);
    case "availability":
      // In-stock/active products first; otherwise preserve catalogue order.
      return arr.sort((a, b) => Number(b.inStock) - Number(a.inStock));
    case "popularity-desc":
      return arr.sort((a, b) => b.popularityScore - a.popularityScore);
    case "popularity-asc":
      return arr.sort((a, b) => a.popularityScore - b.popularityScore);
    case "alpha":
      return arr.sort((a, b) => a.name.localeCompare(b.name));
    case "featured":
    default:
      return arr; // preserve catalogue order
  }
}

export interface Paged {
  items: Product[];
  page: number;
  totalPages: number;
  total: number;
  /** 1-based index of the first item on this page (0 when empty). */
  from: number;
  /** 1-based index of the last item on this page (0 when empty). */
  to: number;
}

export function paginate(list: Product[], page: number): Paged {
  const total = list.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const current = Math.min(Math.max(1, page), totalPages);
  const start = (current - 1) * PAGE_SIZE;
  const items = list.slice(start, start + PAGE_SIZE);
  return {
    items,
    page: current,
    totalPages,
    total,
    from: total === 0 ? 0 : start + 1,
    to: start + items.length,
  };
}

/**
 * One-shot: filter → sort → paginate. Returns the page plus the full filtered
 * count (for the result indicator).
 */
export function browse(
  all: Product[],
  f: ShopFilters,
  opts: FilterOpts = {},
): Paged {
  const filtered = sortProducts(filterProducts(all, f, opts), f.sort);
  return paginate(filtered, f.page);
}
