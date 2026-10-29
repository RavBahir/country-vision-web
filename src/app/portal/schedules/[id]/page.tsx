// app/portal/schedule/[id]/page.tsx
"use client";

import { Badge, Button, Card, EmptyState, PageHeader, Segmented, Toast } from "@/components/portal/UI";
import { fmtDate, fmtTime } from "@/lib/format";
import { usePerms } from "@/lib/use-perms";
import {
  useChangeStatus, useCustomerPrescriptions, useExamRecord, useStaffAppointment,
} from "@/modules/appointments/common/staff-api";
import type { ApptStatus } from "@/modules/appointments/common/appointments";
import type { IPrescription } from "@/modules/appointments/common/staff";
import { AlertTriangle, ArrowLeft, Clock, Mail, MapPin, Phone, Plus, User } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { AssignModal, StaffCancelModal } from "../AssignModal";
import StaffBookingModal from "../StaffBookingModal";
import { SCHEDULE_ROUTE, STAFF_STATUS_LABEL, STATUS_TONE, TYPE_LABEL } from "../common";
import ExamRecordForm from "./ExamRecordForm";
import PrescriptionForm from "./PrescriptionForm";
import { RxCard } from "./PrescriptionsPanel";

type Panel = "record" | "prescriptions";
type Dialog = "approve" | "reassign" | "reschedule" | "cancel" | "rx" | null;

