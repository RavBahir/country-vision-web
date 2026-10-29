import { BASIC_STATUS } from "@/lib/enums";

// pages/customers/common/customers.ts
// export type CustomerStatus = BASIC_STATUS

// export interface ICustomer {
//   id: string;
//   organizationId: string;
//   branchId: string;
//   roleId: string;
//   name: string;
//   email: string;
//   code: string;

//   phone1?: string | null;
//   phone2?: string | null;

//   emergencyContactName?: string | null;
//   emergencyContactEmail?: string | null;
//   emergencyContactPhone?: string | null;

//   address?: string | null;
//   city?: string | null;
//   country?: string | null;
//   notes?: string | null;
//   image?: string | null;
//   status?: CustomerStatus | null;

//   // Present only if the backend includes the relations
//   branch?: { id: string; name: string } | null;
//   role?: { id: string; name: string } | null;

//   createdAt?: string | Date;
//   updatedAt?: string | Date;
// }

export type IQuickCreateCustomer = Pick<ICustomer, "name" | "email"> &
  Partial<Omit<ICustomer, "id" | "name" | "email" | "createdAt" | "updatedAt">> & {password?: string};

export const customerKeys = {
  all: ["customers"] as const,
  lists: () => [...customerKeys.all, "list"] as const,
  detail: (id: string) => [...customerKeys.all, "detail", id] as const,
};

// pages/customers/common/customers.ts
export type CustomerStatus = "active" | "inactive" | "deleted";

export interface ICustomer {
  id: string;
  code: string;
  name: string;
  email: string;
  phone1?: string | null;
  phone2?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  notes?: string | null;
  image?: string | null;
  status?: CustomerStatus | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  emergencyContactEmail?: string | null;
  hasAccount?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ICreateCustomer {
  name: string;
  email: string;
  status: "active" | "inactive";
  phone1: string | null;
  phone2: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  notes: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  emergencyContactEmail: string | null;
  account?: { password: string };
}