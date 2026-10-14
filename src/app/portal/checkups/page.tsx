"use client";

import { useState } from "react";
import { CalendarCheck, ChevronDown, Download, Eye, Stethoscope } from "lucide-react";
import { Badge, ButtonLink, Button, Card, Kicker, PageHeader, SectionTitle, Toast } from "@/components/portal/UI";
import { daysBetween, fmtDate, parseISO, rx, TODAY } from "@/lib/format";
import { CHECKUPS, type Checkup } from "@/lib/portal-data";
import RxTable from "../RxTable";

/* ---------------- sphere trend chart (inline SVG) ---------------- */

function SphereChart({ data }: { data: Checkup[] }) {
  const pts = [...data].sort((a, b) => a.date.localeCompare(b.date));
  const W = 640, H = 250, padL = 48, padR = 24, padT = 20, padB = 38;
  const vals = pts.flatMap((p) => [p.od.sph, p.os.sph]);
  const min = Math.floor((Math.min(...vals) - 0.25) * 4) / 4;
  const max = Math.ceil((Math.max(...vals) + 0.25) * 4) / 4;
  const x = (i: number) => padL + (pts.length === 1 ? 0 : (i * (W - padL - padR)) / (pts.length - 1));
  const y = (v: number) => padT + ((max - v) * (H - padT - padB)) / (max - min);
  const path = (get: (p: Checkup) => number) => pts.map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(get(p)).toFixed(1)}`).join(" ");

  const ticks: number[] = [];
  for (let t = Math.ceil(min * 2) / 2; t <= max + 1e-9; t += 0.5) ticks.push(t);

  const first = pts[0], last = pts[pts.length - 1];
  const label = `Sphere power over time. Right eye from ${rx(first.od.sph)} in ${first.date.slice(0, 4)} to ${rx(last.od.sph)} in ${last.date.slice(0, 4)}. Left eye from ${rx(first.os.sph)} to ${rx(last.os.sph)}.`;

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} className="h-auto w-full">
        {ticks.map((t) => (
          <g key={t}>
            <line x1={padL} x2={W - padR} y1={y(t)} y2={y(t)} stroke="#E6D9C6" strokeDasharray="4 6" />
            <text x={padL - 10} y={y(t) + 4} textAnchor="end" fontSize="12" fill="#1F1A15" opacity="0.5">{rx(t)}</text>
          </g>
        ))}
        <path d={path((p) => p.od.sph)} fill="none" stroke="#8A6A4A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d={path((p) => p.os.sph)} fill="none" stroke="#1F1A15" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {pts.map((p, i) => (
          <g key={p.id}>
            <circle cx={x(i)} cy={y(p.od.sph)} r="5" fill="#fff" stroke="#8A6A4A" strokeWidth="2.5" />
            <circle cx={x(i)} cy={y(p.os.sph)} r="5" fill="#fff" stroke="#1F1A15" strokeWidth="2.5" />
            <text x={x(i)} y={H - 12} textAnchor="middle" fontSize="12" fill="#1F1A15" opacity="0.55">{fmtDate(p.date, { month: "short", year: "2-digit" })}</text>
          </g>
        ))}
      </svg>
      <div className="mt-2 flex gap-6 text-xs text-[#1F1A15]/60">
        <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#8A6A4A]" /> Right eye (OD)</span>
        <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#1F1A15]" /> Left eye (OS)</span>
      </div>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-[#FBF6EE] p-4">
      <dt className="text-xs text-[#1F1A15]/50">{label}</dt>
      <dd className="mt-1 font-semibold">{value}</dd>
    </div>
  );
}

/* ---------------- page ---------------- */

export default function CheckupsPage() {
  const [open, setOpen] = useState<string | null>(CHECKUPS[0].id);
  const [toast, setToast] = useState<string | null>(null);
  const last = CHECKUPS[0];
  const dueIn = daysBetween(TODAY, parseISO(last.nextDue));

  const download = (c: Checkup) => {
    // Demo: generates a plain-text report. Replace with a call to your PDF endpoint.
    const text = [
      "Country Vision · Eye checkup report",
      `Date: ${fmtDate(c.date)}`,
      `Clinician: ${c.clinician}`,
      `OD: ${rx(c.od.sph)} / ${rx(c.od.cyl)} x ${c.od.axis}`,
      `OS: ${rx(c.os.sph)} / ${rx(c.os.cyl)} x ${c.os.axis}`,
      `PD: ${c.pd} mm`,
      `Notes: ${c.notes}`,
    ].join("\n");
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `checkup-${c.date}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setToast("Report downloaded.");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Checkups"
        title="Your eye health history."
        description="Every exam, prescription and clinician note, kept safe and easy to share with your optician."
        actions={<ButtonLink href="/appointments"><CalendarCheck size={16} /> Book next checkup</ButtonLink>}
      />

      {/* summary */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-6">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#F1E7D8] text-[#8A6A4A]"><Stethoscope size={18} /></span>
          <p className="mt-4 text-sm text-[#1F1A15]/55">Last checkup</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight">{fmtDate(last.date, { day: "numeric", month: "long", year: "numeric" })}</p>
          <p className="mt-1 text-sm text-[#1F1A15]/60">{last.clinician} · {last.headline}</p>
        </Card>
        <Card className="p-6">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#F1E7D8] text-[#8A6A4A]"><CalendarCheck size={18} /></span>
          <p className="mt-4 text-sm text-[#1F1A15]/55">Next checkup due</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight">{fmtDate(last.nextDue, { day: "numeric", month: "long", year: "numeric" })}</p>
          <p className="mt-1 text-sm text-[#1F1A15]/60">{dueIn > 0 ? `In ${dueIn} days. ` : "Due now. "}<Badge tone={dueIn <= 14 ? "warn" : "success"}>{dueIn <= 14 ? "Book soon" : "On track"}</Badge></p>
        </Card>
        <div className="rounded-3xl bg-[#12100D] p-6 text-white">
          <Kicker light>Current prescription</Kicker>
          <div className="mt-3"><RxTable od={last.od} os={last.os} pd={last.pd} dark /></div>
        </div>
      </div>

      {/* trend */}
      <Card className="p-6">
        <SectionTitle title="Prescription trend" />
        <p className="mt-1 mb-5 text-sm text-[#1F1A15]/55">Sphere power (SPH) at each exam. Values closer to zero mean milder short-sightedness.</p>
        <SphereChart data={CHECKUPS} />
      </Card>

      {/* records */}
      <section aria-labelledby="records">
        <h2 id="records" className="mb-4 text-lg font-semibold tracking-tight">Exam records</h2>
        <ul className="space-y-3">
          {CHECKUPS.map((c) => {
            const isOpen = open === c.id;
            return (
              <li key={c.id}>
                <Card>
                  <button
                    onClick={() => setOpen(isOpen ? null : c.id)}
                    aria-expanded={isOpen}
                    aria-controls={`rec-${c.id}`}
                    className="flex w-full items-center gap-4 p-5 text-left sm:p-6"
                  >
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#F1E7D8] text-[#8A6A4A]"><Eye size={20} /></span>
                    <span className="min-w-0 flex-1">
                      <b className="block font-semibold">{fmtDate(c.date, { day: "numeric", month: "long", year: "numeric" })}</b>
                      <span className="text-sm text-[#1F1A15]/60">{c.headline} · {c.clinician}</span>
                    </span>
                    <span className="hidden text-sm tabular-nums text-[#1F1A15]/60 sm:block">OD {rx(c.od.sph)} · OS {rx(c.os.sph)}</span>
                    <ChevronDown size={18} className={`shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </button>

                  {isOpen && (
                    <div id={`rec-${c.id}`} className="border-t border-[#E6D9C6] p-5 sm:p-6">
                      <div className="grid gap-6 lg:grid-cols-2">
                        <div>
                          <RxTable od={c.od} os={c.os} pd={c.pd} />
                          <dl className="mt-5 grid grid-cols-2 gap-3">
                            <Fact label="Visual acuity (OD / OS)" value={`${c.acuity.od} / ${c.acuity.os}`} />
                            <Fact label="Eye pressure (OD / OS)" value={`${c.iop.od} / ${c.iop.os} mmHg`} />
                          </dl>
                        </div>
                        <div>
                          <p className="text-xs font-medium tracking-[0.18em] text-[#8A6A4A] uppercase">Clinician notes</p>
                          <p className="mt-3 rounded-2xl bg-[#FBF6EE] p-5 text-[15px] leading-relaxed text-[#1F1A15]/75">{c.notes}</p>
                          <p className="mt-4 text-sm text-[#1F1A15]/55">Recommended follow-up: <b className="text-[#1F1A15]">{fmtDate(c.nextDue, { day: "numeric", month: "long", year: "numeric" })}</b></p>
                          <Button variant="secondary" className="mt-5" onClick={() => download(c)}><Download size={15} /> Download report</Button>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              </li>
            );
          })}
        </ul>
      </section>

      <Toast message={toast} onDone={() => setToast(null)} />
    </div>
  );
}