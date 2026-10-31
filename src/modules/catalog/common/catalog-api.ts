// pages/catalog/common/catalog-api.ts
import { apiClient } from "@/lib/api-client";
import type { IPrescription } from "@/modules/appointments/common/staff";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  catalogKeys, orderKeys, type ICatalog, type ICatalogOrder, type IFrame, type IOption, type IOrderInput, type OrderStatus, type PayMethod,
} from "./catalog";

type W<T> = { data: T };
const unwrap = <T,>(p: Promise<W<T>>) => p.then((r) => r.data);

/* ---------- catalogue ---------- */

export const useCatalog = (enabled = true) =>
  useQuery({ queryKey: catalogKeys.active, queryFn: () => unwrap(apiClient<W<ICatalog>>("/catalog")), enabled, staleTime: 60_000 });

export const useCatalogAdmin = (enabled = true) =>
  useQuery({ queryKey: catalogKeys.admin, queryFn: () => unwrap(apiClient<W<ICatalog>>("/catalog/admin")), enabled });

export const useMyLatestRx = () =>
  useQuery({
    queryKey: ["my-latest-rx"],
    queryFn: () => unwrap(apiClient<W<IPrescription | null>>("/prescriptions/my/latest")),
    staleTime: 60_000,
  });

function useCatalogRefresh() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: catalogKeys.all });
}

export function useSaveFrame() {
  const refresh = useCatalogRefresh();
  return useMutation({
    mutationFn: ({ id, body }: { id?: string; body: Partial<Omit<IFrame, "id" | "code" | "colors">> & { colors?: { name: string; hex: string }[] } }) =>
      unwrap(apiClient<W<IFrame>>(id ? `/catalog/frames/${id}` : "/catalog/frames", { method: id ? "PATCH" : "POST", body })),
    onSettled: refresh,
  });
}
export function useDeleteFrame() {
  const refresh = useCatalogRefresh();
  return useMutation({ mutationFn: (id: string) => apiClient(`/catalog/frames/${id}`, { method: "DELETE" }), onSettled: refresh });
}
export function useSaveOption() {
  const refresh = useCatalogRefresh();
  return useMutation({
    mutationFn: ({ id, body }: { id?: string; body: Partial<Omit<IOption, "id">> }) =>
      unwrap(apiClient<W<IOption>>(id ? `/catalog/options/${id}` : "/catalog/options", { method: id ? "PATCH" : "POST", body })),
    onSettled: refresh,
  });
}
export function useDeleteOption() {
  const refresh = useCatalogRefresh();
  return useMutation({ mutationFn: (id: string) => apiClient(`/catalog/options/${id}`, { method: "DELETE" }), onSettled: refresh });
}
export function useSeedStarter() {
  const refresh = useCatalogRefresh();
  return useMutation({ mutationFn: () => apiClient("/catalog/starter", { method: "POST" }), onSettled: refresh });
}

/* ---------- orders ---------- */

function useOrderRefresh() {
  const qc = useQueryClient();
  return () => Promise.all([
    qc.invalidateQueries({ queryKey: orderKeys.all }),
    qc.invalidateQueries({ queryKey: ["payments"] }),
    qc.invalidateQueries({ queryKey: ["dashboard"] }),
  ]);
}

export const useMyOrders = () =>
  useQuery({ queryKey: orderKeys.mine, queryFn: () => unwrap(apiClient<W<ICatalogOrder[]>>("/orders/my")), staleTime: 30_000 });

export function usePlaceMyOrder() {
  const refresh = useOrderRefresh();
  return useMutation({
    mutationFn: (body: IOrderInput) => unwrap(apiClient<W<ICatalogOrder>>("/orders/my", { method: "POST", body })),
    onSettled: refresh,
  });
}
export function useCancelMyOrder() {
  const refresh = useOrderRefresh();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      unwrap(apiClient<W<ICatalogOrder>>(`/orders/my/${id}/cancel`, { method: "POST", body: { reason } })),
    onSettled: refresh,
  });
}

export interface IOrderFilters { status?: OrderStatus; search?: string }

export const useOrders = (f: IOrderFilters, enabled = true) =>
  useQuery({
    queryKey: orderKeys.list(f),
    queryFn: () => {
      const qs = new URLSearchParams();
      if (f.status) qs.set("status", f.status);
      if (f.search) qs.set("search", f.search);
      return apiClient<{ data: ICatalogOrder[]; counts: Record<string, number> }>(`/orders?${qs}`);
    },
    enabled,
    placeholderData: keepPreviousData,
  });

export const useOrder = (id: string, enabled = true) =>
  useQuery({ queryKey: orderKeys.detail(id), queryFn: () => unwrap(apiClient<W<ICatalogOrder>>(`/orders/${id}`)), enabled: enabled && !!id });

const act = <B,>(path: (id: string) => string, method = "POST") =>
  ({ id, body }: { id: string; body?: B }) => unwrap(apiClient<W<ICatalogOrder>>(path(id), { method, body }));

export function usePlaceStaffOrder() {
  const refresh = useOrderRefresh();
  return useMutation({
    mutationFn: (body: IOrderInput) => unwrap(apiClient<W<ICatalogOrder>>("/orders", { method: "POST", body })),
    onSettled: refresh,
  });
}
export function useOrderStatus() {
  const refresh = useOrderRefresh();
  return useMutation({ mutationFn: act<{ status: OrderStatus; reason?: string | null }>((id) => `/orders/${id}/status`), onSettled: refresh });
}
export function useSaveOrderNotes() {
  const refresh = useOrderRefresh();
  return useMutation({ mutationFn: act<{ staffNotes: string | null }>((id) => `/orders/${id}`, "PATCH"), onSettled: refresh });
}
export function useAddAdjustment() {
  const refresh = useOrderRefresh();
  return useMutation({ mutationFn: act<{ label: string; amount: number }>((id) => `/orders/${id}/adjustments`), onSettled: refresh });
}
export function useRemoveAdjustment() {
  const refresh = useOrderRefresh();
  return useMutation({
    mutationFn: ({ id, lineId }: { id: string; lineId: string }) =>
      unwrap(apiClient<W<ICatalogOrder>>(`/orders/${id}/adjustments/${lineId}`, { method: "DELETE" })),
    onSettled: refresh,
  });
}
export function useRecordPayment() {
  const refresh = useOrderRefresh();
  return useMutation({
    mutationFn: act<{ amount: number; method: PayMethod; reference?: string | null; note?: string | null }>((id) => `/orders/${id}/payments`),
    onSettled: refresh,
  });
}
export function useVoidPayment() {
  const refresh = useOrderRefresh();
  return useMutation({
    mutationFn: ({ id, paymentId, reason }: { id: string; paymentId: string; reason: string }) =>
      unwrap(apiClient<W<ICatalogOrder>>(`/orders/${id}/payments/${paymentId}/void`, { method: "POST", body: { reason } })),
    onSettled: refresh,
  });
}