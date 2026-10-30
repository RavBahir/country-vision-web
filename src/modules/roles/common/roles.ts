// pages/roles/common/roles.ts
export type RoleStatus = "active" | "inactive" | "archived";

export interface IRole {
  id: string;
  name: string;
  description: string | null;
  isAdmin: boolean;
  isSystem: boolean;
  status: RoleStatus | null;
  permissions: string[];
  userCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface IRoleInput {
  name: string;
  description: string | null;
  isAdmin: boolean;
  status: "active" | "inactive";
  permissions: string[];
}

export const roleKeys = {
  all: ["roles"] as const,
  list: () => [...roleKeys.all, "list"] as const,
  detail: (id: string) => [...roleKeys.all, "detail", id] as const,
};