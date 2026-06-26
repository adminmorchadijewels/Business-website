import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { SectionHeading } from "@/components/ui/section-heading";
import { ShopBrowser } from "@/components/shop/shop-browser";
import { ShopSkeleton } from "@/components/shop/shop-skeleton";
import { productsByCategory } from "@/mock-data/products";
import { CATEGORY_FACET } from "@/lib/shop";

/** Prerender a page per known category. */
export function generateStaticParams() {
  return CATEGORY_FACET.map((c) => ({ category: c.value }));
}

function findCategory(slug: string) {
  return CATEGORY_FACET.find((c) => c.value === slug);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const cat = findCategory(category);
  // Brand name TBD — replace [BrandName] once decided.
  return {
    title: cat ? `${cat.label} — [BrandName]` : "Shop — [BrandName]",
    description: cat
      ? `Shop ${cat.label.toLowerCase()} — filter by price and metal.`
      : undefined,
  };
}

/**
 * /shop/[category] — a category-pre-filtered catalogue view. The category facet
 * is hidden (the category is implied by the URL); price + metal filters and sort
 * still apply, layered on as query params. A breadcrumb links back to /shop.
 * Unknown categories 404.
 */
export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const cat = findCategory(category);
  if (!cat) notFound();

  const categoryProducts = productsByCategory(cat.value);

  return (
    <main className="flex-1 py-10 sm:py-12">
      <div className="mx-auto w-full max-w-6xl px-6 pb-8">
        {/* Breadcrumb back to the full catalogue */}
        <nav
          aria-label="Breadcrumb"
          className="mb-4 flex items-center gap-1.5 font-body text-sm text-text-secondary"
        >
          <Link href="/shop" className="transition-colors hover:text-text-primary">
            Shop
          </Link>
          <ChevronRight className="size-3.5" aria-hidden />
          <span className="text-text-primary">{cat.label}</span>
        </nav>
        <SectionHeading as="h1" eyebrow="Shop">
          {cat.label}
        </SectionHeading>
      </div>
      <Suspense fallback={<ShopSkeleton />}>
        <ShopBrowser products={categoryProducts} lockedCategory={cat.value} />
      </Suspense>
    </main>
  );
}
