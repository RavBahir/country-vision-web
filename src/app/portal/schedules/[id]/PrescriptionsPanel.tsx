// app/portal/schedule/[id]/PrescriptionsPanel.tsx
"use client";

import { Badge, Button, Card } from "@/components/portal/UI";
import { fmtDate } from "@/lib/format";
import { useVoidPrescription } from "@/modules/appointments/common/staff-api";
import type { IEyeRx, IPrescription } from "@/modules/appointments/common/staff";

const f = (v: number | null, signed = true) =>
  v === null ? "–" : `${signed && v > 0 ? "+" : ""}${v.toFixed(2)}`;

function EyeRow({ label, e }: { label: string; e: IEyeRx }) {
  return (
    <tr>
      <th scope="row" className="py-1 pr-3 text-left font-semibold">{label}</th>
      <td className="px-2 text-center tabular-nums">{f(e.sphere)}</td>
      <td className="px-2 text-center tabular-nums">{f(e.cylinder)}</td>
      <td className="px-2 text-center tabular-nums">{e.axis ?? "–"}</td>
      <td className="px-2 text-center tabular-nums">{f(e.add)}</td>
      <td className="px-2 text-center tabular-nums">{e.prism !== null ? `${f(e.prism, false)} ${e.base ?? ""}` : "–"}</td>
      <td className="px-2 text-center tabular-nums">{e.pd ?? "–"}</td>
    </tr>
  );
}

export function RxCard({
  rx, canVoid, onMessage,
}: { rx: IPrescription; canVoid: boolean; onMessage: (m: string) => void }) {
  const voidRx = useVoidPrescription();

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-medium capitalize">{rx.type.replace("_", " ")}</p>
        <div className="flex items-center gap-2">
          {rx.expired && <Badge tone="warn">Expired</Badge>}
          {canVoid && (
            <Button
              variant="danger" disabled={voidRx.isPending}
              onClick={() => {
                if (!confirm("Void this prescription? This can't be undone.")) return;
                voidRx.mutate(rx.id, {
                  onSuccess: () => onMessage("Prescription voided."),
                  onError: (e) => onMessage(e.message),
                });
              }}
            >
              Void
            </Button>
          )}
        </div>
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-104 text-sm">
          <thead>
            <tr className="text-[11px] tracking-wide text-[#1F1A15]/50 uppercase">
              <th /><th>Sph</th><th>Cyl</th><th>Axis</th><th>Add</th><th>Prism</th><th>PD</th>
            </tr>
          </thead>
          <tbody>
            <EyeRow label="OD" e={rx.right} />
            <EyeRow label="OS" e={rx.left} />
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-[#1F1A15]/55">
        Issued {fmtDate(rx.issuedAt.slice(0, 10), { day: "numeric", month: "long", year: "numeric" })}
        {rx.issuedBy ? ` by ${rx.issuedBy.name}` : ""}
        {rx.expiresAt ? ` · expires ${fmtDate(rx.expiresAt.slice(0, 10), { day: "numeric", month: "short", year: "numeric" })}` : ""}
        {rx.pdDistance ? ` · PD ${rx.pdDistance} mm` : ""}
      </p>
      {rx.notes && <p className="mt-2 rounded-xl bg-[#FBF6EE] px-3 py-2 text-sm">{rx.notes}</p>}
    </Card>
  );
}