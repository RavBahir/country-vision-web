// app/portal/profile/DetailsForm.tsx
"use client";

import { Button, Card } from "@/components/portal/UI";
import { FormError } from "@/components/portal/FormFields";
import { useUpdateProfile } from "@/modules/profile/common/profile-api";
import type { IProfile, IProfilePatch } from "@/modules/profile/common/profile";
import { useState, type FormEvent, type ReactNode } from "react";
import { TextField } from "./Fields";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[0-9 ()-]{8,18}$/;

const KEYS = [
  "name", "phone", "address", "city", "country",
  "emergencyContactName", "emergencyContactPhone", "emergencyContactEmail",
] as const;
type Values = Record<(typeof KEYS)[number], string>;

const fromProfile = (p: IProfile): Values =>
  Object.fromEntries(KEYS.map((k) => [k, (p[k] as string | null | undefined) ?? ""])) as Values;

function validate(v: Values): Partial<Values> {
  const e: Partial<Values> = {};
  if (v.name.trim().length < 2) e.name = "Please enter your full name.";
  if (v.phone.trim() && !PHONE_RE.test(v.phone.trim())) e.phone = "Enter a valid phone number, e.g. +233 24 000 0000.";
  if (v.emergencyContactPhone.trim() && !PHONE_RE.test(v.emergencyContactPhone.trim())) e.emergencyContactPhone = "Enter a valid phone number.";
  if (v.emergencyContactEmail.trim() && !EMAIL_RE.test(v.emergencyContactEmail.trim())) e.emergencyContactEmail = "Enter a valid email address.";
  return e;
}

function Section({ title, text, children }: { title: string; text?: string; children: ReactNode }) {
  return (
    <section className="grid gap-5 border-t border-[#E6D9C6] py-7 first:border-t-0 first:pt-0 lg:grid-cols-[220px_1fr]">
      <div>
        <h3 className="font-semibold">{title}</h3>
        {text && <p className="mt-1 text-sm text-[#1F1A15]/55">{text}</p>}
      </div>
      <div className="grid gap-5 sm:grid-cols-2">{children}</div>
    </section>
  );
}

export default function DetailsForm({ profile, onSaved }: { profile: IProfile; onSaved: (m: string) => void }) {
  const isCustomer = profile.kind === "customer";
  const [v, setV] = useState<Values>(() => fromProfile(profile));
  const [showErrors, setShowErrors] = useState(false);
  const save = useUpdateProfile();

  const saved = fromProfile(profile);
  const dirty = JSON.stringify(v) !== JSON.stringify(saved);
  const errors = validate(v);
  const set = (k: keyof Values) => (val: string) => setV((s) => ({ ...s, [k]: val }));
  const err = (k: keyof Values) => (showErrors ? errors[k] : undefined);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setShowErrors(true);
    if (Object.keys(errors).length > 0 || !dirty || save.isPending) return;

    // Send only what this account type can edit; the server enforces the same list
    const keys = isCustomer ? KEYS : (["name", "phone"] as const);
    const body = Object.fromEntries(keys.map((k) => [k, v[k].trim()])) as IProfilePatch;
    save.mutate(body, {
      onSuccess: (p) => { setV(fromProfile(p)); setShowErrors(false); onSaved("Profile saved."); },
    });
  };

  return (
    <Card className="p-6 sm:p-8">
      <form onSubmit={submit} noValidate>
        <Section title="Contact" text="We use these for confirmations and reminders.">
          <div className="sm:col-span-2">
            <TextField label="Full name" value={v.name} onChange={set("name")} error={err("name")} autoComplete="name" />
          </div>
          <TextField label="Email" type="email" value={profile.email} onChange={() => {}} disabled
            hint="Your email is your sign-in. Contact us if it needs to change." />
          <TextField label="Phone" type="tel" inputMode="tel" autoComplete="tel" value={v.phone}
            onChange={set("phone")} error={err("phone")} optional />
        </Section>

        {isCustomer && (
          <>
            <Section title="Address" text="Used for deliveries and your records.">
              <div className="sm:col-span-2">
                <TextField label="Street address" value={v.address} onChange={set("address")} autoComplete="street-address" optional />
              </div>
              <TextField label="City" value={v.city} onChange={set("city")} autoComplete="address-level2" optional />
              <TextField label="Country" value={v.country} onChange={set("country")} autoComplete="country-name" optional />
            </Section>

            <Section title="Emergency contact" text="Only used if we can't reach you during a visit.">
              <div className="sm:col-span-2">
                <TextField label="Contact name" value={v.emergencyContactName} onChange={set("emergencyContactName")} optional />
              </div>
              <TextField label="Contact phone" type="tel" inputMode="tel" value={v.emergencyContactPhone}
                onChange={set("emergencyContactPhone")} error={err("emergencyContactPhone")} optional />
              <TextField label="Contact email" type="email" value={v.emergencyContactEmail}
                onChange={set("emergencyContactEmail")} error={err("emergencyContactEmail")} optional />
            </Section>
          </>
        )}

        <FormError message={save.error?.message} />

        <div className="mt-2 flex flex-wrap items-center justify-end gap-3 border-t border-[#E6D9C6] pt-6">
          {dirty && <p className="mr-auto text-sm text-[#8A5A12]">You have unsaved changes.</p>}
          <Button variant="secondary" disabled={!dirty || save.isPending}
            onClick={() => { setV(saved); setShowErrors(false); save.reset(); }}>
            Discard
          </Button>
          <Button type="submit" disabled={!dirty || save.isPending}>
            {save.isPending ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </form>
    </Card>
  );
}