// app/portal/catalog/common.tsx
"use client";

import { Button, inputCls, Modal } from "@/components/portal/UI";
import { fmtDate, money } from "@/lib/format";
import {
  byKind, defaultLens, quote, type ILensChoice, type IFrame, type IOption, type IOrderInput,
} from "@/modules/catalog/common/catalog";
import type { IPrescription } from "@/modules/appointments/common/staff";
import { Check, Glasses } from "lucide-react";
import { ReactNode, useState } from "react";
import CheckupRx from "../checkups/CheckupRx";
import { FormError } from "@/components/portal/FormFields";

export type IFrameTab = "frames" | "lenses" | "requests";
export type ISort = "featured" | "low" | "high";

export function Choice({
  type, name, checked, onChange, title, note, price,
}: { type: "radio" | "checkbox"; name: string; checked: boolean; onChange: () => void; title: string; note?: string | null; price?: number }) {
  return (
    <label className="relative block cursor-pointer">
      <input type={type} name={name} checked={checked} onChange={onChange} className="peer sr-only" />
      <span className="flex items-start gap-3 rounded-2xl border border-[#E6D9C6] bg-white p-4 transition-colors peer-checked:border-[#1F1A15] peer-checked:bg-[#FBF6EE] peer-focus-visible:outline peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#8A6A4A]">
        <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center border ${type === "radio" ? "rounded-full" : "rounded-md"} ${checked ? "border-[#1F1A15] bg-[#1F1A15] text-white" : "border-[#1F1A15]/30"}`}>
          {checked && <Check size={12} strokeWidth={3} />}
        </span>
        <span className="flex-1"><b className="block text-sm font-medium">{title}</b>{note && <span className="text-xs text-[#1F1A15]/55">{note}</span>}</span>
        {price !== undefined && <span className="text-sm tabular-nums text-[#1F1A15]/70">{price === 0 ? "Included" : `+${money(price)}`}</span>}
      </span>
    </label>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-3 text-sm font-semibold">{title}</legend>
      <div className="grid gap-2">{children}</div>
    </fieldset>
  );
}

export function LensConfigurator({
  value, onChange, prefix, options, rx,
}: { value: ILensChoice; onChange: (c: ILensChoice) => void; prefix: string; options: IOption[]; rx?: IPrescription | null }) {
  const by = byKind(options);
  const toggle = (id: string) =>
    onChange({ ...value, coatingIds: value.coatingIds.includes(id) ? value.coatingIds.filter((c) => c !== id) : [...value.coatingIds, id] });

  if (by.lens_type.length === 0 || by.lens_index.length === 0) {
    return <p className="rounded-2xl border border-dashed border-[#E6D9C6] p-5 text-sm text-[#1F1A15]/60">Lens options haven&rsquo;t been set up yet. Please contact us to order.</p>;
  }

  return (
    <div className="grid gap-7">
      <Group title="Lens type">
        {by.lens_type.map((o) => <Choice key={o.id} type="radio" name={`${prefix}-type`} checked={value.typeId === o.id} onChange={() => onChange({ ...value, typeId: o.id })} title={o.name} note={o.note} price={o.price} />)}
      </Group>
      <Group title="Lens thickness (index)">
        {by.lens_index.map((o) => <Choice key={o.id} type="radio" name={`${prefix}-index`} checked={value.indexId === o.id} onChange={() => onChange({ ...value, indexId: o.id })} title={o.name} note={o.note} price={o.price} />)}
      </Group>
      {by.coating.length > 0 && (
        <Group title="Coatings & treatments">
          {by.coating.map((o) => <Choice key={o.id} type="checkbox" name={`${prefix}-coat`} checked={value.coatingIds.includes(o.id)} onChange={() => toggle(o.id)} title={o.name} note={o.note} price={o.price} />)}
        </Group>
      )}
      <Group title="Prescription">
        {rx && <Choice type="radio" name={`${prefix}-rx`} checked={value.rxSource === "file"} onChange={() => onChange({ ...value, rxSource: "file" })} title="Use my prescription on file" note={`From your ${fmtDate(rx.issuedAt.slice(0, 10), { month: "long", year: "numeric" })} exam`} />}
        <Choice type="radio" name={`${prefix}-rx`} checked={value.rxSource === "upload"} onChange={() => onChange({ ...value, rxSource: "upload" })} title="Send a new prescription" note="We'll ask you to share it after you submit" />
        <Choice type="radio" name={`${prefix}-rx`} checked={value.rxSource === "later"} onChange={() => onChange({ ...value, rxSource: "later" })} title="I'll bring it in" note="Our optician will confirm at your fitting" />
        {rx && value.rxSource === "file" && <div className="rounded-2xl border border-[#E6D9C6] bg-white p-4"><CheckupRx rx={rx} /></div>}
      </Group>
    </div>
  );
}

export function FrameCustomizer({
  frame, options, rx, pending, error, onClose, onSubmit,
}: {
  frame: IFrame; options: IOption[]; rx?: IPrescription | null; pending: boolean; error?: string | null;
  onClose: () => void; onSubmit: (i: IOrderInput) => void;
}) {
  const sizes = byKind(options).frame_size;
  const [colorId, setColorId] = useState(frame.colors[0].id);
  const [sizeId, setSizeId] = useState(sizes.find((s) => s.isDefault)?.id ?? sizes[0]?.id ?? "");
  const [lens, setLens] = useState(() => defaultLens(options, !!rx));
  const [notes, setNotes] = useState("");

  const color = frame.colors.find((c) => c.id === colorId) ?? frame.colors[0];
  const q = quote(options, [sizeId, lens.typeId, lens.indexId, ...lens.coatingIds], frame);
  const ready = Boolean(sizeId && lens.typeId && lens.indexId);

  return (
    <Modal
      open variant="drawer" onClose={pending ? () => {} : onClose} title="Customize your pair"
      footer={
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-[#1F1A15]/55">Estimated total</p>
            <p className="text-xl font-semibold tabular-nums">{money(q.total)}</p>
          </div>
          <Button disabled={!ready || pending}
            onClick={() => onSubmit({ kind: "frame", frameId: frame.id, colorId, sizeId, lens, notes: notes.trim() || null })}>
            {pending ? "Sending…" : "Request this pair"}
          </Button>
        </div>
      }
    >
      <div className="grid gap-8">
        <div className="rounded-3xl p-8 text-center transition-colors" style={{ backgroundColor: `${color.hex}1F` }}>
          <Glasses size={84} strokeWidth={1.4} style={{ color: color.hex }} className="mx-auto" aria-hidden />
          <p className="mt-4 text-lg font-semibold">{frame.name}</p>
          <p className="text-sm text-[#1F1A15]/60">{frame.shape} · {frame.material} · {color.name}</p>
          <p className="mt-2 text-xs text-[#1F1A15]/45">Colour shown is indicative.</p>
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold">Frame colour: <span className="font-normal text-[#1F1A15]/60">{color.name}</span></p>
          <div className="flex flex-wrap gap-3">
            {frame.colors.map((c) => (
              <button key={c.id} type="button" onClick={() => setColorId(c.id)} aria-label={c.name} aria-pressed={c.id === colorId}
                className={`h-11 w-11 rounded-full border-2 p-1 transition-colors ${c.id === colorId ? "border-[#1F1A15]" : "border-transparent hover:border-[#E6D9C6]"}`}>
                <span className="block h-full w-full rounded-full" style={{ backgroundColor: c.hex }} />
              </button>
            ))}
          </div>
        </div>

        {sizes.length > 0 && (
          <fieldset>
            <legend className="mb-3 text-sm font-semibold">Frame fit</legend>
            <div className="grid grid-cols-3 gap-2">
              {sizes.map((s) => (
                <button key={s.id} type="button" aria-pressed={sizeId === s.id} onClick={() => setSizeId(s.id)}
                  className={`rounded-2xl border px-3 py-3 text-center text-sm transition-colors ${sizeId === s.id ? "border-[#1F1A15] bg-[#1F1A15] text-white" : "border-[#E6D9C6] bg-white hover:bg-[#F1E7D8]"}`}>
                  <b className="block font-medium">{s.name}</b>
                  {s.mm && <span className={`text-xs ${sizeId === s.id ? "text-white/70" : "text-[#1F1A15]/50"}`}>{s.mm} mm</span>}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-[#1F1A15]/50">Not sure? Choose the middle size and we&rsquo;ll confirm at your fitting.</p>
          </fieldset>
        )}

        <LensConfigurator value={lens} onChange={setLens} prefix="frame" options={options} rx={rx} />

        <div>
          <label htmlFor="frame-notes" className="mb-2 block text-sm font-semibold">Notes for our optician <span className="font-normal text-[#1F1A15]/45">(optional)</span></label>
          <textarea id="frame-notes" rows={3} maxLength={500} value={notes} onChange={(e) => setNotes(e.target.value)} className={`${inputCls} h-auto py-3`} placeholder="e.g. I drive at night, mostly use a laptop" />
        </div>
        <FormError message={error} />
      </div>
    </Modal>
  );
}