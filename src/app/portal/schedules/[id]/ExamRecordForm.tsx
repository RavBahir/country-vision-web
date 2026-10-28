// app/portal/schedule/[id]/ExamRecordForm.tsx
"use client";

import { Button } from "@/components/portal/UI";
import {
  FormError, FormSection, TextAreaField, TextField,
} from "@/components/portal/FormFields";
import { useSaveExamRecord } from "@/pages/appointments/common/staff-api";
import type { IExamInput, IExamRecord } from "@/pages/appointments/common/staff";
import { useState, type FormEvent } from "react";

const s = (v: unknown) => (v === null || v === undefined ? "" : String(v));

type Values = Record<keyof IExamInput, string>;

const fromRecord = (r: IExamRecord | null): Values => ({
  chiefComplaint: s(r?.chiefComplaint),
  medicalHistory: s(r?.medicalHistory),
  ocularHistory: s(r?.ocularHistory),
  currentCorrection: s(r?.currentCorrection),
  vaRightUnaided: s(r?.vaRightUnaided),
  vaLeftUnaided: s(r?.vaLeftUnaided),
  vaRightAided: s(r?.vaRightAided),
  vaLeftAided: s(r?.vaLeftAided),
  iopRight: s(r?.iopRight),
  iopLeft: s(r?.iopLeft),
  examination: s(r?.examination),
  diagnosis: s(r?.diagnosis),
  clinicalNotes: s(r?.clinicalNotes),
  recommendations: s(r?.recommendations),
  followUpDate: s(r?.followUpDate).slice(0, 10),
  referralTo: s(r?.referralTo),
});

const text = (v: string) => v.trim() || null;
const num = (v: string) => (v.trim() === "" ? null : Number(v));

export default function ExamRecordForm({
  appointmentId, record, canEdit, readOnlyReason, onSaved,
}: {
  appointmentId: string;
  record: IExamRecord | null;
  canEdit: boolean;
  readOnlyReason?: string;
  onSaved: (message: string) => void;
}) {
  const initial = fromRecord(record);
  const [v, setV] = useState<Values>(initial);
  const [error, setError] = useState<string | null>(null);
  const save = useSaveExamRecord();

  const dirty = JSON.stringify(v) !== JSON.stringify(initial);
  const set = (k: keyof Values) => (val: string) => setV((p) => ({ ...p, [k]: val }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!canEdit || !dirty || save.isPending) return;

    const iopR = num(v.iopRight);
    const iopL = num(v.iopLeft);
    for (const x of [iopR, iopL]) {
      if (x !== null && (Number.isNaN(x) || x < 0 || x > 80)) {
        return setError("Eye pressure (IOP) must be a number between 0 and 80 mmHg.");
      }
    }

    const body: IExamInput = {
      chiefComplaint: text(v.chiefComplaint), medicalHistory: text(v.medicalHistory),
      ocularHistory: text(v.ocularHistory), currentCorrection: text(v.currentCorrection),
      vaRightUnaided: text(v.vaRightUnaided), vaLeftUnaided: text(v.vaLeftUnaided),
      vaRightAided: text(v.vaRightAided), vaLeftAided: text(v.vaLeftAided),
      iopRight: iopR, iopLeft: iopL,
      examination: text(v.examination), diagnosis: text(v.diagnosis),
      clinicalNotes: text(v.clinicalNotes), recommendations: text(v.recommendations),
      followUpDate: v.followUpDate || null, referralTo: text(v.referralTo),
    };
    save.mutate({ id: appointmentId, body }, { onSuccess: () => onSaved("Exam record saved.") });
  };

  return (
    <form onSubmit={submit} className="grid gap-6">
      {!canEdit && readOnlyReason && (
        <p className="rounded-xl bg-[#FBF6EE] px-4 py-3 text-sm text-[#1F1A15]/65">{readOnlyReason}</p>
      )}
      {record?.recordedBy && (
        <p className="text-xs text-[#1F1A15]/50">Recorded by {record.recordedBy.name}</p>
      )}

      <fieldset disabled={!canEdit} className="m-0 grid min-w-0 gap-6 border-0 p-0">
        <FormSection title="History">
          <TextAreaField label="Reason for visit" value={v.chiefComplaint} onChange={set("chiefComplaint")} placeholder="e.g. headaches when reading" optional />
          <TextAreaField label="General health & medication" value={v.medicalHistory} onChange={set("medicalHistory")} optional />
          <TextAreaField label="Eye history" value={v.ocularHistory} onChange={set("ocularHistory")} optional />
          <TextField label="Current correction" value={v.currentCorrection} onChange={set("currentCorrection")} placeholder="e.g. single vision glasses, 2 years old" optional />
        </FormSection>

        <FormSection title="Visual acuity">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Right (OD), unaided" value={v.vaRightUnaided} onChange={set("vaRightUnaided")} placeholder="6/12" optional />
            <TextField label="Left (OS), unaided" value={v.vaLeftUnaided} onChange={set("vaLeftUnaided")} placeholder="6/9" optional />
            <TextField label="Right (OD), aided" value={v.vaRightAided} onChange={set("vaRightAided")} placeholder="6/6" optional />
            <TextField label="Left (OS), aided" value={v.vaLeftAided} onChange={set("vaLeftAided")} placeholder="6/6" optional />
          </div>
        </FormSection>

        <FormSection title="Eye pressure (mmHg)">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Right (OD)" type="number" value={v.iopRight} onChange={set("iopRight")} optional />
            <TextField label="Left (OS)" type="number" value={v.iopLeft} onChange={set("iopLeft")} optional />
          </div>
        </FormSection>

        <FormSection title="Findings">
          <TextAreaField label="Examination" value={v.examination} onChange={set("examination")} rows={4} placeholder="Slit lamp, fundus, other findings" optional />
          <TextAreaField label="Diagnosis" value={v.diagnosis} onChange={set("diagnosis")} optional />
        </FormSection>

        <FormSection title="Plan">
          <TextAreaField label="Recommendations (shown to the customer)" value={v.recommendations} onChange={set("recommendations")} optional />
          <TextAreaField label="Private clinical notes (staff only)" value={v.clinicalNotes} onChange={set("clinicalNotes")} rows={4} optional />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Follow-up date" type="date" value={v.followUpDate} onChange={set("followUpDate")} optional />
            <TextField label="Referred to" value={v.referralTo} onChange={set("referralTo")} placeholder="e.g. ophthalmologist" optional />
          </div>
        </FormSection>
      </fieldset>

      <FormError message={error ?? save.error?.message} />

      {canEdit && (
        <div className="flex items-center justify-end gap-3">
          {dirty && <span className="text-xs text-[#1F1A15]/50">Unsaved changes</span>}
          <Button type="submit" disabled={!dirty || save.isPending}>
            {save.isPending ? "Saving…" : "Save record"}
          </Button>
        </div>
      )}
    </form>
  );
}