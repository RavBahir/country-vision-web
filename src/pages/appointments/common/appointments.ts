// pages/appointments/common/appointments.ts
export type ApptStatus =
  | "pending" | "approved" | "in_progress" | "completed" | "cancelled" | "no_show";

export type ApptType =
  | "eye_checkup" | "contact_lens_fitting" | "frame_fitting"
  | "follow_up" | "collection" | "other";

export interface IAppointment {
  id: string;
  code: string;
  type: ApptType;
  status: ApptStatus;
  startsAt: string;
  endsAt: string;
  date: string;              // "YYYY-MM-DD" (clinic-local, added by the API)
  time: string;              // "HH:mm"
  notes: string | null;
  clinician: string | null;  // optometrist name, null until assigned
  location: string | null;   // branch name
  branchId: string;
  cancelReason: string | null;
  cancelledBy: "customer" | "staff" | null;
  /** Only present once completed. Customers never see clinical notes. */
  detail: { recommendations: string | null; followUpDate: string | null } | null;
}

export interface ISlot { time: string; available: boolean }
export interface IAvailability { date: string; closed: boolean; slots: ISlot[] }

export interface IBranchLite { id: string; name: string; address?: string | null }

export interface IBookInput {
  branchId?: string;
  type: ApptType;
  date: string;
  time: string;
  notes?: string | null;
}
export type IChangeInput = Partial<Omit<IBookInput, "branchId">>;

export const apptKeys = {
  all: ["my-appointments"] as const,
  lists: () => [...apptKeys.all, "list"] as const,
  listCustomers: () => [...apptKeys.all, "customers"] as const,
  availability: (date: string, branchId?: string) =>
    [...apptKeys.all, "availability", date, branchId ?? "default"] as const,
  branches: () => [...apptKeys.all, "branches"] as const,
};