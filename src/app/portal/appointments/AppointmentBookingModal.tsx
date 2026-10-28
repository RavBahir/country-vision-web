// app/portal/appointments/AppointmentBookingModal.tsx
"use client";

import { Button, inputCls, Modal } from "@/components/portal/UI";
import { fmtTime, toISO } from "@/lib/format";
import {
  useAvailability, useBookAppointment, useChangeAppointment,
} from "@/pages/appointments/common/appointments-api";
import type { ApptType, IAppointment, IBranchLite } from "@/pages/appointments/common/appointments";
import { useState, type FormEvent } from "react";
import { CUTOFF_HOURS, TYPE_OPTIONS } from "./common";

type Props = {
  /** null = new booking, an appointment = reschedule */
  initial: IAppointment | null;
  /** Pre-fills the type, used by "Book again" */
  presetType?: ApptType;
  branches: IBranchLite[];
  onClose: () => void;
  onSaved: (mode: "booked" | "updated") => void;
};

export default function BookingModal({ initial, presetType, branches, onClose, onSaved }: Props) {
  const isEdit = Boolean(initial);

  const [type, setType] = useState<ApptType>(initial?.type ?? presetType ?? "eye_checkup");
  const [branchId, setBranchId] = useState(initial?.branchId ?? (branches.length === 1 ? branches[0].id : ""));
  const [date, setDate] = useState(initial?.date ?? "");
  const [time, setTime] = useState(initial?.time ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");

  const needsBranch = !isEdit && branches.length > 1;
  const branchReady = !needsBranch || Boolean(branchId);

  const book = useBookAppointment();
  const change = useChangeAppointment();
  const mutation = isEdit ? change : book;
  const isPending = mutation.isPending;

  const { data: avail, isFetching, isError: availError } = useAvailability(
    branchReady ? date : "",
    branchId || undefined,
  );

  const slots = avail?.slots ?? [];
  const closed = Boolean(avail?.closed);
  const noneLeft = avail && !closed && slots.every((s) => !s.available);
  const unchanged = isEdit && date === initial!.date && time === initial!.time;
  const canSubmit = Boolean(date && time && branchReady && !closed && !isPending);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    if (initial) {
      change.mutate(
        {
          id: initial.id,
          data: {
            type,
            notes: notes.trim() || null,
            // The API wants date and time together, and only when the slot moved
            ...(unchanged ? {} : { date, time }),
          },
        },
        { onSuccess: () => onSaved("updated") },
      );
    } else {
      book.mutate(
        { branchId: branchId || undefined, type, date, time, notes: notes.trim() || null },
        { onSuccess: () => onSaved("booked") },
      );
    }
  };

  return (
    <Modal
      open
      onClose={isPending ? () => {} : onClose}
      title={isEdit ? "Reschedule appointment" : "Book an appointment"}
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={isPending}>Cancel</Button>
          <Button type="submit" form="booking-form" disabled={!canSubmit}>
            {isPending ? "Saving…" : isEdit ? "Save changes" : "Request booking"}
          </Button>
        </div>
      }
    >
      <form id="booking-form" onSubmit={submit} className="grid gap-5">
        {isEdit && initial!.status === "approved" && !unchanged && (
          <p className="rounded-xl bg-[#FBF6EE] px-4 py-3 text-sm text-[#1F1A15]/65">
            Moving a confirmed appointment sends it back for approval. We&rsquo;ll confirm the new time shortly.
          </p>
        )}

        <div>
          <label htmlFor="b-type" className="mb-2 block text-sm font-medium">Appointment type</label>
          <select id="b-type" value={type} onChange={(e) => setType(e.target.value as ApptType)} className={inputCls}>
            {TYPE_OPTIONS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>

        {needsBranch && (
          <div>
            <label htmlFor="b-branch" className="mb-2 block text-sm font-medium">Branch</label>
            <select
              id="b-branch"
              value={branchId}
              onChange={(e) => { setBranchId(e.target.value); setTime(""); }}
              className={inputCls}
              required
            >
              <option value="">Select a branch</option>
              {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
        )}

        <div>
          <label htmlFor="b-date" className="mb-2 block text-sm font-medium">Date</label>
          <input
            id="b-date"
            type="date"
            required
            min={toISO(new Date())}
            value={date}
            onChange={(e) => { setDate(e.target.value); setTime(""); }}
            className={inputCls}
          />
          {closed && (
            <p className="mt-2 text-sm text-[#8E3524]">We&rsquo;re closed that day. Please pick another.</p>
          )}
          {noneLeft && (
            <p className="mt-2 text-sm text-[#8E3524]">No times left that day. Try another date.</p>
          )}
        </div>

        <fieldset disabled={!date || !branchReady || closed}>
          <legend className="mb-2 text-sm font-medium">Time</legend>
          {isFetching && !avail ? (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4" aria-busy="true">
              {Array.from({ length: 8 }).map((_, i) => (
                <span key={i} className="h-10 animate-pulse rounded-full bg-[#F1E7D8]" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {slots.map((s) => {
                const on = time === s.time;
                // Keep the customer's current slot selectable when rescheduling
                const own = isEdit && initial!.date === date && initial!.time === s.time;
                const disabled = !s.available && !own;
                return (
                  <button
                    key={s.time}
                    type="button"
                    disabled={disabled}
                    aria-pressed={on}
                    onClick={() => setTime(s.time)}
                    className={`rounded-full border px-3 py-2.5 text-sm transition-colors disabled:cursor-not-allowed disabled:line-through disabled:opacity-40 ${
                      on ? "border-[#1F1A15] bg-[#1F1A15] text-white" : "border-[#E6D9C6] bg-white hover:bg-[#F1E7D8]"
                    }`}
                  >
                    {fmtTime(s.time)}
                  </button>
                );
              })}
            </div>
          )}
          {availError && <p className="mt-2 text-sm text-[#8E3524]">Couldn&rsquo;t load times. Please try again.</p>}
          {!date && <p className="mt-2 text-xs text-[#1F1A15]/50">Choose a date to see available times.</p>}
        </fieldset>

        <div>
          <label htmlFor="b-notes" className="mb-2 block text-sm font-medium">
            Anything we should know? <span className="text-[#1F1A15]/45">(optional)</span>
          </label>
          <textarea
            id="b-notes"
            rows={3}
            maxLength={500}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. headaches when reading, new screen job"
            className={`${inputCls} h-auto py-3`}
          />
        </div>

        {mutation.error && (
          <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {mutation.error.message}
          </p>
        )}
      </form>
    </Modal>
  );
}