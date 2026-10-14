import { Card, SectionTitle } from '@/components/portal/UI'
import { fmtDate, money } from '@/lib/format'
import { Transaction } from '@/lib/portal-data'
import { allRoutes } from '@/routes/routes'
import { ArrowRight, Receipt } from 'lucide-react'
import Link from 'next/link'

const DashboardRecentTransactions = ({recent}:{recent: Transaction[]}) => {
  return (
      <Card className="p-6">
            <SectionTitle
              title="Recent transactions"
              action={
                <Link
                  href={allRoutes.PORTAL + allRoutes.TRANSACTIONS}
                  className="flex items-center gap-1.5 text-sm font-medium"
                >
                  All transactions <ArrowRight size={14} />
                </Link>
              }
            />
            <ul className="mt-4 divide-y divide-[#E6D9C6]">
              {recent.map((t) => (
                <li key={t.id} className="flex items-center gap-4 py-3.5">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#F1E7D8] text-[#8A6A4A]">
                    <Receipt size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {t.description}
                    </p>
                    <p className="text-xs text-[#1F1A15]/50">
                      {fmtDate(t.date)} · {t.method}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold tabular-nums">
                      {money(t.amount)}
                    </p>
                    <p
                      className={`text-xs ${t.status === "paid" ? "text-[#3B5A2C]" : t.status === "pending" ? "text-[#8A5A12]" : "text-[#8E3524]"}`}
                    >
                      {t.status[0].toUpperCase() + t.status.slice(1)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
  )
}

export default DashboardRecentTransactions