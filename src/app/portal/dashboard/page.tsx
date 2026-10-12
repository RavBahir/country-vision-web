"use client";

import Link from "next/link";
import {
  ArrowRight, CalendarCheck, Clock, Eye, FileText, Glasses, Headset, MapPin, Package, Receipt,
  type LucideIcon,
} from "lucide-react";
import { Badge, ButtonLink, Card, Kicker, PageHeader, SectionTitle, StatCard, StepTracker } from "@/components/portal/UI";
import { daysBetween, fmtDate, fmtTime, money, parseISO, rx, toISO, TODAY } from "@/lib/format";
import { APPOINTMENTS, CHECKUPS, ORDERS, ORDER_STEPS, PATIENT, TRANSACTIONS } from "@/lib/portal-data";
import { WHATSAPP_PHONE } from "@/app/login/page";
import { allRoutes } from "@/routes/routes";

const QUICK: { href: string; label: string; sub: string; icon: LucideIcon }[] = [
  { href: allRoutes.APPOINTMENTS, label: "Book a visit", sub: "Instant confirmation", icon: CalendarCheck },
  { href: allRoutes.CATALOG, label: "Order spectacles", sub: "Rx on file", icon: Glasses },
  { href: `"https://wa.me/${WHATSAPP_PHONE}"`, label: "Chat with us", sub: "Mon–Sat", icon: Headset },
];

