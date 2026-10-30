// pages/enquiries/common/enquiries-api.ts
import { apiClient } from "@/lib/api-client";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { enquiryKeys, type IEnquiry, type IEnquiryCounts, type IEnquiryFilters, type IEnquiryPatch } from "./enquiries";

/** Public. Plain function (no React Query), so the landing page needs no provider. */
export const submitEnquiry = (body: {
  name: string; email: string; phone?: string; service: string; message: string; website?: string;
}) => apiClient<{ message: string }>("/enquiries/public", { method: "POST", body });

export const useEnquiries = (f: IEnquiryFilters, enabled = true) =>
  useQuery({
    queryKey: enquiryKeys.list(f),
    queryFn: () => {
      const qs = new URLSearchParams();
      if (f.status) qs.set("status", f.status);
      if (f.mine) qs.set("mine", "true");
      if (f.search) qs.set("search", f.search);
      return apiClient<{ data: IEnquiry[]; counts: IEnquiryCounts }>(`/enquiries?${qs}`);
    },
    enabled,
    placeholderData: keepPreviousData,
    refetchInterval: 60_000, // new enquiries arrive while the page is open
  });

function useRefresh() {
  const qc = useQueryClient();
  return () => Promise.all([
    qc.invalidateQueries({ queryKey: enquiryKeys.all }),
    qc.invalidateQueries({ queryKey: ["dashboard"] }),
  ]);
}

export function useUpdateEnquiry() {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: IEnquiryPatch }) =>
      (await apiClient<{ data: IEnquiry }>(`/enquiries/${id}`, { method: "PATCH", body: data })).data,
    onSettled: refresh,
  });
}

export function useDeleteEnquiry() {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: (id: string) => apiClient<{ data: { id: string } }>(`/enquiries/${id}`, { method: "DELETE" }),
    onSettled: refresh,
  });
}