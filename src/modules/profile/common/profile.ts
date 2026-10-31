// pages/profile/common/profile.ts
export interface IProfile {
  kind: "user" | "customer";
  id: string;
  code: string;
  name: string;
  email: string;
  phone: string | null;
  createdAt: string;
  // staff
  roleName?: string;
  branchName?: string | null;
  // customer
  address?: string | null;
  city?: string | null;
  country?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  emergencyContactEmail?: string | null;
}

export type IProfilePatch = Partial<
  Pick<IProfile, "name" | "phone" | "address" | "city" | "country" |
    "emergencyContactName" | "emergencyContactPhone" | "emergencyContactEmail">
>;

export const profileKeys = { me: ["profile"] as const };