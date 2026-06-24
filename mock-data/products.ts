import type { Product } from "@/types/product";

/**
 * Dummy catalogue used to develop the UI before the data layer exists.
 * All images point at the local placeholder SVG for now.
 */
export const products: Product[] = [
  {
    id: "p_001",
    slug: "aurora-solitaire-ring",
    name: "Aurora Solitaire Ring",
    description: "A single brilliant-cut stone on a fine 18k gold band.",
    priceInPaise: 2480000,
    currency: "INR",
    category: "rings",
    material: "18k Gold",
    imageSrc: "/placeholder-product.svg",
    tag: "NEW",
    inStock: true,
  },
  {
    id: "p_002",
    slug: "lumen-drop-earrings",
    name: "Lumen Drop Earrings",
    description: "Tapered drops that catch the light from every angle.",
    priceInPaise: 1860000,
    currency: "INR",
    category: "earrings",
    material: "Platinum",
    imageSrc: "/placeholder-product.svg",
    tag: "BESTSELLER",
    inStock: true,
  },
  {
    id: "p_003",
    slug: "meridian-pendant-necklace",
    name: "Meridian Pendant Necklace",
    description: "A minimalist pendant on a delicate cable chain.",
    priceInPaise: 3120000,
    currency: "INR",
    category: "necklaces",
    material: "18k Gold",
    imageSrc: "/placeholder-product.svg",
    inStock: true,
  },
  {
    id: "p_004",
    slug: "halo-tennis-bracelet",
    name: "Halo Tennis Bracelet",
    description: "A continuous line of matched stones in a slim setting.",
    priceInPaise: 5400000,
    currency: "INR",
    category: "bracelets",
    material: "White Gold",
    imageSrc: "/placeholder-product.svg",
    tag: "LIMITED",
    inStock: false,
  },
];
