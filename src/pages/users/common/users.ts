import { BASIC_STATUS } from "@/lib/enums";
import { IBranch, IRole } from "@/pages/auth/auth";

export interface IUser {
  id: string;
  name: string;
  phone: string;
  email: string
  password?: string
  roleId?: string
  role: IRole
  image?: string
  status?: BASIC_STATUS
  currenntBranchId?: string
  currentBranch?: IBranch
  isSuperAdmin?: boolean
  createdAt?: string
  updatedAt?: string
}

export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};
