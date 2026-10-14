"use client";

import {
  ButtonLink,
  PageHeader,
  Toast
} from "@/components/portal/UI";
import { daysBetween, parseISO, TODAY } from "@/lib/format";
import { CHECKUPS } from "@/lib/portal-data";
import {
  CalendarCheck
} from "lucide-react";
import { useState } from "react";
import CheckoutRecords from "./CheckoutRecords";
import CheckoutSummary from "./CheckoutSummary";
import CheckoutTrend from "./CheckoutTrend";

/* ---------------- page ---------------- */

export default function CheckupsPage() {
  const [open, setOpen] = useState<string | null>(CHECKUPS[0].id);
  const [toast, setToast] = useState<string | null>(null);
  const last = CHECKUPS[0];
  const dueIn = daysBetween(TODAY, parseISO(last.nextDue));

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Checkups"
        title="Your eye health history."
        description="Every exam, prescription and clinician note, kept safe and easy to share with your optician."
        actions={
          <ButtonLink href="/appointments">
            <CalendarCheck size={16} /> Book next checkup
          </ButtonLink>
        }
      />

      {/* summary */}
      <CheckoutSummary dueIn={dueIn} last={last} />

      {/* trend */}
      <CheckoutTrend />

      {/* records */}
      <CheckoutRecords open={open} setOpen={setOpen} setToast={setToast} />

      <Toast message={toast} onDone={() => setToast(null)} />
    </div>
  );
}
