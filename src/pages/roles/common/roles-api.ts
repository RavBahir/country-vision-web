import { apiClient } from "@/lib/api-client";
import { IRole } from "@/pages/auth/auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { roleKeys } from "./roles";

type ListResponse<T> = T[] | { data?: T[]; roles?: T[]; items?: T[]; results?: T[] };

const toArray = <T,>(res: ListResponse<T> | null | undefined): T[] => {
  if (Array.isArray(res)) return res;
  return res?.data ?? res?.roles ?? res?.items ?? res?.results ?? [];
};

export const rolesApi = {
  getAll: async () => toArray(await apiClient<ListResponse<IRole>>("/roles")),
  // getAll: () => apiClient<IRole[]>("/roles"),

  getById: (id: string) => apiClient<Partial<IRole>>(`/roles/${id}`),

  create: (data: Partial<IRole>) =>
    apiClient<IRole>("/roles", {
      method: "POST",
      body: data,
    }),

  update: (id: string, data: Partial<IRole>) =>
    apiClient<IRole>(`/roles/${id}`, {
      method: "PATCH",
      body: data,
    }),

  delete: (id: string) =>
    apiClient<void>(`/roles/${id}`, {
      method: "DELETE",
    }),
};

export function useGetRoles() {
  return useQuery({
    queryKey: roleKeys.lists(),
    queryFn: rolesApi.getAll,
  });
}

export function useGetRole(id: string) {
  return useQuery({
    queryKey: roleKeys.detail(id),
    queryFn: () => rolesApi.getById(id),
    enabled: Boolean(id),
  });
}

export function useCreateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<IRole>) => rolesApi.create(data),

    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: roleKeys.lists(),
      }),
  });
}

export function useUpdateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<IRole> }) =>
      rolesApi.update(id, data),

    onSuccess: (role) => {
      queryClient.setQueryData(roleKeys.detail(role.id), role);

      return queryClient.invalidateQueries({
        queryKey: roleKeys.lists(),
      });
    },
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: rolesApi.delete,

    onSuccess: (_, id) => {
      queryClient.removeQueries({
        queryKey: roleKeys.detail(id),
        exact: true,
      });

      return queryClient.invalidateQueries({
        queryKey: roleKeys.lists(),
      });
    },
  });
}
