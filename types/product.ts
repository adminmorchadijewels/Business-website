/**
 * Domain types for the storefront. These describe the *shape* of data the UI
 * consumes. The real source (Supabase) arrives in a later session; for now the
 * same shapes are satisfied by /mock-data.
 */

export type ProductCategory =
  | "rings"
  | "earrings"
  | "necklaces"
  | "bracelets";

export type ProductTag = "NEW" | "BESTSELLER" | "LIMITED";

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  /** Price in paise (integer, smallest currency unit) to avoid float errors. */
  priceInPaise: number;
  currency: "INR";
  category: ProductCategory;
  /** Primary material, e.g. "18k Gold". */
  material: string;
  imageSrc: string;
  tag?: ProductTag;
  inStock: boolean;
}
