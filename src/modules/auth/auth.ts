export type ILoginDetails = {
  email: string;
  password: string;
};

export interface IOrganization {
  id: string;
  name: string;
  code?: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  logoUrl?: string | null;
  status?: string | null;
}

export interface IBranch {
  id: string;
  name: string;
  code?: string;
  isMain?: boolean;
}

export interface IRole {
  id: string;
  name: string;
  roleId?: string
  isAdmin?: boolean;
}

export type ILoginAuth = {
  loginCount?: number | null;
  lastLoginAt?: string | Date | null;
  emailIsVerified?: boolean;
};

export type IUserValidationInfo = {
  id: string;
  name: string;
  email: string;
  organizationId: string;
  roleId: string;
  roleName?: string;
  kind: "user" | "customer"
  isAdmin?: boolean;
  isSuperadmin?: boolean;
  emailIsVerified?: boolean;
  image?: string | null;
  branchId?: string | null;
};

export type ILoginAccess = {
  organization?: IOrganization;
  role: IRole;
  auth: ILoginAuth;
  permissions: string[];
  currentBranch?: IBranch | null;
};

export type ILoginResponse = {
  message: string;
  accessToken: string;
  emailIsVerified: boolean;
  isLoggedIn: boolean;
  kind: "user" | "customer";
  user_validation_info: IUserValidationInfo;
  organization: IOrganization;
  currentBranch?: IBranch | null;
  isSuperadmin?: boolean;
  access: ILoginAccess;
};

export type ILoggedInUser = {
  user: IUserValidationInfo | null;
  organization: IOrganization | null;
  role: IRole | null;
  permissions: string[] | null;
  auth: ILoginAuth | null;
  currentBranch: IBranch | null;
  isSuperadmin: boolean;
  /** Set while a super admin is impersonating another user. */
  impersonating: boolean;
};
