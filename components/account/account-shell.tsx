"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { useAuth } from "@/components/auth/auth-context";

/**
 * AccountShell — shared chrome for the Account section: the page heading, the
 * Profile/Orders sub-nav, and the signed-out guard. Children render only when a
 * mock user is signed in, so each Account page can assume `auth.user` exists.
 */

const TABS = [
  { href: "/account/profile", label: "My Profile" },
  { href: "/account/orders", label: "My Orders" },
];

export function AccountShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const auth = useAuth();
  const pathname = usePathname();

  return (
    <main className="flex-1 py-10 sm:py-12">
      <div className="mx-auto w-full max-w-4xl px-6">
        <SectionHeading as="h1" eyebrow="Account" className="mb-6">
          {title}
        </SectionHeading>

        {!auth.hydrated ? (
          <div aria-busy className="h-40" />
        ) : !auth.isLoggedIn ? (
          <Reveal className="rounded-lg border border-keyline bg-card px-6 py-16 text-center">
            <p className="font-heading text-lg text-text-primary">Please sign in</p>
            <p className="mt-2 font-body text-sm text-text-secondary">
              Sign in to view your account, orders, and saved addresses.
            </p>
            <Button size="lg" className="mt-6 rounded-sm" render={<Link href="/login" />}>
              Sign in
              <ArrowRight />
            </Button>
          </Reveal>
        ) : (
          <>
            <nav className="mb-8 flex gap-1 border-b border-keyline">
              {TABS.map((t) => {
                const active = pathname === t.href;
                return (
                  <Link
                    key={t.href}
                    href={t.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "-mb-px border-b-2 px-4 py-2.5 font-body text-sm transition-colors",
                      active
                        ? "border-accent font-semibold text-text-primary"
                        : "border-transparent text-text-secondary hover:text-text-primary",
                    )}
                  >
                    {t.label}
                  </Link>
                );
              })}
            </nav>
            {children}
          </>
        )}
      </div>
    </main>
  );
}
