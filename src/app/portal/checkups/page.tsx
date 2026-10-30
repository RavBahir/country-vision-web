// app/portal/checkups/page.tsx
"use client";

import { Button, ButtonLink, EmptyState, PageHeader, Toast } from "@/components/portal/UI";
import { daysBetween, parseISO, TODAY } from "@/lib/format";
import { allRoutes } from "@/routes/routes";
import { AlertTriangle, CalendarCheck, Stethoscope } from "lucide-react";
import { useMemo, useState } from "react";
import CheckoutRecords from "./CheckoutRecords";
import CheckoutSummary from "./CheckoutSummary";
import CheckoutTrend from "./CheckoutTrend";
import { useMyCheckups } from "@/modules/checkups/common/checkups-api";
import { nextDueOf } from "@/modules/checkups/common/checkups";

const bookHref = allRoutes.PORTAL + allRoutes.APPOINTMENTS;

export default function CheckupsPage() {
  // undefined = the customer hasn't chosen yet, so expand the newest record
  const [openId, setOpenId] = useState<string | null | undefined>(undefined);
  const [toast, setToast] = useState<string | null>(null);

  const { data, isPending, isError, error, refetch } = useMyCheckups();
  const checkups = useMemo(() => data ?? [], [data]); // API returns newest first

  const last = checkups[0];
  const current = useMemo(() => checkups.find((c) => c.prescription) ?? null, [checkups]);
  const open = openId === undefined ? (last?.id ?? null) : openId;

  const due = last ? nextDueOf(last) : null;
  const dueIn = due ? daysBetween(TODAY, parseISO(due.date)) : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Checkups"
        title="Your eye health history."
        description="Every exam, prescription and recommendation, kept safe and easy to share with your optician."
        actions={
          <ButtonLink href={bookHref}>
            <CalendarCheck size={16} /> Book next checkup
          </ButtonLink>
        }
      />

      {isPending ? (
        <div aria-busy="true" aria-label="Loading checkups" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-3">
            {[0, 1, 2].map((i) => <div key={i} className="h-44 animate-pulse rounded-3xl bg-[#F1E7D8]" />)}
          </div>
          <div className="h-72 animate-pulse rounded-3xl bg-[#F1E7D8]" />
        </div>
      ) : isError ? (
        <EmptyState
          icon={AlertTriangle}
          title="Couldn't load your checkups"
          text={error?.message || "Something went wrong. Please try again."}
          action={<Button variant="secondary" onClick={() => refetch()}>Try again</Button>}
        />
      ) : !last || !due ? (
        <EmptyState
          icon={Stethoscope}
          title="No exam records yet"
          text="Your results appear here once your optometrist has completed your first checkup."
          action={<ButtonLink href={bookHref}><CalendarCheck size={16} /> Book a checkup</ButtonLink>}
        />
      ) : (
        <>
          <CheckoutSummary last={last} dueIn={dueIn} dueDate={due.date} recommended={due.recommended} current={current} />
          <CheckoutTrend data={checkups} />
          <CheckoutRecords data={checkups} open={open} setOpen={setOpenId} setToast={setToast} />
        </>
      )}

      <Toast message={toast} onDone={() => setToast(null)} />
    </div>
  );
}