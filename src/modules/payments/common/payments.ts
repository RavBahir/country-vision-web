// pages/payments/common/payments.ts
import type { PayMethod } from "@/modules/catalog/common/catalog";

export interface IPaymentRow {
  id: string;
  code: string;
  amount: number;
  method: PayMethod;
  reference: string | null;
  status: "paid" | "voided";
  paidAt: string;
  date: string;   // YYYY-MM-DD, clinic time
  time: string;
  order: { id: string; code: string; title: string; kind: "frame" | "lenses_only"; status: string };
  // staff only
  customer?: { id: string; name: string; code: string };
  receivedBy?: string | null;
  voidReason?: string | null;
}

export interface IPaymentTotals { year: number; month: number; voided: number; outstanding: number }

export interface IPaymentFilters {
  status?: "paid" | "voided";
  method?: PayMethod;
  kind?: "frame" | "lenses_only";
  from?: string;
  to?: string;
  search?: string;
}

export interface IReceipt {
  code: string; amount: number; method: PayMethod; reference: string | null;
  date: string; time: string; receivedBy: string | null;
  organization: { name: string; phone: string | null; email: string | null; address: string | null } | null;
  customer: { name: string; code: string };
  order: { code: string; title: string; total: number; paid: number; balance: number; lines: { label: string; amount: number }[] };
}

export const paymentKeys = {
  all: ["payments"] as const,
  list: (scope: "staff" | "customer", f: IPaymentFilters) => ["payments", scope, f] as const,
};