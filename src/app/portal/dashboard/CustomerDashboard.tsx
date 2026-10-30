// app/portal/dashboard/CustomerDashboard.tsx
"use client";

import { Badge, Button, ButtonLink, Card, EmptyState, Kicker, PageHeader, SectionTitle } from "@/components/portal/UI";
import { daysBetween, fmtDate, fmtTime, parseISO, rx as fmtPower, TODAY, toISO } from "@/lib/format";
import { STATUS_LABEL, STATUS_TONE, TYPE_LABEL } from "@/app/portal/appointments/common";
import CheckupRx from "@/app/portal/checkups/CheckupRx";
import { allRoutes } from "@/routes/routes";
import { AlertTriangle, ArrowRight, Clock, MapPin } from "lucide-react";
import Link from "next/link";
import { CheckupRing, greeting, QUICK } from "./common";
import StatTile, { TilesSkeleton } from "./StatTile";
import { ICustomerDashboard } from "@/modules/dashboard/common/dashboard";
import { useCustomerDashboard } from "@/modules/dashboard/common/dashboard-api";
import { IAppointment } from "@/lib/portal-data";

const APPTS = allRoutes.PORTAL + allRoutes.APPOINTMENTS;
const CHECKUPS = allRoutes.PORTAL + allRoutes.CHECKUPS;
const long = { day: "numeric", month: "long", year: "numeric" } as const;

/** The optometrist's follow-up date, otherwise a year after the exam. */
function dueFor(last: NonNullable<ICustomerDashboard["lastCheckup"]>) {
  if (last.followUpDate) return last.followUpDate;
  const d = parseISO(last.date);
  d.setFullYear(d.getFullYear() + 1);
  return toISO(d);
}

