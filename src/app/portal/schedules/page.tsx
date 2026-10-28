// app/portal/schedule/page.tsx
"use client";

import {
  Badge, Button, Card, EmptyState, inputCls, PageHeader, Segmented, Toast,
} from "@/components/portal/UI";
import { fmtDate, fmtTime, toISO } from "@/lib/format";
import { usePerms } from "@/lib/use-perms";
import { useStaffAppointments } from "@/pages/appointments/common/staff-api";
import type { ApptStatus } from "@/pages/appointments/common/appointments";
import type { IApptFilters, IStaffAppointment } from "@/pages/appointments/common/staff";
import { AlertTriangle, CalendarCheck, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { AssignModal } from "./AssignModal";
import StaffBookingModal from "./StaffBookingModal";
import {
  SCHEDULE_ROUTE, STAFF_STATUS_LABEL, STATUS_TONE, TYPE_LABEL, useDebounced,
} from "./common";

type Tab = "pending" | "today" | "upcoming" | "all";

export default function SchedulePage() {
  const { can, userId } = usePerms();
  const [tab, setTab] = useState<Tab>("today");
  const [status, setStatus] = useState<"all" | ApptStatus>("all");
  const [mine, setMine] = useState(false);
  const [search, setSearch] = useState("");
  const q = useDebounced(search.trim());

  const [booking, setBooking] = useState(false);
  const [approving, setApproving] = useState<IStaffAppointment | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const today = toISO(new Date());

  const filters = useMemo<IApptFilters>(
    () => ({
      ...(tab === "pending" ? { status: "pending" as const }
        : tab === "today" ? { from: today, to: today }
        : tab === "upcoming" ? { from: today }
        : {}),
      ...(status !== "all" && tab !== "pending" ? { status } : {}),
      ...(mine ? { mine: true } : {}),
      ...(q ? { search: q } : {}),
    }),
    [tab, status, mine, q, today],
  );

  const { data, isPending, isError, error, refetch, isFetching } = useStaffAppointments(filters);

  const rows = useMemo(() => {
    const all = data ?? [];
    // Hide cancelled and no-shows from forward-looking views unless asked for
    return (tab === "today" || tab === "upcoming") && status === "all"
      ? all.filter((a) => a.status !== "cancelled" && a.status !== "no_show")
      : all;
  }, [data, tab, status]);

  const canApprove = can("canUpdateAppointments");

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Schedule"
        title="Appointments"
        description="Approve requests, assign optometrists and run the day's visits."
        actions={
          can("canCreateAppointments") ? (
            <Button onClick={() => setBooking(true)}>
              <Plus size={16} /> Book appointment
            </Button>
          ) : undefined
        }
      />

      <Segmented<Tab>
        label="View"
        value={tab}
        onChange={setTab}
        options={[
          { value: "pending", label: "Needs approval" },
          { value: "today", label: "Today" },
          { value: "upcoming", label: "Upcoming" },
          { value: "all", label: "All" },
        ]}
      />

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative min-w-55 flex-1 sm:max-w-xs">
          <Search size={16} aria-hidden className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-[#1F1A15]/45" />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customer, email or code" aria-label="Search appointments"
            className={`${inputCls} pl-11`}
          />
        </div>

        {tab !== "pending" && (
          <select
            value={status} onChange={(e) => setStatus(e.target.value as "all" | ApptStatus)}
            aria-label="Filter by status" className={`${inputCls} w-auto`}
          >
            <option value="all">All statuses</option>
            {(Object.keys(STAFF_STATUS_LABEL) as ApptStatus[]).map((s) => (
              <option key={s} value={s}>{STAFF_STATUS_LABEL[s]}</option>
            ))}
          </select>
        )}

        {userId && (
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input type="checkbox" checked={mine} onChange={(e) => setMine(e.target.checked)} className="h-4 w-4 accent-[#1F1A15]" />
            Assigned to me
          </label>
        )}

        {isFetching && !isPending && <span role="status" className="text-xs text-[#1F1A15]/50 md:ml-auto">Refreshing…</span>}
      </div>

      {isPending ? (
        <div aria-busy="true" className="space-y-3">
          {[0, 1, 2, 3].map((i) => <div key={i} className="h-16 animate-pulse rounded-2xl bg-[#F1E7D8]" />)}
        </div>
      ) : isError ? (
        <EmptyState
          icon={AlertTriangle} title="Couldn't load appointments"
          text={error?.message || "Something went wrong."}
          action={<Button variant="secondary" onClick={() => refetch()}>Try again</Button>}
        />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title={tab === "pending" ? "Nothing waiting for approval" : "No appointments found"}
          text={tab === "pending" ? "New requests from customers will appear here." : "Try a different view or filter."}
        />
      ) : (
        <>
          <Card className="hidden overflow-hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <caption className="sr-only">Appointments</caption>
                <thead>
                  <tr className="border-b border-[#E6D9C6] bg-[#FBF6EE] text-[11px] tracking-[0.16em] text-[#1F1A15]/50 uppercase">
                    {["When", "Customer", "Type", "Optometrist", "Status"].map((h) => (
                      <th key={h} scope="col" className="px-6 py-4 font-medium">{h}</th>
                    ))}
                    <th scope="col" className="px-6 py-4"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((a) => (
                    <tr key={a.id} className="border-b border-[#E6D9C6] last:border-0 hover:bg-[#FBF6EE]/60">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <b className="block font-medium">{fmtTime(a.time)}</b>
                        <span className="text-xs text-[#1F1A15]/50">
                          {fmtDate(a.date, { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <b className="block font-medium">{a.customer.name}</b>
                        <span className="text-xs text-[#1F1A15]/45">{a.customer.code} · {a.code}</span>
                      </td>
                      <td className="px-6 py-4 text-[#1F1A15]/70">{TYPE_LABEL[a.type]}</td>
                      <td className="px-6 py-4 text-[#1F1A15]/70">{a.optometrist?.name ?? "Unassigned"}</td>
                      <td className="px-6 py-4"><Badge tone={STATUS_TONE[a.status]}>{STAFF_STATUS_LABEL[a.status]}</Badge></td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          {a.status === "pending" && canApprove && (
                            <Button variant="secondary" onClick={() => setApproving(a)}>Approve</Button>
                          )}
                          <Link
                            href={`${SCHEDULE_ROUTE}/${a.id}`}
                            className="grid h-10 place-items-center rounded-full border border-[#E6D9C6] px-4 text-sm font-medium hover:bg-[#F1E7D8]"
                          >
                            Open
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <ul className="space-y-3 md:hidden">
            {rows.map((a) => (
              <li key={a.id}>
                <Card className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{a.customer.name}</p>
                      <p className="mt-1 text-xs text-[#1F1A15]/50">
                        {fmtDate(a.date, { day: "numeric", month: "short" })} · {fmtTime(a.time)} · {TYPE_LABEL[a.type]}
                      </p>
                      <p className="mt-1 text-xs text-[#1F1A15]/50">{a.optometrist?.name ?? "Unassigned"}</p>
                    </div>
                    <Badge tone={STATUS_TONE[a.status]}>{STAFF_STATUS_LABEL[a.status]}</Badge>
                  </div>
                  <div className="mt-4 flex gap-2">
                    {a.status === "pending" && canApprove && (
                      <Button variant="secondary" className="flex-1" onClick={() => setApproving(a)}>Approve</Button>
                    )}
                    <Link
                      href={`${SCHEDULE_ROUTE}/${a.id}`}
                      className="grid h-11 flex-1 place-items-center rounded-full border border-[#E6D9C6] text-sm font-medium"
                    >
                      Open
                    </Link>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        </>
      )}

      {booking && (
        <StaffBookingModal
          initial={null}
          onClose={() => setBooking(false)}
          onSaved={(m) => { setBooking(false); setToast(m); }}
        />
      )}
      {approving && (
        <AssignModal
          appt={approving} mode="approve"
          onClose={() => setApproving(null)}
          onDone={(m) => { setApproving(null); setToast(m); }}
        />
      )}
      <Toast message={toast} onDone={() => setToast(null)} />
    </div>
  );
}