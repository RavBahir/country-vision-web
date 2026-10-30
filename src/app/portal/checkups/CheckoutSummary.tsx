// app/portal/checkups/CheckoutSummary.tsx
import { Badge, Card, Kicker } from "@/components/portal/UI";
import { fmtDate } from "@/lib/format";
import { CalendarCheck, Stethoscope } from "lucide-react";
import CheckupRx from "./CheckupRx";
import { ICheckup, TYPE_LABEL } from "@/modules/checkups/common/checkups";

const long = { day: "numeric", month: "long", year: "numeric" } as const;

export default function CheckoutSummary({
  last, dueIn, dueDate, recommended, current,
}: {
  last: ICheckup;
  dueIn: number;
  dueDate: string;
  recommended: boolean;
  /** Most recent checkup that produced a prescription, possibly an earlier visit */
  current: ICheckup | null;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="p-6">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#F1E7D8] text-[#8A6A4A]"><Stethoscope size={18} /></span>
        <p className="mt-4 text-sm text-[#1F1A15]/55">Last checkup</p>
        <p className="mt-1 text-2xl font-semibold tracking-tight">{fmtDate(last.date, long)}</p>
        <p className="mt-1 text-sm text-[#1F1A15]/60">{last.clinician ?? "Optometrist"} · {TYPE_LABEL[last.type]}</p>
      </Card>

      <Card className="p-6">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#F1E7D8] text-[#8A6A4A]"><CalendarCheck size={18} /></span>
        <p className="mt-4 text-sm text-[#1F1A15]/55">{recommended ? "Follow-up recommended" : "Next checkup due"}</p>
        <p className="mt-1 text-2xl font-semibold tracking-tight">{fmtDate(dueDate, long)}</p>
        <p className="mt-1 text-sm text-[#1F1A15]/60">
          {dueIn > 0 ? `In ${dueIn} days. ` : "Due now. "}
          <Badge tone={dueIn <= 14 ? "warn" : "success"}>{dueIn <= 14 ? "Book soon" : "On track"}</Badge>
        </p>
      </Card>

      <div className="rounded-3xl bg-[#12100D] p-6 text-white">
        <Kicker light>Current prescription</Kicker>
        {current?.prescription ? (
          <div className="mt-3">
            <CheckupRx rx={current.prescription} dark />
            {current.prescription.expired && <p className="mt-2 text-xs text-[#C9A57B]">This prescription has expired. Book a checkup to renew it.</p>}
          </div>
        ) : (
          <p className="mt-3 text-sm text-white/60">No prescription on file yet.</p>
        )}
      </div>
    </div>
  );
}