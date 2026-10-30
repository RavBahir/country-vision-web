// app/portal/checkups/CheckupRx.tsx
import { IPrescription } from "@/modules/appointments/common/staff";
import { power } from "@/modules/checkups/common/checkups";

export default function CheckupRx({ rx, dark }: { rx: IPrescription; dark?: boolean }) {
  const line = dark ? "border-white/15" : "border-[#E6D9C6]";
  const muted = dark ? "text-white/55" : "text-[#1F1A15]/50";
  const Row = ({ label, e }: { label: string; e: IPrescription["right"] }) => (
    <tr className={`border-t ${line}`}>
      <th scope="row" className="py-2 pr-3 text-left font-semibold">{label}</th>
      <td className="px-2 text-center tabular-nums">{power(e.sphere)}</td>
      <td className="px-2 text-center tabular-nums">{power(e.cylinder)}</td>
      <td className="px-2 text-center tabular-nums">{e.axis ?? "–"}</td>
      <td className="px-2 text-center tabular-nums">{e.add !== null ? power(e.add) : "–"}</td>
    </tr>
  );
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className={`text-[11px] tracking-wide uppercase ${muted}`}>
            <th /><th>Sph</th><th>Cyl</th><th>Axis</th><th>Add</th>
          </tr>
        </thead>
        <tbody>
          <Row label="OD" e={rx.right} />
          <Row label="OS" e={rx.left} />
        </tbody>
      </table>
      {rx.pdDistance && <p className={`mt-2 text-xs ${muted}`}>PD {rx.pdDistance} mm</p>}
    </div>
  );
}