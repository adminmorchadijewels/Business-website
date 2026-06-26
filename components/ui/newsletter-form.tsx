"use client";

import * as React from "react";
import { ArrowRight, Check } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface NewsletterFormProps {
  className?: string;
}

/**
 * NewsletterForm — email capture UI only. No backend yet: on submit we just
 * console.log and show a confirmation state. Wire to a real list (Supabase /
 * provider) in a later session.
 */
function NewsletterForm({ className }: NewsletterFormProps) {
  const [email, setEmail] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email) return;
    // TODO: send to the real newsletter service once the data layer exists.
    console.log("[newsletter] signup:", email);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <p
        className={cn(
          "animate-in fade-in flex items-center justify-center gap-2 font-body text-sm font-medium text-text-primary duration-500",
          className,
        )}
      >
        <Check className="size-4 text-accent" />
        Thanks — you&apos;re on the list.
      </p>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("flex w-full max-w-md items-center gap-2", className)}
    >
      <label htmlFor="newsletter-email" className="sr-only">
        Email address
      </label>
      <input
        id="newsletter-email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@email.com"
        className="h-9 w-full rounded-lg border border-keyline bg-card px-3 font-body text-sm text-text-primary placeholder:text-text-secondary focus-visible:border-ring focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      />
      <Button type="submit" size="lg">
        Subscribe
        <ArrowRight />
      </Button>
    </form>
  );
}

export { NewsletterForm };
