// app/portal/schedule/[id]/PrescriptionForm.tsx
"use client";

import { Button, inputCls, Modal } from "@/components/portal/UI";
import { FormError, SelectField, TextAreaField, TextField } from "@/components/portal/FormFields";
import { useIssuePrescription } from "@/pages/appointments/common/staff-api";
import type { IEyeRx, IPrescription, IRxInput, RxType } from "@/pages/appointments/common/staff";
import { useState, type FormEvent } from "react";

type Eye = "right" | "left";
type Field = "sphere" | "cylinder" | "axis" | "add" | "prism" | "base" | "pd";
type EyeStr = Record<Field, string>;

const COLS: { key: Field; label: string; step?: number; min?: number; max?: number }[] = [
  { key: "sphere", label: "Sphere", step: 0.25, min: -20, max: 20 },
  { key: "cylinder", label: "Cylinder", step: 0.25, min: -10, max: 10 },
  { key: "axis", label: "Axis", step: 1, min: 1, max: 180 },
  { key: "add", label: "Add", step: 0.25, min: 0, max: 4 },
  { key: "prism", label: "Prism", step: 0.25, min: 0, max: 20 },
  { key: "base", label: "Base" },
  { key: "pd", label: "PD", step: 0.5, min: 20, max: 45 },
];

const TYPES: { value: RxType; label: string }[] = [
  { value: "single_vision", label: "Single vision" },
  { value: "bifocal", label: "Bifocal" },
  { value: "progressive", label: "Progressive" },
  { value: "reading", label: "Reading" },
  { value: "contact_lens", label: "Contact lens" },
];

const s = (v: unknown) => (v === null || v === undefined ? "" : String(v));
const num = (v: string) => (v.trim() === "" ? null : Number(v));

const eyeToStr = (e?: IEyeRx): EyeStr => ({
  sphere: s(e?.sphere), cylinder: s(e?.cylinder), axis: s(e?.axis), add: s(e?.add),
  prism: s(e?.prism), base: s(e?.base), pd: s(e?.pd),
});

const eyeToInput = (e: EyeStr): IEyeRx => ({
  sphere: num(e.sphere), cylinder: num(e.cylinder), axis: num(e.axis), add: num(e.add),
  prism: num(e.prism), base: (e.base || null) as IEyeRx["base"], pd: num(e.pd),
});

export default function PrescriptionForm({
  appointmentId, startFrom, onClose, onSaved,
}: {
  appointmentId: string;
  /** Pre-fills the grid, e.g. from the customer's last prescription */
  startFrom?: IPrescription;
  onClose: () => void;
  onSaved: (message: string) => void;
}) {
  const [type, setType] = useState<RxType>(startFrom?.type ?? "single_vision");
  const [eyes, setEyes] = useState<Record<Eye, EyeStr>>({
    right: eyeToStr(startFrom?.right), left: eyeToStr(startFrom?.left),
  });
  const [pdDistance, setPdDistance] = useState(s(startFrom?.pdDistance));
  const [pdNear, setPdNear] = useState(s(startFrom?.pdNear));
  const [expiresAt, setExpiresAt] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  const issue = useIssuePrescription();

  const setCell = (eye: Eye, f: Field, v: string) =>
    setEyes((p) => ({ ...p, [eye]: { ...p[eye], [f]: v } }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (issue.isPending) return;

    const right = eyeToInput(eyes.right);
    const left = eyeToInput(eyes.left);

    const all = [...Object.values(right), ...Object.values(left), num(pdDistance), num(pdNear)];
    if (all.some((x) => typeof x === "number" && Number.isNaN(x))) {
      return setError("Check the lens values. One of them isn't a number.");
    }
    for (const [name, eye] of [["Right", right], ["Left", left]] as const) {
      if (eye.cylinder && !eye.axis) return setError(`${name} eye: axis is required with a cylinder.`);
    }
    const hasLens = [right, left].some((x) => x.sphere !== null || x.cylinder !== null || x.add !== null);
    if (!hasLens) return setError("Enter at least one lens measurement.");

    const body: IRxInput = {
      type, right, left,
      pdDistance: num(pdDistance), pdNear: num(pdNear),
      ...(expiresAt ? { expiresAt } : {}),
      notes: notes.trim() || null,
    };
    issue.mutate({ id: appointmentId, body }, { onSuccess: () => onSaved("Prescription issued.") });
  };

  const cell = `${inputCls} px-2 text-center tabular-nums`;

  return (
    <Modal
      open
      onClose={issue.isPending ? () => {} : onClose}
      title="Issue prescription"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={issue.isPending}>Cancel</Button>
          <Button type="submit" form="rx-form" disabled={issue.isPending}>
            {issue.isPending ? "Issuing…" : "Issue prescription"}
          </Button>
        </div>
      }
    >
      <form id="rx-form" onSubmit={submit} className="grid gap-5" noValidate>
        <SelectField label="Lens type" value={type} onChange={(v) => setType(v as RxType)} options={TYPES} />

        <div className="overflow-x-auto">
          <table className="w-full min-w-136 border-separate border-spacing-x-1.5 border-spacing-y-2 text-sm">
            <thead>
              <tr className="text-[11px] tracking-wide text-[#1F1A15]/50 uppercase">
                <th className="w-12" />
                {COLS.map((c) => <th key={c.key} className="font-medium">{c.label}</th>)}
              </tr>
            </thead>
            <tbody>
              {(["right", "left"] as Eye[]).map((eye) => (
                <tr key={eye}>
                  <th scope="row" className="text-left font-semibold">{eye === "right" ? "OD" : "OS"}</th>
                  {COLS.map((c) => (
                    <td key={c.key}>
                      {c.key === "base" ? (
                        <select
                          aria-label={`${eye} base`}
                          value={eyes[eye].base}
                          onChange={(e) => setCell(eye, "base", e.target.value)}
                          className={cell}
                        >
                          <option value="">–</option>
                          {["up", "down", "in", "out"].map((b) => <option key={b}>{b}</option>)}
                        </select>
                      ) : (
                        <input
                          aria-label={`${eye} ${c.label}`}
                          type="number" inputMode="decimal"
                          step={c.step} min={c.min} max={c.max}
                          value={eyes[eye][c.key]}
                          onChange={(e) => setCell(eye, c.key, e.target.value)}
                          className={cell}
                        />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="PD distance (mm)" type="number" value={pdDistance} onChange={setPdDistance} optional />
          <TextField label="PD near (mm)" type="number" value={pdNear} onChange={setPdNear} optional />
        </div>

        <TextField
          label="Expires" type="date" value={expiresAt} onChange={setExpiresAt}
          hint="Leave blank for the clinic default (24 months)." optional
        />
        <TextAreaField label="Notes" value={notes} onChange={setNotes} rows={2} optional />

        <p className="text-xs text-[#1F1A15]/50">
          Issued prescriptions can&rsquo;t be edited. To correct a measurement, void it and issue a new one.
        </p>
        <FormError message={error ?? issue.error?.message} />
      </form>
    </Modal>
  );
}