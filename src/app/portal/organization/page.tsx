// app/portal/organization/page.tsx
"use client";

import { Badge, Button, Card, EmptyState, PageHeader, Toast } from "@/components/portal/UI";
import { FormError, FormSection, SelectField, TextAreaField, TextField } from "@/components/portal/FormFields";
import { fmtDate } from "@/lib/format";
import { usePerms } from "@/lib/use-perms";
import { useOrganization, useUpdateOrganization } from "@/modules/organization/common/organization-api";
import type { Currency, IOrganization, IOrgPatch } from "@/modules/organization/common/organization";
import { AlertTriangle, Building2, Camera, Lock, Trash2 } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[0-9 ()-]{8,18}$/;

const DAYS: [key: "0" | "1" | "2" | "3" | "4" | "5" | "6", label: string][] = [
  ["1", "Monday"], ["2", "Tuesday"], ["3", "Wednesday"], ["4", "Thursday"],
  ["5", "Friday"], ["6", "Saturday"], ["0", "Sunday"],
];
const ZONES = ["Africa/Accra", "Africa/Lagos", "Africa/Nairobi", "Europe/London", "UTC"];
const CURRENCIES: Currency[] = ["GHS", "USD", "NGN", "EUR", "GBP"];
const SLOTS = [15, 20, 30, 45, 60];

type Hours = Record<string, { open: boolean; from: string; to: string }>;
interface Values {
  name: string; phone: string; email: string; address: string;
  timezone: string; currency: Currency; hours: Hours;
  slotMinutes: string; minLeadMinutes: string; cancelHours: string;
  maxOpen: string; rxMonths: string; notifyEmail: string;
}

const toValues = (o: IOrganization): Values => ({
  name: o.name, phone: o.phone ?? "", email: o.email ?? "", address: o.address ?? "",
  timezone: o.settings.timezone, currency: o.settings.currency,
  hours: Object.fromEntries(
    DAYS.map(([k]) => {
      const h = o.settings.hours[k];
      return [k, { open: !!h, from: h?.open ?? "09:00", to: h?.close ?? "17:00" }];
    }),
  ),
  slotMinutes: String(o.settings.slotMinutes),
  minLeadMinutes: String(o.settings.minLeadMinutes),
  cancelHours: String(o.settings.customerCancelCutoffHours),
  maxOpen: String(o.settings.maxOpenPerCustomer),
  rxMonths: String(o.settings.prescriptionValidityMonths),
  notifyEmail: o.settings.notifyEmail ?? "",
});

const intIn = (v: string, min: number, max: number) => /^\d+$/.test(v) && +v >= min && +v <= max;

function validate(v: Values) {
  const e: Record<string, string> = {};
  if (v.name.trim().length < 2) e.name = "Enter the organization name.";
  if (v.email.trim() && !EMAIL_RE.test(v.email.trim())) e.email = "Enter a valid email.";
  if (v.phone.trim() && !PHONE_RE.test(v.phone.trim())) e.phone = "Enter a valid phone number.";
  if (v.notifyEmail.trim() && !EMAIL_RE.test(v.notifyEmail.trim())) e.notifyEmail = "Enter a valid email.";
  for (const [k, label] of DAYS) {
    const h = v.hours[k];
    if (h.open && h.to <= h.from) e[`h${k}`] = `${label}: closing must be after opening.`;
  }
  if (!intIn(v.minLeadMinutes, 0, 1440)) e.minLeadMinutes = "Enter 0 to 1440 minutes.";
  if (!intIn(v.cancelHours, 0, 168)) e.cancelHours = "Enter 0 to 168 hours.";
  if (!intIn(v.maxOpen, 1, 20)) e.maxOpen = "Enter 1 to 20.";
  if (!intIn(v.rxMonths, 1, 60)) e.rxMonths = "Enter 1 to 60 months.";
  return e;
}

