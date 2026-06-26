import type { Product, ProductVariant } from "@/types/product";
import { categoryImageSet } from "@/mock-data/images";

/**
 * Dummy catalogue used to develop the UI before the data layer exists.
 *
 * IMAGES: temporary, clearly-not-final placeholders. Each product's gallery is
 * assigned from a CURATED, hand-verified set of jewellery photos (see
 * `mock-data/images.ts`). Swap for real product photography (R2 / Cloudflare
 * Images) later.
 *
 * VARIANTS: products with selectable options carry `optionGroups` (the axes) +
 * `variants` (the SKUs, each with its OWN price + stock flag). The product-level
 * `priceInPaise` is the derived "from" (minimum variant) price for listings.
 *
 * SORT SIGNALS: `popularity` (bestselling) + `createdAt` (newest) are derived
 * deterministically below.
 */

/**
 * Swatch colours for colour/stone options. These are product DATA (the physical
 * colour of the piece), NOT themeable Daylight tokens — they must not change on
 * a re-skin — so they live with the data and are applied via inline style in the
 * swatch UI. See decisions.md.
 */
const SWATCH = {
  gold: "#c9a24b",
  rose: "#d9a38b",
  silver: "#c8cdd3",
  white: "#ecebe6",
  champagne: "#e6cfa1",
  blush: "#e7c2c7",
  aqua: "#9fd1d6",
  topaz: "#d39b46",
  onyx: "#2c2c30",
} as const;

// ---- Variant builders (keep the SKU matrices readable) --------------------

/** Aurora ring: Stone × Ring size; price varies by stone; one combo sold out. */
const auroraVariants: ProductVariant[] = (() => {
  const stones: [string, number][] = [
    ["white", 199900],
    ["champagne", 209900],
    ["blush", 219900],
  ];
  const sizes = ["5", "6", "7", "8"];
  const out: ProductVariant[] = [];
  for (const [stone, priceInPaise] of stones) {
    for (const size of sizes) {
      out.push({
        id: `p_021-${stone}-${size}`,
        options: { stone, size },
        priceInPaise,
        // Blush in size 8 is sold out (combination-level availability).
        inStock: !(stone === "blush" && size === "8"),
      });
    }
  }
  return out;
})();

/** Serra cuff bangle: Colour × Size; rose costs more; rose + L sold out. */
const serraVariants: ProductVariant[] = (() => {
  const colours: [string, number][] = [
    ["gold", 134900],
    ["rose", 139900],
  ];
  const sizes = ["s", "m", "l"];
  const out: ProductVariant[] = [];
  for (const [colour, priceInPaise] of colours) {
    for (const size of sizes) {
      out.push({
        id: `p_016-${colour}-${size}`,
        options: { colour, size },
        priceInPaise,
        inStock: !(colour === "rose" && size === "l"),
      });
    }
  }
  return out;
})();

/** Catalogue rows minus fields derived below. Listing price / stock are derived
 *  from `variants` when present, so they're optional on variant products. */
type RawProduct = Omit<
  Product,
  | "imageSrc"
  | "images"
  | "longDescription"
  | "popularity"
  | "popularityScore"
  | "createdAt"
  | "listedAt"
  | "inStock"
  | "priceInPaise"
  | "originalPriceInPaise"
> & {
  priceInPaise?: number;
  originalPriceInPaise?: number;
  inStock?: boolean;
};

