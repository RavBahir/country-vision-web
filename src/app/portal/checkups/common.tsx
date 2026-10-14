import { fmtDate, rx } from "@/lib/format";
import { Checkup } from "@/lib/portal-data";
import { SetStateAction } from "react";

export function SphereChart({ data }: { data: Checkup[] }) {
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

export function CheckupFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-[#FBF6EE] p-4">
      <dt className="text-xs text-[#1F1A15]/50">{label}</dt>
      <dd className="mt-1 font-semibold">{value}</dd>
    </div>
  );
}
 export const checkout_download = ({c, setToast}:{c: Checkup, setToast: (value: SetStateAction<string | null>) => void}) => {
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
