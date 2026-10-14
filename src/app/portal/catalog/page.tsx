"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Check, Glasses, PackageSearch, Search, Sparkles } from "lucide-react";
import { Badge, Button, Card, EmptyState, Kicker, Modal, PageHeader, Segmented, StepTracker, Toast, inputCls } from "@/components/portal/UI";
import { fmtDate, money, toISO, TODAY } from "@/lib/format";
import {
  CHECKUPS, COATINGS, DEFAULT_LENS, FRAMES, FRAME_SIZES, INITIAL_REQUESTS, LENS_INDEX, LENS_TYPES, REQUEST_STEPS,
  lensPrice, lensSummary,
  type CatalogRequest, type Frame, type LensConfig,
} from "@/lib/portal-data";
import RxTable from "../RxTable";

type Tab = "frames" | "lenses" | "requests";
const RX = CHECKUPS[0];

/* ---------------- reusable option card ---------------- */

function Choice({
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

function LensConfigurator({ value, onChange, prefix }: { value: LensConfig; onChange: (c: LensConfig) => void; prefix: string }) {
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

function FrameCustomizer({ frame, onClose, onRequest }: { frame: Frame; onClose: () => void; onRequest: (r: CatalogRequest) => void }) {
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

type Sort = "featured" | "low" | "high";

export default function CatalogPage() {
  const [tab, setTab] = useState<Tab>("frames");
  const [query, setQuery] = useState("");
  const [shape, setShape] = useState("All");
  const [sort, setSort] = useState<Sort>("featured");
  const [customizing, setCustomizing] = useState<Frame | null>(null);
  const [requests, setRequests] = useState<CatalogRequest[]>(INITIAL_REQUESTS);
  const [toast, setToast] = useState<string | null>(null);

  // lens-only form
  const [lensFor, setLensFor] = useState("My current frames");
  const [lensCfg, setLensCfg] = useState<LensConfig>(DEFAULT_LENS);

  const shapes = useMemo(() => ["All", ...Array.from(new Set(FRAMES.map((f) => f.shape)))], []);
  const frames = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = FRAMES.filter((f) => (shape === "All" || f.shape === shape) && (!q || `${f.name} ${f.shape} ${f.material}`.toLowerCase().includes(q)));
    if (sort === "low") list.sort((a, b) => a.price - b.price);
    if (sort === "high") list.sort((a, b) => b.price - a.price);
    return list;
  }, [query, shape, sort]);

  const addRequest = (r: CatalogRequest) => {
    setRequests((prev) => [r, ...prev]);
    setCustomizing(null);
    setTab("requests");
    setToast("Request sent. Our optician will review it shortly.");
  };

  const submitLenses = () => {
    addRequest({
      id: `REQ-${Math.floor(Math.random() * 900 + 100)}`,
      title: `Lenses only · ${lensFor || "My current frames"}`,
      summary: lensSummary(lensCfg),
      date: toISO(TODAY),
      step: 0,
      total: lensPrice(lensCfg),
    });
    setLensCfg(DEFAULT_LENS);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Catalog"
        title={<>Find a frame that feels like <span className="font-serif text-[1.1em] font-normal italic">you.</span></>}
        description="Customize frames and lenses to your prescription, then send a request. Our optician reviews every order before it goes to the lab."
      />

      <Segmented<Tab>
        label="Catalog sections"
        value={tab}
        onChange={setTab}
        options={[
          { value: "frames", label: "Frames" },
          { value: "lenses", label: "Lenses only" },
          { value: "requests", label: "My requests", count: requests.length },
        ]}
      />

      {/* ---------- FRAMES ---------- */}
      {tab === "frames" && (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-55 flex-1 sm:max-w-xs">
              <Search size={16} className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-[#1F1A15]/45" aria-hidden />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search frames" aria-label="Search frames" className={`${inputCls} pl-11`} />
            </div>
            <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="Sort frames" className={`${inputCls} w-auto`}>
              <option value="featured">Featured</option>
              <option value="low">Price: low to high</option>
              <option value="high">Price: high to low</option>
            </select>
          </div>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by shape">
            {shapes.map((s) => (
              <button key={s} aria-pressed={shape === s} onClick={() => setShape(s)} className={`rounded-full border px-4 py-2 text-sm transition-colors ${shape === s ? "border-[#1F1A15] bg-[#1F1A15] text-white" : "border-[#E6D9C6] bg-white hover:bg-[#F1E7D8]"}`}>{s}</button>
            ))}
          </div>

          {frames.length === 0 ? (
            <EmptyState icon={Glasses} title="No frames match" text="Try a different shape or clear your search." action={<Button variant="secondary" onClick={() => { setQuery(""); setShape("All"); }}>Clear filters</Button>} />
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {frames.map((f) => (
                <li key={f.id}>
                  <Card className="flex h-full flex-col overflow-hidden">
                    <div className="grid h-44 place-items-center" style={{ backgroundColor: `${f.colors[0].hex}1F` }}>
                      <Glasses size={64} strokeWidth={1.4} style={{ color: f.colors[0].hex }} aria-hidden />
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <Badge>{f.shape}</Badge>
                      <h2 className="mt-3 font-semibold">{f.name}</h2>
                      <p className="mt-1 flex-1 text-sm text-[#1F1A15]/55">{f.blurb}</p>
                      <div className="mt-4 flex items-center gap-1.5" aria-label={`${f.colors.length} colours`}>
                        {f.colors.map((c) => <span key={c.name} title={c.name} className="h-4 w-4 rounded-full border border-black/10" style={{ backgroundColor: c.hex }} />)}
                        <span className="ml-1 text-xs text-[#1F1A15]/50">{f.material}</span>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <p className="text-sm"><span className="text-[#1F1A15]/50">From </span><b className="tabular-nums">{money(f.price)}</b></p>
                        <Button className="px-4 py-2" onClick={() => setCustomizing(f)}>Customize</Button>
                      </div>
                    </div>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {/* ---------- LENSES ONLY ---------- */}
      {tab === "lenses" && (
        <div className="grid items-start gap-6 xl:grid-cols-[1.6fr_1fr]">
          <Card className="p-6 sm:p-8">
            <h2 className="text-xl font-semibold tracking-tight">Request new lenses</h2>
            <p className="mt-1 mb-6 text-sm text-[#1F1A15]/55">Keep your favourite frames and refresh the lenses.</p>
            <div className="mb-7">
              <label htmlFor="lens-for" className="mb-2 block text-sm font-semibold">Which frames are these for?</label>
              <input id="lens-for" value={lensFor} onChange={(e) => setLensFor(e.target.value)} className={inputCls} placeholder="e.g. Black acetate round frames" />
              <p className="mt-2 text-xs text-[#1F1A15]/50">Bring the frames to your next visit so we can measure and fit the lenses.</p>
            </div>
            <LensConfigurator value={lensCfg} onChange={setLensCfg} prefix="lens" />
          </Card>

          <div className="space-y-4 xl:sticky xl:top-6">
            <div className="rounded-3xl bg-[#12100D] p-6 text-white">
              <Kicker light>Your lens request</Kicker>
              <p className="mt-4 text-sm leading-relaxed text-white/70">{lensSummary(lensCfg)}</p>
              <p className="mt-6 text-xs text-white/50">Estimated total</p>
              <p className="text-3xl font-semibold tabular-nums">{money(lensPrice(lensCfg))}</p>
              <Button variant="light" className="mt-6 w-full" onClick={submitLenses}>Request lenses</Button>
            </div>
            <p className="flex items-start gap-3 rounded-2xl border border-[#E6D9C6] bg-white p-4 text-xs leading-relaxed text-[#1F1A15]/60">
              <Sparkles size={16} className="mt-0.5 shrink-0 text-[#8A6A4A]" />
              Prices are estimates. Our optician confirms the final price and lens compatibility before anything goes to the lab.
            </p>
          </div>
        </div>
      )}

      {/* ---------- REQUESTS ---------- */}
      {tab === "requests" && (
        requests.length === 0 ? (
          <EmptyState icon={PackageSearch} title="No requests yet" text="Customize a frame or request new lenses and track it here." action={<Button onClick={() => setTab("frames")}>Browse frames</Button>} />
        ) : (
          <ul className="space-y-4">
            {requests.map((r) => (
              <li key={r.id}>
                <Card className="p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs text-[#1F1A15]/50">{r.id} · Requested {fmtDate(r.date)}</p>
                      <h2 className="mt-1 text-lg font-semibold">{r.title}</h2>
                      <p className="mt-1 max-w-xl text-sm text-[#1F1A15]/60">{r.summary}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold tabular-nums">{money(r.total)}</p>
                      <Badge tone={r.step === 0 ? "warn" : r.step === REQUEST_STEPS.length - 1 ? "success" : "neutral"}>{REQUEST_STEPS[r.step]}</Badge>
                    </div>
                  </div>
                  <div className="mt-7 max-w-2xl"><StepTracker steps={REQUEST_STEPS} current={r.step} /></div>
                </Card>
              </li>
            ))}
          </ul>
        )
      )}

      {customizing && <FrameCustomizer key={customizing.id} frame={customizing} onClose={() => setCustomizing(null)} onRequest={addRequest} />}
      <Toast message={toast} onDone={() => setToast(null)} />
    </div>
  );
}