const rawProducts: RawProduct[] = [
  // ---------------------------------------------------------------- Earrings
  {
    id: "p_001",
    slug: "lumen-drop-earrings",
    name: "Lumen Drop Earrings",
    description: "Tapered drops that catch the light from every angle.",
    priceInPaise: 124900,
    originalPriceInPaise: 149900,
    currency: "INR",
    category: "earrings",
    material: "Gold Vermeil",
    colour: "gold-tone",
    tag: "BESTSELLER",
    isBestseller: true,
    inStock: true,
  },
  {
    // Colour-only variants, per-variant pricing (range 849 – 949).
    id: "p_002",
    slug: "aria-huggie-hoops",
    name: "Aria Huggie Hoops",
    description: "Everyday hoops that hug the lobe — light enough to forget.",
    currency: "INR",
    category: "earrings",
    material: "18k Gold Plated",
    colour: "gold-tone",
    tag: "NEW",
    isNew: true,
    optionGroups: [
      {
        axis: "colour",
        label: "Colour",
        options: [
          { value: "gold", label: "Gold", swatch: SWATCH.gold },
          { value: "rose", label: "Rose Gold", swatch: SWATCH.rose },
          { value: "silver", label: "Silver", swatch: SWATCH.silver },
        ],
      },
    ],
    variants: [
      { id: "p_002-gold", options: { colour: "gold" }, priceInPaise: 89900, originalPriceInPaise: 109900, inStock: true },
      { id: "p_002-rose", options: { colour: "rose" }, priceInPaise: 94900, originalPriceInPaise: 114900, inStock: true },
      { id: "p_002-silver", options: { colour: "silver" }, priceInPaise: 84900, inStock: true },
    ],
  },
  {
    id: "p_003",
    slug: "petal-stud-earrings",
    name: "Petal Stud Earrings",
    description: "A soft floral stud for a quiet everyday sparkle.",
    priceInPaise: 49900,
    currency: "INR",
    category: "earrings",
    material: "925 Silver",
    colour: "silver-tone",
    tag: "NEW",
    isNew: true,
    inStock: true,
    // Time-bound sale — a short window (a flash sale) to exercise the live
    // countdown. If "now" is past saleEndsAt this simply reverts to ₹499.
    saleStartsAt: "2026-06-20T00:00:00+05:30",
    saleEndsAt: "2026-06-28T20:00:00+05:30",
    salePriceInPaise: 39900,
  },
  {
    id: "p_004",
    slug: "celeste-threader-earrings",
    name: "Celeste Threader Earrings",
    description: "A fine chain threader that drapes along the jawline.",
    priceInPaise: 99900,
    currency: "INR",
    category: "earrings",
    material: "Rose Gold Vermeil",
    colour: "rose-gold",
    inStock: true,
  },
  {
    id: "p_005",
    slug: "mira-pearl-drops",
    name: "Mira Pearl Drops",
    description: "Freshwater pearls on a slender hook — a modern classic.",
    priceInPaise: 134900,
    currency: "INR",
    category: "earrings",
    material: "Freshwater Pearl",
    colour: "silver-tone",
    tag: "BESTSELLER",
    isBestseller: true,
    inStock: true,
  },
  {
    id: "p_006",
    slug: "dewdrop-ear-cuffs",
    name: "Dewdrop Ear Cuffs",
    description: "No-pierce cuffs that stack along the ear's edge.",
    priceInPaise: 39900,
    originalPriceInPaise: 54900,
    currency: "INR",
    category: "earrings",
    material: "Stainless Steel",
    colour: "silver-tone",
    tag: "NEW",
    isNew: true,
    inStock: true,
  },
  {
    id: "p_007",
    slug: "soleil-chandelier-earrings",
    name: "Soleil Chandelier Earrings",
    description: "A statement cascade of cut stones for the occasions.",
    priceInPaise: 169900,
    currency: "INR",
    category: "earrings",
    material: "Cubic Zirconia",
    colour: "silver-tone",
    tag: "LIMITED",
    inStock: true,
  },

  // --------------------------------------------------------------- Necklaces
  {
    id: "p_008",
    slug: "meridian-pendant-necklace",
    name: "Meridian Pendant Necklace",
    description: "A minimalist pendant on a delicate cable chain.",
    priceInPaise: 159900,
    currency: "INR",
    category: "necklaces",
    material: "18k Gold Plated",
    colour: "gold-tone",
    inStock: true,
  },
  {
    id: "p_009",
    slug: "aurelia-layered-chain",
    name: "Aurelia Layered Chain",
    description: "Two chains pre-layered at the perfect lengths.",
    priceInPaise: 189900,
    currency: "INR",
    category: "necklaces",
    material: "Gold Vermeil",
    colour: "gold-tone",
    tag: "BESTSELLER",
    isBestseller: true,
    inStock: true,
  },
  {
    id: "p_010",
    slug: "solene-locket",
    name: "Solene Locket",
    description: "A keepsake locket that opens to hold a small photo.",
    priceInPaise: 144900,
    currency: "INR",
    category: "necklaces",
    material: "925 Silver",
    colour: "silver-tone",
    tag: "NEW",
    isNew: true,
    inStock: true,
  },
  {
    id: "p_011",
    slug: "coral-charm-necklace",
    name: "Coral Charm Necklace",
    description: "A playful charm strung on a fine box chain.",
    priceInPaise: 79900,
    currency: "INR",
    category: "necklaces",
    material: "18k Gold Plated",
    colour: "gold-tone",
    tag: "BESTSELLER",
    isBestseller: true,
    inStock: true,
  },
  {
    // Colour-only variants (Gold / Silver), per-variant pricing.
    id: "p_012",
    slug: "luna-choker",
    name: "Luna Choker",
    description: "A sleek close-fit choker for clean necklines.",
    currency: "INR",
    category: "necklaces",
    material: "Stainless Steel",
    colour: "silver-tone",
    optionGroups: [
      {
        axis: "colour",
        label: "Colour",
        options: [
          { value: "gold", label: "Gold", swatch: SWATCH.gold },
          { value: "silver", label: "Silver", swatch: SWATCH.silver },
        ],
      },
    ],
    variants: [
      { id: "p_012-gold", options: { colour: "gold" }, priceInPaise: 99900, inStock: true },
      { id: "p_012-silver", options: { colour: "silver" }, priceInPaise: 94900, inStock: true },
    ],
  },
  {
    id: "p_013",
    slug: "wisp-initial-necklace",
    name: "Wisp Initial Necklace",
    description: "A dainty initial pendant — personal, barely-there.",
    priceInPaise: 64900,
    currency: "INR",
    category: "necklaces",
    material: "Rose Gold Vermeil",
    colour: "rose-gold",
    tag: "NEW",
    isNew: true,
    inStock: true,
  },
  {
    id: "p_014",
    slug: "estelle-tennis-necklace",
    name: "Estelle Tennis Necklace",
    description: "A continuous line of matched stones — pure occasion.",
    priceInPaise: 209900,
    currency: "INR",
    category: "necklaces",
    material: "Cubic Zirconia",
    colour: "silver-tone",
    tag: "LIMITED",
    inStock: false,
  },
  {
    // Customisable / made-to-order, single SKU, partial-payment deposit.
    id: "p_038",
    slug: "custom-name-necklace",
    name: "Custom Name Necklace",
    description: "Your name (or theirs) in a flowing script pendant.",
    priceInPaise: 189900,
    currency: "INR",
    category: "necklaces",
    material: "18k Gold Plated",
    colour: "gold-tone",
    tag: "NEW",
    isNew: true,
    isCustomisable: true,
    depositInPaise: 70000,
    inStock: true,
  },

  // ---------------------------------------------------------------- Pendants
  {
    id: "p_027",
    slug: "etoile-star-pendant",
    name: "Étoile Star Pendant",
    description: "A tiny star pendant that sits just below the collarbone.",
    priceInPaise: 84900,
    currency: "INR",
    category: "pendants",
    material: "Gold Vermeil",
    colour: "gold-tone",
    tag: "NEW",
    isNew: true,
    inStock: true,
  },
  {
    id: "p_028",
    slug: "halo-disc-pendant",
    name: "Halo Disc Pendant",
    description: "A brushed disc on a fine chain — clean and modern.",
    priceInPaise: 74900,
    currency: "INR",
    category: "pendants",
    material: "925 Silver",
    colour: "silver-tone",
    inStock: true,
    // Time-bound sale — a long, season-length window so there's always at least
    // one demonstrably-active sale countdown regardless of when this is viewed.
    saleStartsAt: "2026-06-01T00:00:00+05:30",
    saleEndsAt: "2026-12-31T23:59:59+05:30",
    salePriceInPaise: 59900,
  },
  {
    id: "p_029",
    slug: "rose-heart-pendant",
    name: "Rose Heart Pendant",
    description: "A softly domed heart in a warm rose finish.",
    priceInPaise: 69900,
    originalPriceInPaise: 89900,
    currency: "INR",
    category: "pendants",
    material: "Rose Gold Plated",
    colour: "rose-gold",
    inStock: true,
  },
  {
    id: "p_030",
    slug: "lumiere-pearl-pendant",
    name: "Lumière Pearl Pendant",
    description: "A single freshwater pearl drop on a whisper chain.",
    priceInPaise: 109900,
    currency: "INR",
    category: "pendants",
    material: "Freshwater Pearl",
    colour: "silver-tone",
    tag: "BESTSELLER",
    isBestseller: true,
    inStock: true,
  },
  {
    // Stone-only variants shown as swatches; price varies by stone.
    id: "p_031",
    slug: "cygne-birthstone-pendant",
    name: "Cygne Birthstone Pendant",
    description: "A bezel-set birthstone on a dainty cable chain.",
    currency: "INR",
    category: "pendants",
    material: "Cubic Zirconia",
    colour: "gold-tone",
    optionGroups: [
      {
        axis: "stone",
        label: "Stone",
        options: [
          { value: "aqua", label: "Aquamarine", swatch: SWATCH.aqua },
          { value: "blush", label: "Rose Quartz", swatch: SWATCH.blush },
          { value: "topaz", label: "Topaz", swatch: SWATCH.topaz },
          { value: "onyx", label: "Black Onyx", swatch: SWATCH.onyx },
        ],
      },
    ],
    variants: [
      { id: "p_031-aqua", options: { stone: "aqua" }, priceInPaise: 54900, inStock: true },
      { id: "p_031-blush", options: { stone: "blush" }, priceInPaise: 54900, inStock: true },
      { id: "p_031-topaz", options: { stone: "topaz" }, priceInPaise: 59900, inStock: true },
      { id: "p_031-onyx", options: { stone: "onyx" }, priceInPaise: 49900, inStock: true },
    ],
  },

  // ----------------------------------------------------------------- Bangles
  {
    id: "p_015",
    slug: "halo-bangle",
    name: "Halo Bangle",
    description: "A smooth, weighty bangle with a polished finish.",
    priceInPaise: 119900,
    currency: "INR",
    category: "bangles",
    material: "Gold Vermeil",
    colour: "gold-tone",
    inStock: true,
  },
  {
    // Colour × Size variants; rose costs more; rose + Large is sold out.
    id: "p_016",
    slug: "serra-cuff-bangle",
    name: "Serra Cuff Bangle",
    description: "An open cuff that slips on and holds its shape.",
    currency: "INR",
    category: "bangles",
    material: "18k Gold Plated",
    colour: "gold-tone",
    tag: "BESTSELLER",
    isBestseller: true,
    optionGroups: [
      {
        axis: "colour",
        label: "Colour",
        options: [
          { value: "gold", label: "Gold", swatch: SWATCH.gold },
          { value: "rose", label: "Rose Gold", swatch: SWATCH.rose },
        ],
      },
      {
        axis: "size",
        label: "Size",
        options: [
          { value: "s", label: "S" },
          { value: "m", label: "M" },
          { value: "l", label: "L" },
        ],
      },
    ],
    variants: serraVariants,
  },
  {
    id: "p_017",
    slug: "wren-twist-bangle",
    name: "Wren Twist Bangle",
    description: "A gently twisted band that catches the light as you move.",
    priceInPaise: 69900,
    originalPriceInPaise: 89900,
    currency: "INR",
    category: "bangles",
    material: "925 Silver",
    colour: "silver-tone",
    tag: "NEW",
    isNew: true,
    inStock: true,
  },
  {
    id: "p_018",
    slug: "ivy-charm-bangle",
    name: "Ivy Charm Bangle",
    description: "A fine bangle hung with a single removable charm.",
    priceInPaise: 89900,
    currency: "INR",
    category: "bangles",
    material: "Rose Gold Vermeil",
    colour: "rose-gold",
    inStock: true,
  },
  {
    id: "p_019",
    slug: "nova-stacking-bangles",
    name: "Nova Stacking Bangles (Set of 3)",
    description: "Three slim bangles designed to be worn together.",
    priceInPaise: 149900,
    originalPriceInPaise: 199900,
    currency: "INR",
    category: "bangles",
    material: "18k Gold Plated",
    colour: "gold-tone",
    tag: "BESTSELLER",
    isBestseller: true,
    inStock: true,
  },
  {
    id: "p_020",
    slug: "mae-beaded-bangle",
    name: "Mae Beaded Bangle",
    description: "A featherweight beaded bangle — the easy daily piece.",
    priceInPaise: 29900,
    currency: "INR",
    category: "bangles",
    material: "Brass",
    colour: "gold-tone",
    inStock: true,
  },

  // --------------------------------------------------------------- Bracelets
  {
    id: "p_032",
    slug: "liane-chain-bracelet",
    name: "Liane Chain Bracelet",
    description: "A fluid paperclip-link chain for the wrist.",
    priceInPaise: 99900,
    currency: "INR",
    category: "bracelets",
    material: "Gold Vermeil",
    colour: "gold-tone",
    tag: "BESTSELLER",
    isBestseller: true,
    inStock: true,
  },
  {
    id: "p_033",
    slug: "etincelle-tennis-bracelet",
    name: "Étincelle Tennis Bracelet",
    description: "A continuous line of brilliant-cut stones.",
    priceInPaise: 179900,
    currency: "INR",
    category: "bracelets",
    material: "Cubic Zirconia",
    colour: "silver-tone",
    tag: "LIMITED",
    inStock: true,
  },
  {
    // Size-only variants (single colour → no colour selector shown).
    id: "p_034",
    slug: "rose-cuff-bracelet",
    name: "Rosé Cuff Bracelet",
    description: "An open cuff with a warm rose finish.",
    currency: "INR",
    category: "bracelets",
    material: "Rose Gold Plated",
    colour: "rose-gold",
    tag: "NEW",
    isNew: true,
    optionGroups: [
      {
        axis: "size",
        label: "Size",
        options: [
          { value: "s", label: "S" },
          { value: "m", label: "M" },
          { value: "l", label: "L" },
        ],
      },
    ],
    variants: [
      { id: "p_034-s", options: { size: "s" }, priceInPaise: 89900, inStock: true },
      { id: "p_034-m", options: { size: "m" }, priceInPaise: 89900, inStock: true },
      { id: "p_034-l", options: { size: "l" }, priceInPaise: 89900, inStock: true },
    ],
  },
  {
    id: "p_035",
    slug: "perle-beaded-bracelet",
    name: "Perle Beaded Bracelet",
    description: "Tiny freshwater pearls on a stretch band.",
    priceInPaise: 39900,
    originalPriceInPaise: 49900,
    currency: "INR",
    category: "bracelets",
    material: "Freshwater Pearl",
    colour: "gold-tone",
    inStock: true,
  },
  {
    id: "p_036",
    slug: "maillon-link-bracelet",
    name: "Maillon Link Bracelet",
    description: "A chunky link bracelet that wears with everything.",
    priceInPaise: 44900,
    currency: "INR",
    category: "bracelets",
    material: "Stainless Steel",
    colour: "silver-tone",
    inStock: true,
  },

  // ------------------------------------------------------------------- Rings
  {
    // Stone × Size variants; price varies by stone; Blush + size 8 sold out.
    id: "p_021",
    slug: "aurora-solitaire-ring",
    name: "Aurora Solitaire Ring",
    description: "A single brilliant-cut stone on a fine band.",
    currency: "INR",
    category: "rings",
    material: "Gold Vermeil",
    colour: "gold-tone",
    tag: "BESTSELLER",
    isBestseller: true,
    optionGroups: [
      {
        axis: "stone",
        label: "Stone",
        options: [
          { value: "white", label: "White", swatch: SWATCH.white },
          { value: "champagne", label: "Champagne", swatch: SWATCH.champagne },
          { value: "blush", label: "Blush", swatch: SWATCH.blush },
        ],
      },
      {
        axis: "size",
        label: "Ring size",
        options: [
          { value: "5", label: "5" },
          { value: "6", label: "6" },
          { value: "7", label: "7" },
          { value: "8", label: "8" },
        ],
      },
    ],
    variants: auroraVariants,
  },
  {
    id: "p_022",
    slug: "juno-stacking-ring",
    name: "Juno Stacking Ring",
    description: "A whisper-thin band made to stack three or four high.",
    priceInPaise: 34900,
    currency: "INR",
    category: "rings",
    material: "925 Silver",
    colour: "silver-tone",
    tag: "NEW",
    isNew: true,
    inStock: true,
  },
  {
    id: "p_023",
    slug: "clover-signet-ring",
    name: "Clover Signet Ring",
    description: "A modern signet with a softly domed face.",
    priceInPaise: 59900,
    currency: "INR",
    category: "rings",
    material: "18k Gold Plated",
    colour: "gold-tone",
    tag: "BESTSELLER",
    isBestseller: true,
    inStock: true,
    // Time-bound sale that has ALREADY ENDED — verifies the card reverts to the
    // regular ₹599 price with no countdown once `saleEndsAt` has passed.
    saleStartsAt: "2025-11-01T00:00:00+05:30",
    saleEndsAt: "2025-11-15T23:59:59+05:30",
    salePriceInPaise: 49900,
  },
  {
    id: "p_024",
    slug: "opaline-cocktail-ring",
    name: "Opaline Cocktail Ring",
    description: "An oversized stone for the nights that ask for it.",
    priceInPaise: 179900,
    currency: "INR",
    category: "rings",
    material: "Gold Vermeil",
    colour: "gold-tone",
    tag: "LIMITED",
    inStock: true,
  },
  {
    id: "p_025",
    slug: "vesper-band-ring",
    name: "Vesper Band Ring",
    description: "A clean comfort-fit band that wears with everything.",
    priceInPaise: 44900,
    currency: "INR",
    category: "rings",
    material: "Stainless Steel",
    colour: "silver-tone",
    tag: "NEW",
    isNew: true,
    inStock: true,
  },
  {
    id: "p_026",
    slug: "marigold-cluster-ring",
    name: "Marigold Cluster Ring",
    description: "A cluster of small stones set in a sunburst.",
    priceInPaise: 99900,
    currency: "INR",
    category: "rings",
    material: "Cubic Zirconia",
    colour: "silver-tone",
    inStock: true,
  },
  {
    // Customisable / made-to-order initial ring; size variants + deposit.
    id: "p_037",
    slug: "initial-ring-letter-a",
    name: "Initial Ring — Letter A",
    description: "A made-to-order signet engraved with the initial A.",
    currency: "INR",
    category: "rings",
    material: "Gold Vermeil",
    colour: "gold-tone",
    tag: "NEW",
    isNew: true,
    isCustomisable: true,
    depositInPaise: 50000,
    optionGroups: [
      {
        axis: "size",
        label: "Ring size",
        options: [
          { value: "5", label: "5" },
          { value: "6", label: "6" },
          { value: "7", label: "7" },
          { value: "8", label: "8" },
        ],
      },
    ],
    variants: [
      { id: "p_037-5", options: { size: "5" }, priceInPaise: 159900, inStock: true },
      { id: "p_037-6", options: { size: "6" }, priceInPaise: 159900, inStock: true },
      { id: "p_037-7", options: { size: "7" }, priceInPaise: 159900, inStock: true },
      { id: "p_037-8", options: { size: "8" }, priceInPaise: 159900, inStock: true },
    ],
  },
];

