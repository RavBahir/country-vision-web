// app/portal/calendar/page.tsx
"use client";

import { Badge, Button, ButtonLink, Card, EmptyState, SectionTitle } from "@/components/portal/UI";
import { fmtDate, fmtTime, TODAY, toISO } from "@/lib/format";
import { usePerms } from "@/lib/use-perms";
import { useSession } from "@/modules/auth/session";
import { STATUS_LABEL, STATUS_TONE, TYPE_LABEL } from "@/app/portal/appointments/common";
import { allRoutes } from "@/routes/routes";
import { AlertTriangle, ChevronLeft, ChevronRight, Clock, Plus } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { CalKind, ICalEvent } from "@/modules/calendar/common/calendar";
import { useCalendar } from "@/modules/calendar/common/calendar-api";
import { SCHEDULE_ROUTE, STAFF_STATUS_LABEL } from "../schedules/common";

const KINDS: Record<CalKind, { label: string; dot: string; chip: string }> = {
  appointment: { label: "Appointments", dot: "#C9A57B", chip: "bg-[#F1E7D8] text-[#5C4A36]" },
  followup: { label: "Follow-ups", dot: "#8FB070", chip: "bg-[#E4EBDD] text-[#3B5A2C]" },
};

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const CUSTOMER_APPTS = allRoutes.PORTAL + allRoutes.APPOINTMENTS;