export default function AppointmentDetailPage() {
  const { id } = useParams<{ id: string }>() ?? { id: "" };
  const { can, fullAccess, userId } = usePerms();

  const [panel, setPanel] = useState<Panel>("record");
  const [dialog, setDialog] = useState<Dialog>(null);
  const [toast, setToast] = useState<string | null>(null);

  const { data: a, isPending, isError, error, refetch } = useStaffAppointment(id);
  const change = useChangeStatus();

  const clinicalOpen = !!a && ["approved", "in_progress", "completed"].includes(a.status);
  const canViewRecord = can("canViewExamRecords");
  const canViewRx = can("canViewPrescriptions");

  const { data: record } = useExamRecord(id, clinicalOpen && canViewRecord);
  const { data: history = [] } = useCustomerPrescriptions(a?.customerId ?? "", canViewRx && !!a);

  if (isPending) return <div className="h-64 animate-pulse rounded-3xl bg-[#F1E7D8]" aria-busy="true" />;
  if (isError || !a) {
    return (
      <EmptyState
        icon={AlertTriangle} title="Couldn't load this appointment"
        text={error?.message || "It may have been deleted."}
        action={<Button variant="secondary" onClick={() => refetch()}>Try again</Button>}
      />
    );
  }

  /* ---- rules, mirroring the server ---- */
  const isAssigned = a.optometristId === userId;
  const clinician = fullAccess || isAssigned;
  const canUpdate = can("canUpdateAppointments");
  const finalized = !!record?.isFinalized;

  const recordPerm = record ? can("canUpdateExamRecords") : can("canCreateExamRecords");
  const canEditRecord = clinicalOpen && clinician && recordPerm && (!finalized || fullAccess);
  const canIssueRx = clinicalOpen && clinician && can("canCreatePrescriptions");

  const readOnlyReason = !clinician
    ? "Only the assigned optometrist or an administrator can edit this record."
    : finalized && !fullAccess
      ? "This record is finalized. Ask an administrator to amend it."
      : !recordPerm
        ? "You don't have permission to edit exam records."
        : undefined;

  const go = (status: ApptStatus, message: string) =>
    change.mutate(
      { id: a.id, body: { status } },
      { onSuccess: () => setToast(message), onError: (e) => setToast(e.message) },
    );

  const started = new Date(a.startsAt).getTime() <= Date.now();
  const done = (m: string) => { setDialog(null); setToast(m); };

  const thisVisit = record?.prescriptions ?? [];
  const visitIds = new Set(thisVisit.map((r) => r.id));
  const previous: IPrescription[] = history.filter((r) => !visitIds.has(r.id));

  return (
    <div className="space-y-6">
      <Link href={SCHEDULE_ROUTE} className="inline-flex items-center gap-2 text-sm text-[#1F1A15]/65 hover:text-[#1F1A15]">
        <ArrowLeft size={16} /> Back to schedule
      </Link>

      <PageHeader
        kicker={a.code}
        title={a.customer.name}
        description={`${TYPE_LABEL[a.type]} · ${fmtDate(a.date, { day: "numeric", month: "long", year: "numeric" })} at ${fmtTime(a.time)}`}
        actions={<Badge tone={STATUS_TONE[a.status]}>{STAFF_STATUS_LABEL[a.status]}</Badge>}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        {/* ---- summary + actions ---- */}
        <div className="space-y-4">
          <Card className="p-6">
            <ul className="grid gap-3 text-sm">
              <li className="flex items-center gap-3"><Clock size={15} className="text-[#8A6A4A]" /> {fmtTime(a.time)} · {fmtDate(a.date, { day: "numeric", month: "short", year: "numeric" })}</li>
              <li className="flex items-center gap-3"><User size={15} className="text-[#8A6A4A]" /> {a.optometrist?.name ?? "No optometrist assigned"}</li>
              {a.location && <li className="flex items-center gap-3"><MapPin size={15} className="text-[#8A6A4A]" /> {a.location}</li>}
              <li className="flex items-center gap-3"><Mail size={15} className="text-[#8A6A4A]" /> {a.customer.email}</li>
              {a.customer.phone1 && (
                <li className="flex items-center gap-3"><Phone size={15} className="text-[#8A6A4A]" /> <a href={`tel:${a.customer.phone1}`}>{a.customer.phone1}</a></li>
              )}
            </ul>
            {a.notes && (
              <p className="mt-4 rounded-xl bg-[#FBF6EE] px-4 py-3 text-sm text-[#1F1A15]/70">
                <b className="block text-xs tracking-wide text-[#1F1A15]/50 uppercase">Customer note</b>
                {a.notes}
              </p>
            )}
            {a.status === "cancelled" && (
              <p className="mt-4 text-sm text-[#1F1A15]/60">
                Cancelled by {a.cancelledBy ?? "staff"}{a.cancelReason ? `: ${a.cancelReason}` : ""}
              </p>
            )}
          </Card>

          {canUpdate && (
            <Card className="grid gap-2 p-4">
              {a.status === "pending" && <Button onClick={() => setDialog("approve")}>Approve & assign</Button>}

              {a.status === "approved" && (
                <>
                  {clinician && <Button disabled={change.isPending} onClick={() => go("in_progress", "Visit started.")}>Start visit</Button>}
                  <Button variant="secondary" onClick={() => setDialog("reassign")}>Change optometrist</Button>
                  <Button variant="secondary" onClick={() => setDialog("reschedule")}>Reschedule</Button>
                  {started && (
                    <Button variant="secondary" disabled={change.isPending} onClick={() => go("no_show", "Marked as no-show.")}>
                      Mark no-show
                    </Button>
                  )}
                </>
              )}

              {a.status === "in_progress" && clinician && (
                <Button
                  disabled={change.isPending}
                  onClick={() => {
                    if (confirm("Complete this visit? The exam record will be finalized.")) {
                      go("completed", "Visit completed.");
                    }
                  }}
                >
                  Complete visit
                </Button>
              )}

              {a.status === "pending" && <Button variant="secondary" onClick={() => setDialog("reschedule")}>Reschedule</Button>}
              {(a.status === "pending" || a.status === "approved" || a.status === "in_progress") && (
                <Button variant="danger" onClick={() => setDialog("cancel")}>Cancel appointment</Button>
              )}
            </Card>
          )}
        </div>

        {/* ---- clinical ---- */}
        <div className="space-y-4">
          {!canViewRecord && !canViewRx ? (
            <EmptyState icon={AlertTriangle} title="Clinical details are restricted" text="You don't have permission to view exam records or prescriptions." />
          ) : !clinicalOpen ? (
            <EmptyState
              icon={Clock}
              title="Clinical record not available yet"
              text={a.status === "pending" ? "Approve the appointment to start recording the exam." : "No exam is recorded for this appointment."}
            />
          ) : (
            <>
              <Segmented<Panel>
                label="Clinical"
                value={panel}
                onChange={setPanel}
                options={[
                  ...(canViewRecord ? [{ value: "record" as const, label: "Exam record" }] : []),
                  ...(canViewRx ? [{ value: "prescriptions" as const, label: "Prescriptions", count: thisVisit.length }] : []),
                ]}
              />

              {panel === "record" && canViewRecord && (
                <Card className="p-6">
                  <ExamRecordForm
                    key={record?.updatedAt ?? "new"}
                    appointmentId={a.id}
                    record={record ?? null}
                    canEdit={canEditRecord}
                    readOnlyReason={readOnlyReason}
                    onSaved={setToast}
                  />
                </Card>
              )}

              {panel === "prescriptions" && canViewRx && (
                <div className="space-y-4">
                  {canIssueRx && (
                    <div className="flex justify-end">
                      <Button onClick={() => setDialog("rx")}><Plus size={16} /> Issue prescription</Button>
                    </div>
                  )}

                  <h3 className="text-sm font-medium text-[#1F1A15]/60">Issued at this visit</h3>
                  {thisVisit.length === 0 ? (
                    <p className="text-sm text-[#1F1A15]/50">Nothing issued yet.</p>
                  ) : (
                    thisVisit.map((rx) => (
                      <RxCard key={rx.id} rx={rx} canVoid={can("canDeletePrescriptions")} onMessage={setToast} />
                    ))
                  )}

                  {previous.length > 0 && (
                    <>
                      <h3 className="pt-2 text-sm font-medium text-[#1F1A15]/60">Previous prescriptions</h3>
                      {previous.map((rx) => (
                        <RxCard key={rx.id} rx={rx} canVoid={can("canDeletePrescriptions")} onMessage={setToast} />
                      ))}
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {(dialog === "approve" || dialog === "reassign") && (
        <AssignModal appt={a} mode={dialog} onClose={() => setDialog(null)} onDone={done} />
      )}
      {dialog === "reschedule" && <StaffBookingModal initial={a} onClose={() => setDialog(null)} onSaved={done} />}
      {dialog === "cancel" && <StaffCancelModal appt={a} onClose={() => setDialog(null)} onDone={done} />}
      {dialog === "rx" && (
        <PrescriptionForm
          appointmentId={a.id}
          startFrom={previous[0] ?? thisVisit[0]}
          onClose={() => setDialog(null)}
          onSaved={done}
        />
      )}

      <Toast message={toast} onDone={() => setToast(null)} />
    </div>
  );
}