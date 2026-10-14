"use client";

import {
  Button,
  EmptyState,
  Modal,
  PageHeader,
  Segmented,
  Toast,
} from "@/components/portal/UI";
import { TODAY, fmtDate, fmtTime, toISO } from "@/lib/format";
import { APPOINTMENTS, type Appointment } from "@/lib/portal-data";
import { CalendarCheck, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import BookingModal from "./AppointmentBookingModal";
import AppointmentCard from "./AppointmentCard";
import ClinicDetailsSection from "./ClinicDetailsSection";
import { IAppointmentTab } from "./common";

/* ---------------- page ---------------- */

export default function AppointmentsPage() {
  const [appts, setAppts] = useState<Appointment[]>(APPOINTMENTS);
  const [tab, setTab] = useState<IAppointmentTab>("upcoming");
  const [editing, setEditing] = useState<Appointment | "new" | null>(null);
  const [cancelling, setCancelling] = useState<Appointment | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const todayISO = toISO(TODAY);

  const groups = useMemo(
    () => ({
      upcoming: appts
        .filter(
          (a) =>
            (a.status === "confirmed" || a.status === "pending") &&
            a.date >= todayISO,
        )
        .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)),
      past: appts
        .filter(
          (a) =>
            a.status === "completed" ||
            (a.status !== "cancelled" && a.date < todayISO),
        )
        .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time)),
      cancelled: appts
        .filter((a) => a.status === "cancelled")
        .sort((a, b) => b.date.localeCompare(a.date)),
    }),
    [appts, todayISO],
  );

  const list = groups[tab];

  const save = (a: Appointment) => {
    setAppts((prev) =>
      prev.some((p) => p.id === a.id)
        ? prev.map((p) => (p.id === a.id ? a : p))
        : [...prev, a],
    );
    setEditing(null);
    setTab("upcoming");
    setToast(
      editing === "new"
        ? "Appointment booked. Confirmation sent."
        : "Appointment updated.",
    );
  };

  const cancel = () => {
    if (!cancelling) return;
    setAppts((prev) =>
      prev.map((p) =>
        p.id === cancelling.id ? { ...p, status: "cancelled" } : p,
      ),
    );
    setCancelling(null);
    setToast("Appointment cancelled.");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Appointments"
        title="Your visits, in one place."
        description="Book, reschedule or cancel eye checkups and fittings. Pick a time and get instant confirmation."
        actions={
          <Button onClick={() => setEditing("new")}>
            <Plus size={16} /> Book appointment
          </Button>
        }
      />

      <Segmented<IAppointmentTab>
        label="Appointment status"
        value={tab}
        onChange={setTab}
        options={[
          {
            value: "upcoming",
            label: "Upcoming",
            count: groups.upcoming.length,
          },
          { value: "past", label: "Past", count: groups.past.length },
          {
            value: "cancelled",
            label: "Cancelled",
            count: groups.cancelled.length,
          },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <div className="space-y-4">
          {list.length === 0 ? (
            <EmptyState
              icon={CalendarCheck}
              title={
                tab === "upcoming"
                  ? "No upcoming appointments"
                  : `No ${tab} appointments`
              }
              text={
                tab === "upcoming"
                  ? "Book an eye checkup or frame fitting that suits your week."
                  : "Nothing to show here yet."
              }
              action={
                tab === "upcoming" ? (
                  <Button onClick={() => setEditing("new")}>
                    <Plus size={16} /> Book appointment
                  </Button>
                ) : undefined
              }
            />
          ) : (
            list.map((a) => (
              <AppointmentCard
                appointment={a}
                setCancelling={setCancelling}
                setEditing={setEditing}
                tab={tab}
                key={a.id}
              />
            ))
          )}
        </div>
        <ClinicDetailsSection />
      </div>

      {editing && (
        <BookingModal
          initial={editing === "new" ? null : editing}
          existing={appts}
          onClose={() => setEditing(null)}
          onSave={save}
        />
      )}

      <Modal
        open={cancelling !== null}
        onClose={() => setCancelling(null)}
        title="Cancel this appointment?"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setCancelling(null)}>
              Keep it
            </Button>
            <Button onClick={cancel}>Yes, cancel</Button>
          </div>
        }
      >
        {cancelling && (
          <p className="text-[15px] leading-relaxed text-[#1F1A15]/70">
            Your <b>{cancelling.type}</b> on{" "}
            <b>{fmtDate(cancelling.date, { day: "numeric", month: "long" })}</b>{" "}
            at <b>{fmtTime(cancelling.time)}</b> will be cancelled. You can book
            another time whenever you like.
          </p>
        )}
      </Modal>

      <Toast message={toast} onDone={() => setToast(null)} />
    </div>
  );
}
