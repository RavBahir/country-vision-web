// pages/appointments/common/staff-api.ts
import { apiClient } from "@/lib/api-client";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { IAvailability, IBranchLite } from "./appointments";
import {
  staffKeys,
  type IApptFilters, type IExamInput, type IExamRecord, type IOptometrist,
  type IPrescription, type IRxInput, type IStaffAppointment, type IStaffBookInput,
  type IStaffChangeInput, type IStatusInput,
} from "./staff";

type Wrapped<T> = { data: T };
const unwrap = <T,>(p: Promise<Wrapped<T>>) => p.then((r) => r.data);

const qs = (o: Record<string, unknown>) => {
  const p = new URLSearchParams();
  Object.entries(o).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "" && v !== false) p.set(k, String(v));
  });
  const s = p.toString();
  return s ? `?${s}` : "";
};

export const staffApi = {
  list: (f: IApptFilters) =>
    unwrap(apiClient<Wrapped<IStaffAppointment[]>>(`/appointments${qs({ ...f })}`)),
  get: (id: string) => unwrap(apiClient<Wrapped<IStaffAppointment>>(`/appointments/${id}`)),
  optometrists: (branchId?: string) =>
    unwrap(apiClient<Wrapped<IOptometrist[]>>(`/appointments/optometrists${qs({ branchId })}`)),
  availability: (date: string, branchId?: string, optometristId?: string) =>
    unwrap(
      apiClient<Wrapped<IAvailability>>(
        `/appointments/availability${qs({ date, branchId, optometristId })}`,
      ),
    ),
  branches: async (): Promise<IBranchLite[]> => {
    const r = await apiClient<IBranchLite[] | Wrapped<IBranchLite[]>>("/branches");
    return Array.isArray(r) ? r : (r.data ?? []);
  },

  create: (body: IStaffBookInput) =>
    unwrap(apiClient<Wrapped<IStaffAppointment>>("/appointments", { method: "POST", body })),
  update: (id: string, body: IStaffChangeInput) =>
    unwrap(apiClient<Wrapped<IStaffAppointment>>(`/appointments/${id}`, { method: "PATCH", body })),
  status: (id: string, body: IStatusInput) =>
    unwrap(apiClient<Wrapped<IStaffAppointment>>(`/appointments/${id}/status`, { method: "POST", body })),

  record: (id: string) =>
    unwrap(apiClient<Wrapped<IExamRecord | null>>(`/appointments/${id}/record`)),
  saveRecord: (id: string, body: IExamInput) =>
    unwrap(apiClient<Wrapped<IExamRecord>>(`/appointments/${id}/record`, { method: "PUT", body })),

  issueRx: (id: string, body: IRxInput) =>
    unwrap(apiClient<Wrapped<IPrescription>>(`/appointments/${id}/prescriptions`, { method: "POST", body })),
  customerRx: (customerId: string) =>
    unwrap(apiClient<Wrapped<IPrescription[]>>(`/prescriptions${qs({ customerId })}`)),
  voidRx: (id: string) => apiClient<Wrapped<{ id: string }>>(`/prescriptions/${id}`, { method: "DELETE" }),
};

/* ---------- queries ---------- */

export const useStaffAppointments = (f: IApptFilters) =>
  useQuery({
    queryKey: staffKeys.list(f),
    queryFn: () => staffApi.list(f),
    placeholderData: keepPreviousData, // no table flash while filters change
  });

export const useStaffAppointment = (id: string) =>
  useQuery({ queryKey: staffKeys.detail(id), queryFn: () => staffApi.get(id), enabled: Boolean(id) });

export const useOptometrists = (branchId?: string, enabled = true) =>
  useQuery({
    queryKey: staffKeys.optometrists(branchId),
    queryFn: () => staffApi.optometrists(branchId),
    enabled,
    staleTime: 5 * 60_000,
  });

export const useStaffAvailability = (date: string, branchId?: string, optometristId?: string) =>
  useQuery({
    queryKey: staffKeys.availability(date, branchId, optometristId),
    queryFn: () => staffApi.availability(date, branchId, optometristId),
    enabled: Boolean(date),
    staleTime: 15_000,
  });

export const useStaffBranches = () =>
  useQuery({ queryKey: staffKeys.branches(), queryFn: staffApi.branches, staleTime: 10 * 60_000 });

export const useExamRecord = (id: string, enabled: boolean) =>
  useQuery({ queryKey: staffKeys.record(id), queryFn: () => staffApi.record(id), enabled });

export const useCustomerPrescriptions = (customerId: string, enabled: boolean) =>
  useQuery({
    queryKey: staffKeys.rx(customerId),
    queryFn: () => staffApi.customerRx(customerId),
    enabled: enabled && Boolean(customerId),
  });

/* ---------- mutations ---------- */

function useRefresh() {
  const qc = useQueryClient();
  return () =>
    Promise.all([
      qc.invalidateQueries({ queryKey: staffKeys.all }),
      qc.invalidateQueries({ queryKey: ["prescriptions"] }),
    ]);
}

export function useStaffBook() {
  const refresh = useRefresh();
  return useMutation({ mutationFn: staffApi.create, onSettled: refresh });
}

export function useStaffUpdate() {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: IStaffChangeInput }) => staffApi.update(id, data),
    onSettled: refresh,
  });
}

export function useChangeStatus() {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: IStatusInput }) => staffApi.status(id, body),
    onSettled: refresh,
  });
}

export function useSaveExamRecord() {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: IExamInput }) => staffApi.saveRecord(id, body),
    onSettled: refresh,
  });
}

export function useIssuePrescription() {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: IRxInput }) => staffApi.issueRx(id, body),
    onSettled: refresh,
  });
}

export function useVoidPrescription() {
  const refresh = useRefresh();
  return useMutation({ mutationFn: staffApi.voidRx, onSettled: refresh });
}