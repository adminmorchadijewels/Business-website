import type { ProductCategory } from "@/types/product";
import { categoryImage, galleryImage } from "@/mock-data/images";

/**
 * Content for the home page that has no real source yet. All copy here is
 * PLACEHOLDER and all imagery comes from the same curated, hand-verified
 * jewellery photo set as the product catalogue (see mock-data/images.ts).
 * Replace with real CMS / business content before launch.
 */

// ---------------------------------------------------------------- Hero
export const hero = {
  // Brand name TBD — [BrandName] is replaced once the real name is chosen.
  eyebrow: "[BrandName] — Fine everyday jewellery",
  heading: "Made to be worn in daylight",
  body: "Demi-fine pieces designed for real life — waterproof, anti-tarnish, and light enough to never take off.",
  ctaLabel: "Shop the collection",
  ctaHref: "/shop",
  // Wide styled flatlay from the curated set, cropped landscape for the banner.
  imageSrc: galleryImage(26, 1600, 1000),
};

// ---------------------------------------------------------- Announcement bar
// Rotating promo strip messages. Placeholder copy — confirm offers before launch.
export const announcements = [
  "Free shipping on orders above ₹999",
  "Extra 10% off your first order — code FIRST10",
  "Easy 7-day returns on every order",
];

// -------------------------------------------------------------- Trust strip
// PLACEHOLDER trust claims. These product claims (waterproof / anti-tarnish /
// skin-friendly) MUST be confirmed with the business and verified before launch.
export const trustClaims = [
  "WATERPROOF",
  "ANTI-TARNISH",
  "SKIN-FRIENDLY",
  "HYPOALLERGENIC",
  "6-MONTH WARRANTY",
];

// ------------------------------------------------------------- Video gallery
// Structural placeholders for the "Watch the Sparkle in Action" rail. Real
// short-video clips will replace these still thumbnails in a later session.
// Portrait (9:16) crops from the curated set, spread across categories. The
// `alt` text describes the (future) clip; no caption is rendered on the card.
// Exactly 4 unique cards — the marquee repeats this set seamlessly, so the loop
// cycles through only these 4 distinct items.
export const videoThumbs = [
  { id: "v1", alt: "Styling the layered look", imageSrc: galleryImage(7, 450, 800) },
  { id: "v2", alt: "Stacking rings 101", imageSrc: galleryImage(14, 450, 800) },
  { id: "v3", alt: "The waterproof test", imageSrc: galleryImage(20, 450, 800) },
  { id: "v4", alt: "Everyday hoops, three ways", imageSrc: galleryImage(0, 450, 800) },
];

// ----------------------------------------------------------- Shop by category
// Six categories (> 4) so the home page exercises the conditional
// carousel-vs-grid behaviour for this section (see app/page.tsx / decisions.md).
// Distinct image indices per tile so no two tiles repeat a photo (pendants draws
// from the necklace pool, bracelets from the bangle pool — offset by one).
export const categoryTiles: {
  label: string;
  category: ProductCategory;
  href: string;
  imageSrc: string;
}[] = [
  { label: "Earrings", category: "earrings", href: "/shop/earrings", imageSrc: categoryImage("earrings", 0) },
  { label: "Necklaces", category: "necklaces", href: "/shop/necklaces", imageSrc: categoryImage("necklaces", 0) },
  { label: "Pendants", category: "pendants", href: "/shop/pendants", imageSrc: categoryImage("pendants", 1) },
  { label: "Rings", category: "rings", href: "/shop/rings", imageSrc: categoryImage("rings", 0) },
  { label: "Bangles", category: "bangles", href: "/shop/bangles", imageSrc: categoryImage("bangles", 0) },
  { label: "Bracelets", category: "bracelets", href: "/shop/bracelets", imageSrc: categoryImage("bracelets", 1) },
];

// ---------------------------------------------------------------- Testimonials
export const testimonials = [
  {
    id: "t1",
    quote: "I haven't taken my hoops off in three months — showers, gym, everything. Still look brand new.",
    name: "Aisha R.",
    rating: 5,
  },
  {
    id: "t2",
    quote: "Finally jewellery that doesn't turn my skin green. The layered chain is my everyday now.",
    name: "Priya M.",
    rating: 5,
  },
  {
    id: "t3",
    quote: "Gifted the locket to my sister and she cried. Beautiful finish for the price.",
    name: "Neha K.",
    rating: 4,
  },
];

// ------------------------------------------------------------- Instagram feed
// Placeholder grid that would embed the real feed. Handle uses [BrandName].
export const instagramHandle = "@[BrandName]";
export const instagramHref = "https://instagram.com";
export const instagramPosts = [
  { id: "ig1", imageSrc: galleryImage(2) },
  { id: "ig2", imageSrc: galleryImage(8) },
  { id: "ig3", imageSrc: galleryImage(13) },
  { id: "ig4", imageSrc: galleryImage(21) },
  { id: "ig5", imageSrc: galleryImage(28) },
  { id: "ig6", imageSrc: galleryImage(5) },
];
