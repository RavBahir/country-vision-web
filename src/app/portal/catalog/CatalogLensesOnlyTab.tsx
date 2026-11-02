// app/portal/catalog/CatalogLensesOnlyTab.tsx
import { Button, Card, inputCls, Kicker } from "@/components/portal/UI";
import { FormError } from "@/components/portal/FormFields";
import { money } from "@/lib/format";
import { defaultLens, quote, type IOption, type IOrderInput } from "@/modules/catalog/common/catalog";
import type { IPrescription } from "@/modules/appointments/common/staff";
import { Sparkles } from "lucide-react";
import { useState } from "react";
import { LensConfigurator } from "./common";

export default function CatalogLensesOnlyTab({
  options, rx, pending, error, onSubmit,
}: { options: IOption[]; rx?: IPrescription | null; pending: boolean; error?: string | null; onSubmit: (i: IOrderInput) => void }) {
  const [lensFor, setLensFor] = useState("My current frames");
  const [lens, setLens] = useState(() => defaultLens(options, !!rx));
  const q = quote(options, [lens.typeId, lens.indexId, ...lens.coatingIds]);
  const ready = Boolean(lens.typeId && lens.indexId);

  return (
    <div className="grid items-start gap-6 xl:grid-cols-[1.6fr_1fr]">
      <Card className="p-6 sm:p-8">
        <h2 className="text-xl font-semibold tracking-tight">Request new lenses</h2>
        <p className="mt-1 mb-6 text-sm text-[#1F1A15]/55">Keep your favourite frames and refresh the lenses.</p>
        <div className="mb-7">
          <label htmlFor="lens-for" className="mb-2 block text-sm font-semibold">Which frames are these for?</label>
          <input id="lens-for" value={lensFor} maxLength={120} onChange={(e) => setLensFor(e.target.value)} className={inputCls} placeholder="e.g. Black acetate round frames" />
          <p className="mt-2 text-xs text-[#1F1A15]/50">Bring the frames to your next visit so we can measure and fit the lenses.</p>
        </div>
        <LensConfigurator value={lens} onChange={setLens} prefix="lens" options={options} rx={rx} />
      </Card>

      <div className="space-y-4 xl:sticky xl:top-6">
        <div className="rounded-3xl bg-[#12100D] p-6 text-white">
          <Kicker light>Your lens request</Kicker>
          <p className="mt-4 text-sm leading-relaxed text-white/70">{q.summary || "Choose your lenses"}</p>
          <p className="mt-6 text-xs text-white/50">Estimated total</p>
          <p className="text-3xl font-semibold tabular-nums">{money(q.total)}</p>
          <Button variant="light" className="mt-6 w-full" disabled={!ready || pending}
            onClick={() => onSubmit({ kind: "lenses_only", lensFor: lensFor.trim() || null, lens })}>
            {pending ? "Sending…" : "Request lenses"}
          </Button>
          <div className="mt-3 text-red-200"><FormError message={error} /></div>
        </div>
        <p className="flex items-start gap-3 rounded-2xl border border-[#E6D9C6] bg-white p-4 text-xs leading-relaxed text-[#1F1A15]/60">
          <Sparkles size={16} className="mt-0.5 shrink-0 text-[#8A6A4A]" />
          Prices are estimates. Our optician confirms the final price and lens compatibility before anything goes to the lab.
        </p>
      </div>
    </div>
  );
}