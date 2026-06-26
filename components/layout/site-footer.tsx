import Link from "next/link";
import { Camera, Mail, MapPin, MessageCircle, Phone, Send } from "lucide-react";

import { Reveal } from "@/components/ui/reveal";
import { instagramHref } from "@/mock-data/home";

/**
 * Site-wide footer (brand blurb + socials, policies, contact, payments).
 * Rendered once in the root layout so every page shares it. Social / payment
 * glyphs are placeholders (lucide v1 dropped brand logos; payment names are text
 * chips) until real assets are sourced.
 *
 * Brand name is still TBD — uses the literal [BrandName] placeholder.
 */
export function SiteFooter() {
  return (
    <Reveal as="footer" className="border-t border-keyline bg-background">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4">
        {/* Brand */}
        <div className="sm:col-span-2 lg:col-span-1">
          <p className="font-heading text-xl font-semibold text-text-primary">
            [BrandName]
          </p>
          <p className="mt-3 max-w-xs font-body text-sm text-text-secondary">
            Fine-feeling everyday jewellery — waterproof, anti-tarnish and made to
            be lived in.
          </p>
          <div className="mt-5 flex items-center gap-2">
            <a
              href={instagramHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="rounded-full border border-keyline p-2 text-text-secondary transition-colors hover:border-accent/40 hover:text-accent"
            >
              <Camera className="size-4" />
            </a>
            <a
              href={instagramHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="rounded-full border border-keyline p-2 text-text-secondary transition-colors hover:border-accent/40 hover:text-accent"
            >
              <MessageCircle className="size-4" />
            </a>
            <a
              href="mailto:hello@example.com"
              aria-label="Email"
              className="rounded-full border border-keyline p-2 text-text-secondary transition-colors hover:border-accent/40 hover:text-accent"
            >
              <Send className="size-4" />
            </a>
          </div>
        </div>

        {/* Policies */}
        <nav className="flex flex-col gap-3">
          <p className="font-body text-xs font-semibold uppercase tracking-[0.18em] text-text-primary">
            Policies
          </p>
          {[
            ["Shipping", "/policies/shipping"],
            ["Returns & exchanges", "/policies/returns"],
            ["Privacy policy", "/policies/privacy"],
            ["Terms of service", "/policies/terms"],
          ].map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className="font-body text-sm text-text-secondary transition-colors hover:text-text-primary"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Contact */}
        <div className="flex flex-col gap-3">
          <p className="font-body text-xs font-semibold uppercase tracking-[0.18em] text-text-primary">
            Contact
          </p>
          <span className="flex items-center gap-2 font-body text-sm text-text-secondary">
            <Mail className="size-4" /> hello@brand.example
          </span>
          <span className="flex items-center gap-2 font-body text-sm text-text-secondary">
            <Phone className="size-4" /> +91 00000 00000
          </span>
          <span className="flex items-center gap-2 font-body text-sm text-text-secondary">
            <MapPin className="size-4" /> India
          </span>
        </div>

        {/* Payments */}
        <div className="flex flex-col gap-3">
          <p className="font-body text-xs font-semibold uppercase tracking-[0.18em] text-text-primary">
            We accept
          </p>
          <div className="flex flex-wrap gap-2">
            {["PhonePe", "UPI", "Visa", "Mastercard", "Rupay"].map((m) => (
              <span
                key={m}
                className="rounded-md border border-keyline bg-surface-alt px-2.5 py-1 font-body text-xs font-medium text-text-secondary"
              >
                {m}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-keyline">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-6 py-5 sm:flex-row">
          <p className="font-body text-xs text-text-secondary">
            © 2026 [BrandName]. All rights reserved.
          </p>
          <p className="font-body text-xs text-text-secondary">Made in daylight.</p>
        </div>
      </div>
    </Reveal>
  );
}
