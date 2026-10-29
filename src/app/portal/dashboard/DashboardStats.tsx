import { StatCard } from '@/components/portal/UI'
import { fmtDate, fmtTime, rx } from '@/lib/format'
import { IAppointment, Checkup, Order } from '@/lib/portal-data'
import { CalendarCheck, Clock, Eye, Package } from 'lucide-react'

const DashboardStats = ({next,last, activeOrders, dueIn}:{next: IAppointment, activeOrders: Order[], last: Checkup, dueIn: number}) => {
  return (
       <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={CalendarCheck}
          label="Next appointment"
          value={
            next
              ? fmtDate(next.date, {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                })
              : "None booked"
          }
          sub={
            next
              ? `${fmtTime(next.time)} · ${next.type}`
              : "Book your next visit"
          }
        />
        <StatCard
          icon={Package}
          label="Active orders"
          value={String(activeOrders.length)}
          sub={
            activeOrders[0]
              ? `${activeOrders[0].id} ready ~${fmtDate(activeOrders[0].eta, { day: "numeric", month: "short" })}`
              : "Nothing in progress"
          }
        />
        <StatCard
          icon={Eye}
          label="Current prescription"
          value={`OD ${rx(last.od.sph)}`}
          sub={`OS ${rx(last.os.sph)} · updated ${fmtDate(last.date, { month: "short", year: "numeric" })}`}
        />
        <StatCard
          icon={Clock}
          label="Checkup due"
          value={dueIn > 0 ? `In ${dueIn} days` : "Due now"}
          sub={`Recommended by ${last.clinician}`}
        />
      </div>
  )
}

export default DashboardStats