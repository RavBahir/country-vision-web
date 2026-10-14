import { Badge, Button, Card } from "@/components/portal/UI";
import { fmtDate, fmtTime, parseISO } from "@/lib/format";
import { Appointment } from "@/lib/portal-data";
import { SetStateAction } from "react";
import { IAppointmentTab, STATUS_LABEL, STATUS_TONE } from "./common";
import { Clock, MapPin, User } from "lucide-react";

const AppointmentCard = ({
  appointment: a,
  tab,
  setCancelling,
  setEditing,
}: {
  appointment: Appointment;
  tab: IAppointmentTab;
  setCancelling: (value: SetStateAction<Appointment | null>) => void;
  setEditing: (value: SetStateAction<Appointment | "new" | null>) => void;
}) => {
  return (
    <Card key={a.id} className="p-5 sm:p-6">
      <div className="flex flex-wrap items-center gap-5">
        <div className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-[#F1E7D8] text-center leading-none">
          <span>
            <span className="block text-[11px] tracking-wide text-[#8A6A4A] uppercase">
              {fmtDate(a.date, { month: "short" })}
            </span>
            <b className="mt-1 block text-3xl font-semibold">
              {parseISO(a.date).getDate()}
            </b>
            <span className="mt-1 block text-[11px] text-[#1F1A15]/50">
              {fmtDate(a.date, { weekday: "short" })}
            </span>
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-lg font-semibold">{a.type}</h2>
            <Badge tone={STATUS_TONE[a.status]}>{STATUS_LABEL[a.status]}</Badge>
          </div>
          <ul className="mt-2 grid gap-1.5 text-sm text-[#1F1A15]/60">
            <li className="flex items-center gap-2">
              <Clock size={14} /> {fmtTime(a.time)} ·{" "}
              {fmtDate(a.date, {
                year: "numeric",
                day: "numeric",
                month: "long",
              })}
            </li>
            <li className="flex items-center gap-2">
              <User size={14} /> {a.clinician}
            </li>
            <li className="flex items-center gap-2">
              <MapPin size={14} /> {a.location}
            </li>
          </ul>
          {a.notes && (
            <p className="mt-3 rounded-xl bg-[#FBF6EE] px-4 py-2.5 text-sm text-[#1F1A15]/65">
              {a.notes}
            </p>
          )}
        </div>
        <div className="flex w-full gap-2 sm:w-auto sm:flex-col">
          {tab === "upcoming" && (
            <>
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setEditing(a)}
              >
                Reschedule
              </Button>
              <Button
                variant="danger"
                className="flex-1"
                onClick={() => setCancelling(a)}
              >
                Cancel
              </Button>
            </>
          )}
          {tab !== "upcoming" && (
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setEditing("new")}
            >
              Book again
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default AppointmentCard;
