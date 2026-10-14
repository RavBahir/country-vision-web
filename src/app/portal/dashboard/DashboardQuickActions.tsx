import { Card, SectionTitle } from '@/components/portal/UI'
import React from 'react'
import { QUICK } from './common'
import Link from 'next/link'

const DashboardQuickActions = () => {
  return (
    <Card className="p-6">
            <SectionTitle title="Quick actions" />
            <ul className="mt-4 grid grid-cols-2 gap-3">
              {QUICK.map((q) => (
                <li key={q.label}>
                  <Link
                    href={q.href}
                    className="flex h-full flex-col gap-3 rounded-2xl border border-[#E6D9C6] bg-[#FBF6EE] p-4 transition-colors hover:bg-[#F1E7D8]"
                  >
                    <q.icon size={18} className="text-[#8A6A4A]" />
                    <span>
                      <b className="block text-sm font-semibold">{q.label}</b>
                      <span className="text-xs text-[#1F1A15]/55">{q.sub}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
  )
}

export default DashboardQuickActions