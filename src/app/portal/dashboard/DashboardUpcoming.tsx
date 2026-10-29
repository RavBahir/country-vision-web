import { Badge, Card, SectionTitle } from "@/components/portal/UI"
import { fmtDate, fmtTime, parseISO } from "@/lib/format"
import { IAppointment } from "@/lib/portal-data"
import { allRoutes } from "@/routes/routes"
import { ArrowRight, Clock, MapPin } from "lucide-react"
import Link from "next/link"

const DashboardUpcoming = ({upcoming}:{upcoming: IAppointment[]}) => {
  return (
          <Card className="p-6">
            <SectionTitle
              title="Upcoming appointments"
              action={
                <Link
                  href={allRoutes.PORTAL + allRoutes.APPOINTMENTS}
                  className="flex items-center gap-1.5 text-sm font-medium"
                >
                  View all <ArrowRight size={14} />
                </Link>
              }
            />
            <ul className="mt-5 divide-y divide-[#E6D9C6]">
              {upcoming.slice(0, 3).map((a) => (
                <li
                  key={a.id}
                  className="flex flex-wrap items-center gap-4 py-4 first:pt-0 last:pb-0"
                >
                  <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-[#F1E7D8] text-center leading-none">
                    <span>
                      <b className="block text-xl font-semibold">
                        {parseISO(a.date).getDate()}
                      </b>
                      <span className="mt-1 block text-[11px] tracking-wide text-[#8A6A4A] uppercase">
                        {fmtDate(a.date, { month: "short" })}
                      </span>
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{a.type}</p>
                    <p className="mt-1 flex flex-wrap gap-x-4 text-sm text-[#1F1A15]/60">
                      <span className="flex items-center gap-1.5">
                        <Clock size={13} /> {fmtTime(a.time)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin size={13} /> {a.clinician}
                      </span>
                    </p>
                  </div>
                  <Badge tone={a.status === "confirmed" ? "success" : "warn"}>
                    {a.status === "confirmed" ? "Confirmed" : "Pending"}
                  </Badge>
                </li>
              ))}
              {upcoming.length === 0 && (
                <li className="py-4 text-sm text-[#1F1A15]/55">
                  No upcoming appointments.
                </li>
              )}
            </ul>
          </Card>
  )
}

export default DashboardUpcoming