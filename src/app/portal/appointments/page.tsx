"use client";

import { useMemo, useState, type FormEvent } from "react";
import { CalendarCheck, Clock, MapPin, Phone, Plus, User } from "lucide-react";
import { Badge, Button, Card, EmptyState, Modal, PageHeader, Segmented, Toast, inputCls } from "@/components/portal/UI";
import { fmtDate, fmtTime, parseISO, toISO, TODAY } from "@/lib/format";
import {
  APPOINTMENTS, APPT_TYPES, CLINIC, CLINICIANS, TIME_SLOTS,
  type Appointment, type ApptStatus, type ApptType,
} from "@/lib/portal-data";

type Tab = "upcoming" | "past" | "cancelled";

const STATUS_TONE: Record<ApptStatus, "success" | "warn" | "neutral" | "danger"> = {
  confirmed: "success", pending: "warn", completed: "neutral", cancelled: "danger",
};
const STATUS_LABEL: Record<ApptStatus, string> = {
  confirmed: "Confirmed", pending: "Pending", completed: "Completed", cancelled: "Cancelled",
};

/* ---------------- booking / reschedule modal ---------------- */

function BookingModal({
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

/* ---------------- page ---------------- */

export default function AppointmentsPage() {
  const [appts, setAppts] = useState<Appointment[]>(APPOINTMENTS);
  const [tab, setTab] = useState<Tab>("upcoming");
  const [editing, setEditing] = useState<Appointment | "new" | null>(null);
  const [cancelling, setCancelling] = useState<Appointment | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const todayISO = toISO(TODAY);

  const groups = useMemo(() => ({
    upcoming: appts.filter((a) => (a.status === "confirmed" || a.status === "pending") && a.date >= todayISO).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)),
    past: appts.filter((a) => a.status === "completed" || (a.status !== "cancelled" && a.date < todayISO)).sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time)),
    cancelled: appts.filter((a) => a.status === "cancelled").sort((a, b) => b.date.localeCompare(a.date)),
  }), [appts, todayISO]);

  const list = groups[tab];

  const save = (a: Appointment) => {
    setAppts((prev) => (prev.some((p) => p.id === a.id) ? prev.map((p) => (p.id === a.id ? a : p)) : [...prev, a]));
    setEditing(null);
    setTab("upcoming");
    setToast(editing === "new" ? "Appointment booked. Confirmation sent." : "Appointment updated.");
  };

  const cancel = () => {
    if (!cancelling) return;
    setAppts((prev) => prev.map((p) => (p.id === cancelling.id ? { ...p, status: "cancelled" } : p)));
    setCancelling(null);
    setToast("Appointment cancelled.");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Appointments"
        title="Your visits, in one place."
        description="Book, reschedule or cancel eye checkups and fittings. Pick a time and get instant confirmation."
        actions={<Button onClick={() => setEditing("new")}><Plus size={16} /> Book appointment</Button>}
      />

      <Segmented<Tab>
        label="Appointment status"
        value={tab}
        onChange={setTab}
        options={[
          { value: "upcoming", label: "Upcoming", count: groups.upcoming.length },
          { value: "past", label: "Past", count: groups.past.length },
          { value: "cancelled", label: "Cancelled", count: groups.cancelled.length },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <div className="space-y-4">
          {list.length === 0 ? (
            <EmptyState
              icon={CalendarCheck}
              title={tab === "upcoming" ? "No upcoming appointments" : `No ${tab} appointments`}
              text={tab === "upcoming" ? "Book an eye checkup or frame fitting that suits your week." : "Nothing to show here yet."}
              action={tab === "upcoming" ? <Button onClick={() => setEditing("new")}><Plus size={16} /> Book appointment</Button> : undefined}
            />
          ) : (
            list.map((a) => (
              <Card key={a.id} className="p-5 sm:p-6">
                <div className="flex flex-wrap items-center gap-5">
                  <div className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-[#F1E7D8] text-center leading-none">
                    <span>
                      <span className="block text-[11px] tracking-wide text-[#8A6A4A] uppercase">{fmtDate(a.date, { month: "short" })}</span>
                      <b className="mt-1 block text-3xl font-semibold">{parseISO(a.date).getDate()}</b>
                      <span className="mt-1 block text-[11px] text-[#1F1A15]/50">{fmtDate(a.date, { weekday: "short" })}</span>
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-lg font-semibold">{a.type}</h2>
                      <Badge tone={STATUS_TONE[a.status]}>{STATUS_LABEL[a.status]}</Badge>
                    </div>
                    <ul className="mt-2 grid gap-1.5 text-sm text-[#1F1A15]/60">
                      <li className="flex items-center gap-2"><Clock size={14} /> {fmtTime(a.time)} · {fmtDate(a.date, { year: "numeric", day: "numeric", month: "long" })}</li>
                      <li className="flex items-center gap-2"><User size={14} /> {a.clinician}</li>
                      <li className="flex items-center gap-2"><MapPin size={14} /> {a.location}</li>
                    </ul>
                    {a.notes && <p className="mt-3 rounded-xl bg-[#FBF6EE] px-4 py-2.5 text-sm text-[#1F1A15]/65">{a.notes}</p>}
                  </div>
                  <div className="flex w-full gap-2 sm:w-auto sm:flex-col">
                    {tab === "upcoming" && (
                      <>
                        <Button variant="secondary" className="flex-1" onClick={() => setEditing(a)}>Reschedule</Button>
                        <Button variant="danger" className="flex-1" onClick={() => setCancelling(a)}>Cancel</Button>
                      </>
                    )}
                    {tab !== "upcoming" && <Button variant="secondary" className="flex-1" onClick={() => setEditing("new")}>Book again</Button>}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold">Clinic details</h2>
            <ul className="mt-4 grid gap-4 text-sm">
              <li className="flex gap-3"><MapPin size={16} className="mt-0.5 shrink-0 text-[#8A6A4A]" /><span><b className="block font-medium">{CLINIC.name}</b><span className="text-[#1F1A15]/60">{CLINIC.address}</span></span></li>
              <li className="flex gap-3"><Clock size={16} className="mt-0.5 shrink-0 text-[#8A6A4A]" /><span>{CLINIC.hours}</span></li>
              <li className="flex gap-3"><Phone size={16} className="mt-0.5 shrink-0 text-[#8A6A4A]" /><a href="tel:+2348001234567">{CLINIC.phone}</a></li>
            </ul>
          </Card>
          <div className="rounded-3xl bg-[#12100D] p-6 text-white">
            <h2 className="text-lg font-semibold">Before your visit</h2>
            <ul className="mt-4 grid gap-3 text-sm text-white/70">
              {["Bring your current glasses or lenses", "Note any headaches or blurred vision", "List medication you take regularly", "Arrive 10 minutes early"].map((t) => (
                <li key={t} className="flex gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#C9A57B]" />{t}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {editing && (
        <BookingModal initial={editing === "new" ? null : editing} existing={appts} onClose={() => setEditing(null)} onSave={save} />
      )}

      <Modal
        open={cancelling !== null}
        onClose={() => setCancelling(null)}
        title="Cancel this appointment?"
        footer={<div className="flex justify-end gap-3"><Button variant="secondary" onClick={() => setCancelling(null)}>Keep it</Button><Button onClick={cancel}>Yes, cancel</Button></div>}
      >
        {cancelling && (
          <p className="text-[15px] leading-relaxed text-[#1F1A15]/70">
            Your <b>{cancelling.type}</b> on <b>{fmtDate(cancelling.date, { day: "numeric", month: "long" })}</b> at <b>{fmtTime(cancelling.time)}</b> will be cancelled. You can book another time whenever you like.
          </p>
        )}
      </Modal>

      <Toast message={toast} onDone={() => setToast(null)} />
    </div>
  );
}