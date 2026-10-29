import { apiClient } from "@/lib/api-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ILoginDetails, ILoginResponse } from "./auth";
import { tokenStorage } from "@/lib/token-storage";
import { sessionKey } from "./session";

interface IVerifyPasswordResetPayload {
  email: string;
  otp: string;
  newPassword: string;
}

interface IResetPayload {
  email: string;
}
interface IResetResponse {
  message: string;
}

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

  sendResetUserOTP: (data: IResetPayload) =>
    apiClient<IResetResponse>("/auth/reset_user_otp", {
      method: "POST",
      body: data,
    }),

  verifyResetUserOTP: (data: IVerifyPasswordResetPayload) =>
    apiClient<IResetResponse>("/auth/verify_user_reset_otp", {
      method: "POST",
      body: data,
    }),

  sendResetCustomerOTP: (data: IResetPayload) =>
    apiClient<IResetResponse>("/auth/reset_customer_otp", {
      method: "POST",
      body: data,
    }),

  verifyResetCustomerOTP: (data: IVerifyPasswordResetPayload) =>
    apiClient<IResetResponse>("/auth/verify_customer_reset_otp", {
      method: "POST",
      body: data,
    }),
};

const saveToken = (res: { accessToken?: string }) => {
  if (res.accessToken) tokenStorage.set(res.accessToken);
};

export function useLoginUser() {
  const queryClient = useQueryClient();
  return useMutation<
    ILoginResponse,
    Error,
    ILoginDetails & { remember?: boolean }
  >({
    mutationFn: ({ remember, ...creds }) => loginApi.loginUser(creds),
    onSuccess: ({ accessToken, ...session }, { remember = true }) => {
      tokenStorage.set(accessToken, remember);
      queryClient.setQueryData(sessionKey, session);
    },
  });
}

export function useLoginCustomer() {
  const queryClient = useQueryClient();
  return useMutation<
    ILoginResponse,
    Error,
    ILoginDetails & { remember?: boolean }
  >({
    mutationFn: ({ remember, ...creds }) => loginApi.loginCustomer(creds),
    onSuccess: ({ accessToken, ...session }, { remember = true }) => {
      tokenStorage.set(accessToken, remember);
      queryClient.setQueryData(sessionKey, session);
    },
  });
}

export function useResetUserOTP() {
  return useMutation<IResetResponse, Error, IResetPayload>({
    mutationFn: loginApi.sendResetUserOTP,
  });
}

export function useVerifyResetUserOTP() {
  return useMutation<IResetResponse, Error, IVerifyPasswordResetPayload>({
    mutationFn: loginApi.verifyResetUserOTP,
  });
}
