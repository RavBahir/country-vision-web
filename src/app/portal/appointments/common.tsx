// app/portal/appointments/common.ts
import type { ApptStatus, ApptType, IAppointment } from "@/modules/appointments/common/appointments";

export type IAppointmentTab = "upcoming" | "past" | "cancelled";

type Tone = "success" | "warn" | "neutral" | "danger";

export const STATUS_LABEL: Record<ApptStatus, string> = {
  pending: "Awaiting confirmation",
  approved: "Confirmed",
  in_progress: "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "Missed",
};

export const STATUS_TONE: Record<ApptStatus, Tone> = {
  pending: "warn",
  approved: "success",
  in_progress: "success",
  completed: "neutral",
  cancelled: "danger",
  no_show: "danger",
};

export const TYPE_LABEL: Record<ApptType, string> = {
  eye_checkup: "Eye checkup",
  contact_lens_fitting: "Contact lens fitting",
  frame_fitting: "Frame fitting",
  follow_up: "Follow-up",
  collection: "Collection",
  other: "Other",
};

export const TYPE_OPTIONS = (Object.keys(TYPE_LABEL) as ApptType[]).map((value) => ({
  value,
  label: TYPE_LABEL[value],
}));

/** Keep in sync with CUSTOMER_CANCEL_CUTOFF_HOURS on the server. */
export const CUTOFF_HOURS = 12;

export const hoursUntil = (a: IAppointment) =>
  (new Date(a.startsAt).getTime() - Date.now()) / 3_600_000;

/** Server rules: only pending/approved, and not inside the cutoff window. */
export const canChange = (a: IAppointment) =>
  (a.status === "pending" || a.status === "approved") && hoursUntil(a) >= CUTOFF_HOURS;

export const isOpen = (a: IAppointment) =>
  a.status === "pending" || a.status === "approved" || a.status === "in_progress";