import Link from "next/link";
import { ArrowRight, Camera, Play, Star } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatPriceFromPaise } from "@/lib/format";
import { firstVideo } from "@/lib/product";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/ui/product-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { Marquee } from "@/components/ui/marquee";
import { DragScroll } from "@/components/ui/drag-scroll";
import { Reveal } from "@/components/ui/reveal";
import type { Product } from "@/types/product";
import { newArrivals, bestsellers } from "@/mock-data/products";
import {
  trustClaims,
  hero,
  videoThumbs,
  categoryTiles,
  testimonials,
  instagramHandle,
  instagramHref,
  instagramPosts,
} from "@/mock-data/home";

/**
 * Home page. Composed from the Daylight design system + components, on mock data
 * only (no Supabase / APIs yet). The site chrome (announcement bar, header,
 * footer) lives in the root layout (components/layout) and is shared with /shop.
 *
 * Brand name is still TBD — every user-facing brand slot uses the literal
 * [BrandName] placeholder for a one-pass find-and-replace later.
 */

// Reusable rail. MOBILE: a compact 2×2 grid showing the first 4 products only
// (the rest are hidden until `md`). TABLET/DESKTOP (`md`+): a single-row,
// free-flowing swipe/drag scroll with no visible scrollbar showing every
// product. The grid→carousel switch is at `md` (768px) — the same tablet width
// where the sibling category/testimonial rows go multi-up — so the product rail
// isn't a cramped 2-up next to a 4-up category grid at tablet width. DragScroll
// auto-disables its drag where the row isn't overflowing (the mobile grid).
function ProductRail({ products }: { products: Product[] }) {
  return (
    <DragScroll className="grid grid-cols-2 gap-x-4 gap-y-6 md:flex md:snap-x md:gap-5 md:overflow-x-auto md:pb-1">
      {products.map((p, i) => (
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
          // Beyond the first 4, stay hidden on mobile but rejoin the tablet/desktop row.
          className={cn(
            "md:w-56 md:shrink-0 md:snap-start",
            i >= 4 && "hidden md:flex",
          )}
        />
      ))}
    </DragScroll>
  );
}

// A single "Shop by Category" tile: borderless, flush image + label/arrow below.
// `className` lets the caller size it for a carousel slot vs. a grid cell.
function CategoryTile({
  tile,
  className,
}: {
  tile: (typeof categoryTiles)[number];
  className?: string;
}) {
  return (
    <Link
      href={tile.href}
      className={cn(
        "group flex flex-col transition duration-200 ease-out hover:-translate-y-1",
        className,
      )}
    >
      {/* Borderless, flush image on a clean near-white frame (no mat). */}
      <div className="aspect-square overflow-hidden rounded-md bg-card transition-shadow duration-200 ease-out group-hover:shadow-lg">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={tile.imageSrc}
          alt={tile.label}
          width={600}
          height={600}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <span className="flex items-center justify-between px-0.5 pt-3">
        <span className="font-heading text-base font-medium text-text-primary">
          {tile.label}
        </span>
        <ArrowRight className="size-4 text-text-secondary transition-transform group-hover:translate-x-0.5 group-hover:text-accent" />
      </span>
    </Link>
  );
}

