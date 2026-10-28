// app/portal/appointments/AppointmentCard.tsx
import { Badge, Button, Card } from "@/components/portal/UI";
import { fmtDate, fmtTime, parseISO } from "@/lib/format";
import type { IAppointment } from "@/pages/appointments/common/appointments";
import { CalendarClock, Clock, MapPin, MessageSquareText, User } from "lucide-react";
import {
  canChange, CUTOFF_HOURS, isOpen, STATUS_LABEL, STATUS_TONE, TYPE_LABEL,
  type IAppointmentTab,
} from "./common";

type Props = {
  appointment: IAppointment;
  tab: IAppointmentTab;
  onReschedule: (a: IAppointment) => void;
  onCancel: (a: IAppointment) => void;
  onBookAgain: (a: IAppointment) => void;
};

export default function AppointmentCard({ appointment: a, tab, onReschedule, onCancel, onBookAgain }: Props) {
  const changeable = canChange(a);
  const open = isOpen(a);

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex flex-wrap items-center gap-5">
        <div className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-[#F1E7D8] text-center leading-none">
          <span>
            <span className="block text-[11px] tracking-wide text-[#8A6A4A] uppercase">
              {fmtDate(a.date, { month: "short" })}
            </span>
            <b className="mt-1 block text-3xl font-semibold">{parseISO(a.date).getDate()}</b>
            <span className="mt-1 block text-[11px] text-[#1F1A15]/50">
              {fmtDate(a.date, { weekday: "short" })}
            </span>
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-lg font-semibold">{TYPE_LABEL[a.type]}</h2>
            <Badge tone={STATUS_TONE[a.status]}>{STATUS_LABEL[a.status]}</Badge>
          </div>

          <ul className="mt-2 grid gap-1.5 text-sm text-[#1F1A15]/60">
            <li className="flex items-center gap-2">
              <Clock size={14} /> {fmtTime(a.time)} ·{" "}
              {fmtDate(a.date, { year: "numeric", day: "numeric", month: "long" })}
            </li>
            <li className="flex items-center gap-2">
              <User size={14} /> {a.clinician ?? "Optometrist to be assigned"}
            </li>
            {a.location && (
              <li className="flex items-center gap-2">
                <MapPin size={14} /> {a.location}
              </li>
            )}
          </ul>

          {a.status === "pending" && (
            <p className="mt-3 text-sm text-[#8A6A4A]">
              We&rsquo;ll confirm this and assign your optometrist shortly.
            </p>
          )}

          {a.notes && (
            <p className="mt-3 rounded-xl bg-[#FBF6EE] px-4 py-2.5 text-sm text-[#1F1A15]/65">{a.notes}</p>
          )}

          {a.status === "completed" && a.detail?.recommendations && (
            <div className="mt-3 rounded-xl border border-[#E6D9C6] px-4 py-3 text-sm">
              <p className="flex items-center gap-2 font-medium">
                <MessageSquareText size={14} /> From your optometrist
              </p>
              <p className="mt-1 text-[#1F1A15]/70">{a.detail.recommendations}</p>
              {a.detail.followUpDate && (
                <p className="mt-2 flex items-center gap-2 text-[#1F1A15]/60">
                  <CalendarClock size={14} /> Follow-up around{" "}
                  {fmtDate(a.detail.followUpDate.slice(0, 10), { day: "numeric", month: "long", year: "numeric" })}
                </p>
              )}
            </div>
          )}

          {a.status === "cancelled" && a.cancelReason && (
            <p className="mt-3 text-sm text-[#1F1A15]/55">Reason: {a.cancelReason}</p>
          )}
        </div>

        <div className="flex w-full gap-2 sm:w-auto sm:flex-col">
          {tab === "upcoming" && open && (
            <>
              <Button variant="secondary" className="flex-1" disabled={!changeable} onClick={() => onReschedule(a)}>
                Reschedule
              </Button>
              <Button variant="danger" className="flex-1" disabled={!changeable} onClick={() => onCancel(a)}>
                Cancel
              </Button>
            </>
          )}
          {tab !== "upcoming" && (
            <Button variant="secondary" className="flex-1" onClick={() => onBookAgain(a)}>
              Book again
            </Button>
          )}
        </div>
      </div>

      {tab === "upcoming" && open && !changeable && a.status !== "in_progress" && (
        <p className="mt-4 text-xs text-[#1F1A15]/50">
          Within {CUTOFF_HOURS} hours of your visit, please call the clinic to make changes.
        </p>
      )}
    </Card>
  );
}