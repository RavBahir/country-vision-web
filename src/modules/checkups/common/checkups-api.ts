// pages/checkups/common/checkups-api.ts
import { apiClient } from "@/lib/api-client";
import { useQuery } from "@tanstack/react-query";
import { checkupKeys, type ICheckup } from "./checkups";

export const useMyCheckups = () =>
  useQuery({
    queryKey: checkupKeys.list(),
    queryFn: async () =>
      (await apiClient<{ data: ICheckup[] }>("/checkups/my")).data,
    staleTime: 60_000,
  });