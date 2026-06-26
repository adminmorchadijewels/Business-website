/**
 * Domain types for the storefront. These describe the *shape* of data the UI
 * consumes. The real source (Supabase) arrives in a later session; for now the
 * same shapes are satisfied by /mock-data.
 */

export type ProductCategory =
  | "rings"
  | "earrings"
  | "necklaces"
  | "pendants"
  | "bangles"
  | "bracelets";

export type ProductTag = "NEW" | "BESTSELLER" | "LIMITED";

/**
 * Metal / colour tone — the filterable "Material/Colour" facet on the Shop page.
 * Kept separate from the human-readable `material` (e.g. "18k Gold Plated") so it
 * can be filtered on cleanly.
 */
export type ColourTone = "gold-tone" | "silver-tone" | "rose-gold";

/**
 * VARIANT MODEL (drives the Product page's pricing + availability logic).
 *
 * A product's selectable choices are described by `optionGroups` (one per axis,
 * e.g. a "Colour" group and a "Ring size" group). The purchasable SKUs live in
 * `variants`: each variant is ONE option per axis, with its OWN price and stock
 * flag — so price can differ by combination and a single colour×size combo can
 * be sold out independently. This mirrors the shape a real backend would expose
 * (an option matrix + a SKU table), so the UI logic won't need rewriting later.
 */
export type VariantAxis = "colour" | "stone" | "size";

/**
 * GALLERY MEDIA. A product's gallery is a mixed list of images and videos. Each
 * item declares its `type` so the gallery viewer knows whether to render an
 * `<img>` or a `<video>`. `poster` is the still frame shown for a video before
 * playback (and used as its thumbnail). The card image (`imageSrc`) and the
 * `images` array stay image-only; `media` is the richer gallery the PDP renders.
 */
export type GalleryMediaType = "image" | "video";

export interface GalleryMedia {
  type: GalleryMediaType;
  /** Image URL, or video file URL when `type === "video"`. */
  src: string;
  /** Poster/thumbnail image for a video (required in practice for videos). */
  poster?: string;
}

export interface VariantOption {
  /** Stable key used in selection state / variant matching, e.g. "gold", "6". */
  value: string;
  /** Display label, e.g. "Gold", "Letter A", "6". */
  label: string;
  /**
   * Swatch colour for colour/stone axes — a CSS colour string. This is product
   * DATA (the physical colour of the piece), NOT a themeable Daylight token, so
   * it is stored here and applied via inline style; it must not change on a
   * re-skin. Omitted for size (rendered as a text pill). See decisions.md.
   */
  swatch?: string;
}

export interface VariantGroup {
  axis: VariantAxis;
  /** Display name above the options, e.g. "Colour", "Stone", "Ring size". */
  label: string;
  options: VariantOption[];
}

/** A purchasable SKU: exactly one option value per axis in `optionGroups`. */
export interface ProductVariant {
  id: string;
  /** Selected option value per axis, e.g. { colour: "gold", size: "6" }. */
  options: Partial<Record<VariantAxis, string>>;
  /** This combination's price in paise (can differ between combinations). */
  priceInPaise: number;
  /** Optional pre-sale price for this combination. */
  originalPriceInPaise?: number;
  /** This specific combination's availability (sold out ≠ hidden). */
  inStock: boolean;
}

