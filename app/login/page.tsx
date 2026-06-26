"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  Info,
  PackageCheck,
  MapPin,
  Zap,
} from "lucide-react";

import {
  MOCK_OTP,
  OTP_RESEND_SECONDS,
  isValidOtp,
  isValidPhone,
  makeNewUser,
  normalisePhone,
} from "@/lib/auth";
import { findUserByPhone } from "@/mock-data/users";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { useAuth } from "@/components/auth/auth-context";

/**
 * /login — single unified phone-OTP flow (no separate login vs signup forms):
 * phone → "Send OTP" → OTP → verify → (name, if a new user) → signed in.
 *
 * Mock only — there's no SMS provider yet, so any phone "receives" an OTP and the
 * fixed `MOCK_OTP` (shown in the demo hint) verifies. Known numbers (see
 * mock-data/users.ts) sign straight in; unknown numbers are treated as new and
 * asked for a name. The resend cooldown is a cosmetic countdown for this version.
 */

type Step = "phone" | "otp" | "name";

const VALUE_PROPS = [
  { icon: PackageCheck, text: "Track your orders" },
  { icon: MapPin, text: "Save addresses" },
  { icon: Zap, text: "Check out faster" },
];

export default function LoginPage() {
  const auth = useAuth();
  const router = useRouter();

  const [step, setStep] = React.useState<Step>("phone");
  const [phone, setPhone] = React.useState("");
  const [otp, setOtp] = React.useState("");
  const [name, setName] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [cooldown, setCooldown] = React.useState(0);

  // Cosmetic resend countdown — ticks down to 0 while on the OTP step.
  React.useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  function sendOtp() {
    if (!isValidPhone(phone)) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }
    setError(null);
    setOtp("");
    setStep("otp");
    setCooldown(OTP_RESEND_SECONDS);
  }

  function verifyOtp() {
    if (!isValidOtp(otp)) {
      setError(`Incorrect OTP. In demo mode, use ${MOCK_OTP}.`);
      return;
    }
    setError(null);
    const existing = findUserByPhone(phone);
    if (existing) {
      auth.login(existing);
      router.push("/account/orders");
      return;
    }
    // Unknown number → new (mock) user: collect a name before finishing.
    setStep("name");
  }

  function finishSignup() {
    if (!name.trim()) {
      setError("Enter your name to continue.");
      return;
    }
    setError(null);
    auth.login(makeNewUser(phone, name));
    router.push("/account/profile");
  }

  // Already signed in — offer the account links rather than the form again.
  if (auth.hydrated && auth.isLoggedIn) {
    return (
      <Shell>
        <Reveal className="rounded-lg border border-keyline bg-card px-6 py-12 text-center">
          <p className="font-heading text-lg text-text-primary">
            You&apos;re signed in
          </p>
          <p className="mt-2 font-body text-sm text-text-secondary">
            Signed in as{" "}
            <span className="font-medium text-text-primary">{auth.user?.name}</span>.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Button size="lg" className="rounded-sm" render={<Link href="/account/orders" />}>
              My Orders
              <ArrowRight />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="rounded-sm"
              render={<Link href="/account/profile" />}
            >
              My Profile
            </Button>
          </div>
        </Reveal>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="mx-auto max-w-md">
        {/* Value proposition */}
        <Reveal className="mb-6 rounded-lg border border-keyline bg-surface-warm p-5">
          <p className="font-body text-sm font-medium text-text-primary">
            Sign in to track orders, save addresses, and check out faster.
          </p>
          <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
            {VALUE_PROPS.map(({ icon: Icon, text }) => (
              <li
                key={text}
                className="flex items-center gap-1.5 font-body text-xs text-text-secondary"
              >
                <Icon className="size-3.5 text-accent" aria-hidden />
                {text}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal className="rounded-lg border border-keyline bg-card p-6">
          {step === "phone" ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendOtp();
              }}
              noValidate
            >
              <label htmlFor="phone" className="font-body text-sm text-text-primary">
                Mobile number
              </label>
              <div className="mt-1 flex items-stretch gap-2">
                <span className="inline-flex items-center rounded-md border border-keyline bg-surface-alt px-3 font-body text-sm text-text-secondary">
                  +91
                </span>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  autoFocus
                  placeholder="10-digit mobile"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-10 w-full rounded-md border border-keyline bg-background px-3 font-body text-sm text-text-primary placeholder:text-text-secondary focus-visible:border-ring focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              </div>
              {error ? <ErrorText>{error}</ErrorText> : null}
              <Button type="submit" size="lg" className="mt-4 w-full rounded-sm" nativeButton>
                Send OTP
                <ArrowRight />
              </Button>
            </form>
          ) : null}

          {step === "otp" ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                verifyOtp();
              }}
              noValidate
            >
              {/* Demo "toast" — inline, since there's no SMS provider yet. */}
              <div className="mb-4 flex gap-2 rounded-md border border-keyline bg-surface-warm p-3">
                <Info className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
                <p className="font-body text-xs leading-relaxed text-text-secondary">
                  OTP sent to{" "}
                  <span className="font-medium text-text-primary">
                    +91 {normalisePhone(phone)}
                  </span>{" "}
                  <span className="italic">(demo mode — use {MOCK_OTP})</span>.
                </p>
              </div>

              <label htmlFor="otp" className="font-body text-sm text-text-primary">
                Enter OTP
              </label>
              <input
                id="otp"
                name="otp"
                inputMode="numeric"
                autoComplete="one-time-code"
                autoFocus
                maxLength={6}
                placeholder="••••••"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                className="mt-1 h-12 w-full rounded-md border border-keyline bg-background px-3 text-center font-body text-lg tracking-[0.5em] text-text-primary placeholder:tracking-[0.3em] placeholder:text-text-secondary focus-visible:border-ring focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              />
              {error ? <ErrorText>{error}</ErrorText> : null}

              <Button type="submit" size="lg" className="mt-4 w-full rounded-sm" nativeButton>
                Verify &amp; Continue
                <ArrowRight />
              </Button>

              <div className="mt-4 flex items-center justify-between font-body text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setStep("phone");
                    setError(null);
                  }}
                  className="text-text-secondary underline-offset-4 hover:text-text-primary hover:underline"
                >
                  Change number
                </button>
                {cooldown > 0 ? (
                  <span className="tabular-nums text-text-secondary">
                    Resend OTP in 0:{String(cooldown).padStart(2, "0")}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={sendOtp}
                    className="font-medium text-accent underline-offset-4 hover:underline"
                  >
                    Resend OTP
                  </button>
                )}
              </div>
            </form>
          ) : null}

          {step === "name" ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                finishSignup();
              }}
              noValidate
            >
              <div className="mb-4 flex items-center gap-2 font-body text-sm text-accent">
                <Check className="size-4" aria-hidden />
                Verified
              </div>
              <label htmlFor="name" className="font-body text-sm text-text-primary">
                What&apos;s your name?
              </label>
              <p className="mt-0.5 font-body text-xs text-text-secondary">
                Almost there — tell us what to call you.
              </p>
              <input
                id="name"
                name="name"
                autoComplete="name"
                autoFocus
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2 h-10 w-full rounded-md border border-keyline bg-background px-3 font-body text-sm text-text-primary placeholder:text-text-secondary focus-visible:border-ring focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              />
              {error ? <ErrorText>{error}</ErrorText> : null}
              <Button type="submit" size="lg" className="mt-4 w-full rounded-sm" nativeButton>
                Create account &amp; continue
                <ArrowRight />
              </Button>
            </form>
          ) : null}
        </Reveal>

        <p className="mt-4 text-center font-body text-xs text-text-secondary">
          We&apos;ll only use your number to sign you in and send order updates.
        </p>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex-1 py-10 sm:py-12">
      <div className="mx-auto w-full max-w-6xl px-6">
        <SectionHeading as="h1" eyebrow="Account" align="center" className="mb-8 items-center">
          Sign in or create an account
        </SectionHeading>
        {children}
      </div>
    </main>
  );
}

function ErrorText({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-2 font-body text-xs text-destructive" role="alert">
      {children}
    </p>
  );
}
