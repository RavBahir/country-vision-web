// pages/audit/common/audit.ts
export interface IAuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  summary: string;
  metadata: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: string;
  actorEmail: string;
  actor: { id: string; name: string } | null;
}

export interface IAuditMeta { total: number; page: number; size: number; totalPages?: number }

export interface IAuditFilters {
  actions?: string[];
  startDate?: string; // YYYY-MM-DD
  endDate?: string;
  search?: string;
  page: number;
  size: number;
}

export const CATEGORIES = [
  { id: "auth", label: "Sign-ins", actions: ["login", "login_failed", "logout", "password_reset"] },
  { id: "users", label: "Staff", actions: ["user_created", "user_updated", "user_deleted"] },
  { id: "customers", label: "Customers", actions: ["customer_created", "customer_updated", "customer_deleted"] },
  { id: "roles", label: "Roles", actions: ["role_created", "role_updated", "role_deleted"] },
  {
    id: "clinic", label: "Appointments & clinical",
    actions: [
      "appointment_created", "appointment_updated", "appointment_status_changed",
      "appointment_cancelled", "appointment_deleted",
      "exam_record_saved", "prescription_issued", "prescription_updated", "prescription_voided",
    ],
  },
  { id: "enquiries", label: "Enquiries", actions: ["enquiry_updated", "enquiry_status_changed", "enquiry_deleted"] },
  {
    id: "admin", label: "Organization",
    actions: ["branch_created", "branch_updated", "branch_switched", "organization_created", "organization_updated"],
  },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

export const actionLabel = (a: string) => {
  const s = a.replace(/_/g, " ");
  return s.charAt(0).toUpperCase() + s.slice(1);
};

export const actionTone = (a: string): "success" | "warn" | "neutral" | "danger" =>
  a === "login_failed" ? "danger"
  : a.endsWith("_deleted") || a.endsWith("_voided") || a.endsWith("_cancelled") ? "warn"
  : a.endsWith("_created") || a === "login" || a === "prescription_issued" ? "success"
  : "neutral";

export const auditKeys = { all: ["audit"] as const, list: (f: IAuditFilters) => ["audit", "list", f] as const };