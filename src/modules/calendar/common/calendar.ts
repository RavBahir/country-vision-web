// pages/calendar/common/calendar.ts

import { ApptStatus, ApptType } from "@/lib/portal-data";

export type CalKind = "appointment" | "followup";

export interface ICalEvent {
  id: string;
  kind: CalKind;
  appointmentId: string;
  date: string;              // YYYY-MM-DD, clinic time
  time: string | null;       // HH:mm, null for follow-ups
  type?: ApptType;
  status?: ApptStatus;
  clinician?: string | null;
  location?: string | null;
  customerName?: string;     // staff only
}

export const calendarKeys = {
  all: ["calendar"] as const,
  range: (from: string, to: string, mine: boolean) => ["calendar", from, to, mine] as const,
};