// pages/dashboard/common/dashboard-api.ts
import { apiClient } from "@/lib/api-client";
import { useQuery } from "@tanstack/react-query";
import { dashboardKeys, type ICustomerDashboard, type IStaffDashboard } from "./dashboard";

export const useStaffDashboard = (enabled: boolean) =>
  useQuery({
    queryKey: dashboardKeys.staff,
    queryFn: async () => (await apiClient<{ data: IStaffDashboard }>("/dashboard/staff")).data,
    enabled,
    staleTime: 30_000,
    refetchInterval: 60_000, // the schedule changes during the day
  });

export const useCustomerDashboard = (enabled: boolean) =>
  useQuery({
    queryKey: dashboardKeys.customer,
    queryFn: async () => (await apiClient<{ data: ICustomerDashboard }>("/dashboard/customer")).data,
    enabled,
    staleTime: 60_000,
  });