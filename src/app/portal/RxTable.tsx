import { rx } from "@/lib/format";
import type { EyeRx } from "@/lib/portal-data";

export default function RxTable({ od, os, pd, dark }: { od: EyeRx; os: EyeRx; pd?: number; dark?: boolean }) {
  const head = dark ? "text-white/45" : "text-[#1F1A15]/45";
  const line = dark ? "border-white/10" : "border-[#E6D9C6]";
  const rows: [string, EyeRx][] = [["OD", od], ["OS", os]];
  return (
    <div>
      <table className="w-full text-left text-sm">
        <caption className="sr-only">Prescription values</caption>
        <thead>
          <tr className={`text-[11px] tracking-[0.16em] uppercase ${head}`}>
            <th scope="col" className="pb-2 font-medium">Eye</th>
            <th scope="col" className="pb-2 font-medium">Sph</th>
            <th scope="col" className="pb-2 font-medium">Cyl</th>
            <th scope="col" className="pb-2 font-medium">Axis</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([eye, v]) => (
            <tr key={eye} className={`border-t ${line}`}>
              <th scope="row" className="py-3 font-semibold">{eye}</th>
              <td className="py-3 tabular-nums">{rx(v.sph)}</td>
              <td className="py-3 tabular-nums">{rx(v.cyl)}</td>
              <td className="py-3 tabular-nums">{v.axis}°</td>
            </tr>
          ))}
        </tbody>
      </table>
      {pd && <p className={`mt-1 border-t pt-3 text-sm ${line} ${dark ? "text-white/60" : "text-[#1F1A15]/60"}`}>Pupillary distance (PD): <b className={dark ? "text-white" : "text-[#1F1A15]"}>{pd} mm</b></p>}
    </div>
  );
}