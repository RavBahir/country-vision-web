// app/portal/appointments/page.tsx
"use client";

import { Button, EmptyState, Modal, PageHeader, Segmented, Toast } from "@/components/portal/UI";
import { fmtDate, fmtTime } from "@/lib/format";
import {
  useBranches, useCancelAppointment, useGetAllAppointments, useMyAppointments,
} from "@/pages/appointments/common/appointments-api";
import type { ApptType, IAppointment } from "@/pages/appointments/common/appointments";
import { AlertTriangle, CalendarCheck, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import BookingModal from "./AppointmentBookingModal";
import AppointmentCard from "./AppointmentCard";
import ClinicDetailsSection from "./ClinicDetailsSection";
import { isOpen, TYPE_LABEL, type IAppointmentTab } from "./common";
import { useSession } from "@/pages/auth/session";

type Editing = { appt: IAppointment | null; presetType?: ApptType } | null;

const byStart = (dir: 1 | -1) => (a: IAppointment, b: IAppointment) =>
  dir * (new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());

export default function AppointmentsPage() {
  const [tab, setTab] = useState<IAppointmentTab>("upcoming");
  const [editing, setEditing] = useState<Editing>(null);
  const [cancelling, setCancelling] = useState<IAppointment | null>(null);
  const [reason, setReason] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const {session} = useSession()

  const isCustomer = session?.user_validation_info.kind === "customer"

  const { data, isPending, isError, error, refetch } = isCustomer ? useMyAppointments() : useGetAllAppointments();
  const { data: branches = [] } = useBranches();
  const cancelMutation = useCancelAppointment();

  const groups = useMemo(() => {
    const all = data ?? [];
    const now = Date.now();
    const future = (a: IAppointment) => new Date(a.endsAt).getTime() >= now;
    return {
      upcoming: all.filter((a) => isOpen(a) && future(a)).sort(byStart(1)),
      past: all
        .filter((a) => a.status === "completed" || a.status === "no_show" || (isOpen(a) && !future(a)))
        .sort(byStart(-1)),
      cancelled: all.filter((a) => a.status === "cancelled").sort(byStart(-1)),
    };
  }, [data]);

  const list = groups[tab];
  const openNew = (presetType?: ApptType) => setEditing({ appt: null, presetType });

  const closeCancel = () => {
    setCancelling(null);
    setReason("");
    cancelMutation.reset();
  };

  const confirmCancel = () => {
    if (!cancelling) return;
    cancelMutation.mutate(
      { id: cancelling.id, reason: reason.trim() || undefined },
      {
        onSuccess: () => {
          closeCancel();
          setToast("Appointment cancelled.");
        },
      },
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Appointments"
        title="Your visits, in one place."
        description="Request, reschedule or cancel eye checkups and fittings. We confirm each booking and assign your optometrist."
        actions={
          <Button onClick={() => openNew()}>
            <Plus size={16} /> Book appointment
          </Button>
        }
      />

      <Segmented<IAppointmentTab>
        label="Appointment status"
        value={tab}
        onChange={setTab}
        options={[
          { value: "upcoming", label: "Upcoming", count: groups.upcoming.length },
          { value: "past", label: "Past", count: groups.past.length },
          { value: "cancelled", label: "Cancelled", count: groups.cancelled.length },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <div className="space-y-4">
          {isPending ? (
            <div aria-busy="true" aria-label="Loading appointments" className="space-y-4">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-36 animate-pulse rounded-3xl bg-[#F1E7D8]" />
              ))}
            </div>
          ) : isError ? (
            <EmptyState
              icon={AlertTriangle}
              title="Couldn't load your appointments"
              text={error?.message || "Something went wrong. Please try again."}
              action={<Button variant="secondary" onClick={() => refetch()}>Try again</Button>}
            />
          ) : list.length === 0 ? (
            <EmptyState
              icon={CalendarCheck}
              title={tab === "upcoming" ? "No upcoming appointments" : `No ${tab} appointments`}
              text={
                tab === "upcoming"
                  ? "Book an eye checkup or frame fitting that suits your week."
                  : "Nothing to show here yet."
              }
              action={
                tab === "upcoming" ? (
                  <Button onClick={() => openNew()}>
                    <Plus size={16} /> Book appointment
                  </Button>
                ) : undefined
              }
            />
          ) : (
            list.map((a) => (
              <AppointmentCard
                key={a.id}
                appointment={a}
                tab={tab}
                onReschedule={(appt) => setEditing({ appt })}
                onCancel={setCancelling}
                onBookAgain={(appt) => openNew(appt.type)}
              />
            ))
          )}
        </div>
        <ClinicDetailsSection />
      </div>

      {editing && (
        <BookingModal
          initial={editing.appt}
          presetType={editing.presetType}
          branches={branches}
          onClose={() => setEditing(null)}
          onSaved={(mode) => {
            setEditing(null);
            setTab("upcoming");
            setToast(
              mode === "booked"
                ? "Request sent. We'll confirm your appointment shortly."
                : "Appointment updated. We'll confirm the new time.",
            );
          }}
        />
      )}

      <Modal
        open={cancelling !== null}
        onClose={cancelMutation.isPending ? () => {} : closeCancel}
        title="Cancel this appointment?"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={closeCancel} disabled={cancelMutation.isPending}>
              Keep it
            </Button>
            <Button onClick={confirmCancel} disabled={cancelMutation.isPending}>
              {cancelMutation.isPending ? "Cancelling…" : "Yes, cancel"}
            </Button>
          </div>
        }
      >
        {cancelling && (
          <div className="grid gap-4">
            <p className="text-[15px] leading-relaxed text-[#1F1A15]/70">
              Your <b>{TYPE_LABEL[cancelling.type]}</b> on{" "}
              <b>{fmtDate(cancelling.date, { day: "numeric", month: "long" })}</b> at{" "}
              <b>{fmtTime(cancelling.time)}</b> will be cancelled. You can book another time whenever you like.
            </p>
            <div>
              <label htmlFor="c-reason" className="mb-2 block text-sm font-medium">
                Reason <span className="text-[#1F1A15]/45">(optional)</span>
              </label>
              <textarea
                id="c-reason"
                rows={2}
                maxLength={300}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full rounded-2xl border border-[#1F1A15]/10 bg-[#F6EFE4] px-4 py-3 text-[15px] outline-none focus:border-[#8A6A4A] focus:bg-white"
              />
            </div>
            {cancelMutation.error && (
              <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                {cancelMutation.error.message}
              </p>
            )}
          </div>
        )}
      </Modal>

      <Toast message={toast} onDone={() => setToast(null)} />
    </div>
  );
}