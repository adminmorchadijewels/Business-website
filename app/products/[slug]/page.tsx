import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { formatPriceFromPaise } from "@/lib/format";
import { firstVideo } from "@/lib/product";
import { CATEGORY_FACET } from "@/lib/shop";
import { SectionHeading } from "@/components/ui/section-heading";
import { ProductCard } from "@/components/ui/product-card";
import { Reveal } from "@/components/ui/reveal";
import { DragScroll } from "@/components/ui/drag-scroll";
import {
  Accordion,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductBuyBox } from "@/components/product/product-buy-box";
import {
  addOnsFor,
  productBySlug,
  products,
  relatedProducts,
} from "@/mock-data/products";

/** Prerender a page per product. Add-on-only products are excluded — they're
 *  reachable only through a main product's add-on selector, not as standalone
 *  catalogue pages. */
export function generateStaticParams() {
  return products.filter((p) => !p.isAddOnOnly).map((p) => ({ slug: p.slug }));
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
 * gift add-ons → add to cart → trust badges → description accordions → related
 * products. The description block is three independently-collapsible accordions
 * (Product Description / Product Details / Return & Exchange); every panel keeps
 * its full content in the DOM via `hiddenUntilFound` (SEO), so collapsing only
 * hides it visually.
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
          <ProductGallery media={product.media} alt={product.name} />
          <ProductBuyBox product={product} addOns={addOnsFor(product)} />
        </div>

        {/* 8 — Description split into three accordions. Every panel uses
            `hiddenUntilFound` so its full content stays in the rendered HTML
            (SEO + find-in-page) even while collapsed — only the visual display is
            hidden, never the DOM content. "Product Description" opens by default. */}
        <Reveal as="section" className="mt-12 max-w-2xl border-t border-keyline pt-2">
          <h2 className="sr-only">Product information</h2>
          <Accordion multiple defaultValue={["description"]} className="flex flex-col">
            <AccordionItem value="description">
              <AccordionTrigger className="font-heading text-base font-semibold text-text-primary">
                Product Description
              </AccordionTrigger>
              <AccordionPanel hiddenUntilFound>
                <p className="font-body text-sm leading-relaxed text-text-secondary">
                  {product.longDescription}
                </p>
              </AccordionPanel>
            </AccordionItem>

            <AccordionItem value="details">
              <AccordionTrigger className="font-heading text-base font-semibold text-text-primary">
                Product Details
              </AccordionTrigger>
              <AccordionPanel hiddenUntilFound>
                <dl className="flex flex-col gap-3 font-body text-sm">
                  <div>
                    <dt className="font-medium text-text-primary">Material</dt>
                    <dd className="mt-0.5 text-text-secondary">{product.material}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-text-primary">Dimensions</dt>
                    <dd className="mt-0.5 text-text-secondary">{product.dimensions}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-text-primary">Care</dt>
                    <dd className="mt-0.5 text-text-secondary">{product.care}</dd>
                  </div>
                </dl>
              </AccordionPanel>
            </AccordionItem>

            <AccordionItem value="returns">
              <AccordionTrigger className="font-heading text-base font-semibold text-text-primary">
                Return &amp; Exchange
              </AccordionTrigger>
              <AccordionPanel hiddenUntilFound>
                <p className="font-body text-sm leading-relaxed text-text-secondary">
                  Returns accepted within 7 days of delivery for unused items in
                  their original packaging. Made-to-order and customised pieces
                  are non-returnable.
                </p>
                <p className="mt-2 font-body text-xs italic text-text-secondary">
                  Placeholder policy — final return &amp; exchange terms are
                  pending business confirmation.
                </p>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
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
                  videoSrc={firstVideo(p)?.src}
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
