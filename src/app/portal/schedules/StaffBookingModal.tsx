// app/portal/schedule/StaffBookingModal.tsx
"use client";

import { Button, inputCls, Modal } from "@/components/portal/UI";
import { FormError, SelectField } from "@/components/portal/FormFields";
import { fmtTime, toISO } from "@/lib/format";
import { useGetCustomers } from "@/pages/customers/common/customers-api";
import {
  useOptometrists, useStaffAvailability, useStaffBook, useStaffBranches, useStaffUpdate,
} from "@/pages/appointments/common/staff-api";
import type { ApptType } from "@/pages/appointments/common/appointments";
import type { IStaffAppointment } from "@/pages/appointments/common/staff";
import { useMemo, useState, type FormEvent } from "react";
import { TYPE_OPTIONS } from "./common";

export default function StaffBookingModal({
  initial, onClose, onSaved,
}: {
  /** null = new booking, an appointment = reschedule */
  initial: IStaffAppointment | null;
  onClose: () => void;
  onSaved: (message: string) => void;
}) {
  const isEdit = Boolean(initial);
  const [customerId, setCustomerId] = useState(initial?.customerId ?? "");
  const [branchId, setBranchId] = useState(initial?.branchId ?? "");
  const [type, setType] = useState<ApptType>(initial?.type ?? "eye_checkup");
  const [optometristId, setOptometristId] = useState(initial?.optometristId ?? "");
  const [date, setDate] = useState(initial?.date ?? "");
  const [time, setTime] = useState(initial?.time ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");

  const { data: customers = [] } = useGetCustomers();
  const { data: branches = [] } = useStaffBranches();
  const { data: optos = [] } = useOptometrists(branchId || undefined);
  const { data: avail, isFetching } = useStaffAvailability(
    date, branchId || undefined, optometristId || undefined,
  );

  const book = useStaffBook();
  const update = useStaffUpdate();
  const mutation = isEdit ? update : book;

  const activeCustomers = useMemo(
    () => customers.filter((c) => (c.status ?? "active") === "active"),
    [customers],
  );

  const slots = avail?.slots ?? [];
  const closed = Boolean(avail?.closed);
  const slotMoved = !isEdit || date !== initial!.date || time !== initial!.time;
  const canSubmit = Boolean(
    (isEdit || customerId) && date && time && !closed && !mutation.isPending,
  );

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    if (initial) {
      update.mutate(
        {
          id: initial.id,
          data: {
            type,
            notes: notes.trim() || null,
            ...(slotMoved ? { date, time } : {}),
            ...(optometristId !== (initial.optometristId ?? "")
              ? { optometristId: optometristId || null }
              : {}),
          },
        },
        { onSuccess: () => onSaved("Appointment updated.") },
      );
    } else {
      book.mutate(
        {
          customerId,
          branchId: branchId || undefined,
          optometristId: optometristId || undefined,
          type, date, time,
          notes: notes.trim() || null,
        },
        {
          onSuccess: () =>
            onSaved(optometristId ? "Appointment booked and approved." : "Appointment booked. Assign an optometrist to approve it."),
        },
      );
    }
  };

  return (
    <Modal
      open
      onClose={mutation.isPending ? () => {} : onClose}
      title={isEdit ? "Reschedule appointment" : "Book an appointment"}
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={mutation.isPending}>Cancel</Button>
          <Button type="submit" form="staff-booking-form" disabled={!canSubmit}>
            {mutation.isPending ? "Saving…" : isEdit ? "Save changes" : "Book"}
          </Button>
        </div>
      }
    >
      <form id="staff-booking-form" onSubmit={submit} className="grid gap-5">
        {isEdit ? (
          <p className="text-[15px]"><b>{initial!.customer.name}</b> · {initial!.customer.code}</p>
        ) : (
          <SelectField
            label="Customer"
            value={customerId}
            onChange={setCustomerId}
            options={activeCustomers.map((c) => ({ value: c.id, label: `${c.name} · ${c.code}` }))}
            placeholder="Select a customer"
            required
          />
        )}

        {!isEdit && branches.length > 1 && (
          <SelectField
            label="Branch"
            value={branchId}
            onChange={(v) => { setBranchId(v); setOptometristId(""); setTime(""); }}
            options={branches.map((b) => ({ value: b.id, label: b.name }))}
            placeholder="Select a branch"
            required
          />
        )}

        <SelectField
          label="Appointment type"
          value={type}
          onChange={(v) => setType(v as ApptType)}
          options={TYPE_OPTIONS}
        />

        <SelectField
          label="Optometrist"
          value={optometristId}
          onChange={(v) => { setOptometristId(v); setTime(""); }}
          options={optos.map((o) => ({ value: o.id, label: o.name }))}
          placeholder="Assign later"
          hint="Choosing one books the appointment as approved."
          optional
        />

        <div>
          <label htmlFor="sb-date" className="mb-2 block text-sm font-medium">Date</label>
          <input
            id="sb-date" type="date" required min={toISO(new Date())}
            value={date} onChange={(e) => { setDate(e.target.value); setTime(""); }}
            className={inputCls}
          />
          {closed && <p className="mt-2 text-sm text-[#8E3524]">The clinic is closed that day.</p>}
        </div>

        <fieldset disabled={!date || closed}>
          <legend className="mb-2 text-sm font-medium">Time</legend>
          {isFetching && !avail ? (
            <p className="text-sm text-[#1F1A15]/50">Loading times…</p>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {slots.map((s) => {
                const on = time === s.time;
                const own = isEdit && initial!.date === date && initial!.time === s.time;
                return (
                  <button
                    key={s.time} type="button" aria-pressed={on}
                    disabled={!s.available && !own}
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
          {!date && <p className="mt-2 text-xs text-[#1F1A15]/50">Choose a date to see available times.</p>}
        </fieldset>

        <div>
          <label htmlFor="sb-notes" className="mb-2 block text-sm font-medium">
            Notes <span className="text-[#1F1A15]/45">(optional)</span>
          </label>
          <textarea
            id="sb-notes" rows={3} maxLength={500} value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={`${inputCls} h-auto py-3`}
          />
        </div>

        <FormError message={mutation.error?.message} />
      </form>
    </Modal>
  );
}