export default function CustomerDashboard({ name }: { name: string }) {
  const { data, isPending, isError, error, refetch } = useCustomerDashboard(true);

  const last = data?.lastCheckup ?? null;
  const due = last ? dueFor(last) : null;
  const dueIn = due ? daysBetween(TODAY, parseISO(due)) : 0;
  const cycle = last && due ? Math.max(1, daysBetween(parseISO(last.date), parseISO(due))) : 1;
  const elapsed = last ? daysBetween(parseISO(last.date), TODAY) : 0;
  const rx = data?.prescription ?? null;

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Dashboard"
        title={<>{greeting()}, <span className="font-serif text-[1.1em] font-normal italic">{name}.</span></>}
        description="Here's a quick look at your appointments and prescription."
        actions={
          <>
            <ButtonLink href={APPTS}>Book an appointment <ArrowRight size={15} /></ButtonLink>
            <ButtonLink href={CHECKUPS} variant="secondary">Checkup history</ButtonLink>
          </>
        }
      />

      {isPending ? (
        <TilesSkeleton />
      ) : isError ? (
        <EmptyState
          icon={AlertTriangle} title="Couldn't load your dashboard"
          text={error?.message || "Something went wrong."}
          action={<Button variant="secondary" onClick={() => refetch()}>Try again</Button>}
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatTile
              dark label="Upcoming visits" value={data.stats.upcomingCount}
              note={data.stats.awaiting ? `${data.stats.awaiting} awaiting confirmation` : "All confirmed"}
            />
            <StatTile
              label="Last checkup"
              value={last ? fmtDate(last.date, { day: "numeric", month: "short" }) : "–"}
              note={last ? `${last.clinician ?? "Optometrist"}` : "No exam yet"}
            />
            <StatTile
              label="Next checkup"
              value={due ? fmtDate(due, { day: "numeric", month: "short" }) : "–"}
              note={due ? (dueIn > 0 ? `In ${dueIn} days` : "Due now") : "Book your first exam"}
            />
            <StatTile label="Exams on record" value={data.stats.examCount} />
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
            <Card className="p-6">
              <SectionTitle
                title="Upcoming appointments"
                action={<Link href={APPTS} className="flex items-center gap-1.5 text-sm font-medium">View all <ArrowRight size={14} /></Link>}
              />
              {data.upcoming.length === 0 ? (
                <p className="mt-4 text-sm text-[#1F1A15]/55">
                  No upcoming appointments. <Link href={APPTS} className="border-b border-[#8A6A4A]/50 font-medium text-[#1F1A15]">Book one</Link>
                </p>
              ) : (
                <ul className="mt-5 divide-y divide-[#E6D9C6]">
                  {data.upcoming.map((a: IAppointment) => (
                    <li key={a.id} className="flex flex-wrap items-center gap-4 py-4 first:pt-0 last:pb-0">
                      <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-[#F1E7D8] text-center leading-none">
                        <span>
                          <b className="block text-xl font-semibold">{parseISO(a.date).getDate()}</b>
                          <span className="mt-1 block text-[11px] tracking-wide text-[#8A6A4A] uppercase">{fmtDate(a.date, { month: "short" })}</span>
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold">{TYPE_LABEL[a.type]}</p>
                        <p className="mt-1 flex flex-wrap gap-x-4 text-sm text-[#1F1A15]/60">
                          <span className="flex items-center gap-1.5"><Clock size={13} /> {fmtTime(a.time)}</span>
                          <span className="flex items-center gap-1.5"><MapPin size={13} /> {a.location ?? "Clinic"}{a.clinician ? ` · ${a.clinician}` : ""}</span>
                        </p>
                      </div>
                      <Badge
                        tone={STATUS_TONE[a.status as keyof typeof STATUS_TONE] ?? Object.values(STATUS_TONE)[0]}
                      >
                        {STATUS_LABEL[a.status as keyof typeof STATUS_LABEL] ?? a.status}
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <div className="space-y-6">
              <Card className="flex flex-col items-center p-6 text-center">
                <Kicker>Eye health</Kicker>
                {last && due ? (
                  <>
                    <div className="mt-4"><CheckupRing elapsed={elapsed} total={cycle} left={dueIn} /></div>
                    <p className="mt-4 font-semibold">Next checkup {fmtDate(due, { day: "numeric", month: "long" })}</p>
                    <p className="mt-1 text-sm text-[#1F1A15]/55">Your last exam was {fmtDate(last.date, long)}.</p>
                  </>
                ) : (
                  <p className="mt-4 text-sm text-[#1F1A15]/55">Your checkup schedule appears here after your first exam.</p>
                )}
                <ButtonLink href={last ? CHECKUPS : APPTS} variant="secondary" className="mt-5">
                  {last ? "View checkup history" : "Book a checkup"}
                </ButtonLink>
              </Card>

              <div className="rounded-3xl bg-[#12100D] p-6 text-white">
                <Kicker light>Current prescription</Kicker>
                {rx ? (
                  <>
                    <div className="mt-3"><CheckupRx rx={rx} dark /></div>
                    <p className="mt-3 text-xs text-white/55">
                      {rx.expired ? "Expired. Book a checkup to renew it." : rx.expiresAt ? `Valid until ${fmtDate(rx.expiresAt.slice(0, 10), long)}` : ""}
                    </p>
                    <Link href={allRoutes.PORTAL + allRoutes.CATALOG} className="mt-4 inline-flex rounded-full bg-[#FAF5EE] px-5 py-3 text-sm font-medium text-[#1F1A15]">
                      Order spectacles
                    </Link>
                  </>
                ) : (
                  <p className="mt-3 text-sm text-white/60">No prescription on file yet.</p>
                )}
              </div>

              <Card className="p-6">
                <SectionTitle title="Quick actions" />
                <ul className="mt-4 grid grid-cols-2 gap-3">
                  {QUICK.map((q) => (
                    <li key={q.label}>
                      <Link href={q.href} className="flex h-full flex-col gap-3 rounded-2xl border border-[#E6D9C6] bg-[#FBF6EE] p-4 transition-colors hover:bg-[#F1E7D8]">
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
            </div>
          </div>
        </>
      )}
    </div>
  );
}