function OrgForm({ org, canEdit, onSaved }: { org: IOrganization; canEdit: boolean; onSaved: (m: string) => void }) {
  const initial = toValues(org);
  const [v, setV] = useState<Values>(initial);
  const [logo, setLogo] = useState<string | null | undefined>(undefined); // undefined = unchanged
  const [logoError, setLogoError] = useState<string | null>(null);
  const [showErrors, setShowErrors] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const save = useUpdateOrganization();

  const shownLogo = logo === undefined ? org.logoUrl : logo;
  const dirty = JSON.stringify(v) !== JSON.stringify(initial) || logo !== undefined;
  const errors = validate(v);
  const err = (k: string) => (showErrors ? errors[k] : undefined);
  const set = <K extends keyof Values>(k: K) => (val: Values[K]) => setV((s) => ({ ...s, [k]: val }));
  const setDay = (k: string, patch: Partial<Hours[string]>) =>
    setV((s) => ({ ...s, hours: { ...s.hours, [k]: { ...s.hours[k], ...patch } } }));

  const pickLogo = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return setLogoError("Please choose an image file.");
    if (file.size > 2 * 1024 * 1024) return setLogoError("Logo must be under 2 MB.");
    setLogoError(null);
    const r = new FileReader();
    r.onload = () => setLogo(String(r.result));
    r.readAsDataURL(file);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setShowErrors(true);
    if (!canEdit || Object.keys(errors).length || !dirty || save.isPending) return;

    const body: IOrgPatch = {
      name: v.name.trim(),
      phone: v.phone.trim() || null,
      email: v.email.trim() || null,
      address: v.address.trim() || null,
      ...(logo !== undefined ? { logo } : {}),
      settings: {
        timezone: v.timezone,
        currency: v.currency,
        hours: Object.fromEntries(
          DAYS.map(([k]) => [k, v.hours[k].open ? { open: v.hours[k].from, close: v.hours[k].to } : null]),
        ) as NonNullable<IOrgPatch["settings"]>["hours"],
        slotMinutes: +v.slotMinutes,
        minLeadMinutes: +v.minLeadMinutes,
        customerCancelCutoffHours: +v.cancelHours,
        maxOpenPerCustomer: +v.maxOpen,
        prescriptionValidityMonths: +v.rxMonths,
        notifyEmail: v.notifyEmail.trim() || null,
      },
    };
    save.mutate(body, { onSuccess: () => { setLogo(undefined); setShowErrors(false); onSaved("Organization saved."); } });
  };

  const hourErrors = DAYS.map(([k]) => err(`h${k}`)).filter(Boolean);
  const time = "h-11 rounded-xl border border-[#1F1A15]/10 bg-[#F6EFE4] px-3 text-sm outline-none focus:border-[#8A6A4A] focus:bg-white disabled:opacity-50";

  return (
    <form onSubmit={submit} noValidate className="space-y-6">
      <fieldset disabled={!canEdit} className="m-0 min-w-0 space-y-6 border-0 p-0">
        <Card className="space-y-7 p-6 sm:p-8">
          <FormSection title="Branding">
            <div className="flex items-center gap-5">
              {shownLogo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={shownLogo} alt="Organization logo" className="h-20 w-20 rounded-2xl border border-[#E6D9C6] bg-white object-contain p-1" />
              ) : (
                <span className="grid h-20 w-20 place-items-center rounded-2xl bg-[#F1E7D8] text-[#8A6A4A]" aria-hidden><Building2 size={28} /></span>
              )}
              <div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" className="px-4 py-2" disabled={!canEdit} onClick={() => fileRef.current?.click()}>
                    <Camera size={15} /> {shownLogo ? "Change logo" : "Upload logo"}
                  </Button>
                  {shownLogo && (
                    <Button variant="secondary" className="px-4 py-2" disabled={!canEdit} onClick={() => setLogo(null)}>
                      <Trash2 size={15} /> Remove
                    </Button>
                  )}
                </div>
                <p className={`mt-2 text-xs ${logoError ? "text-[#8E3524]" : "text-[#1F1A15]/50"}`} role={logoError ? "alert" : undefined}>
                  {logoError ?? "PNG, JPG or SVG, up to 2 MB. Replaces the app logo in the sidebar."}
                </p>
                <input ref={fileRef} type="file" accept="image/*" className="sr-only" aria-label="Choose logo"
                  onChange={(e) => { pickLogo(e.target.files?.[0]); e.target.value = ""; }} />
              </div>
            </div>
          </FormSection>

          <FormSection title="Company details">
            <TextField label="Organization name" value={v.name} onChange={set("name")} error={err("name")} required />
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField label="Phone" type="tel" value={v.phone} onChange={set("phone")} error={err("phone")} optional />
              <TextField label="Email" type="email" value={v.email} onChange={set("email")} error={err("email")} optional />
            </div>
            <TextAreaField label="Address" value={v.address} onChange={set("address")} rows={2} optional />
            <div className="grid gap-4 sm:grid-cols-2">
              <SelectField label="Time zone" value={v.timezone} onChange={set("timezone")}
                options={[...new Set([v.timezone, ...ZONES])].map((z) => ({ value: z, label: z }))} />
              <SelectField label="Currency" value={v.currency} onChange={(x) => set("currency")(x as Currency)}
                options={CURRENCIES.map((c) => ({ value: c, label: c }))} />
            </div>
          </FormSection>
        </Card>

        <Card className="space-y-4 p-6 sm:p-8">
          <FormSection title="Opening hours">
            <ul className="divide-y divide-[#E6D9C6]">
              {DAYS.map(([k, label]) => {
                const h = v.hours[k];
                return (
                  <li key={k} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3 first:pt-0 last:pb-0">
                    <label className="flex w-40 cursor-pointer items-center gap-3 text-sm font-medium">
                      <input type="checkbox" checked={h.open} onChange={(e) => setDay(k, { open: e.target.checked })}
                        className="h-4 w-4 accent-[#1F1A15]" />
                      {label}
                    </label>
                    {h.open ? (
                      <div className="flex items-center gap-2 text-sm">
                        <input type="time" aria-label={`${label} opens`} value={h.from} onChange={(e) => setDay(k, { from: e.target.value })} className={time} />
                        <span className="text-[#1F1A15]/50">to</span>
                        <input type="time" aria-label={`${label} closes`} value={h.to} onChange={(e) => setDay(k, { to: e.target.value })} className={time} />
                      </div>
                    ) : (
                      <span className="text-sm text-[#1F1A15]/50">Closed</span>
                    )}
                  </li>
                );
              })}
            </ul>
            {hourErrors.map((m) => <p key={m} role="alert" className="text-sm text-[#8E3524]">{m}</p>)}
          </FormSection>
        </Card>

        <Card className="space-y-7 p-6 sm:p-8">
          <FormSection title="Appointments">
            <div className="grid gap-4 sm:grid-cols-2">
              <SelectField label="Appointment length" value={v.slotMinutes} onChange={set("slotMinutes")}
                options={SLOTS.map((m) => ({ value: String(m), label: `${m} minutes` }))} />
              <TextField label="Minimum notice (minutes)" type="number" value={v.minLeadMinutes} onChange={set("minLeadMinutes")}
                error={err("minLeadMinutes")} hint="How far ahead a booking must be made." />
              <TextField label="Customer change window (hours)" type="number" value={v.cancelHours} onChange={set("cancelHours")}
                error={err("cancelHours")} hint="Customers can't reschedule or cancel inside this window." />
              <TextField label="Open bookings per customer" type="number" value={v.maxOpen} onChange={set("maxOpen")}
                error={err("maxOpen")} />
              <TextField label="Prescription validity (months)" type="number" value={v.rxMonths} onChange={set("rxMonths")}
                error={err("rxMonths")} hint="Default expiry for new prescriptions." />
            </div>
          </FormSection>

          <FormSection title="Notifications">
            <TextField label="Enquiry notification email" type="email" value={v.notifyEmail} onChange={set("notifyEmail")}
              error={err("notifyEmail")} hint="New website enquiries are emailed here. Leave blank to use the server default." optional />
          </FormSection>
        </Card>
      </fieldset>

      <FormError message={save.error?.message} />

      {canEdit ? (
        <div className="flex flex-wrap items-center justify-end gap-3">
          {dirty && <p className="mr-auto text-sm text-[#8A5A12]">You have unsaved changes.</p>}
          <Button variant="secondary" disabled={!dirty || save.isPending}
            onClick={() => { setV(initial); setLogo(undefined); setShowErrors(false); save.reset(); }}>
            Discard
          </Button>
          <Button type="submit" disabled={!dirty || save.isPending}>{save.isPending ? "Saving…" : "Save changes"}</Button>
        </div>
      ) : (
        <p className="flex items-center gap-2 text-sm text-[#1F1A15]/55"><Lock size={14} /> You can view these settings but not change them.</p>
      )}
    </form>
  );
}

