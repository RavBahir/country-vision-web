// app/portal/schedule/AssignModal.tsx
"use client";

import { Button, Modal } from "@/components/portal/UI";
import { SelectField, FormError, TextAreaField } from "@/components/portal/FormFields";
import {
  useChangeStatus, useOptometrists, useStaffUpdate,
} from "@/modules/appointments/common/staff-api";
import type { IStaffAppointment } from "@/modules/appointments/common/staff";
import { useState, type FormEvent } from "react";

/** "approve" moves pending -> approved. "reassign" only swaps the optometrist. */
export function AssignModal({
  appt, mode, onClose, onDone,
}: {
  appt: IStaffAppointment;
  mode: "approve" | "reassign";
  onClose: () => void;
  onDone: (message: string) => void;
}) {
  const { data: optos = [], isPending: loading } = useOptometrists(appt.branchId);
  const [optometristId, setOptometristId] = useState(appt.optometristId ?? "");
  const status = useChangeStatus();
  const update = useStaffUpdate();
  const mutation = mode === "approve" ? status : update;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!optometristId || mutation.isPending) return;
    if (mode === "approve") {
      status.mutate(
        { id: appt.id, body: { status: "approved", optometristId } },
        { onSuccess: () => onDone("Appointment approved.") },
      );
    } else {
      update.mutate(
        { id: appt.id, data: { optometristId } },
        { onSuccess: () => onDone("Optometrist updated.") },
      );
    }
  };

  return (
    <Modal
      open
      onClose={mutation.isPending ? () => {} : onClose}
      title={mode === "approve" ? "Approve appointment" : "Change optometrist"}
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={mutation.isPending}>Cancel</Button>
          <Button type="submit" form="assign-form" disabled={!optometristId || mutation.isPending}>
            {mutation.isPending ? "Saving…" : mode === "approve" ? "Approve" : "Save"}
          </Button>
        </div>
      }
    >
      <form id="assign-form" onSubmit={submit} className="grid gap-5">
        <p className="text-[15px] text-[#1F1A15]/70">
          <b>{appt.customer.name}</b> · {appt.date} at {appt.time}
        </p>
        <SelectField
          label="Optometrist"
          value={optometristId}
          onChange={setOptometristId}
          options={optos.map((o) => ({ value: o.id, label: o.name }))}
          placeholder={loading ? "Loading…" : "Select an optometrist"}
          hint={
            !loading && optos.length === 0
              ? "No optometrists are assigned to this branch. Mark a staff member as an optometrist and add them to the branch first."
              : undefined
          }
          required
        />
        <FormError message={mutation.error?.message} />
      </form>
    </Modal>
  );
}

export function StaffCancelModal({
  appt, onClose, onDone,
}: {
  appt: IStaffAppointment;
  onClose: () => void;
  onDone: (message: string) => void;
}) {
  const [reason, setReason] = useState("");
  const status = useChangeStatus();

  return (
    <Modal
      open
      onClose={status.isPending ? () => {} : onClose}
      title="Cancel this appointment?"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={status.isPending}>Keep it</Button>
          <Button
            variant="danger"
            disabled={status.isPending}
            onClick={() =>
              status.mutate(
                { id: appt.id, body: { status: "cancelled", cancelReason: reason.trim() || null } },
                { onSuccess: () => onDone("Appointment cancelled.") },
              )
            }
          >
            {status.isPending ? "Cancelling…" : "Yes, cancel"}
          </Button>
        </div>
      }
    >
      <div className="grid gap-4">
        <p className="text-[15px] text-[#1F1A15]/70">
          {appt.customer.name} · {appt.date} at {appt.time}
        </p>
        <TextAreaField label="Reason" value={reason} onChange={setReason} rows={2} optional />
        <FormError message={status.error?.message} />
      </div>
    </Modal>
  );
}