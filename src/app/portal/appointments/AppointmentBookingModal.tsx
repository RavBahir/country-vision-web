import { Button, inputCls, Modal } from "@/components/portal/UI";
import { fmtTime, parseISO, TODAY, toISO } from "@/lib/format";
import { Appointment, APPT_TYPES, ApptType, CLINIC, CLINICIANS, TIME_SLOTS } from "@/lib/portal-data";
import { FormEvent, useMemo, useState } from "react";

/* ---------------- booking / reschedule modal ---------------- */

export function BookingModal({
  initial, existing, onClose, onSave,
}: { initial: Appointment | null; existing: Appointment[]; onClose: () => void; onSave: (a: Appointment) => void }) {
  const [type, setType] = useState<ApptType>(initial?.type ?? "Eye checkup");
  const [clinician, setClinician] = useState<string>(initial?.clinician ?? CLINICIANS[0]);
  const [date, setDate] = useState(initial?.date ?? "");
  const [time, setTime] = useState(initial?.time ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");

  const closedDay = date !== "" && parseISO(date).getDay() === 0;
  const taken = useMemo(
    () => existing.filter((a) => a.date === date && a.clinician === clinician && a.status !== "cancelled" && a.id !== initial?.id).map((a) => a.time),
    [existing, date, clinician, initial],
  );

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!date || !time || closedDay) return;
    onSave({
      id: initial?.id ?? `a${Date.now()}`,
      type, clinician, date, time, notes: notes || undefined,
      location: CLINIC.name,
      status: "confirmed",
    });
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={initial ? "Reschedule appointment" : "Book an appointment"}
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="booking-form" disabled={!date || !time || closedDay}>{initial ? "Save changes" : "Confirm booking"}</Button>
        </div>
      }
    >
      <form id="booking-form" onSubmit={submit} className="grid gap-5">
        <div>
          <label htmlFor="b-type" className="mb-2 block text-sm font-medium">Appointment type</label>
          <select id="b-type" value={type} onChange={(e) => setType(e.target.value as ApptType)} className={inputCls}>
            {APPT_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="b-clin" className="mb-2 block text-sm font-medium">Clinician</label>
          <select id="b-clin" value={clinician} onChange={(e) => { setClinician(e.target.value); setTime(""); }} className={inputCls}>
            {CLINICIANS.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="b-date" className="mb-2 block text-sm font-medium">Date</label>
          <input id="b-date" type="date" required min={toISO(TODAY)} value={date} onChange={(e) => { setDate(e.target.value); setTime(""); }} className={inputCls} />
          {closedDay && <p className="mt-2 text-sm text-[#8E3524]">We&rsquo;re closed on Sundays. Please pick another day.</p>}
        </div>

        <fieldset disabled={!date || closedDay}>
          <legend className="mb-2 text-sm font-medium">Time</legend>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {TIME_SLOTS.map((t) => {
              const busy = taken.includes(t);
              const on = time === t;
              return (
                <button
                  key={t}
                  type="button"
                  disabled={busy}
                  aria-pressed={on}
                  onClick={() => setTime(t)}
                  className={`rounded-full border px-3 py-2.5 text-sm transition-colors disabled:cursor-not-allowed disabled:line-through disabled:opacity-40 ${
                    on ? "border-[#1F1A15] bg-[#1F1A15] text-white" : "border-[#E6D9C6] bg-white hover:bg-[#F1E7D8]"
                  }`}
                >
                  {fmtTime(t)}
                </button>
              );
            })}
          </div>
          {!date && <p className="mt-2 text-xs text-[#1F1A15]/50">Choose a date to see available times.</p>}
        </fieldset>

        <div>
          <label htmlFor="b-notes" className="mb-2 block text-sm font-medium">Anything we should know? <span className="text-[#1F1A15]/45">(optional)</span></label>
          <textarea id="b-notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. headaches when reading, new screen job" className={`${inputCls} h-auto py-3`} />
        </div>
      </form>
    </Modal>
  );
}


export default BookingModal