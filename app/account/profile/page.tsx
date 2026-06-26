"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  Lock,
  LogOut,
  MapPin,
  Pencil,
  Plus,
  Star,
  Trash2,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { isValidPhone, normalisePhone, type SavedAddress } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/ui/reveal";
import { useAuth } from "@/components/auth/auth-context";
import { AccountShell } from "@/components/account/account-shell";

/**
 * /account/profile — the signed-in mock user's details + saved addresses.
 * Name and email are editable; the phone is read-only (it's the OTP-auth
 * identity). Addresses support add / edit / delete with a single default marker.
 * All mutations go through AuthContext (sessionStorage) — no real persistence yet.
 */
export default function ProfilePage() {
  const auth = useAuth();
  return (
    <AccountShell title="My Profile">
      {auth.user ? <ProfileBody /> : null}
    </AccountShell>
  );
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function ProfileBody() {
  const auth = useAuth();
  const router = useRouter();
  const user = auth.user!; // AccountShell only mounts children when signed in.

  const [name, setName] = React.useState(user.name);
  const [email, setEmail] = React.useState(user.email);
  // `saved` only records that a save happened this session; whether the pill is
  // shown is gated by `!dirty` below — i.e. it tracks the SAVED snapshot (`user`,
  // which updates on save) rather than raw keystrokes. So editing a field and
  // then reverting it to its saved value re-shows the pill, instead of a single
  // keystroke permanently suppressing it.
  const [saved, setSaved] = React.useState(false);

  const emailError =
    email.trim() && !EMAIL_RE.test(email.trim())
      ? "Enter a valid email address."
      : null;
  const dirty = name.trim() !== user.name || email.trim() !== user.email;
  const canSave = dirty && !!name.trim() && !emailError;

  function saveDetails(e: React.FormEvent) {
    e.preventDefault();
    if (!canSave) return;
    auth.updateProfile({ name: name.trim(), email: email.trim() });
    setSaved(true);
  }

  // Address editor: null = closed; { id?: ... } = editing existing / adding new.
  const [editing, setEditing] = React.useState<SavedAddress | "new" | null>(null);

  function logout() {
    auth.logout();
    router.push("/");
  }

  return (
    <div className="flex flex-col gap-10">
      {/* ---- Profile details ------------------------------------------------ */}
      <Reveal>
        <form
          onSubmit={saveDetails}
          className="rounded-lg border border-keyline bg-card p-6"
        >
          <h2 className="font-heading text-base font-semibold text-text-primary">
            Profile details
          </h2>

          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="font-body text-sm text-text-primary">
                Name
              </label>
              <input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 h-10 w-full rounded-md border border-keyline bg-background px-3 font-body text-sm text-text-primary placeholder:text-text-secondary focus-visible:border-ring focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            </div>

            {/* Phone — read-only (tied to OTP auth) */}
            <div>
              <span className="font-body text-sm text-text-primary">Phone</span>
              <div className="mt-1 flex h-10 items-center justify-between rounded-md border border-keyline bg-surface-alt px-3">
                <span className="font-body text-sm text-text-secondary">
                  +91 {user.phone}
                </span>
                <Lock className="size-3.5 text-text-secondary" aria-hidden />
              </div>
              <p className="mt-1 font-body text-xs text-text-secondary">
                Linked to your login — can&apos;t be changed.
              </p>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="email" className="font-body text-sm text-text-primary">
                Email{" "}
                <span className="text-text-secondary">(for order updates)</span>
              </label>
              <input
                id="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={!!emailError}
                className={cn(
                  "mt-1 h-10 w-full rounded-md border bg-background px-3 font-body text-sm text-text-primary placeholder:text-text-secondary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                  emailError
                    ? "border-destructive focus-visible:border-destructive"
                    : "border-keyline focus-visible:border-ring",
                )}
              />
              {emailError ? (
                <p className="mt-1 font-body text-xs text-destructive">{emailError}</p>
              ) : null}
            </div>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <Button
              type="submit"
              size="lg"
              className="rounded-sm"
              disabled={!canSave}
              nativeButton
            >
              Save changes
            </Button>
            {saved && !dirty ? (
              <span className="flex items-center gap-1 font-body text-sm text-accent">
                <Check className="size-4" aria-hidden />
                Saved
              </span>
            ) : null}
          </div>
        </form>
      </Reveal>

      {/* ---- Saved addresses ------------------------------------------------ */}
      <Reveal>
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-heading text-base font-semibold text-text-primary">
            <MapPin className="size-4 text-accent" aria-hidden />
            Saved addresses
          </h2>
          {editing === null ? (
            <Button
              variant="outline"
              size="sm"
              className="rounded-sm"
              onClick={() => setEditing("new")}
              nativeButton
            >
              <Plus />
              Add address
            </Button>
          ) : null}
        </div>

        {editing === "new" ? (
          <AddressForm
            className="mt-4"
            onCancel={() => setEditing(null)}
            onSubmit={(values) => {
              auth.addAddress(values);
              setEditing(null);
            }}
          />
        ) : null}

        <div className="mt-4 flex flex-col gap-4">
          {user.addresses.length === 0 && editing !== "new" ? (
            <div className="rounded-lg border border-dashed border-keyline bg-surface-warm px-6 py-10 text-center">
              <p className="font-body text-sm text-text-secondary">
                No saved addresses yet. Add one for faster checkout.
              </p>
            </div>
          ) : null}

          {user.addresses.map((addr) =>
            editing !== "new" && typeof editing === "object" && editing?.id === addr.id ? (
              <AddressForm
                key={addr.id}
                initial={addr}
                onCancel={() => setEditing(null)}
                onSubmit={(values) => {
                  auth.updateAddress(addr.id, values);
                  setEditing(null);
                }}
              />
            ) : (
              <AddressCard
                key={addr.id}
                address={addr}
                onEdit={() => setEditing(addr)}
                onDelete={() => auth.removeAddress(addr.id)}
                onMakeDefault={() => auth.setDefaultAddress(addr.id)}
              />
            ),
          )}
        </div>
      </Reveal>

      {/* ---- Logout --------------------------------------------------------- */}
      <Reveal className="border-t border-keyline pt-6">
        <Button
          variant="destructive"
          size="lg"
          className="rounded-sm"
          onClick={logout}
          nativeButton
        >
          <LogOut />
          Log out
        </Button>
      </Reveal>
    </div>
  );
}

function AddressCard({
  address,
  onEdit,
  onDelete,
  onMakeDefault,
}: {
  address: SavedAddress;
  onEdit: () => void;
  onDelete: () => void;
  onMakeDefault: () => void;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-card p-5",
        address.isDefault ? "border-accent" : "border-keyline",
      )}
    >
      <div className="flex items-center gap-2">
        {address.label ? (
          <span className="font-body text-sm font-semibold text-text-primary">
            {address.label}
          </span>
        ) : null}
        {address.isDefault ? (
          <Badge variant="soft">
            <Star className="size-3" aria-hidden />
            Default
          </Badge>
        ) : null}
      </div>

      <address className="mt-2 font-body text-sm not-italic leading-relaxed text-text-secondary">
        <span className="font-medium text-text-primary">{address.fullName}</span>
        <br />
        {address.line1}
        {address.line2 ? `, ${address.line2}` : ""}
        <br />
        {address.city}, {address.state} {address.pincode}
        <br />
        +91 {address.phone}
      </address>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {!address.isDefault ? (
          <Button
            variant="ghost"
            size="sm"
            className="rounded-sm"
            onClick={onMakeDefault}
            nativeButton
          >
            <Star />
            Set as default
          </Button>
        ) : null}
        <Button
          variant="ghost"
          size="sm"
          className="rounded-sm"
          onClick={onEdit}
          nativeButton
        >
          <Pencil />
          Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="rounded-sm text-destructive"
          onClick={onDelete}
          nativeButton
        >
          <Trash2 />
          Delete
        </Button>
      </div>
    </div>
  );
}

