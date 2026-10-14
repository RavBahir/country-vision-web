import { ApptStatus } from "@/lib/portal-data";

export type IAppointmentTab = "upcoming" | "past" | "cancelled";

export const STATUS_TONE: Record<ApptStatus, "success" | "warn" | "neutral" | "danger"> = {
  confirmed: "success", pending: "warn", completed: "neutral", cancelled: "danger",
};
export const STATUS_LABEL: Record<ApptStatus, string> = {
  confirmed: "Confirmed", pending: "Pending", completed: "Completed", cancelled: "Cancelled",
};