// Outlined, rectangular "View All" CTA that ends each product carousel,
// linking to the (placeholder) filtered Shop route.
function ViewAllButton({ href, children }: { href: string; children: string }) {
  return (
    <div className="mt-8 flex justify-center">
      <Button
        variant="outline"
        size="lg"
        className="rounded-sm"
        render={<Link href={href} />}
      >
        {children}
        <ArrowRight />
      </Button>
    </div>
  );
}

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
        {/* 2 — Hero (the one signature moment; restrained entrance animation) */}
        <section className="relative isolate overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={hero.imageSrc}
            alt=""
            aria-hidden
            width={1920}
            height={1080}
            className="absolute inset-0 -z-10 h-full w-full object-cover"
          />
          {/* Scrim for text legibility over the photo. */}
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-gradient-to-t from-text-primary/80 via-text-primary/40 to-text-primary/20"
          />
          <div className="mx-auto flex w-full max-w-6xl flex-col items-start px-6 py-28 sm:py-36 lg:py-44">
            <div className="animate-in fade-in slide-in-from-bottom-4 max-w-xl duration-700">
              <Badge variant="soft" className="mb-5">
                {hero.eyebrow}
              </Badge>
              <h1 className="font-heading text-4xl font-semibold leading-tight text-on-accent sm:text-5xl lg:text-6xl">
                {hero.heading}
              </h1>
              <p className="mt-5 max-w-md font-body text-base text-on-accent/85">
                {hero.body}
              </p>
              <Button
                size="lg"
                className="mt-8"
                render={<Link href={hero.ctaHref} />}
              >
                {hero.ctaLabel}
                <ArrowRight />
              </Button>
            </div>
          </div>
        </section>

        {/* 3 — Trust strip (scrolling marquee; placeholder claims) */}
        {/* NOTE: these trust claims are PLACEHOLDERS — real claims must be
            confirmed with the business and verified before launch. */}
        <Reveal as="section" className="border-y border-keyline bg-surface-warm py-3">
          <Marquee durationSec={28} aria-label="Product promises">
            {trustClaims.map((claim) => (
              <span
                key={claim}
                className="mx-8 inline-flex items-center gap-3 font-body text-xs font-semibold uppercase tracking-[0.22em] text-text-primary"
              >
                {claim}
                <Star className="size-3 fill-accent text-accent" aria-hidden />
              </span>
            ))}
          </Marquee>
        </Reveal>

        {/* 4 — Video gallery (placeholder thumbnails for future video clips) */}
        {/* NOTE: real short-video files will replace these still thumbnails.
            An infinite, seamlessly-looping marquee (renders the set twice and
            translates -50%) with equal margins between every card — no captions,
            no visible scrollbar. Pauses on hover; reduced-motion aware. */}
        <Reveal as="section" className="mx-auto w-full max-w-6xl py-12 sm:py-16">
          <SectionHeading eyebrow="In motion" className="mb-6 px-6">
            Watch the Sparkle in Action
          </SectionHeading>
          <Marquee durationSec={45} aria-label="Short videos">
            {videoThumbs.map((v) => (
              <article key={v.id} className="group mx-2.5 w-44 shrink-0 sm:w-52">
                {/* Vertical / portrait framing (~9:16) to match short-form
                    reels-style video. object-cover re-crops the placeholder. */}
                <div className="relative aspect-[9/16] overflow-hidden rounded-lg bg-surface-alt">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={v.imageSrc}
                    alt={v.alt}
                    width={360}
                    height={640}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <span
                    aria-hidden
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <span className="flex size-12 items-center justify-center rounded-full bg-background/85 text-accent shadow-sm transition-transform duration-300 group-hover:scale-110">
                      <Play className="size-5 translate-x-px fill-accent" />
                    </span>
                  </span>
                </div>
              </article>
            ))}
          </Marquee>
        </Reveal>

        {/* 5 — Shop by Category (borderless tiles: image flush, label below) */}
        <Reveal as="section" className="mx-auto w-full max-w-6xl px-6 py-12 sm:py-16">
          <SectionHeading eyebrow="Browse" className="mb-6">
            Shop by Category
          </SectionHeading>
          {/* Conditional: > 4 categories → free-flowing drag/swipe carousel
              (no visible scrollbar); otherwise the static responsive grid. */}
          {categoryTiles.length > 4 ? (
            <DragScroll className="flex snap-x gap-4 overflow-x-auto pb-1">
              {categoryTiles.map((c) => (
                <CategoryTile
                  key={c.category}
                  tile={c}
                  className="w-40 shrink-0 snap-start sm:w-52"
                />
              ))}
            </DragScroll>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {categoryTiles.map((c) => (
                <CategoryTile key={c.category} tile={c} />
              ))}
            </div>
          )}
        </Reveal>

        {/* 6 — New Arrivals (free-flowing swipe/drag scroll on mobile) */}
        <Reveal as="section" className="mx-auto w-full max-w-6xl px-6 py-12 sm:py-16">
          <SectionHeading eyebrow="Just in" className="mb-6">
            New Arrivals
          </SectionHeading>
          <ProductRail products={newArrivals} />
          <ViewAllButton href="/shop?category=new">
            View All New Arrivals
          </ViewAllButton>
        </Reveal>

        {/* 7 — Bestsellers (consolidated row, distinct products from New Arrivals) */}
        <Reveal as="section" className="bg-surface-alt/50 py-12 sm:py-16">
          <div className="mx-auto w-full max-w-6xl px-6">
            <SectionHeading eyebrow="Most loved" className="mb-6">
              Bestsellers
            </SectionHeading>
            <ProductRail products={bestsellers} />
            <ViewAllButton href="/shop?filter=bestsellers">
              View All Bestsellers
            </ViewAllButton>
          </div>
        </Reveal>

        {/* Testimonials */}
        <Reveal as="section" className="py-12 sm:py-16">
          <div className="mx-auto w-full max-w-6xl px-6">
            <SectionHeading
              eyebrow="Kind words"
              align="center"
              className="mb-10 items-center"
            >
              Loved by thousands
            </SectionHeading>
            {/* MOBILE: free-flowing horizontal swipe/drag carousel (no visible
                scrollbar, one card + a peek of the next). DESKTOP (`sm`+): the
                static 3-up grid. DragScroll's drag disables itself at the grid. */}
            <DragScroll className="flex snap-x gap-4 overflow-x-auto sm:grid sm:grid-cols-3 sm:gap-6 sm:overflow-visible">
              {testimonials.map((t) => (
                <figure
                  key={t.id}
                  className="flex w-72 shrink-0 snap-start flex-col rounded-xl border border-keyline bg-card p-6 sm:w-auto"
                >
                  <div
                    className="mb-4 flex items-center gap-0.5"
                    aria-label={`${t.rating} out of 5 stars`}
                  >
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        aria-hidden
                        className={cn(
                          "size-4",
                          i < t.rating
                            ? "fill-accent-soft text-accent-soft"
                            : "text-keyline",
                        )}
                      />
                    ))}
                  </div>
                  <blockquote className="flex-1 font-body text-sm leading-relaxed text-text-primary">
                    “{t.quote}”
                  </blockquote>
                  <figcaption className="mt-4 font-body text-sm font-semibold text-text-secondary">
                    {t.name}
                  </figcaption>
                </figure>
              ))}
            </DragScroll>
          </div>
        </Reveal>

        {/* Instagram feed strip */}
        <Reveal as="section" className="mx-auto w-full max-w-6xl px-6 py-12 sm:py-16">
          <SectionHeading
            eyebrow="Follow along"
            align="center"
            description={`Tag us ${instagramHandle} to be featured.`}
            className="mb-8 items-center"
          >
            On Instagram
          </SectionHeading>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            {instagramPosts.map((post) => (
              <a
                key={post.id}
                href={instagramHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Open ${instagramHandle} on Instagram`}
                className="group relative aspect-square overflow-hidden rounded-md border border-keyline bg-surface-alt"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={post.imageSrc}
                  alt=""
                  width={600}
                  height={600}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <span className="absolute inset-0 flex items-center justify-center bg-text-primary/0 text-on-accent opacity-0 transition-all duration-300 group-hover:bg-text-primary/40 group-hover:opacity-100">
                  <Camera className="size-6" />
                </span>
              </a>
            ))}
          </div>
        </Reveal>
    </main>
  );
}
