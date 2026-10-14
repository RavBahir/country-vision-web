import { Card, SectionTitle, StepTracker } from '@/components/portal/UI'
import { fmtDate, money } from '@/lib/format'
import { Order, ORDER_STEPS } from '@/lib/portal-data'
import { allRoutes } from '@/routes/routes'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

const DashboardOrders = ({activeOrders}:{activeOrders: Order[]}) => {
  return (
           <Card className="p-6">
            <SectionTitle
              title="Orders in progress"
              action={
                <Link
                  href={allRoutes.PORTAL + allRoutes.CATALOG}
                  className="flex items-center gap-1.5 text-sm font-medium"
                >
                  Catalog <ArrowRight size={14} />
                </Link>
              }
            />
            {activeOrders.length === 0 ? (
              <p className="mt-4 text-sm text-[#1F1A15]/55">
                No active orders. Browse the catalog to start one.
              </p>
            ) : (
              activeOrders.map((o) => (
                <div
                  key={o.id}
                  className="mt-5 rounded-2xl border border-[#E6D9C6] bg-[#FBF6EE] p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold">{o.title}</p>
                      <p className="mt-1 text-sm text-[#1F1A15]/55">
                        {o.id} · Estimated ready{" "}
                        {fmtDate(o.eta, { day: "numeric", month: "long" })}
                      </p>
                    </div>
                    <p className="font-semibold">{money(o.total)}</p>
                  </div>
                  <div className="mt-6">
                    <StepTracker steps={ORDER_STEPS} current={o.step} />
                  </div>
                </div>
              ))
            )}
          </Card>
  )
}

export default DashboardOrders