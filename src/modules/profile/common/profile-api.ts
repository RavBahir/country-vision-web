// pages/profile/common/profile-api.ts
import { apiClient } from "@/lib/api-client";
import { sessionKey } from "@/modules/auth/session"; // use the same path as your useSession import
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { profileKeys, type IProfile, type IProfilePatch } from "./profile";

export const useProfile = () =>
  useQuery({
    queryKey: profileKeys.me,
    queryFn: async () => (await apiClient<{ data: IProfile }>("/profile")).data,
    staleTime: 60_000,
  });

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: IProfilePatch) =>
      (await apiClient<{ data: IProfile }>("/profile", { method: "PATCH", body })).data,
    onSuccess: (p) => {
      qc.setQueryData(profileKeys.me, p);
      qc.invalidateQueries({ queryKey: sessionKey }); // the dashboard greeting uses the session name
    },
  });
}

export const useChangePassword = () =>
  useMutation({
    mutationFn: (body: { currentPassword: string; newPassword: string }) =>
      apiClient<{ message: string }>("/profile/password", { method: "POST", body }),
  });