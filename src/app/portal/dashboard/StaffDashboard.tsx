// app/portal/dashboard/StaffDashboard.tsx
"use client";

import { Badge, Button, ButtonLink, Card, EmptyState, PageHeader, SectionTitle } from "@/components/portal/UI";
import { fmtDate, fmtTime } from "@/lib/format";
import { usePerms } from "@/lib/use-perms";
import { AlertTriangle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { greeting } from "./common";
import StatTile, { TilesSkeleton } from "./StatTile";
import { IStaffAppointment } from "@/modules/appointments/common/staff";
import { SCHEDULE_ROUTE, STAFF_STATUS_LABEL, STATUS_TONE, TYPE_LABEL } from "../schedules/common";
import { useStaffDashboard } from "@/modules/dashboard/common/dashboard-api";

function ApptRow({ a }: { a: IStaffAppointment }) {
  return (
    <li>
      <Link
        href={`${SCHEDULE_ROUTE}/${a.id}`}
        className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0 hover:opacity-80"
      >
        <b className="w-16 shrink-0 text-sm tabular-nums">{fmtTime(a.time)}</b>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">{a.customer.name}</span>
          <span className="block truncate text-xs text-[#1F1A15]/50">
            {TYPE_LABEL[a.type]} · {a.optometrist?.name ?? "Unassigned"}
          </span>
        </span>
        <Badge tone={STATUS_TONE[a.status]}>{STAFF_STATUS_LABEL[a.status]}</Badge>
      </Link>
    </li>
  );
}

export default function StaffDashboard({ name }: { name: string }) {
  const { can } = usePerms();
  const { data, isPending, isError, error, refetch } = useStaffDashboard(true);

  const s = data?.stats;
  const max = Math.max(1, ...(data?.week?.map((d) => d.count) ?? [0]));
  const tiles = s
    ? [
        s.todayCount !== null && { label: "Visits today", value: s.todayCount, note: s.mineToday ? `${s.mineToday} assigned to you` : undefined, dark: true },
        s.pendingCount !== null && { label: "Needs approval", value: s.pendingCount, note: s.pendingCount ? "Customer requests waiting" : "All caught up" },
        s.customers !== null && { label: "Active customers", value: s.customers, note: s.newCustomers ? `${s.newCustomers} new this month` : undefined },
        s.completedMonth !== null && { label: "Completed this month", value: s.completedMonth },
        s.staffCount !== null && { label: "Active staff", value: s.staffCount },
      ].filter(Boolean) as { label: string; value: number; note?: string; dark?: boolean }[]
    : [];

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Dashboard"
        title={<>{greeting()}, <span className="font-serif text-[1.1em] font-normal italic">{name}.</span></>}
        description={
          data?.scope.branchName
            ? `Clinic overview for ${data.scope.branchName}.`
            : "Clinic overview across all branches."
        }
        actions={
          can("canViewAppointments") ? (
            <ButtonLink href={SCHEDULE_ROUTE}>Open schedule <ArrowRight size={15} /></ButtonLink>
          ) : undefined
        }
      />

      {isPending ? (
        <TilesSkeleton />
      ) : isError ? (
        <EmptyState
          icon={AlertTriangle} title="Couldn't load the dashboard"
          text={error?.message || "Something went wrong."}
          action={<Button variant="secondary" onClick={() => refetch()}>Try again</Button>}
        />
      ) : (
        <>
          {tiles.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {tiles.slice(0, 4).map((t) => <StatTile key={t.label} {...t} />)}
            </div>
          )}

          <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
            <div className="space-y-6">
              {data.today && (
                <Card className="p-6">
                  <SectionTitle
                    title="Today's schedule"
                    action={<Link href={SCHEDULE_ROUTE} className="flex items-center gap-1.5 text-sm font-medium">View all <ArrowRight size={14} /></Link>}
                  />
                  {data.today.length === 0 ? (
                    <p className="mt-4 text-sm text-[#1F1A15]/55">No visits scheduled today.</p>
                  ) : (
                    <ul className="mt-5 divide-y divide-[#E6D9C6]">
                      {data.today.map((a) => <ApptRow key={a.id} a={a} />)}
                    </ul>
                  )}
                </Card>
              )}

              {data.week && (
                <Card className="p-6">
                  <SectionTitle title="Next 7 days" />
                  <div className="mt-6 flex h-40 items-end gap-3" role="img"
                    aria-label={`Appointments per day: ${data.week.map((d) => `${fmtDate(d.date, { weekday: "short" })} ${d.count}`).join(", ")}`}>
                    {data.week.map((d, i) => (
                      <div key={d.date} className="flex h-full flex-1 flex-col justify-end gap-2 text-center">
                        <span className="text-xs tabular-nums text-[#1F1A15]/60">{d.count}</span>
                        <div
                          className={`w-full rounded-t-xl ${i === 0 ? "bg-[#8A6A4A]" : "bg-[#E6D9C6]"}`}
                          style={{ height: `${Math.max(4, (d.count / max) * 100)}%` }}
                        />
                        <span className="text-[11px] text-[#1F1A15]/50">{fmtDate(d.date, { weekday: "short" })}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>

            <div className="space-y-6">
              {data.pending && (
                <Card className="p-6">
                  <SectionTitle title="Needs approval" />
                  {data.pending.length === 0 ? (
                    <p className="mt-4 text-sm text-[#1F1A15]/55">No requests waiting.</p>
                  ) : (
                    <ul className="mt-4 divide-y divide-[#E6D9C6]">
                      {data.pending.map((a) => (
                        <li key={a.id}>
                          <Link href={`${SCHEDULE_ROUTE}/${a.id}`} className="block py-3 first:pt-0 last:pb-0 hover:opacity-80">
                            <span className="block text-sm font-medium">{a.customer.name}</span>
                            <span className="block text-xs text-[#1F1A15]/50">
                              {fmtDate(a.date, { day: "numeric", month: "short" })} · {fmtTime(a.time)} · {TYPE_LABEL[a.type]}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </Card>
              )}

              <Card className="p-6">
                <SectionTitle title="Quick actions" />
                <ul className="mt-4 grid gap-2 text-sm font-medium">
                  {can("canViewAppointments") && <li><Link className="block rounded-2xl border border-[#E6D9C6] bg-[#FBF6EE] px-4 py-3 hover:bg-[#F1E7D8]" href={SCHEDULE_ROUTE}>Manage appointments</Link></li>}
                  {can("canViewCustomers") && <li><Link className="block rounded-2xl border border-[#E6D9C6] bg-[#FBF6EE] px-4 py-3 hover:bg-[#F1E7D8]" href="/portal/customers">Customers</Link></li>}
                  {can("canViewUsers") && <li><Link className="block rounded-2xl border border-[#E6D9C6] bg-[#FBF6EE] px-4 py-3 hover:bg-[#F1E7D8]" href="/portal/users">Staff</Link></li>}
                </ul>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}