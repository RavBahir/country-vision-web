"use client";

import { useState } from "react";
import { Button, Card } from "@/components/portal/UI";
import { SelectField } from "./Fields";
import { BRANCHES, CLINICIANS, type Channel, type NotifTopic, type Preferences, type ReminderLead } from "@/lib/portal-data";

const TOPICS: { id: NotifTopic; label: string; text: string; required?: boolean }[] = [
  { id: "appointments", label: "Appointments", text: "Confirmations, changes and reminders", required: true },
  { id: "checkups", label: "Checkup reminders", text: "When your next eye exam is due" },
  { id: "orders", label: "Order updates", text: "Lab progress and when your pair is ready" },
  { id: "payments", label: "Payments & receipts", text: "Payment confirmations and receipts", required: true },
  { id: "offers", label: "Offers & news", text: "Promotions and clinic updates" },
];
const CHANNELS: { id: Channel; label: string }[] = [
  { id: "whatsapp", label: "WhatsApp" },
  { id: "sms", label: "SMS" },
  { id: "email", label: "Email" },
];
const LEADS: { id: ReminderLead; label: string }[] = [
  { id: "day_before", label: "24 hours before" },
  { id: "two_hours_before", label: "2 hours before" },
  { id: "both", label: "Both" },
];

export default function PreferencesForm({ saved, onSave }: { saved: Preferences; onSave: (p: Preferences) => void }) {
  const [prefs, setPrefs] = useState<Preferences>(saved);
  const [notice, setNotice] = useState<string | null>(null);
  const dirty = JSON.stringify(prefs) !== JSON.stringify(saved);

  const toggle = (topic: NotifTopic, ch: Channel, required?: boolean) => {
    const next = !prefs.channels[topic][ch];
    const remaining = CHANNELS.filter((c) => (c.id === ch ? next : prefs.channels[topic][c.id])).length;
    if (required && remaining === 0) {
      setNotice("Keep at least one channel on for appointments and payments so you never miss a confirmation.");
      return;
    }
    setNotice(null);
    setPrefs((p: any) => ({ ...p, channels: { ...p.channels, [topic]: { ...p.channels[topic], [ch]: next } } }));
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 sm:p-8">
        <h2 className="text-lg font-semibold tracking-tight">How should we reach you?</h2>
        <p className="mt-1 text-sm text-[#1F1A15]/55">Choose a channel for each kind of message.</p>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-115 text-left text-sm">
            <caption className="sr-only">Notification channels by topic</caption>
            <thead>
              <tr className="text-[11px] tracking-[0.16em] text-[#1F1A15]/45 uppercase">
                <th scope="col" className="pb-3 font-medium">Topic</th>
                {CHANNELS.map((c) => <th key={c.id} scope="col" className="w-24 pb-3 text-center font-medium">{c.label}</th>)}
              </tr>
            </thead>
            <tbody>
              {TOPICS.map((t) => (
                <tr key={t.id} className="border-t border-[#E6D9C6]">
                  <th scope="row" className="py-4 pr-4 font-normal">
                    <b className="block font-medium">{t.label}</b>
                    <span className="text-xs text-[#1F1A15]/55">{t.text}</span>
                  </th>
                  {CHANNELS.map((c) => (
                    <td key={c.id} className="py-4 text-center">
                      <input
                        type="checkbox"
                        checked={prefs.channels[t.id][c.id]}
                        onChange={() => toggle(t.id, c.id, t.required)}
                        aria-label={`${t.label} by ${c.label}`}
                        className="h-5 w-5 cursor-pointer accent-[#1F1A15]"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {notice && <p role="alert" className="mt-4 rounded-xl bg-[#F6E6C8] px-4 py-3 text-sm text-[#8A5A12]">{notice}</p>}

        <fieldset className="mt-8">
          <legend className="mb-3 text-sm font-semibold">Appointment reminders</legend>
          <div role="radiogroup" aria-label="Reminder timing" className="flex flex-wrap gap-2">
            {LEADS.map((l) => (
              <button
                key={l.id}
                type="button"
                role="radio"
                aria-checked={prefs.reminderLead === l.id}
                onClick={() => setPrefs((p: any) => ({ ...p, reminderLead: l.id }))}
                className={`rounded-full border px-5 py-2.5 text-sm transition-colors ${prefs.reminderLead === l.id ? "border-[#1F1A15] bg-[#1F1A15] text-white" : "border-[#E6D9C6] bg-white hover:bg-[#F1E7D8]"}`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </fieldset>
      </Card>

      <Card className="p-6 sm:p-8">
        <h2 className="text-lg font-semibold tracking-tight">Booking & ordering defaults</h2>
        <p className="mt-1 text-sm text-[#1F1A15]/55">We'll pre-select these so booking takes fewer taps.</p>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <SelectField label="Preferred branch" value={prefs.preferredBranchId} onChange={(v) => setPrefs((p: any) => ({ ...p, preferredBranchId: v }))}>
            {BRANCHES.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </SelectField>
          <SelectField label="Preferred clinician" value={prefs.preferredClinician} onChange={(v) => setPrefs((p: any) => ({ ...p, preferredClinician: v }))}>
            <option value="any">First available</option>
            {CLINICIANS.map((c) => <option key={c} value={c}>{c}</option>)}
          </SelectField>
          <SelectField label="Default for orders" value={prefs.fulfilment} onChange={(v) => setPrefs((p: any) => ({ ...p, fulfilment: v as Preferences["fulfilment"] }))}>
            <option value="pickup">Collect in store</option>
            <option value="delivery">Deliver to me</option>
          </SelectField>
        </div>

        <div className="mt-7 flex items-center justify-between gap-4 rounded-2xl border border-[#E6D9C6] bg-[#FBF6EE] p-5">
          <div>
            <p className="font-medium">Send me offers and eye-care tips</p>
            <p className="mt-1 text-xs text-[#1F1A15]/55">Uses the channels ticked for "Offers & news" above. You can opt out any time.</p>
          </div>
          {/* <Switch checked={prefs.marketingOptIn} onChange={(v) => setPrefs((p) => ({ ...p, marketingOptIn: v }))} label="Receive offers and eye-care tips" /> */}
        </div>
      </Card>

      <div className="flex flex-wrap items-center justify-end gap-3">
        {dirty && <p className="mr-auto text-sm text-[#8A5A12]">You have unsaved changes.</p>}
        <Button variant="secondary" disabled={!dirty} onClick={() => { setPrefs(saved); setNotice(null); }}>Discard</Button>
        <Button disabled={!dirty} onClick={() => onSave(prefs)}>Save preferences</Button>
      </div>
    </div>
  );
}