// Deterministic mock sort signals (no analytics yet). NEW items get recent
// `createdAt` dates so "Newest" aligns with the NEW badge; bestsellers get a
// large `popularity` boost so "Bestselling" surfaces them first.
const CATALOGUE_EPOCH = Date.UTC(2025, 0, 1);
const DAY_MS = 86_400_000;

/**
 * Derive each product's gallery, listing price/stock (from variants when
 * present), long-form copy, and sort signals.
 */
const perCategoryCount: Partial<Record<Product["category"], number>> = {};
export const products: Product[] = rawProducts.map((p, i) => {
  const n = perCategoryCount[p.category] ?? 0;
  perCategoryCount[p.category] = n + 1;

  const images = categoryImageSet(p.category, n, 4);
  const cheapest = p.variants?.length
    ? p.variants.reduce((a, b) => (b.priceInPaise < a.priceInPaise ? b : a))
    : null;
  const priceInPaise = cheapest ? cheapest.priceInPaise : p.priceInPaise ?? 0;
  const originalPriceInPaise = cheapest
    ? cheapest.originalPriceInPaise
    : p.originalPriceInPaise;
  const inStock = p.variants?.length
    ? p.variants.some((v) => v.inStock)
    : p.inStock ?? true;

  return {
    ...p,
    priceInPaise,
    originalPriceInPaise,
    inStock,
    imageSrc: images[0],
    images,
    // Mock long-form copy — always rendered (SEO); CSS truncates it on the PDP.
    longDescription: `${p.description} Crafted in ${p.material.toLowerCase()}, the ${p.name} is made for everyday wear — light enough to forget you have it on, yet finished to feel anything but everyday. Each piece carries a protective, anti-tarnish finish and is designed to be lived in: showers, workouts and the in-between moments of real life. It arrives in signature [BrandName] packaging, ready to gift — to someone else, or to yourself. Style it back with your existing stack or let it stand alone; either way it's made to move with you, season after season.`,
    createdAt: new Date(
      CATALOGUE_EPOCH + (p.isNew ? 500 + i : i) * DAY_MS,
    ).toISOString(),
    // Catalogue insertion order (drives "Recently Listed"): later array index =
    // more recently listed, with NO new-badge boost (unlike `createdAt`).
    listedAt: new Date(CATALOGUE_EPOCH + i * DAY_MS).toISOString(),
    popularity:
      (p.isBestseller ? 1000 : 0) +
      (p.isNew ? 300 : 0) +
      (rawProducts.length - i) * 5,
    // PLACEHOLDER popularity score (0–99): a deterministic mock proxy standing in
    // for real order-count-based popularity once Supabase order data exists. The
    // *37 spread just scatters the values so the popularity sorts visibly reorder
    // the grid; it carries no real meaning. See decisions.md.
    popularityScore: (i * 37) % 100,
  };
});

/** Products flagged for the "New Arrivals" rail. */
export const newArrivals = products.filter((p) => p.isNew);

/** Products flagged for the "Bestsellers" rail (disjoint from New Arrivals). */
export const bestsellers = products.filter((p) => p.isBestseller);

/** Look up products in a single category (used by /shop/[category]). */
export function productsByCategory(category: Product["category"]): Product[] {
  return products.filter((p) => p.category === category);
}

/** Look up a single product by its slug (used by /products/[slug]). */
export function productBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

/** Related products: same category, excluding the given product. */
export function relatedProducts(product: Product, limit = 8): Product[] {
  return products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, limit);
}
