import { Kicker } from '@/components/portal/UI'
import { rx } from '@/lib/format'
import { Checkup } from '@/lib/portal-data'
import { allRoutes } from '@/routes/routes'
import Link from 'next/link'

const DashboardReorderCard = ({last}:{last: Checkup}) => {
  return (
      <div className="rounded-3xl bg-[#12100D] p-6 text-white">
            <Kicker light>Prescription on file</Kicker>
            <h2 className="mt-3 text-2xl font-semibold leading-tight tracking-tight">
              Reorder lenses in one tap.
            </h2>
            <p className="mt-2 text-sm text-white/60">
              OD {rx(last.od.sph)} · OS {rx(last.os.sph)} is saved and ready at
              checkout.
            </p>
            <Link
              href={allRoutes.PORTAL + allRoutes.CATALOG}
              className="mt-5 inline-flex rounded-full bg-[#FAF5EE] px-5 py-3 text-sm font-medium text-[#1F1A15]"
            >
              Start an order
            </Link>
          </div>
  )
}

export default DashboardReorderCard