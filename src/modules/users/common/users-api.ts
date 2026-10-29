import { apiClient } from "@/lib/api-client";
import { IUser, userKeys } from "./users";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

type ListResponse<T> = T[] | { data?: T[]; users?: T[]; items?: T[]; results?: T[] };

const toArray = <T,>(res: ListResponse<T> | null | undefined): T[] => {
  if (Array.isArray(res)) return res;
  return res?.data ?? res?.users ?? res?.items ?? res?.results ?? [];
};

export const usersApi = {
  getAll: async () => toArray(await apiClient<ListResponse<IUser>>("/users")),
  // getAll: () => apiClient<IUser[]>("/users"),

  getById: (id: string) => apiClient<Partial<IUser>>(`/users/${id}`),

  getMe: () => apiClient<Partial<IUser>>(`/users/me`),

  create: (data: Partial<IUser>) =>
    apiClient<IUser>("/users", {
      method: "POST",
      body: data,
    }),

  update: (id: string, data: Partial<IUser>) =>
    apiClient<IUser>(`/users/${id}`, {
      method: "PATCH",
      body: data,
    }),

  delete: (id: string) =>
    apiClient<void>(`/users/${id}`, {
      method: "DELETE",
    }),
};

export function useGetUsers() {
  return useQuery({
    queryKey: userKeys.lists(),
    queryFn: usersApi.getAll,
  });
}

export function useGetMyDetails() {
  return useQuery({
    queryKey: userKeys.lists(),
    queryFn: usersApi.getMe,
  });
}

export function useGetUser(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => usersApi.getById(id),
    enabled: Boolean(id),
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<IUser>) => usersApi.create(data),

    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: userKeys.lists(),
      }),
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<IUser> }) =>
      usersApi.update(id, data),

    onSuccess: (user) => {
      queryClient.setQueryData(userKeys.detail(user.id), user);

      return queryClient.invalidateQueries({
        queryKey: userKeys.lists(),
      });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: usersApi.delete,

    onSuccess: (_, id) => {
      queryClient.removeQueries({
        queryKey: userKeys.detail(id),
        exact: true,
      });

      return queryClient.invalidateQueries({
        queryKey: userKeys.lists(),
      });
    },
  });
}
