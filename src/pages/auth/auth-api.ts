import { apiClient } from "@/lib/api-client";
import { useMutation } from "@tanstack/react-query";
import type { ILoginDetails, ILoginResponse } from "./auth";
import { tokenStorage } from "@/lib/token-storage";

export const loginApi = {
  loginUser: (data: ILoginDetails) =>
    apiClient<ILoginResponse>("/auth/login_user", {
      method: "POST",
      body: data,
    }),

  loginCustomer: (data: ILoginDetails) =>
    apiClient<ILoginResponse>("/auth/login_customer", {
      method: "POST",
      body: data,
    }),
};

const saveToken = (res: { accessToken?: string }) => {
  if (res.accessToken) tokenStorage.set(res.accessToken);
};

export function useLoginUser() {
  return useMutation<ILoginResponse, Error, ILoginDetails>({
    mutationFn: loginApi.loginUser,
    onSuccess: saveToken
});
}

export function useLoginCustomer() {
    return useMutation<ILoginResponse, Error, ILoginDetails>({
        mutationFn: loginApi.loginCustomer,
        onSuccess: saveToken
  });
}