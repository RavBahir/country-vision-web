// pages/auth/session.ts
import { apiClient } from "@/lib/api-client";
import { tokenStorage, useHydrated, useToken } from "@/lib/token-storage";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { ILoginResponse } from "./auth";

export type ISession = Omit<ILoginResponse, "accessToken" | "refreshToken">;
export const sessionKey = ["session"] as const;

export function useSession() {
  const token = useToken();
  const hydrated = useHydrated();

  const query = useQuery({
    queryKey: sessionKey,
    queryFn: () => apiClient<ISession>("/auth/me"),
    enabled: Boolean(token),
    staleTime: 5 * 60_000,
    retry: false,
  });

  return {
    session: query.data ?? null,
    // true until we know whether someone is logged in
    isLoading: !hydrated || (Boolean(token) && query.isPending),
    isAuthenticated: Boolean(token) && Boolean(query.data),
  };
}

export function useLogout() {
  const queryClient = useQueryClient();
  return () => {
    tokenStorage.clear();
    queryClient.clear(); // no data leaks to the next account
  };
}