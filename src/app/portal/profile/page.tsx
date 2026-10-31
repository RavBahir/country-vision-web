// app/portal/profile/page.tsx
"use client";

import { Badge, Button, Card, EmptyState, PageHeader, Segmented, Toast } from "@/components/portal/UI";
import { fmtDate } from "@/lib/format";
import { useProfile } from "@/modules/profile/common/profile-api";
import { AlertTriangle, CalendarDays } from "lucide-react";
import { useState } from "react";
import DetailsForm from "./DetailsForm";
import SecurityPanel from "./SecurityPanel";

type Tab = "details" | "security";

export default function ProfilePage() {
  const [tab, setTab] = useState<Tab>("details");
  const [toast, setToast] = useState<string | null>(null);
  const { data: p, isPending, isError, error, refetch } = useProfile();

  const initials =
    p?.name.split(" ").filter(Boolean).slice(0, 2).map((s) => s[0]).join("").toUpperCase() || "?";

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Profile"
        title="Your account."
        description="Update your details and keep your password secure."
      />

      {isPending ? (
        <div aria-busy="true" className="space-y-4">
          <div className="h-28 animate-pulse rounded-3xl bg-[#F1E7D8]" />
          <div className="h-80 animate-pulse rounded-3xl bg-[#F1E7D8]" />
        </div>
      ) : isError || !p ? (
        <EmptyState
          icon={AlertTriangle} title="Couldn't load your profile"
          text={error?.message || "Something went wrong."}
          action={<Button variant="secondary" onClick={() => refetch()}>Try again</Button>}
        />
      ) : (
        <>
          <Card className="flex flex-wrap items-center gap-5 p-6">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-[#1F1A15] text-xl font-semibold text-white" aria-hidden>
              {initials}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xl font-semibold tracking-tight">{p.name}</p>
              <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#1F1A15]/60">
                <span>{p.kind === "customer" ? "Customer" : "Staff"} ID {p.code}</span>
                <span className="flex items-center gap-1.5">
                  <CalendarDays size={14} /> Since {fmtDate(p.createdAt.slice(0, 10), { month: "long", year: "numeric" })}
                </span>
              </p>
            </div>
            {p.kind === "user" && (
              <div className="flex flex-wrap gap-2">
                {p.roleName && <Badge tone="neutral">{p.roleName}</Badge>}
                {p.branchName && <Badge tone="neutral">{p.branchName}</Badge>}
              </div>
            )}
          </Card>

          <Segmented<Tab>
            label="Profile sections"
            value={tab}
            onChange={setTab}
            options={[
              { value: "details", label: "Personal details" },
              { value: "security", label: "Security" },
            ]}
          />

          {tab === "details" && <DetailsForm profile={p} onSaved={setToast} />}
          {tab === "security" && <SecurityPanel onSaved={setToast} />}
        </>
      )}

      <Toast message={toast} onDone={() => setToast(null)} />
    </div>
  );
}