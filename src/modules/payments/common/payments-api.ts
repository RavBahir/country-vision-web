// pages/payments/common/payments-api.ts
import { apiClient } from "@/lib/api-client";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { paymentKeys, type IPaymentFilters, type IPaymentRow, type IPaymentTotals, type IReceipt } from "./payments";

const base = (scope: "staff" | "customer") => (scope === "customer" ? "/payments/my" : "/payments");

export const usePayments = (scope: "staff" | "customer", f: IPaymentFilters, enabled = true) =>
  useQuery({
    queryKey: paymentKeys.list(scope, f),
    queryFn: () => {
      const qs = new URLSearchParams();
      Object.entries(f).forEach(([k, v]) => v && qs.set(k, String(v)));
      return apiClient<{ data: IPaymentRow[]; totals: IPaymentTotals }>(`${base(scope)}?${qs}`);
    },
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 15_000,
  });

export const fetchReceipt = async (scope: "staff" | "customer", id: string) =>
  (await apiClient<{ data: IReceipt }>(`${base(scope)}/${id}/receipt`)).data;