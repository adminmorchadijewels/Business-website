"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/ui/product-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { products } from "@/mock-data/products";
import { formatPriceFromPaise } from "@/lib/format";

/**
 * /style-guide — a living reference for the Daylight design system.
 * Everything here is driven by the tokens in /styles/tokens.css. Change a token
 * value and every swatch + component on this page updates with no edits here.
 * Keep this route; it is the visual source of truth for the theme.
 */

// Swatches reference Tailwind utilities only — no hex is hard-coded, so the
// swatches recolour automatically whenever a token changes.
const colourTokens: {
  name: string;
  util: string;
  swatch: string;
  ring?: boolean;
}[] = [
  { name: "background", util: "bg-background", swatch: "bg-background", ring: true },
  { name: "surface-alt", util: "bg-surface-alt", swatch: "bg-surface-alt" },
  { name: "surface-warm", util: "bg-surface-warm", swatch: "bg-surface-warm" },
  { name: "accent", util: "bg-accent", swatch: "bg-accent" },
  { name: "accent-soft", util: "bg-accent-soft", swatch: "bg-accent-soft" },
  { name: "text-primary", util: "text-text-primary", swatch: "bg-text-primary" },
  { name: "text-secondary", util: "text-text-secondary", swatch: "bg-text-secondary" },
  { name: "keyline", util: "border-keyline", swatch: "bg-keyline" },
];

const radiusTokens = [
  { name: "rounded-sm", cls: "rounded-sm" },
  { name: "rounded-md", cls: "rounded-md" },
  { name: "rounded-lg", cls: "rounded-lg" },
  { name: "rounded-xl", cls: "rounded-xl" },
];

function Block({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-keyline py-12">
      <SectionHeading eyebrow="Design system" as="h2" className="mb-8">
        {title}
      </SectionHeading>
      {children}
    </section>
  );
}

export default function StyleGuidePage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-6 pb-24">
      {/* Masthead */}
      <header className="py-16">
        <Badge variant="soft" className="mb-4">
          DAYLIGHT
        </Badge>
        <h1 className="font-heading text-4xl font-semibold leading-tight text-text-primary sm:text-5xl">
          Design system reference
        </h1>
        <p className="mt-4 max-w-prose font-body text-base text-text-secondary">
          A living preview of the Daylight theme. Every colour, font, radius and
          component below is driven by the tokens in{" "}
          <code className="rounded-sm bg-surface-alt px-1.5 py-0.5 text-sm text-text-primary">
            styles/tokens.css
          </code>
          . Change one value there and this whole page re-skins itself.
        </p>
      </header>

      {/* Colour */}
      <Block title="Colour palette">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {colourTokens.map((t) => (
            <div key={t.name} className="flex flex-col gap-2">
              <div
                className={`h-24 w-full rounded-md border border-keyline ${t.swatch}`}
              />
              <div>
                <p className="font-body text-sm font-medium text-text-primary">
                  {t.name}
                </p>
                <code className="font-body text-xs text-text-secondary">
                  {t.util}
                </code>
              </div>
            </div>
          ))}
        </div>
      </Block>

      {/* Typography */}
      <Block title="Typography">
        <div className="grid gap-10 sm:grid-cols-2">
          <div>
            <p className="mb-4 font-body text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              Heading · Fraunces · font-heading
            </p>
            <p className="font-heading text-5xl font-semibold leading-tight text-text-primary">
              Aa
            </p>
            <p className="mt-4 font-heading text-3xl font-normal text-text-primary">
              Quiet luxury, in daylight
            </p>
            <p className="font-heading text-xl font-medium text-text-primary">
              Quiet luxury, in daylight
            </p>
            <p className="font-heading text-base font-semibold text-text-primary">
              Quiet luxury, in daylight
            </p>
          </div>
          <div>
            <p className="mb-4 font-body text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              Body · Inter · font-body
            </p>
            <p className="font-body text-5xl font-bold text-text-primary">Aa</p>
            <p className="mt-4 font-body text-base font-normal text-text-secondary">
              Regular 400 — Crafted for everyday brilliance, each piece is made
              to be worn and lived in.
            </p>
            <p className="mt-2 font-body text-base font-medium text-text-primary">
              Medium 500 — Crafted for everyday brilliance.
            </p>
            <p className="mt-2 font-body text-base font-bold text-text-primary">
              Bold 700 — Crafted for everyday brilliance.
            </p>
          </div>
        </div>
      </Block>

      {/* Radius + keyline */}
      <Block title="Radius & keyline">
        <div className="flex flex-wrap gap-6">
          {radiusTokens.map((r) => (
            <div key={r.name} className="flex flex-col items-center gap-2">
              <div
                className={`h-20 w-20 border border-keyline bg-surface-warm ${r.cls}`}
              />
              <code className="font-body text-xs text-text-secondary">
                {r.name}
              </code>
            </div>
          ))}
        </div>
      </Block>

      {/* Buttons */}
      <Block title="Buttons">
        <div className="flex flex-wrap items-center gap-4">
          <Button variant="default">Add to bag</Button>
          <Button variant="outline">View details</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
          <Button variant="default" disabled>
            Disabled
          </Button>
        </div>
      </Block>

      {/* Badges */}
      <Block title="Badges & pills">
        <div className="flex flex-wrap items-center gap-4">
          <Badge variant="soft">NEW</Badge>
          <Badge variant="default">Accent</Badge>
          <Badge variant="secondary">In stock</Badge>
          <Badge variant="outline">Limited</Badge>
        </div>
      </Block>

      {/* Section heading */}
      <Block title="Section heading">
        <SectionHeading
          eyebrow="New arrivals"
          description="Heading font with the small accent marker — the Daylight signature for section breaks."
          as="h3"
        >
          Pieces made for daylight
        </SectionHeading>
      </Block>

      {/* Product cards */}
      <Block title="Product card — “matted frame”">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              name={p.name}
              price={formatPriceFromPaise(p.priceInPaise)}
              imageSrc={p.imageSrc}
              tag={p.tag}
            />
          ))}
        </div>
      </Block>
    </main>
  );
}