export default function CalendarPage() {
  const { session } = useSession();
  const isStaff = session?.kind !== "customer";
  const { can, userId } = usePerms();

  const [cursor, setCursor] = useState({ y: TODAY.getFullYear(), m: TODAY.getMonth() });
  const [selected, setSelected] = useState(toISO(TODAY));
  const [visible, setVisible] = useState<CalKind[]>(["appointment", "followup"]);
  const [mine, setMine] = useState(false);
  const todayISO = toISO(TODAY);

  const from = toISO(new Date(cursor.y, cursor.m, 1));
  const to = toISO(new Date(cursor.y, cursor.m + 1, 0));
  const soon = toISO(new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate() + 30));

  const month = useCalendar(from, to, isStaff && mine);
  const ahead = useCalendar(todayISO, soon, isStaff && mine);

  const events = useMemo(
    () => (month.data ?? []).filter((e) => visible.includes(e.kind)),
    [month.data, visible],
  );
  const byDate = useMemo(() => {
    const map = new Map<string, ICalEvent[]>();
    events.forEach((e) => map.set(e.date, [...(map.get(e.date) ?? []), e]));
    map.forEach((list) => list.sort((a, b) => (a.time ?? "99").localeCompare(b.time ?? "99")));
    return map;
  }, [events]);

  const upcoming = useMemo(
    () =>
      (ahead.data ?? [])
        .filter((e) => visible.includes(e.kind))
        .sort((a, b) => (a.date + (a.time ?? "")).localeCompare(b.date + (b.time ?? "")))
        .slice(0, 5),
    [ahead.data, visible],
  );

  // month grid, Monday first
  const cells = useMemo(() => {
    const first = new Date(cursor.y, cursor.m, 1);
    const offset = (first.getDay() + 6) % 7;
    const days = new Date(cursor.y, cursor.m + 1, 0).getDate();
    const total = Math.ceil((offset + days) / 7) * 7;
    return Array.from({ length: total }, (_, i) => {
      const d = i - offset + 1;
      return d >= 1 && d <= days ? new Date(cursor.y, cursor.m, d) : null;
    });
  }, [cursor]);

  const monthLabel = new Date(cursor.y, cursor.m, 1).toLocaleDateString("en-GB", { month: "long", year: "numeric" });

  const showMonth = (y: number, m: number, day?: string) => {
    setCursor({ y, m });
    const inThisMonth = y === TODAY.getFullYear() && m === TODAY.getMonth();
    setSelected(day ?? (inThisMonth ? todayISO : toISO(new Date(y, m, 1))));
  };
  const move = (delta: number) => {
    const d = new Date(cursor.y, cursor.m + delta, 1);
    showMonth(d.getFullYear(), d.getMonth());
  };
  const toggle = (k: CalKind) => setVisible((v) => (v.includes(k) ? v.filter((x) => x !== k) : [...v, k]));

  /* ---- labels and links that depend on who is looking ---- */
  const title = (e: ICalEvent) =>
    e.kind === "followup"
      ? isStaff ? `Follow-up: ${e.customerName}` : "Follow-up checkup"
      : isStaff ? `${e.customerName}` : TYPE_LABEL[e.type!];
  const sub = (e: ICalEvent) =>
    e.kind === "followup"
      ? "Recommended by your optometrist"
      : isStaff ? `${TYPE_LABEL[e.type!]}${e.clinician ? ` · ${e.clinician}` : ""}` : e.clinician ?? "Optometrist to be assigned";
  const href = (e: ICalEvent) => (isStaff ? `${SCHEDULE_ROUTE}/${e.appointmentId}` : CUSTOMER_APPTS);
  const statusLabel = (s: NonNullable<ICalEvent["status"]>) => (isStaff ? STAFF_STATUS_LABEL[s as keyof typeof STAFF_STATUS_LABEL] : STATUS_LABEL[s as keyof typeof STATUS_LABEL]);

  const bookHref = isStaff ? SCHEDULE_ROUTE : CUSTOMER_APPTS;
  const canBook = !isStaff || can("canCreateAppointments");
  const dayEvents = byDate.get(selected) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium tracking-[0.2em] text-[#8A6A4A] uppercase">Calendar</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{monthLabel}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 rounded-full border border-[#E6D9C6] bg-white p-1">
            <button onClick={() => move(-1)} aria-label="Previous month" className="grid h-10 w-10 place-items-center rounded-full hover:bg-[#F1E7D8]"><ChevronLeft size={18} /></button>
            <button onClick={() => showMonth(TODAY.getFullYear(), TODAY.getMonth(), todayISO)} className="rounded-full px-4 py-2 text-sm font-medium hover:bg-[#F1E7D8]">Today</button>
            <button onClick={() => move(1)} aria-label="Next month" className="grid h-10 w-10 place-items-center rounded-full hover:bg-[#F1E7D8]"><ChevronRight size={18} /></button>
          </div>
          {canBook && (
            <ButtonLink href={bookHref}><Plus size={16} /> {isStaff ? "Open schedule" : "Book appointment"}</ButtonLink>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Show event types">
          {(Object.keys(KINDS) as CalKind[])
            .filter((k) => k !== "followup" || !isStaff || can("canViewExamRecords"))
            .map((k) => {
              const on = visible.includes(k);
              return (
                <button key={k} aria-pressed={on} onClick={() => toggle(k)} className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors ${on ? "border-[#1F1A15] bg-white" : "border-[#E6D9C6] bg-transparent text-[#1F1A15]/50"}`}>
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: KINDS[k].dot, opacity: on ? 1 : 0.4 }} /> {KINDS[k].label}
                </button>
              );
            })}
        </div>
        {isStaff && userId && (
          <label className="ml-2 flex cursor-pointer items-center gap-2 text-sm">
            <input type="checkbox" checked={mine} onChange={(e) => setMine(e.target.checked)} className="h-4 w-4 accent-[#1F1A15]" />
            Assigned to me
          </label>
        )}
        {month.isFetching && !month.isPending && <span role="status" className="text-xs text-[#1F1A15]/50 md:ml-auto">Refreshing…</span>}
      </div>

      {month.isError && (
        <EmptyState
          icon={AlertTriangle} title="Couldn't load the calendar"
          text={month.error?.message || "Something went wrong."}
          action={<Button variant="secondary" onClick={() => month.refetch()}>Try again</Button>}
        />
      )}

      <div className="grid items-start gap-6 xl:grid-cols-[1.9fr_1fr]">
        <Card className="p-3 sm:p-5" aria-busy={month.isPending}>
          <div className="grid grid-cols-7 pb-2 text-center text-[11px] tracking-[0.14em] text-[#1F1A15]/45 uppercase">
            {WEEKDAYS.map((d) => <span key={d} className="py-2">{d}</span>)}
          </div>
          <div className={`grid grid-cols-7 gap-1.5 ${month.isPending ? "animate-pulse" : ""}`}>
            {cells.map((d, i) => {
              if (!d) return <span key={i} aria-hidden className="min-h-14 sm:min-h-26" />;
              const iso = toISO(d);
              const list = byDate.get(iso) ?? [];
              const isSel = iso === selected;
              const isToday = iso === todayISO;
              return (
                <button
                  key={iso}
                  onClick={() => setSelected(iso)}
                  aria-pressed={isSel}
                  aria-label={`${fmtDate(iso, { day: "numeric", month: "long", year: "numeric" })}, ${list.length} ${list.length === 1 ? "event" : "events"}`}
                  className={`flex min-h-14 flex-col rounded-2xl border p-1.5 text-left transition-colors sm:min-h-26 sm:p-2 ${
                    isSel ? "border-[#1F1A15] bg-[#1F1A15] text-white" : "border-[#E6D9C6] bg-[#FBF6EE] hover:bg-[#F1E7D8]"
                  }`}
                >
                  <span className={`grid h-6 w-6 place-items-center self-start rounded-full text-xs font-medium ${isToday && !isSel ? "bg-[#8A6A4A] text-white" : isToday ? "bg-white text-[#1F1A15]" : ""}`}>{d.getDate()}</span>
                  <span className="mt-1 hidden flex-col gap-1 sm:flex">
                    {list.slice(0, 2).map((e) => (
                      <span key={e.id} className={`truncate rounded-md px-1.5 py-0.5 text-[11px] ${isSel ? "bg-white/15 text-white" : KINDS[e.kind].chip}`}>
                        {e.time ? `${fmtTime(e.time).replace(":00", "")} ` : ""}{title(e)}
                      </span>
                    ))}
                    {list.length > 2 && <span className={`px-1 text-[11px] ${isSel ? "text-white/70" : "text-[#1F1A15]/50"}`}>+{list.length - 2} more</span>}
                  </span>
                  <span className="mt-auto flex gap-1 pt-1 sm:hidden">
                    {list.slice(0, 3).map((e) => <span key={e.id} className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: KINDS[e.kind].dot }} />)}
                  </span>
                </button>
              );
            })}
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-6">
            <p className="text-xs font-medium tracking-[0.18em] text-[#8A6A4A] uppercase">{selected === todayISO ? "Today" : "Selected day"}</p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight">{fmtDate(selected, { weekday: "long", day: "numeric", month: "long" })}</h2>
            {dayEvents.length === 0 ? (
              <div className="mt-5 rounded-2xl border border-dashed border-[#E6D9C6] p-5 text-center">
                <p className="text-sm text-[#1F1A15]/55">Nothing scheduled.</p>
                {canBook && selected >= todayISO && (
                  <Link href={bookHref} className="mt-2 inline-block text-sm font-medium underline decoration-[#8A6A4A]/50 underline-offset-4">
                    {isStaff ? "Open the schedule" : "Book an appointment"}
                  </Link>
                )}
              </div>
            ) : (
              <ul className="mt-5 space-y-3">
                {dayEvents.map((e) => (
                  <li key={e.id}>
                    <Link href={href(e)} className="flex gap-3 rounded-2xl bg-[#FBF6EE] p-4 transition-colors hover:bg-[#F1E7D8]">
                      <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: KINDS[e.kind].dot }} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold">{title(e)}</p>
                        <p className="mt-1 flex flex-wrap items-center gap-x-3 text-xs text-[#1F1A15]/55">
                          {e.time && <span className="flex items-center gap-1"><Clock size={12} /> {fmtTime(e.time)}</span>}
                          <span>{sub(e)}</span>
                        </p>
                      </div>
                      {e.status ? (
                        <Badge tone={STATUS_TONE[e.status as keyof typeof STATUS_TONE]}>{statusLabel(e.status)}</Badge>
                      ) : (
                        <span className={`h-fit rounded-full px-2.5 py-1 text-[11px] font-medium ${KINDS[e.kind].chip}`}>Follow-up</span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="p-6">
            <SectionTitle title="Coming up" />
            <ul className="mt-4 divide-y divide-[#E6D9C6]">
              {upcoming.map((e) => (
                <li key={e.id}>
                  <button
                    onClick={() => { const [y, m] = e.date.split("-").map(Number); showMonth(y, m - 1, e.date); }}
                    className="flex w-full items-center gap-3 py-3 text-left first:pt-0 last:pb-0"
                  >
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: KINDS[e.kind].dot }} />
                    <span className="min-w-0 flex-1">
                      <b className="block truncate text-sm font-medium">{title(e)}</b>
                      <span className="text-xs text-[#1F1A15]/50">
                        {fmtDate(e.date, { weekday: "short", day: "numeric", month: "short" })}{e.time ? ` · ${fmtTime(e.time)}` : ""}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
              {upcoming.length === 0 && <li className="py-2 text-sm text-[#1F1A15]/55">Nothing in the next 30 days.</li>}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}