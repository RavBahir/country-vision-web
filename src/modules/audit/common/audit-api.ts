// pages/audit/common/audit-api.ts
import { apiClient } from "@/lib/api-client";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { auditKeys, type IAuditFilters, type IAuditLog, type IAuditMeta } from "./audit";

export const useAuditLogs = (f: IAuditFilters, enabled = true) =>
  useQuery({
    queryKey: auditKeys.list(f),
    queryFn: () => {
      const qs = new URLSearchParams({ page: String(f.page), size: String(f.size) });
      if (f.actions?.length) qs.set("actions", f.actions.join(","));
      if (f.startDate) qs.set("startDate", f.startDate);
      if (f.endDate) qs.set("endDate", f.endDate);
      if (f.search) qs.set("search", f.search);
      return apiClient<{ data: IAuditLog[]; meta: IAuditMeta }>(`/audit-logs?${qs}`);
    },
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 15_000,
  });