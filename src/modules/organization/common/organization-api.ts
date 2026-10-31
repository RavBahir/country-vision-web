// pages/organization/common/organization-api.ts
import { apiClient } from "@/lib/api-client";
import { sessionKey } from "@/modules/auth/session";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orgKeys, type IOrganization, type IOrgPatch } from "./organization";

export const useOrganization = (enabled = true) =>
  useQuery({
    queryKey: orgKeys.me,
    queryFn: async () => (await apiClient<{ data: IOrganization }>("/organization")).data,
    enabled,
    staleTime: 60_000,
  });

export function useUpdateOrganization() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: IOrgPatch) =>
      (await apiClient<{ data: IOrganization }>("/organization", { method: "PATCH", body })).data,
    onSuccess: (org) => {
      qc.setQueryData(orgKeys.me, org);
      qc.invalidateQueries({ queryKey: sessionKey }); // the sidebar logo and name come from the session
    },
  });
}