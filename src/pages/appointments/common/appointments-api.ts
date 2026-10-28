// pages/appointments/common/appointments-api.ts
import { apiClient } from "@/lib/api-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  apptKeys,
  type IAppointment, type IAvailability, type IBookInput,
  type IBranchLite, type IChangeInput,
} from "./appointments";

const unwrap = <T,>(p: Promise<{ data: T }>) => p.then((r) => r.data);

export const myAppointmentsApi = {
  listCustomerAppointments: () => unwrap(apiClient<{ data: IAppointment[] }>("/appointments/my")),
  listAll: () => unwrap(apiClient<{ data: IAppointment[] }>("/appointments")),

  availability: (date: string, branchId?: string) => {
    const qs = new URLSearchParams({ date, ...(branchId ? { branchId } : {}) });
    return unwrap(
      apiClient<{ data: IAvailability }>(`/appointments/my/availability?${qs}`),
    );
  },

  branches: () => unwrap(apiClient<{ data: IBranchLite[] }>("/users/my/branches")),

  create: (body: IBookInput) =>
    unwrap(apiClient<{ data: IAppointment }>("/appointments/my", { method: "POST", body })),

  update: (id: string, body: IChangeInput) =>
    unwrap(apiClient<{ data: IAppointment }>(`/appointments/my/${id}`, { method: "PATCH", body })),

  cancel: (id: string, reason?: string) =>
    unwrap(
      apiClient<{ data: IAppointment }>(`/appointments/my/${id}/cancel`, {
        method: "POST",
        body: { reason },
      }),
    ),
};

export const useMyAppointments = () =>
  useQuery({ queryKey: apptKeys.listCustomers(), queryFn: myAppointmentsApi.listCustomerAppointments });

export const useGetAllAppointments = () =>
  useQuery({ queryKey: apptKeys.lists(), queryFn: myAppointmentsApi.listAll });

export const useAvailability = (date: string, branchId?: string) =>
  useQuery({
    queryKey: apptKeys.availability(date, branchId),
    queryFn: () => myAppointmentsApi.availability(date, branchId),
    enabled: Boolean(date),
    staleTime: 15_000, // slots go quickly, so keep this short
  });

export const useBranches = () =>
  useQuery({
    queryKey: apptKeys.branches(),
    queryFn: myAppointmentsApi.branches,
    staleTime: 10 * 60_000,
  });

/** Refreshes the list and any cached slots, since a booking changes both. */
function useRefresh() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: apptKeys.all });
}

export function useBookAppointment() {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: myAppointmentsApi.create,
    onSettled: refresh, // also on failure: a 409 means the slot list is stale
  });
}

export function useChangeAppointment() {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: IChangeInput }) =>
      myAppointmentsApi.update(id, data),
    onSettled: refresh,
  });
}

export function useCancelAppointment() {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      myAppointmentsApi.cancel(id, reason),
    onSettled: refresh,
  });
}