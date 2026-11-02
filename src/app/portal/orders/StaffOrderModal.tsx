// app/portal/orders/StaffOrderModal.tsx
"use client";

import { Button, Modal } from "@/components/portal/UI";
import { FormError, SelectField, TextAreaField, TextField } from "@/components/portal/FormFields";
import { money } from "@/lib/format";
import { usePerms } from "@/lib/use-perms";
import { useCustomerPrescriptions } from "@/modules/appointments/common/staff-api";
import { byKind, defaultLens, quote } from "@/modules/catalog/common/catalog";
import { useCatalog, usePlaceStaffOrder } from "@/modules/catalog/common/catalog-api";
import { useGetCustomers } from "@/modules/customers/common/customers-api";
import { useState, type FormEvent } from "react";
import { LensConfigurator } from "../catalog/common";

export default function StaffOrderModal({ onClose, onSaved }: { onClose: () => void; onSaved: (id: string) => void }) {
  const { can } = usePerms();
  const { data: catalog } = useCatalog();
  const { data: customers = [] } = useGetCustomers();
  const place = usePlaceStaffOrder();

  const options = catalog?.options ?? [];
  const frames = catalog?.frames ?? [];
  const sizes = byKind(options).frame_size;

  const [customerId, setCustomerId] = useState("");
  const [kind, setKind] = useState<"frame" | "lenses_only">("frame");
  const [frameId, setFrameId] = useState("");
  const [colorId, setColorId] = useState("");
  const [sizeId, setSizeId] = useState(sizes.find((s) => s.isDefault)?.id ?? sizes[0]?.id ?? "");
  const [lensFor, setLensFor] = useState("");
  const [notes, setNotes] = useState("");
  const [lens, setLens] = useState(() => defaultLens(options, false));

  const { data: history = [] } = useCustomerPrescriptions(customerId, can("canViewPrescriptions") && !!customerId);
  const rx = history.find((r) => !r.expired) ?? history[0] ?? null;

  const frame = frames.find((f) => f.id === frameId) ?? null;
  const q = quote(options, [...(kind === "frame" ? [sizeId] : []), lens.typeId, lens.indexId, ...lens.coatingIds], kind === "frame" ? frame : null);
  const ready = customerId && lens.typeId && lens.indexId && (kind === "lenses_only" || (frameId && colorId && sizeId));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!ready || place.isPending) return;
    place.mutate(
      {
        customerId, kind, lens: { ...lens, rxSource: lens.rxSource === "file" && !rx ? "later" : lens.rxSource },
        notes: notes.trim() || null,
        ...(kind === "frame" ? { frameId, colorId, sizeId } : { lensFor: lensFor.trim() || null }),
      },
      { onSuccess: (o) => onSaved(o.id) },
    );
  };

  return (
    <Modal open variant="drawer" onClose={place.isPending ? () => {} : onClose} title="New order"
      footer={
        <div className="flex items-center justify-between gap-4">
          <div><p className="text-xs text-[#1F1A15]/55">Estimated total</p><p className="text-xl font-semibold tabular-nums">{money(q.total)}</p></div>
          <Button type="submit" form="staff-order-form" disabled={!ready || place.isPending}>{place.isPending ? "Creating…" : "Create order"}</Button>
        </div>
      }>
      <form id="staff-order-form" onSubmit={submit} className="grid gap-6">
        <SelectField label="Customer" value={customerId} onChange={setCustomerId} placeholder="Select a customer" required
          options={customers.filter((c) => (c.status ?? "active") === "active").map((c) => ({ value: c.id, label: `${c.name} · ${c.code}` }))} />
        <SelectField label="Order type" value={kind} onChange={(v) => setKind(v as "frame" | "lenses_only")}
          options={[{ value: "frame", label: "Frame and lenses" }, { value: "lenses_only", label: "Lenses only" }]} />

        {kind === "frame" ? (
          <>
            <SelectField label="Frame" value={frameId} onChange={(v) => { setFrameId(v); setColorId(frames.find((f) => f.id === v)?.colors[0]?.id ?? ""); }}
              placeholder="Select a frame" required options={frames.map((f) => ({ value: f.id, label: `${f.name} · ${money(f.price)}` }))} />
            {frame && <SelectField label="Colour" value={colorId} onChange={setColorId} options={frame.colors.map((c) => ({ value: c.id, label: c.name }))} />}
            {sizes.length > 0 && <SelectField label="Fit" value={sizeId} onChange={setSizeId} options={sizes.map((s) => ({ value: s.id, label: `${s.name}${s.mm ? ` · ${s.mm} mm` : ""}` }))} />}
          </>
        ) : (
          <TextField label="Frames these are for" value={lensFor} onChange={setLensFor} placeholder="e.g. Customer's black round frames" optional />
        )}

        <LensConfigurator value={lens} onChange={setLens} prefix="staff" options={options} rx={rx} />
        <TextAreaField label="Notes" value={notes} onChange={setNotes} rows={2} optional />
        <FormError message={place.error?.message} />
      </form>
    </Modal>
  );
}