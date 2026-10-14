"use client";

import { useRef, useState, type FormEvent, type ReactNode } from "react";
import { BadgeCheck, Camera, Trash2 } from "lucide-react";
import { Badge, Button, Card } from "@/components/portal/UI";
import { SelectField, TextAreaField, TextField } from "./Fields";
import type { Gender, ProfileData } from "@/lib/portal-data";
import { toISO, TODAY } from "@/lib/format";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[0-9 ()-]{8,18}$/;

type Errors = Partial<Record<keyof ProfileData, string>>;

function validate(f: ProfileData): Errors {
  const e: Errors = {};
  if (!f.name.trim()) e.name = "Please enter your full name.";
  if (!f.email.trim() && !f.phone.trim()) { e.email = "Add an email or a phone number so we can reach you."; e.phone = e.email; }
  if (f.email.trim() && !EMAIL_RE.test(f.email.trim())) e.email = "Enter a valid email address.";
  if (f.phone.trim() && !PHONE_RE.test(f.phone.trim())) e.phone = "Enter a valid phone number, e.g. +234 800 000 0000.";
  if (f.emergencyContactPhone.trim() && !PHONE_RE.test(f.emergencyContactPhone.trim())) e.emergencyContactPhone = "Enter a valid phone number.";
  if (f.dateOfBirth && f.dateOfBirth > toISO(TODAY)) e.dateOfBirth = "Date of birth can't be in the future.";
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

export default function DetailsForm({
  saved, avatarUrl, onAvatarChange, onSave,
}: { saved: ProfileData; avatarUrl: string | null; onAvatarChange: (url: string | null) => void; onSave: (p: ProfileData) => void }) {
  const [form, setForm] = useState<ProfileData>(saved);
  const [showErrors, setShowErrors] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof ProfileData>(k: K) => (v: ProfileData[K]) => setForm((f: any) => ({ ...f, [k]: v }));
  const errors = validate(form);
  const err = (k: keyof ProfileData) => (showErrors ? errors[k] : undefined);
  const dirty = JSON.stringify(form) !== JSON.stringify(saved);
  const initials = form.name.split(" ").filter(Boolean).slice(0, 2).map((p: any) => p[0]).join("").toUpperCase() || "?";

  const emailChanged = form.email.trim().toLowerCase() !== saved.email.toLowerCase();
  const phoneChanged = form.phone.replace(/\s/g, "") !== saved.phone.replace(/\s/g, "");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setShowErrors(true);
    if (Object.keys(errors).length > 0) return;
    onSave({ ...form, name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim() });
    setShowErrors(false);
  };

  const pickPhoto = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return setPhotoError("Please choose an image file.");
    if (file.size > 2 * 1024 * 1024) return setPhotoError("Photo must be under 2 MB.");
    setPhotoError(null);
    if (avatarUrl?.startsWith("blob:")) URL.revokeObjectURL(avatarUrl);
    // Demo: previews locally. Upload to Cloudinary here and save the returned URL.
    onAvatarChange(URL.createObjectURL(file));
  };

  return (
    <Card className="p-6 sm:p-8">
      <form onSubmit={submit} noValidate>
        {/* photo */}
        <Section title="Photo" text="Shown on your portal and receipts.">
          <div className="flex items-center gap-5 sm:col-span-2">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="Your profile photo" className="h-20 w-20 rounded-full object-cover" />
            ) : (
              <span className="grid h-20 w-20 place-items-center rounded-full bg-[#1F1A15] text-2xl font-semibold text-white" aria-hidden>{initials}</span>
            )}
            <div>
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" className="px-4 py-2" onClick={() => fileRef.current?.click()}><Camera size={15} /> {avatarUrl ? "Change photo" : "Upload photo"}</Button>
                {avatarUrl && <Button variant="secondary" className="px-4 py-2" onClick={() => { onAvatarChange(null); setPhotoError(null); }}><Trash2 size={15} /> Remove</Button>}
              </div>
              <p className={`mt-2 text-xs ${photoError ? "text-[#8E3524]" : "text-[#1F1A15]/50"}`} role={photoError ? "alert" : undefined}>{photoError ?? "JPG or PNG, up to 2 MB."}</p>
              <input ref={fileRef} type="file" accept="image/*" className="sr-only" aria-label="Choose profile photo" onChange={(e) => { pickPhoto(e.target.files?.[0]); e.target.value = ""; }} />
            </div>
          </div>
        </Section>

        <Section title="Contact" text="We use these for confirmations, reminders and sign-in codes.">
          <div className="sm:col-span-2"><TextField label="Full name" value={form.name} onChange={set("name")} error={err("name")} autoComplete="name" /></div>
          <TextField
            label="Email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={set("email")}
            error={err("email")}
            hint={emailChanged ? "We'll send a verification link to this address when you save." : undefined}
            trailing={form.email && !emailChanged && saved.emailVerified ? <Badge tone="success"><BadgeCheck size={12} className="mr-1" /> Verified</Badge> : form.email ? <Badge tone="warn">Unverified</Badge> : undefined}
          />
          <TextField
            label="Phone (WhatsApp)"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={form.phone}
            onChange={set("phone")}
            error={err("phone")}
            hint={phoneChanged ? "We'll send a WhatsApp code to confirm this number." : "Used for WhatsApp sign-in codes and reminders."}
            trailing={form.phone && !phoneChanged && saved.phoneVerified ? <Badge tone="success"><BadgeCheck size={12} className="mr-1" /> Verified</Badge> : form.phone ? <Badge tone="warn">Unverified</Badge> : undefined}
          />
        </Section>

        <Section title="Personal" text="Helps your optometrist prepare for your visit.">
          <TextField label="Date of birth" type="date" max={toISO(TODAY)} value={form.dateOfBirth} onChange={set("dateOfBirth")} error={err("dateOfBirth")} autoComplete="bday" />
          <SelectField label="Gender" value={form.gender} onChange={(v) => set("gender")(v as Gender)}>
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="other">Other</option>
            <option value="undisclosed">Prefer not to say</option>
          </SelectField>
          <TextField label="Address" value={form.address} onChange={set("address")} autoComplete="street-address" optional />
          <TextField label="City" value={form.city} onChange={set("city")} autoComplete="address-level2" optional />
        </Section>

        <Section title="Emergency contact" text="Only used if we can't reach you during a visit.">
          <TextField label="Contact name" value={form.emergencyContactName} onChange={set("emergencyContactName")} optional />
          <TextField label="Contact phone" type="tel" inputMode="tel" value={form.emergencyContactPhone} onChange={set("emergencyContactPhone")} error={err("emergencyContactPhone")} optional />
        </Section>

        <Section title="Health notes" text="Shared with your clinician. Keep it brief.">
          <div className="sm:col-span-2">
            <TextAreaField label="Allergies, conditions or medication" rows={4} maxLength={600} value={form.medicalHistory} onChange={set("medicalHistory")} optional />
          </div>
        </Section>

        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-[#E6D9C6] pt-6">
          {dirty && <p className="mr-auto text-sm text-[#8A5A12]">You have unsaved changes.</p>}
          <Button variant="secondary" disabled={!dirty} onClick={() => { setForm(saved); setShowErrors(false); }}>Discard</Button>
          <Button type="submit" disabled={!dirty}>Save changes</Button>
        </div>
      </form>
    </Card>
  );
}