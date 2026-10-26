// pages/customers/common/customers-api.ts
import { apiClient } from "@/lib/api-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customerKeys, type ICreateCustomer, type ICustomer } from "./customers";

type ListResponse<T> =
  | T[]
  | { data?: T[]; customers?: T[]; items?: T[]; results?: T[] };

const toArray = <T,>(res: ListResponse<T> | null | undefined): T[] => {
  if (Array.isArray(res)) return res;
  return res?.data ?? res?.customers ?? res?.items ?? res?.results ?? [];
};

export const customersApi = {
  getAll: async () =>
    toArray(await apiClient<ListResponse<ICustomer>>("/customers")),

  getById: (id: string) => apiClient<ICustomer>(`/customers/${id}`),

  create: (data: ICreateCustomer) =>
    apiClient<ICustomer>("/customers", { method: "POST", body: data }),

  update: (id: string, data: Partial<ICustomer>) =>
    apiClient<ICustomer>(`/customers/${id}`, { method: "PATCH", body: data }),

  delete: (id: string) =>
    apiClient<void>(`/customers/${id}`, { method: "DELETE" }),
};

export function useGetCustomers() {
  return useQuery({
    queryKey: customerKeys.lists(),
    queryFn: customersApi.getAll,
  });
}

export function useGetCustomer(id: string) {
  return useQuery({
    queryKey: customerKeys.detail(id),
    queryFn: () => customersApi.getById(id),
    enabled: Boolean(id),
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ICreateCustomer) => customersApi.create(data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() }),
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ICustomer> }) =>
      customersApi.update(id, data),
    onSuccess: (customer) => {
      queryClient.setQueryData(customerKeys.detail(customer.id), customer);
      return queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
    },
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: customersApi.delete,
    onSuccess: (_, id) => {
      queryClient.removeQueries({
        queryKey: customerKeys.detail(id),
        exact: true,
      });
      return queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
    },
  });
}