export default function OrganizationPage() {
  const { can } = usePerms();
  const canView = can("canViewCompany");
  const [toast, setToast] = useState<string | null>(null);
  const { data: org, isPending, isError, error, refetch } = useOrganization(canView);

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Organization"
        title="Organization profile"
        description="Company details, opening hours and booking rules for your whole organization."
        actions={
          org && (
            <>
              <Badge tone="neutral">Code {org.code}</Badge>
              <Badge tone={org.status === "active" ? "success" : "warn"}>{org.status ?? "active"}</Badge>
            </>
          )
        }
      />

      {!canView ? (
        <EmptyState icon={Lock} title="Restricted" text="You don't have permission to view the organization profile." />
      ) : isPending ? (
        <div aria-busy="true" className="space-y-4">
          <div className="h-64 animate-pulse rounded-3xl bg-[#F1E7D8]" />
          <div className="h-80 animate-pulse rounded-3xl bg-[#F1E7D8]" />
        </div>
      ) : isError || !org ? (
        <EmptyState icon={AlertTriangle} title="Couldn't load the organization" text={error?.message || "Something went wrong."}
          action={<Button variant="secondary" onClick={() => refetch()}>Try again</Button>} />
      ) : (
        <>
          <OrgForm key={org.updatedAt} org={org} canEdit={can("canUpdateCompany")} onSaved={setToast} />
          <p className="text-xs text-[#1F1A15]/45">
            Created {fmtDate(org.createdAt.slice(0, 10), { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </>
      )}

      <Toast message={toast} onDone={() => setToast(null)} />
    </div>
  );
}