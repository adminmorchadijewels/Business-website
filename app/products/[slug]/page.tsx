import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { formatPriceFromPaise } from "@/lib/format";
import { CATEGORY_FACET } from "@/lib/shop";
import { SectionHeading } from "@/components/ui/section-heading";
import { ProductCard } from "@/components/ui/product-card";
import { Reveal } from "@/components/ui/reveal";
import { DragScroll } from "@/components/ui/drag-scroll";
import { ExpandableText } from "@/components/ui/expandable-text";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductBuyBox } from "@/components/product/product-buy-box";
import {
  productBySlug,
  products,
  relatedProducts,
} from "@/mock-data/products";

/** Prerender a page per product. */
export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

function categoryLabel(category: string): string {
  return CATEGORY_FACET.find((c) => c.value === category)?.label ?? category;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = productBySlug(slug);
  if (!product) return { title: "Product — [BrandName]" };
  // Brand name TBD — replace [BrandName] once decided.
  return {
    title: `${product.name} — [BrandName]`,
    description: product.description,
  };
}

/**
 * /products/[slug] — the product detail page. Section order is locked:
 * breadcrumb → gallery → title/price → variant selectors → customisation note →
 * add to cart → trust badges → long description → related products. The full
 * description is always in the DOM (SEO); only its display is CSS-truncated.
 */
export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = productBySlug(slug);
  if (!product) notFound();

  const related = relatedProducts(product);
  const catLabel = categoryLabel(product.category);

  return (
    <main className="flex-1 py-8 sm:py-10">
      <div className="mx-auto w-full max-w-6xl px-6">
        {/* 1 — Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-1.5 font-body text-sm text-text-secondary"
        >
          <Link href="/" className="transition-colors hover:text-text-primary">
            Home
          </Link>
          <ChevronRight className="size-3.5" aria-hidden />
          <Link href="/shop" className="transition-colors hover:text-text-primary">
            Shop
          </Link>
          <ChevronRight className="size-3.5" aria-hidden />
          <Link
            href={`/shop/${product.category}`}
            className="transition-colors hover:text-text-primary"
          >
            {catLabel}
          </Link>
          <ChevronRight className="size-3.5" aria-hidden />
          <span className="text-text-primary">{product.name}</span>
        </nav>

        {/* 2 — Gallery + 3–7 buy box */}
        <div className="mt-6 lg:grid lg:grid-cols-2 lg:gap-12">
          <ProductGallery images={product.images} alt={product.name} />
          <ProductBuyBox product={product} />
        </div>

        {/* 8 — Long description (full text always rendered; CSS-truncated) */}
        <Reveal as="section" className="mt-12 max-w-2xl border-t border-keyline pt-8">
          <h2 className="font-heading text-lg font-semibold text-text-primary">
            Details
          </h2>
          <ExpandableText text={product.longDescription} className="mt-3" lines={4} />
        </Reveal>

        {/* 9 — Related products (same category; drag/swipe, no scrollbar) */}
        {related.length > 0 ? (
          <Reveal as="section" className="mt-14">
            <SectionHeading eyebrow="More to love" className="mb-6">
              You may also like
            </SectionHeading>
            <DragScroll className="flex snap-x gap-4 overflow-x-auto pb-1">
              {related.map((p) => (
                <ProductCard
                  key={p.id}
                  name={p.name}
                  price={formatPriceFromPaise(p.priceInPaise)}
                  originalPrice={
                    p.originalPriceInPaise
                      ? formatPriceFromPaise(p.originalPriceInPaise)
                      : undefined
                  }
                  imageSrc={p.imageSrc}
                  tag={p.tag}
                  href={`/products/${p.slug}`}
                  className="w-44 shrink-0 snap-start sm:w-52"
                />
              ))}
            </DragScroll>
          </Reveal>
        ) : null}
      </div>
    </main>
  );
}
