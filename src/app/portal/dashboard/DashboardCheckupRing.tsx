import { ButtonLink, Card, Kicker } from '@/components/portal/UI'
import React from 'react'
import { CheckupRing } from './common'
import { fmtDate } from '@/lib/format'
import { allRoutes } from '@/routes/routes'
import { Checkup } from '@/lib/portal-data'

const DashboardCheckupRing = ({last, elapsed, cycle, dueIn}:{dueIn: number, cycle: number, elapsed: number, last: Checkup}) => {
  return (
     <Card className="flex flex-col items-center p-6 text-center">
                <Kicker>Eye health</Kicker>
                <div className="mt-4">
                  <CheckupRing elapsed={elapsed} total={cycle} left={dueIn} />
                </div>
                <p className="mt-4 font-semibold">
                  Next checkup{" "}
                  {fmtDate(last.nextDue, { day: "numeric", month: "long" })}
                </p>
                <p className="mt-1 text-sm text-[#1F1A15]/55">
                  Your last exam was{" "}
                  {fmtDate(last.date, {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                  .
                </p>
                <ButtonLink href={allRoutes.PORTAL + allRoutes.CHECKUPS} variant="secondary" className="mt-5">
                  View checkup history
                </ButtonLink>
              </Card>
  )
}

export default DashboardCheckupRing