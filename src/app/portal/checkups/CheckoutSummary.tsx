import { Badge, Card, Kicker } from "@/components/portal/UI"
import { fmtDate } from "@/lib/format"
import { Checkup } from "@/lib/portal-data"
import { CalendarCheck, Stethoscope } from "lucide-react"
import RxTable from "../RxTable"

const CheckoutSummary = ({last, dueIn}:{last: Checkup, dueIn: number}) => {
  return (
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
  )
}

export default CheckoutSummary