export interface Product {
  id: string;
  slug: string;
  /** Short one-liner (used in cards / meta). */
  description: string;
  /** Long-form, SEO-critical body copy shown (truncated by CSS) on the PDP. */
  longDescription: string;
  name: string;
  /** Listing / "from" price in paise. For products with variants this is the
      MINIMUM variant price (derived); otherwise the single price. */
  priceInPaise: number;
  /** Listing pre-sale price (struck-through on cards). */
  originalPriceInPaise?: number;
  currency: "INR";
  category: ProductCategory;
  /** Human-readable material, e.g. "18k Gold Plated" (display only). */
  material: string;
  /** Filterable metal / colour tone (the Shop "Material/Colour" facet). */
  colour: ColourTone;
  /** First gallery image (used by cards). */
  imageSrc: string;
  /** Full image gallery (3–4 images) — image-only; used by cards/fallbacks. */
  images: string[];
  /**
   * Mixed-media gallery (images + videos) rendered by the PDP gallery viewer.
   * Derived from `images` (each becomes an image item); a few mock products mix
   * in a video to exercise the `<video>` branch. See mock-data/products.ts.
   */
  media: GalleryMedia[];
  /**
   * Physical specs shown in the "Product Details" PDP accordion (distinct from
   * the narrative `longDescription`). PLACEHOLDER mock content — derived
   * per-category until real spec data lands. See decisions.md.
   */
  dimensions: string;
  /** Care instructions shown in the "Product Details" accordion (placeholder). */
  care: string;
  /**
   * Mock sort signals (no real analytics/CMS yet). `popularity` drives the
   * "Bestselling" sort (higher = more popular); `createdAt` (ISO date) drives
   * "Newest"/"Oldest"; `listedAt` (ISO date) drives "Recently Listed" (catalogue
   * insertion order, independent of the NEW-badge boost baked into `createdAt`).
   * All derived deterministically in mock-data/products.ts.
   */
  popularity: number;
  createdAt: string;
  listedAt: string;
  /**
   * PLACEHOLDER popularity score (0–100) standing in for real, order-count-based
   * popularity once the backend (Supabase order data) exists. Drives the
   * "Popularity (Low → High / High → Low)" sorts. Deterministic mock value — NOT
   * a real metric. See decisions.md.
   */
  popularityScore: number;
  /**
   * TIME-BOUND SALE (Shop-listing promo). When `saleStartsAt`/`saleEndsAt` (ISO
   * datetimes) bracket the current time, the card shows `salePriceInPaise` as the
   * live price (with `priceInPaise` struck through) plus a countdown to
   * `saleEndsAt`. Outside that window the sale pricing/countdown disappear and
   * the card reverts to the regular `priceInPaise`. This is a real time
   * comparison evaluated client-side, not a decorative timer. Currently a
   * Shop-card promo layer only (PDP/cart integration deferred — see decisions.md).
   */
  saleStartsAt?: string;
  saleEndsAt?: string;
  /** Discounted price (paise) shown only while the sale window is active. */
  salePriceInPaise?: number;
  /** Optional badge pill shown on the card (NEW / BESTSELLER / LIMITED). */
  tag?: ProductTag;
  /** Surfaced in the "New Arrivals" rail. */
  isNew?: boolean;
  /** Surfaced in the "Bestsellers" rail. */
  isBestseller?: boolean;
  /** Selectable axes (colour/stone/size) the PDP renders selectors for. */
  optionGroups?: VariantGroup[];
  /** Purchasable SKUs (price + availability per combination). */
  variants?: ProductVariant[];
  /**
   * Made-to-order / customised piece (each customisation is its own product in
   * this brand's model). When true the PDP shows a partial-payment note + the
   * `depositInPaise` required to confirm the order.
   */
  isCustomisable?: boolean;
  /** Per-product deposit (paise) to confirm a customisable/made-to-order item. */
  depositInPaise?: number;
  /**
   * ADD-ON-ONLY product (gift hamper, gift box, card, …). When true the product
   * is EXCLUDED from all browsing surfaces — the Shop grid, category pages and
   * search — and is only ever reachable through the add-on selector on a main
   * product's PDP. Single-SKU (no variants). See decisions.md.
   */
  isAddOnOnly?: boolean;
  /**
   * Ids of add-on products (each `isAddOnOnly`) a "main" product offers as
   * optional extras on its PDP. Resolved to products via `addOnsFor()`.
   */
  availableAddOnIds?: string[];
  /** True when at least one variant (or the single SKU) is available. */
  inStock: boolean;
}
