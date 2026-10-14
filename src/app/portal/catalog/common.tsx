import { fmtDate, money, TODAY, toISO } from "@/lib/format";
import { CatalogRequest, CHECKUPS, COATINGS, DEFAULT_LENS, Frame, FRAME_SIZES, LENS_INDEX, LENS_TYPES, LensConfig, lensPrice, lensSummary } from "@/lib/portal-data";
import { Check, Glasses } from "lucide-react";
import { ReactNode, useState } from "react";
import RxTable from "../RxTable";
import { Button, inputCls, Modal } from "@/components/portal/UI";

export type IFrameTab = "frames" | "lenses" | "requests";
const RX = CHECKUPS[0];

/* ---------------- reusable option card ---------------- */

export function Choice({
  type, name, checked, onChange, title, note, price,
}: { type: "radio" | "checkbox"; name: string; checked: boolean; onChange: () => void; title: string; note: string; price?: number }) {
  return (
    <label className="relative block cursor-pointer">
      <input type={type} name={name} checked={checked} onChange={onChange} className="peer sr-only" />
      <span className="flex items-start gap-3 rounded-2xl border border-[#E6D9C6] bg-white p-4 transition-colors peer-checked:border-[#1F1A15] peer-checked:bg-[#FBF6EE] peer-focus-visible:outline peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#8A6A4A]">
        <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center border ${type === "radio" ? "rounded-full" : "rounded-md"} ${checked ? "border-[#1F1A15] bg-[#1F1A15] text-white" : "border-[#1F1A15]/30"}`}>
          {checked && <Check size={12} strokeWidth={3} />}
        </span>
        <span className="flex-1"><b className="block text-sm font-medium">{title}</b><span className="text-xs text-[#1F1A15]/55">{note}</span></span>
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

/* ---------------- lens configurator ---------------- */

export function LensConfigurator({ value, onChange, prefix }: { value: LensConfig; onChange: (c: LensConfig) => void; prefix: string }) {
  const toggle = (id: string) =>
    onChange({ ...value, coatings: value.coatings.includes(id) ? value.coatings.filter((c) => c !== id) : [...value.coatings, id] });

  return (
    <div className="grid gap-7">
      <Group title="Lens type">
        {LENS_TYPES.map((t) => <Choice key={t.id} type="radio" name={`${prefix}-type`} checked={value.type === t.id} onChange={() => onChange({ ...value, type: t.id })} title={t.label} note={t.note} price={t.price} />)}
      </Group>
      <Group title="Lens thickness (index)">
        {LENS_INDEX.map((t) => <Choice key={t.id} type="radio" name={`${prefix}-index`} checked={value.index === t.id} onChange={() => onChange({ ...value, index: t.id })} title={t.label} note={t.note} price={t.price} />)}
      </Group>
      <Group title="Coatings & treatments">
        {COATINGS.map((t) => <Choice key={t.id} type="checkbox" name={`${prefix}-coat`} checked={value.coatings.includes(t.id)} onChange={() => toggle(t.id)} title={t.label} note={t.note} price={t.price} />)}
      </Group>
      <Group title="Prescription">
        <Choice type="radio" name={`${prefix}-rx`} checked={value.rxSource === "file"} onChange={() => onChange({ ...value, rxSource: "file" })} title="Use my prescription on file" note={`From your ${fmtDate(RX.date, { month: "long", year: "numeric" })} exam with ${RX.clinician}`} />
        <Choice type="radio" name={`${prefix}-rx`} checked={value.rxSource === "upload"} onChange={() => onChange({ ...value, rxSource: "upload" })} title="Send a new prescription" note="We'll ask you to share it after you submit" />
        <Choice type="radio" name={`${prefix}-rx`} checked={value.rxSource === "later"} onChange={() => onChange({ ...value, rxSource: "later" })} title="I'll bring it in" note="Our optician will confirm at your fitting" />
        {value.rxSource === "file" && <div className="rounded-2xl border border-[#E6D9C6] bg-white p-4"><RxTable od={RX.od} os={RX.os} pd={RX.pd} /></div>}
      </Group>
    </div>
  );
}

/* ---------------- frame customizer drawer ---------------- */

export function FrameCustomizer({ frame, onClose, onRequest }: { frame: Frame; onClose: () => void; onRequest: (r: CatalogRequest) => void }) {
  const [colorIdx, setColorIdx] = useState(0);
  const [size, setSize] = useState<string>("M");
  const [lens, setLens] = useState<LensConfig>(DEFAULT_LENS);
  const [notes, setNotes] = useState("");
  const color = frame.colors[colorIdx];
  const total = frame.price + lensPrice(lens);

  const submit = () =>
    onRequest({
      id: `REQ-${Math.floor(Math.random() * 900 + 100)}`,
      title: `${frame.name} · ${color.name}`,
      summary: `${FRAME_SIZES.find((s) => s.id === size)?.label} fit · ${lensSummary(lens)}`,
      date: toISO(TODAY),
      step: 0,
      total,
    });

  return (
    <Modal
      open
      variant="drawer"
      onClose={onClose}
      title="Customize your pair"
      footer={
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-[#1F1A15]/55">Estimated total</p>
            <p className="text-xl font-semibold tabular-nums">{money(total)}</p>
          </div>
          <Button onClick={submit}>Request this pair</Button>
        </div>
      }
    >
      <div className="grid gap-8">
        {/* preview */}
        <div className="rounded-3xl p-8 text-center transition-colors" style={{ backgroundColor: `${color.hex}1F` }}>
          <Glasses size={84} strokeWidth={1.4} style={{ color: color.hex }} className="mx-auto" aria-hidden />
          <p className="mt-4 text-lg font-semibold">{frame.name}</p>
          <p className="text-sm text-[#1F1A15]/60">{frame.shape} · {frame.material} · {color.name}</p>
          <p className="mt-2 text-xs text-[#1F1A15]/45">Photo preview coming soon. Colour shown is indicative.</p>
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold">Frame colour: <span className="font-normal text-[#1F1A15]/60">{color.name}</span></p>
          <div className="flex flex-wrap gap-3">
            {frame.colors.map((c, i) => (
              <button
                key={c.name}
                onClick={() => setColorIdx(i)}
                aria-label={c.name}
                aria-pressed={i === colorIdx}
                className={`h-11 w-11 rounded-full border-2 p-1 transition-colors ${i === colorIdx ? "border-[#1F1A15]" : "border-transparent hover:border-[#E6D9C6]"}`}
              >
                <span className="block h-full w-full rounded-full" style={{ backgroundColor: c.hex }} />
              </button>
            ))}
          </div>
        </div>

        <fieldset>
          <legend className="mb-3 text-sm font-semibold">Frame fit</legend>
          <div className="grid grid-cols-3 gap-2">
            {FRAME_SIZES.map((s) => (
              <button
                key={s.id}
                type="button"
                aria-pressed={size === s.id}
                onClick={() => setSize(s.id)}
                className={`rounded-2xl border px-3 py-3 text-center text-sm transition-colors ${size === s.id ? "border-[#1F1A15] bg-[#1F1A15] text-white" : "border-[#E6D9C6] bg-white hover:bg-[#F1E7D8]"}`}
              >
                <b className="block font-medium">{s.label}</b>
                <span className={`text-xs ${size === s.id ? "text-white/70" : "text-[#1F1A15]/50"}`}>{s.mm} mm</span>
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-[#1F1A15]/50">Not sure? Choose Medium and we&rsquo;ll confirm at your fitting.</p>
        </fieldset>

        <LensConfigurator value={lens} onChange={setLens} prefix="frame" />

        <div>
          <label htmlFor="frame-notes" className="mb-2 block text-sm font-semibold">Notes for our optician <span className="font-normal text-[#1F1A15]/45">(optional)</span></label>
          <textarea id="frame-notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} className={`${inputCls} h-auto py-3`} placeholder="e.g. I drive at night, mostly use a laptop" />
        </div>
      </div>
    </Modal>
  );
}

/* ---------------- page ---------------- */

export type ISort = "featured" | "low" | "high";