type AddressDraft = Omit<SavedAddress, "id">;

function AddressForm({
  initial,
  onSubmit,
  onCancel,
  className,
}: {
  initial?: SavedAddress;
  onSubmit: (values: AddressDraft) => void;
  onCancel: () => void;
  className?: string;
}) {
  const [v, setV] = React.useState<AddressDraft>({
    label: initial?.label ?? "",
    fullName: initial?.fullName ?? "",
    phone: initial?.phone ?? "",
    line1: initial?.line1 ?? "",
    line2: initial?.line2 ?? "",
    city: initial?.city ?? "",
    state: initial?.state ?? "",
    pincode: initial?.pincode ?? "",
    isDefault: initial?.isDefault ?? false,
  });
  const [submitted, setSubmitted] = React.useState(false);

  function set<K extends keyof AddressDraft>(key: K, value: AddressDraft[K]) {
    setV((prev) => ({ ...prev, [key]: value }));
  }

  const errors = {
    fullName: !v.fullName.trim() ? "Enter a name." : null,
    phone: !isValidPhone(v.phone) ? "Enter a valid 10-digit mobile." : null,
    line1: !v.line1.trim() ? "Enter the address." : null,
    city: !v.city.trim() ? "Enter the city." : null,
    state: !v.state.trim() ? "Enter the state." : null,
    pincode: !/^[1-9]\d{5}$/.test(v.pincode.trim()) ? "Enter a valid 6-digit pincode." : null,
  };
  const valid = Object.values(errors).every((e) => e === null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    if (!valid) return;
    onSubmit({
      ...v,
      label: v.label.trim(),
      fullName: v.fullName.trim(),
      phone: normalisePhone(v.phone),
      line1: v.line1.trim(),
      line2: v.line2?.trim() || undefined,
      city: v.city.trim(),
      state: v.state.trim(),
      pincode: v.pincode.trim(),
    });
  }

  return (
    <form
      onSubmit={submit}
      noValidate
      className={cn("rounded-lg border border-accent bg-card p-5", className)}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-sm font-semibold text-text-primary">
          {initial ? "Edit address" : "Add a new address"}
        </h3>
        <button
          type="button"
          onClick={onCancel}
          aria-label="Cancel"
          className="rounded-full p-1 text-text-secondary transition-colors hover:bg-surface-alt hover:text-text-primary"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <AddrField label="Label (optional)" value={v.label} onChange={(x) => set("label", x)} placeholder="Home, Work…" />
        <AddrField label="Full name" value={v.fullName} onChange={(x) => set("fullName", x)} error={submitted ? errors.fullName : null} />
        <AddrField label="Phone" value={v.phone} onChange={(x) => set("phone", x)} error={submitted ? errors.phone : null} inputMode="tel" />
        <AddrField label="Pincode" value={v.pincode} onChange={(x) => set("pincode", x)} error={submitted ? errors.pincode : null} inputMode="numeric" />
        <div className="sm:col-span-2">
          <AddrField label="Address line 1" value={v.line1} onChange={(x) => set("line1", x)} error={submitted ? errors.line1 : null} />
        </div>
        <div className="sm:col-span-2">
          <AddrField label="Address line 2 (optional)" value={v.line2 ?? ""} onChange={(x) => set("line2", x)} />
        </div>
        <AddrField label="City" value={v.city} onChange={(x) => set("city", x)} error={submitted ? errors.city : null} />
        <AddrField label="State" value={v.state} onChange={(x) => set("state", x)} error={submitted ? errors.state : null} />
      </div>

      <label className="mt-4 flex cursor-pointer items-center gap-2.5">
        <input
          type="checkbox"
          checked={v.isDefault}
          onChange={(e) => set("isDefault", e.target.checked)}
          className="peer sr-only"
        />
        <span
          className={cn(
            "grid size-4 shrink-0 place-items-center rounded-sm border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-ring/50",
            v.isDefault
              ? "border-accent bg-accent text-on-accent"
              : "border-keyline bg-card",
          )}
        >
          {v.isDefault ? <Check className="size-3" /> : null}
        </span>
        <span className="font-body text-sm text-text-primary">
          Set as default address
        </span>
      </label>

      <div className="mt-5 flex items-center gap-3">
        <Button type="submit" size="lg" className="rounded-sm" nativeButton>
          {initial ? "Save address" : "Add address"}
        </Button>
        <button
          type="button"
          onClick={onCancel}
          className="font-body text-sm text-text-secondary underline-offset-4 hover:text-text-primary hover:underline"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function AddrField({
  label,
  value,
  onChange,
  error,
  placeholder,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
  placeholder?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  const id = React.useId();
  return (
    <div>
      <label htmlFor={id} className="font-body text-sm text-text-primary">
        {label}
      </label>
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        aria-invalid={!!error}
        className={cn(
          "mt-1 h-10 w-full rounded-md border bg-background px-3 font-body text-sm text-text-primary placeholder:text-text-secondary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
          error
            ? "border-destructive focus-visible:border-destructive"
            : "border-keyline focus-visible:border-ring",
        )}
      />
      {error ? (
        <p className="mt-1 font-body text-xs text-destructive">{error}</p>
      ) : null}
    </div>
  );
}
