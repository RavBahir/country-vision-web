// pages/roles/common/roles-api.ts
import { apiClient } from "@/lib/api-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { roleKeys, type IRole, type IRoleInput } from "./roles";
import { sessionKey } from "@/modules/auth/session";

type Wrapped<T> = { data: T };
const unwrap = <T,>(p: Promise<Wrapped<T>>) => p.then((r) => r.data);

export const rolesApi = {
  list: () => unwrap(apiClient<Wrapped<IRole[]>>("/roles")),
  get: (id: string) => unwrap(apiClient<Wrapped<IRole>>(`/roles/${id}`)),
  create: (body: IRoleInput) => unwrap(apiClient<Wrapped<IRole>>("/roles", { method: "POST", body })),
  update: (id: string, body: Partial<IRoleInput>) =>
    unwrap(apiClient<Wrapped<IRole>>(`/roles/${id}`, { method: "PATCH", body })),
  remove: (id: string) => apiClient<Wrapped<{ id: string }>>(`/roles/${id}`, { method: "DELETE" }),
};

export const useRoles = (enabled = true) =>
  useQuery({ queryKey: roleKeys.list(), queryFn: rolesApi.list, enabled, staleTime: 30_000 });

export const useRole = (id: string, enabled = true) =>
  useQuery({ queryKey: roleKeys.detail(id), queryFn: () => rolesApi.get(id), enabled: enabled && Boolean(id) });

/** For dropdowns, e.g. the staff form's role picker. */
export function useRoleOptions() {
  const q = useRoles();
  const options = (q.data ?? [])
    .filter((r) => r.status !== "inactive")
    .map((r) => ({ value: r.id, label: r.name }));
  return { ...q, options };
}

function useRefresh() {
  const qc = useQueryClient();
  return () =>
    Promise.all([
      qc.invalidateQueries({ queryKey: roleKeys.all }),
      qc.invalidateQueries({ queryKey: ["users"] }),   // use your real userKeys base
      qc.invalidateQueries({ queryKey: sessionKey }),  // editing your own role changes your permissions
    ]);
}

export function useCreateRole() {
  const refresh = useRefresh();
  return useMutation({ mutationFn: rolesApi.create, onSettled: refresh });
}

export function useUpdateRole() {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<IRoleInput> }) => rolesApi.update(id, data),
    onSettled: refresh,
  });
}

export function useDeleteRole() {
  const refresh = useRefresh();
  return useMutation({ mutationFn: rolesApi.remove, onSettled: refresh });
}