// pages/organization/common/organization.ts
export type Currency = "GHS" | "USD" | "NGN" | "EUR" | "GBP";
export interface IDayHours { open: string; close: string }

export interface IOrgSettings {
  timezone: string;
  currency: Currency;
  hours: Record<"0" | "1" | "2" | "3" | "4" | "5" | "6", IDayHours | null>;
  slotMinutes: number;
  minLeadMinutes: number;
  customerCancelCutoffHours: number;
  maxOpenPerCustomer: number;
  prescriptionValidityMonths: number;
  notifyEmail: string | null;
}

export interface IOrganization {
  id: string;
  name: string;
  code: string;
  status: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  logoUrl: string | null;
  createdAt: string;
  updatedAt: string;
  settings: IOrgSettings;
}

export interface IOrgPatch {
  name?: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  logo?: string | null;
  settings?: IOrgSettings;
}

export const orgKeys = { me: ["organization"] as const };