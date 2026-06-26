import { Suspense } from "react";
import type { Metadata } from "next";

import { SectionHeading } from "@/components/ui/section-heading";
import { ShopBrowser } from "@/components/shop/shop-browser";
import { ShopSkeleton } from "@/components/shop/shop-skeleton";
import { shopProducts } from "@/mock-data/products";

export const metadata: Metadata = {
  // Brand name TBD — replace [BrandName] once decided.
  title: "Shop — [BrandName]",
  description:
    "Browse the full collection of fine-feeling everyday jewellery — filter by category, price and metal.",
};

/**
 * /shop — the full catalogue view. The category facet is shown here (it's
 * hidden on /shop/[category] where the category is implied by the URL).
 * Filtering/sort/pagination are handled client-side by ShopBrowser via the URL
 * query string; the browsing UI sits behind a Suspense boundary because it uses
 * useSearchParams.
 */
export default function ShopPage() {
  return (
    <main className="flex-1 py-10 sm:py-12">
      <div className="mx-auto w-full max-w-6xl px-6 pb-8">
        <SectionHeading
          as="h1"
          eyebrow="Shop"
          description="Demi-fine pieces designed for real life — waterproof, anti-tarnish, made to be lived in."
        >
          All Jewellery
        </SectionHeading>
      </div>
      <Suspense fallback={<ShopSkeleton />}>
        <ShopBrowser products={shopProducts} />
      </Suspense>
    </main>
  );
}
