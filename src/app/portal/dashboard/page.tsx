"use client";

import {
  ButtonLink,
  PageHeader
} from "@/components/portal/UI";
import {
  daysBetween,
  parseISO,
  TODAY,
  toISO
} from "@/lib/format";
import {
  APPOINTMENTS,
  CHECKUPS,
  ORDER_STEPS,
  ORDERS,
  TRANSACTIONS,
} from "@/lib/portal-data";
import { allRoutes } from "@/routes/routes";
import {
  ArrowRight
} from "lucide-react";
import { greeting } from "./common";
import DashboardCheckupRing from "./DashboardCheckupRing";
import DashboardOrders from "./DashboardOrders";
import DashboardQuickActions from "./DashboardQuickActions";
import DashboardRecentTransactions from "./DashboardRecentTransactions";
import DashboardReorderCard from "./DashboardReorderCard";
import DashboardStats from "./DashboardStats";
import DashboardUpcoming from "./DashboardUpcoming";
import { useSession } from "@/pages/auth/session";

export default function DashboardPage() {
  const todayISO = toISO(TODAY);
  const {session} = useSession()
  const upcoming = APPOINTMENTS.filter(
    (a) =>
      (a.status === "confirmed" || a.status === "pending") &&
      a.date >= todayISO,
  ).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  const next = upcoming[0];
  const last = CHECKUPS[0];
  const dueIn = daysBetween(TODAY, parseISO(last.nextDue));
  const cycle = daysBetween(parseISO(last.date), parseISO(last.nextDue));
  const elapsed = daysBetween(parseISO(last.date), TODAY);
  const activeOrders = ORDERS.filter((o) => o.step < ORDER_STEPS.length - 1);
  const recent = [...TRANSACTIONS]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 4);

    const userName = session?.user_validation_info.name ?? ""

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Dashboard"
        title={
          <>
            {greeting()},{" "}
            <span className="font-serif text-[1.1em] font-normal italic">
              {userName}.
            </span>
          </>
        }
        description="Here's a quick look at your appointments, orders and prescription."
        actions={
          <>
            <ButtonLink href={allRoutes.PORTAL + allRoutes.APPOINTMENTS}>
              Book an appointment <ArrowRight size={15} />
            </ButtonLink>
            <ButtonLink href={allRoutes.PORTAL + allRoutes.CATALOG} variant="secondary">
              Browse catalog
            </ButtonLink>
          </>
        }
      />

      <DashboardStats activeOrders={activeOrders} dueIn={dueIn} last={last} next={next}/>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <DashboardUpcoming upcoming={upcoming}/>
          <DashboardOrders activeOrders={activeOrders}/>
          <DashboardRecentTransactions recent={recent}/>
        </div>

        <div className="space-y-6">
          <DashboardCheckupRing cycle={cycle} dueIn={dueIn} elapsed={elapsed} last={last}/>
          <DashboardReorderCard last={last}/>
          <DashboardQuickActions />
        </div>
      </div>
    </div>
  );
}