function greeting(): string {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

function CheckupRing({ elapsed, total, left }: { elapsed: number; total: number; left: number }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const pct = Math.min(1, Math.max(0, elapsed / total));
  return (
    <div className="relative grid h-36 w-36 place-items-center">
      <svg viewBox="0 0 120 120" className="absolute inset-0 -rotate-90" aria-hidden>
        <circle cx="60" cy="60" r={r} fill="none" stroke="#F1E7D8" strokeWidth="10" />
        <circle cx="60" cy="60" r={r} fill="none" stroke="#8A6A4A" strokeWidth="10" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct)} />
      </svg>
      <div className="text-center">
        <p className="text-3xl font-semibold tabular-nums">{Math.max(left, 0)}</p>
        <p className="text-xs text-[#1F1A15]/55">days left</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const todayISO = toISO(TODAY);
  const upcoming = APPOINTMENTS.filter((a) => (a.status === "confirmed" || a.status === "pending") && a.date >= todayISO).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  const next = upcoming[0];
  const last = CHECKUPS[0];
  const dueIn = daysBetween(TODAY, parseISO(last.nextDue));
  const cycle = daysBetween(parseISO(last.date), parseISO(last.nextDue));
  const elapsed = daysBetween(parseISO(last.date), TODAY);
  const activeOrders = ORDERS.filter((o) => o.step < ORDER_STEPS.length - 1);
  const recent = [...TRANSACTIONS].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Dashboard"
        title={<>{greeting()}, <span className="font-serif text-[1.1em] font-normal italic">{PATIENT.first}.</span></>}
        description="Here's a quick look at your appointments, orders and prescription."
        actions={<>
          <ButtonLink href="/appointments">Book an appointment <ArrowRight size={15} /></ButtonLink>
          <ButtonLink href="/catalog" variant="secondary">Browse catalog</ButtonLink>
        </>}
      />

      {/* stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={CalendarCheck} label="Next appointment" value={next ? fmtDate(next.date, { weekday: "short", day: "numeric", month: "short" }) : "None booked"} sub={next ? `${fmtTime(next.time)} · ${next.type}` : "Book your next visit"} />
        <StatCard icon={Package} label="Active orders" value={String(activeOrders.length)} sub={activeOrders[0] ? `${activeOrders[0].id} ready ~${fmtDate(activeOrders[0].eta, { day: "numeric", month: "short" })}` : "Nothing in progress"} />
        <StatCard icon={Eye} label="Current prescription" value={`OD ${rx(last.od.sph)}`} sub={`OS ${rx(last.os.sph)} · updated ${fmtDate(last.date, { month: "short", year: "numeric" })}`} />
        <StatCard icon={Clock} label="Checkup due" value={dueIn > 0 ? `In ${dueIn} days` : "Due now"} sub={`Recommended by ${last.clinician}`} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          {/* upcoming */}
          <Card className="p-6">
            <SectionTitle title="Upcoming appointments" action={<Link href="/appointments" className="flex items-center gap-1.5 text-sm font-medium">View all <ArrowRight size={14} /></Link>} />
            <ul className="mt-5 divide-y divide-[#E6D9C6]">
              {upcoming.slice(0, 3).map((a) => (
                <li key={a.id} className="flex flex-wrap items-center gap-4 py-4 first:pt-0 last:pb-0">
                  <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-[#F1E7D8] text-center leading-none">
                    <span><b className="block text-xl font-semibold">{parseISO(a.date).getDate()}</b><span className="mt-1 block text-[11px] tracking-wide text-[#8A6A4A] uppercase">{fmtDate(a.date, { month: "short" })}</span></span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{a.type}</p>
                    <p className="mt-1 flex flex-wrap gap-x-4 text-sm text-[#1F1A15]/60">
                      <span className="flex items-center gap-1.5"><Clock size={13} /> {fmtTime(a.time)}</span>
                      <span className="flex items-center gap-1.5"><MapPin size={13} /> {a.clinician}</span>
                    </p>
                  </div>
                  <Badge tone={a.status === "confirmed" ? "success" : "warn"}>{a.status === "confirmed" ? "Confirmed" : "Pending"}</Badge>
                </li>
              ))}
              {upcoming.length === 0 && <li className="py-4 text-sm text-[#1F1A15]/55">No upcoming appointments.</li>}
            </ul>
          </Card>

          {/* orders */}
          <Card className="p-6">
            <SectionTitle title="Orders in progress" action={<Link href="/catalog" className="flex items-center gap-1.5 text-sm font-medium">Catalog <ArrowRight size={14} /></Link>} />
            {activeOrders.length === 0 ? (
              <p className="mt-4 text-sm text-[#1F1A15]/55">No active orders. Browse the catalog to start one.</p>
            ) : (
              activeOrders.map((o) => (
                <div key={o.id} className="mt-5 rounded-2xl border border-[#E6D9C6] bg-[#FBF6EE] p-5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold">{o.title}</p>
                      <p className="mt-1 text-sm text-[#1F1A15]/55">{o.id} · Estimated ready {fmtDate(o.eta, { day: "numeric", month: "long" })}</p>
                    </div>
                    <p className="font-semibold">{money(o.total)}</p>
                  </div>
                  <div className="mt-6"><StepTracker steps={ORDER_STEPS} current={o.step} /></div>
                </div>
              ))
            )}
          </Card>

          {/* recent transactions */}
          <Card className="p-6">
            <SectionTitle title="Recent transactions" action={<Link href="/transactions" className="flex items-center gap-1.5 text-sm font-medium">All transactions <ArrowRight size={14} /></Link>} />
            <ul className="mt-4 divide-y divide-[#E6D9C6]">
              {recent.map((t) => (
                <li key={t.id} className="flex items-center gap-4 py-3.5">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#F1E7D8] text-[#8A6A4A]"><Receipt size={16} /></span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{t.description}</p>
                    <p className="text-xs text-[#1F1A15]/50">{fmtDate(t.date)} · {t.method}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold tabular-nums">{money(t.amount)}</p>
                    <p className={`text-xs ${t.status === "paid" ? "text-[#3B5A2C]" : t.status === "pending" ? "text-[#8A5A12]" : "text-[#8E3524]"}`}>{t.status[0].toUpperCase() + t.status.slice(1)}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <div className="space-y-6">
          {/* checkup ring */}
          <Card className="flex flex-col items-center p-6 text-center">
            <Kicker>Eye health</Kicker>
            <div className="mt-4"><CheckupRing elapsed={elapsed} total={cycle} left={dueIn} /></div>
            <p className="mt-4 font-semibold">Next checkup {fmtDate(last.nextDue, { day: "numeric", month: "long" })}</p>
            <p className="mt-1 text-sm text-[#1F1A15]/55">Your last exam was {fmtDate(last.date, { day: "numeric", month: "long", year: "numeric" })}.</p>
            <ButtonLink href="/checkups" variant="secondary" className="mt-5">View checkup history</ButtonLink>
          </Card>

          {/* reorder */}
          <div className="rounded-3xl bg-[#12100D] p-6 text-white">
            <Kicker light>Prescription on file</Kicker>
            <h2 className="mt-3 text-2xl font-semibold leading-tight tracking-tight">Reorder lenses in one tap.</h2>
            <p className="mt-2 text-sm text-white/60">OD {rx(last.od.sph)} · OS {rx(last.os.sph)} is saved and ready at checkout.</p>
            <Link href="/catalog" className="mt-5 inline-flex rounded-full bg-[#FAF5EE] px-5 py-3 text-sm font-medium text-[#1F1A15]">Start an order</Link>
          </div>

          {/* quick actions */}
          <Card className="p-6">
            <SectionTitle title="Quick actions" />
            <ul className="mt-4 grid grid-cols-2 gap-3">
              {QUICK.map((q) => (
                <li key={q.label}>
                  <Link href={q.href} className="flex h-full flex-col gap-3 rounded-2xl border border-[#E6D9C6] bg-[#FBF6EE] p-4 transition-colors hover:bg-[#F1E7D8]">
                    <q.icon size={18} className="text-[#8A6A4A]" />
                    <span><b className="block text-sm font-semibold">{q.label}</b><span className="text-xs text-[#1F1A15]/55">{q.sub}</span></span>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}