// pages/dashboard/common/dashboard.ts

import { IAppointment } from "@/lib/portal-data";
import { IPrescription, IStaffAppointment } from "@/modules/appointments/common/staff";

export interface IStaffDashboard {
  scope: { branchName: string | null };
  /** null = the role lacks permission for that figure, so hide the tile */
  stats: {
    todayCount: number | null; mineToday: number | null; pendingCount: number | null;
    completedMonth: number | null; customers: number | null; newCustomers: number | null;
    staffCount: number | null;
  };
  today: IStaffAppointment[] | null;
  pending: IStaffAppointment[] | null;
  week: { date: string; count: number }[] | null;
}

export interface ICustomerDashboard {
  upcoming: IAppointment[];
  stats: { upcomingCount: number; awaiting: number; examCount: number };
  lastCheckup: {
    id: string; code: string; type: IAppointment["type"]; date: string;
    clinician: string | null; followUpDate: string | null;
  } | null;
  prescription: IPrescription | null;
}

export const dashboardKeys = {
  staff: ["dashboard", "staff"] as const,
  customer: ["dashboard", "customer"] as const,
};