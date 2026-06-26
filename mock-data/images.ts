import type { ProductCategory } from "@/types/product";

/**
 * Curated placeholder jewellery photography.
 *
 * A FIXED, hand-verified set of specific Unsplash CDN photos. Each id below was
 * downloaded and visually confirmed to show actual jewellery (rings, necklaces,
 * earrings, bangles/bracelets) on a clean/neutral background. We cycle
 * deterministically through the set so every product, category tile and
 * thumbnail gets a stable, on-topic image across reloads.
 *
 * WHY a fixed list (and not a query endpoint): the earlier approach
 * (`source.unsplash.com` → LoremFlickr keyword queries) returned random,
 * frequently off-topic photos — street scenes, faces, even solid error blocks —
 * because keyword endpoints don't guarantee subject matter. Pinning specific
 * photo ids is the only reliable way to keep the storefront looking like a
 * jewellery store until real product photography lands (served from R2 /
 * Cloudflare Images). See decisions.md. Clearly temporary.
 */

const UNSPLASH = "https://images.unsplash.com";

/**
 * Build a sized Unsplash CDN URL from a stable photo id. `w`/`h` request a
 * server-side crop so the bytes (and framing) match the slot — square for
 * product/category, portrait for the video rail, landscape for the hero.
 */
function photo(id: string, w: number, h: number): string {
  return `${UNSPLASH}/photo-${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;
}

/**
 * Verified photo ids grouped by best-fit category. `bracelets` shares the
 * `bangles` pool (same wrist-jewellery imagery). Each pool has enough distinct
 * shots that a category's products don't visibly repeat.
 */
const idsByCategory: Record<ProductCategory, string[]> = {
  earrings: [
    "1617038220319-276d3cfab638", // gold twisted hoop earrings on stone
    "1617038260897-41a1f14a8ca0", // gold twisted hoops, clean
    "1629224316810-9d8805b95e76", // rose-gold crystal teardrop drops
    "1693212793204-bcea856c75fe", // crystal leaf earrings on black satin
    "1615655114865-4cc1bda5901e", // two-tone hoop earrings on white
    "1608508644127-ba99d7732fee", // small gold hoops on a pink dish
    "1535632066927-ab7c9ab60908", // blue-gem crystal drop earrings
  ],
  necklaces: [
    "1635767798638-3e25273a8236", // layered gold chains + coin pendant
    "1685970731571-72ede0cb26ea", // pearl-petal flower pendant on velvet
    "1685970731194-e27b477e87ba", // gold rope chain + crown pendant
    "1599643478518-a784e5dc4c8f", // layered gold necklaces, blue gem
    "1610694955371-d4a3e0ce4b52", // layered gold pendant necklaces
    "1616837874254-8d5aaa63e273", // gold herringbone chain
  ],
  rings: [
    "1598560917807-1bae44bd2be8", // gold emerald-cut solitaire on white
    "1603561596973-8166e9e089d1", // pink-sapphire halo ring
    "1631982690223-8aa4be0a2497", // three rose-gold rings in a box
    "1631982686092-e6561a853187", // dainty gold floral ring
    "1622398925373-3f91b1e275f5", // pair of gold wedding bands
    "1605100804763-247f67b3557e", // diamond halo ring on black box
    "1713950920412-97799efdf870", // diamond solitaire on black
  ],
  bangles: [
    "1633810543462-77c4a3b13f07", // gold paperclip-chain bracelet on wrist
    "1619119069152-a2b331eb392a", // diamond tennis bracelet on white
    "1611591437281-460bfbe1220a", // rose-gold pavé bangle on pink
    "1689367436629-1d288f1e23b6", // slim gold gemstone bangle, clean
    "1717605383946-96c6884c36b4", // gold clover-charm bracelet flatlay
    "1573408301185-9146fe634ad0", // diamond link bracelet on black
  ],
  // `pendants` and `bracelets` reuse a sibling pool (filled after the literal).
  pendants: [],
  bracelets: [],
};
// Pendants are necklaces; bracelets share the bangle (wrist) imagery.
idsByCategory.pendants = idsByCategory.necklaces;
idsByCategory.bracelets = idsByCategory.bangles;

/** General / styled flatlays — used where no single category applies. */
const generalIds = [
  "1611107683227-e9060eccd846", // stack of gold bangles + chain flatlay
  "1602173574767-37ac01994b2a", // chunky gold chain bracelet on a magazine
  "1655255114527-d0a834d9a774", // rose-gold hoops + snake chain flatlay
];

/**
 * Flat pool of every verified id (category pools + general), de-duplicated.
 * Used by non-category contexts (video rail, Instagram strip, hero).
 */
const allIds = Array.from(
  new Set([
    ...idsByCategory.earrings,
    ...idsByCategory.necklaces,
    ...idsByCategory.rings,
    ...idsByCategory.bangles,
    ...generalIds,
  ]),
);

/**
 * Square (1:1) image for a product or category tile, cycling stably through the
 * category's pool by `index` (so the Nth ring gets a different shot than the
 * first). Defaults to an 800px crop.
 */
export function categoryImage(
  category: ProductCategory,
  index: number,
  size = 800,
): string {
  const pool = idsByCategory[category];
  return photo(pool[index % pool.length], size, size);
}

/**
 * A SET of distinct square images for a single product's gallery (Product page).
 * Cycles `count` consecutive ids from the category pool starting at `index`, so
 * the first image matches the product's card image (`categoryImage`) and the
 * gallery has `count` distinct, on-topic shots.
 */
export function categoryImageSet(
  category: ProductCategory,
  index: number,
  count = 4,
  size = 800,
): string[] {
  const pool = idsByCategory[category];
  return Array.from({ length: count }, (_, k) =>
    photo(pool[(index + k) % pool.length], size, size),
  );
}

/**
 * Image of arbitrary dimensions from the flat pool, cycling by `index`. For the
 * portrait video rail (e.g. 450×800), the hero (1600×1000), or the Instagram
 * grid (square). Keeps a stable photo per slot.
 */
export function galleryImage(
  index: number,
  w = 800,
  h = 800,
): string {
  return photo(allIds[index % allIds.length], w, h);
}
