import Link from "next/link";
import { Heart } from "lucide-react";

import { AnnouncementBar } from "@/components/ui/announcement-bar";
import { CartBagButton } from "@/components/cart/cart-bag-button";
import { AccountNav } from "@/components/layout/account-nav";
import { HeaderSearch } from "@/components/layout/header-search";
import { announcements, categoryTiles } from "@/mock-data/home";

/**
 * Site-wide chrome: the auto-rotating announcement bar + the sticky header
 * (wordmark, category nav, utility icons). Rendered once in the root layout so
 * every page shares identical chrome. Server component; only the announcement
 * rotation is an isolated client component.
 *
 * Brand name is still TBD — the wordmark uses the literal [BrandName] placeholder.
 */
export function SiteHeader() {
  return (
    <>
      {/* Announcement bar (auto-rotating + prev/next) */}
      <AnnouncementBar messages={announcements} />

      <header className="sticky top-0 z-40 border-b border-keyline bg-background/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-6 py-4">
          <Link
            href="/"
            className="font-heading text-xl font-semibold tracking-tight text-text-primary"
          >
            [BrandName]
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            {categoryTiles.map((c) => (
              <Link
                key={c.category}
                href={c.href}
                className="font-body text-sm text-text-secondary transition-colors hover:text-text-primary"
              >
                {c.label}
              </Link>
            ))}
            <Link
              href="/track-order"
              className="font-body text-sm text-text-secondary transition-colors hover:text-text-primary"
            >
              Track order
            </Link>
          </nav>
          <div className="flex items-center gap-1 text-text-primary">
            <HeaderSearch />
            <button
              type="button"
              aria-label="Wishlist"
              className="rounded-full p-2 transition-colors hover:bg-surface-alt"
            >
              <Heart className="size-5" />
            </button>
            <AccountNav />
            <CartBagButton />
          </div>
        </div>
      </header>
    </>
  );
}
