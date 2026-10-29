// pages/appointments/common/staff.ts
import type { ApptStatus, ApptType, IAppointment } from "./appointments";

export interface IStaffAppointment extends Omit<IAppointment, "detail"> {
  customerId: string;
  optometristId: string | null;
  startedAt: string | null;
  completedAt: string | null;
  customer: { id: string; name: string; code: string; email: string; phone1: string | null };
  optometrist: { id: string; name: string } | null;
  detail: {
    id: string;
    isFinalized: boolean;
    recommendations: string | null;
    followUpDate: string | null;
  } | null;
}

export interface IApptFilters {
  status?: ApptStatus;
  from?: string;
  to?: string;
  mine?: boolean;
  search?: string;
  customerId?: string;
  optometristId?: string;
}

export interface IStatusInput {
  status: ApptStatus;
  optometristId?: string;
  cancelReason?: string | null;
}

export interface IStaffBookInput {
  customerId: string;
  branchId?: string;
  optometristId?: string;
  type: ApptType;
  date: string;
  time: string;
  notes?: string | null;
}

export interface IStaffChangeInput {
  date?: string;
  time?: string;
  optometristId?: string | null;
  type?: ApptType;
  notes?: string | null;
}

export interface IOptometrist { id: string; name: string }

/* ---- clinical ---- */

export interface IExamInput {
  chiefComplaint: string | null;
  medicalHistory: string | null;
  ocularHistory: string | null;
  currentCorrection: string | null;
  vaRightUnaided: string | null;
  vaLeftUnaided: string | null;
  vaRightAided: string | null;
  vaLeftAided: string | null;
  iopRight: number | null;
  iopLeft: number | null;
  examination: string | null;
  diagnosis: string | null;
  clinicalNotes: string | null;
  recommendations: string | null;
  followUpDate: string | null; // YYYY-MM-DD
  referralTo: string | null;
}

export interface IExamRecord extends IExamInput {
  id: string;
  appointmentId: string;
  isFinalized: boolean;
  finalizedAt: string | null;
  updatedAt: string;
  recordedBy: { id: string; name: string } | null;
  prescriptions: IPrescription[];
}

export type RxType = "single_vision" | "bifocal" | "progressive" | "reading" | "contact_lens";
export type RxBase = "up" | "down" | "in" | "out";

export interface IEyeRx {
  sphere: number | null;
  cylinder: number | null;
  axis: number | null;
  add: number | null;
  prism: number | null;
  base: RxBase | null;
  pd: number | null;
}

export interface IPrescription {
  id: string;
  customerId: string;
  type: RxType;
  status: string;
  right: IEyeRx;
  left: IEyeRx;
  pdDistance: number | null;
  pdNear: number | null;
  issuedAt: string;
  expiresAt: string | null;
  expired: boolean;
  notes: string | null;
  issuedBy: { id: string; name: string } | null;
  summary: string;
}

export interface IRxInput {
  type: RxType;
  right: IEyeRx;
  left: IEyeRx;
  pdDistance: number | null;
  pdNear: number | null;
  expiresAt?: string;
  notes: string | null;
}

export const staffKeys = {
  all: ["appointments"] as const,
  list: (f: IApptFilters) => [...staffKeys.all, "list", f] as const,
  detail: (id: string) => [...staffKeys.all, "detail", id] as const,
  record: (id: string) => [...staffKeys.all, "record", id] as const,
  optometrists: (branchId?: string) => [...staffKeys.all, "optometrists", branchId ?? "default"] as const,
  availability: (date: string, branchId?: string, optometristId?: string) =>
    [...staffKeys.all, "availability", date, branchId ?? "default", optometristId ?? "any"] as const,
  branches: () => [...staffKeys.all, "branches"] as const,
  rx: (customerId: string) => ["prescriptions", customerId] as const,
};