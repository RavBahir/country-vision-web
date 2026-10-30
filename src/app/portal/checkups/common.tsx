// app/portal/checkups/common.tsx  (chart + fact tile)
import { fmtDate } from "@/lib/format";
import { ICheckup, power } from "@/modules/checkups/common/checkups";

type Eye = "right" | "left";

export function SphereChart({ data }: { data: ICheckup[] }) {
  const pts = data
    .filter((c) => c.prescription)
    .sort((a, b) => a.date.localeCompare(b.date));
  const val = (p: ICheckup, e: Eye) => p.prescription![e].sphere;
  const vals = pts.flatMap((p) => [val(p, "right"), val(p, "left")]).filter((v): v is number => v !== null);

  if (vals.length === 0) {
    return <p className="text-sm text-[#1F1A15]/55">The chart appears once a prescription has been recorded.</p>;
  }

  const W = 640, H = 250, padL = 48, padR = 24, padT = 20, padB = 38;
  const min = Math.floor((Math.min(...vals) - 0.25) * 4) / 4;
  const max = Math.ceil((Math.max(...vals) + 0.25) * 4) / 4;
  const span = max - min || 1;
  const x = (i: number) => padL + (pts.length === 1 ? 0 : (i * (W - padL - padR)) / (pts.length - 1));
  const y = (v: number) => padT + ((max - v) * (H - padT - padB)) / span;

  const path = (e: Eye) =>
    pts
      .map((p, i) => ({ i, v: val(p, e) }))
      .filter((n): n is { i: number; v: number } => n.v !== null)
      .map((n, k) => `${k === 0 ? "M" : "L"}${x(n.i).toFixed(1)},${y(n.v).toFixed(1)}`)
      .join(" ");

  const ticks: number[] = [];
  for (let t = Math.ceil(min * 2) / 2; t <= max + 1e-9; t += 0.5) ticks.push(t);

  const label = `Sphere power over ${pts.length} exam${pts.length === 1 ? "" : "s"}, from ${fmtDate(pts[0].date, { month: "short", year: "numeric" })} to ${fmtDate(pts[pts.length - 1].date, { month: "short", year: "numeric" })}.`;
  const EYES: { eye: Eye; color: string }[] = [
    { eye: "right", color: "#8A6A4A" },
    { eye: "left", color: "#1F1A15" },
  ];

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} className="h-auto w-full">
        {ticks.map((t) => (
          <g key={t}>
            <line x1={padL} x2={W - padR} y1={y(t)} y2={y(t)} stroke="#E6D9C6" strokeDasharray="4 6" />
            <text x={padL - 10} y={y(t) + 4} textAnchor="end" fontSize="12" fill="#1F1A15" opacity="0.5">{power(t)}</text>
          </g>
        ))}
        {EYES.map(({ eye, color }) => (
          <path key={eye} d={path(eye)} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        ))}
        {pts.map((p, i) => (
          <g key={p.id}>
            {EYES.map(({ eye, color }) => {
              const v = val(p, eye);
              return v === null ? null : (
                <circle key={eye} cx={x(i)} cy={y(v)} r="5" fill="#fff" stroke={color} strokeWidth="2.5" />
              );
            })}
            <text x={x(i)} y={H - 12} textAnchor="middle" fontSize="12" fill="#1F1A15" opacity="0.55">
              {fmtDate(p.date, { month: "short", year: "2-digit" })}
            </text>
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
