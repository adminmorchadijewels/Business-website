"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Info } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  type Address,
  type AddressType,
  EMPTY_ADDRESS,
  validateAddress,
} from "@/lib/checkout";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { useCart } from "@/components/cart/cart-context";
import { useCheckout } from "@/components/checkout/checkout-context";
import { OrderSummary } from "@/components/checkout/order-summary";
import { CheckoutSteps } from "@/components/checkout/checkout-steps";

/**
 * /checkout/address — guest checkout (the default; no forced login). Captures
 * the delivery address, validates client-side, and carries it into
 * CheckoutContext for the Payment page. Pincode → City/State auto-fill is out of
 * scope for v1 (manual text inputs). Mock data only.
 */
export default function AddressPage() {
  const cart = useCart();
  const checkout = useCheckout();
  const router = useRouter();

  const [values, setValues] = React.useState<Address>(EMPTY_ADDRESS);
  const [touched, setTouched] = React.useState<Partial<Record<keyof Address, boolean>>>({});
  const [submitted, setSubmitted] = React.useState(false);

  // Prefill once from a previously-entered address (e.g. returning from Payment).
  const prefilled = React.useRef(false);
  React.useEffect(() => {
    if (!checkout.hydrated || prefilled.current) return;
    prefilled.current = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time prefill after hydration
    if (checkout.address) setValues(checkout.address);
  }, [checkout.hydrated, checkout.address]);

  const errors = validateAddress(values);
  const valid = Object.keys(errors).length === 0;
  const showError = (field: keyof Address) =>
    (touched[field] || submitted) && errors[field] ? errors[field] : undefined;

  function set<K extends keyof Address>(field: K, value: Address[K]) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }
  function blur(field: keyof Address) {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    if (!valid) return;
    checkout.setAddress(values);
    router.push("/checkout/payment");
  }

  if (!cart.hydrated || !checkout.hydrated) {
    return <main className="flex-1 py-10 sm:py-12" aria-busy />;
  }

  // "Can this order proceed?" is the SAME predicate the cart's checkout button
  // and the Payment page guard use: are there any AVAILABLE (active) lines?
  const empty = cart.activeLines.length === 0;
  // Distinguish a truly-empty cart from one where every item became unavailable,
  // so the latter gets clear messaging (and points back to the cart, not /shop).
  const allUnavailable = empty && cart.lines.length > 0;

  return (
    <main className="flex-1 py-10 sm:py-12">
      <div className="mx-auto w-full max-w-6xl px-6">
        <CheckoutSteps current="address" />
        <SectionHeading as="h1" eyebrow="Checkout" className="mt-6 mb-8">
          Delivery address
        </SectionHeading>

        {empty ? (
          <Reveal className="rounded-lg border border-keyline bg-card px-6 py-16 text-center">
            <p className="font-heading text-lg text-text-primary">
              {allUnavailable ? "All items are unavailable" : "Your cart is empty"}
            </p>
            <p className="mt-2 font-body text-sm text-text-secondary">
              {allUnavailable
                ? "Every item in your cart became unavailable. Head back to your cart to update it before checking out."
                : "Add something before checking out."}
            </p>
            <Button
              variant="outline"
              size="lg"
              className="mt-6 rounded-sm"
              render={<Link href={allUnavailable ? "/cart" : "/shop"} />}
            >
              {allUnavailable ? "Back to Cart" : "Continue Shopping"}
              <ArrowRight />
            </Button>
          </Reveal>
        ) : (
          <div className="lg:flex lg:items-start lg:gap-10">
            {/* Address form */}
            <Reveal className="min-w-0 lg:flex-1">
              <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
                <Field
                  label="Full name"
                  name="fullName"
                  value={values.fullName}
                  onChange={(v) => set("fullName", v)}
                  onBlur={() => blur("fullName")}
                  error={showError("fullName")}
                  required
                  autoComplete="name"
                />

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field
                    label="Phone number"
                    name="phone"
                    type="tel"
                    inputMode="tel"
                    placeholder="10-digit mobile"
                    value={values.phone}
                    onChange={(v) => set("phone", v)}
                    onBlur={() => blur("phone")}
                    error={showError("phone")}
                    required
                    autoComplete="tel"
                  />
                  <Field
                    label="Email"
                    name="email"
                    type="email"
                    inputMode="email"
                    placeholder="you@email.com"
                    value={values.email}
                    onChange={(v) => set("email", v)}
                    onBlur={() => blur("email")}
                    error={showError("email")}
                    required
                    autoComplete="email"
                  />
                </div>

                <Field
                  label="Address line 1"
                  name="line1"
                  value={values.line1}
                  onChange={(v) => set("line1", v)}
                  onBlur={() => blur("line1")}
                  error={showError("line1")}
                  required
                  autoComplete="address-line1"
                />
                <Field
                  label="Address line 2"
                  name="line2"
                  optional
                  value={values.line2}
                  onChange={(v) => set("line2", v)}
                  autoComplete="address-line2"
                />
                <Field
                  label="Landmark"
                  name="landmark"
                  optional
                  value={values.landmark}
                  onChange={(v) => set("landmark", v)}
                />

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field
                    label="City"
                    name="city"
                    value={values.city}
                    onChange={(v) => set("city", v)}
                    onBlur={() => blur("city")}
                    error={showError("city")}
                    required
                    autoComplete="address-level2"
                  />
                  <Field
                    label="State"
                    name="state"
                    value={values.state}
                    onChange={(v) => set("state", v)}
                    onBlur={() => blur("state")}
                    error={showError("state")}
                    required
                    autoComplete="address-level1"
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field
                    label="Pincode"
                    name="pincode"
                    inputMode="numeric"
                    placeholder="6-digit PIN"
                    value={values.pincode}
                    onChange={(v) => set("pincode", v)}
                    onBlur={() => blur("pincode")}
                    error={showError("pincode")}
                    required
                    autoComplete="postal-code"
                  />
                  {/* Address type — optional label */}
                  <div>
                    <span className="font-body text-sm text-text-primary">
                      Address type{" "}
                      <span className="text-text-secondary">(optional)</span>
                    </span>
                    <div className="mt-1 flex gap-2">
                      {(["Home", "Work", "Other"] as const).map((t) => {
                        const selected = values.addressType === t;
                        return (
                          <button
                            key={t}
                            type="button"
                            aria-pressed={selected}
                            onClick={() =>
                              set("addressType", (selected ? "" : t) as AddressType)
                            }
                            className={cn(
                              "rounded-sm border px-3 py-2 font-body text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                              selected
                                ? "border-accent bg-accent text-on-accent"
                                : "border-keyline text-text-primary hover:border-accent/50",
                            )}
                          >
                            {t}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* COD note — payment becomes relevant on the next step. Honest
                    + non-committal copy (real coverage TBD with the business). */}
                <div className="flex gap-3 rounded-md border border-keyline bg-surface-warm p-4">
                  <Info className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
                  <p className="font-body text-sm text-text-secondary">
                    Cash on Delivery available in most locations. We&apos;ll
                    confirm via call/WhatsApp if there&apos;s an issue with your
                    area. Choose your payment method on the next step.
                  </p>
                </div>

                {/* Optional account creation — never gates the form (guest default). */}
                <label className="group/cb flex cursor-pointer items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={values.createAccount}
                    onChange={(e) => set("createAccount", e.target.checked)}
                    className="peer sr-only"
                  />
                  <span
                    className={cn(
                      "grid size-4 shrink-0 place-items-center rounded-sm border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-ring/50",
                      values.createAccount
                        ? "border-accent bg-accent text-on-accent"
                        : "border-keyline bg-card group-hover/cb:border-accent/50",
                    )}
                  >
                    {values.createAccount ? <Check className="size-3" /> : null}
                  </span>
                  <span className="font-body text-sm text-text-primary">
                    Create an account for faster checkout next time
                  </span>
                </label>

                {/* Continue — disabled until required fields are valid */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <Link
                    href="/cart"
                    className="font-body text-sm text-text-secondary underline-offset-4 hover:text-text-primary hover:underline"
                  >
                    ← Back to cart
                  </Link>
                  <Button
                    type="submit"
                    size="lg"
                    className="rounded-sm sm:w-auto"
                    disabled={!valid}
                    nativeButton
                  >
                    Continue to Payment
                    <ArrowRight />
                  </Button>
                </div>
              </form>
            </Reveal>

            {/* Order summary */}
            <Reveal className="mt-8 lg:mt-0 lg:w-80 lg:shrink-0">
              <div className="lg:sticky lg:top-24">
                <OrderSummary />
              </div>
            </Reveal>
          </div>
        )}
      </div>
    </main>
  );
}

interface FieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  required?: boolean;
  optional?: boolean;
  type?: string;
  placeholder?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  autoComplete?: string;
}

function Field({
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
  required,
  optional,
  type = "text",
  placeholder,
  inputMode,
  autoComplete,
}: FieldProps) {
  return (
    <div>
      <label
        htmlFor={name}
        className="font-body text-sm text-text-primary"
      >
        {label}
        {required ? <span className="text-accent"> *</span> : null}
        {optional ? <span className="text-text-secondary"> (optional)</span> : null}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        inputMode={inputMode}
        placeholder={placeholder}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
        className={cn(
          "mt-1 h-10 w-full rounded-md border bg-card px-3 font-body text-sm text-text-primary placeholder:text-text-secondary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
          error
            ? "border-destructive focus-visible:border-destructive"
            : "border-keyline focus-visible:border-ring",
        )}
      />
      {error ? (
        <p id={`${name}-error`} className="mt-1 font-body text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
