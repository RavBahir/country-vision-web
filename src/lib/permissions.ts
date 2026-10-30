// lib/permissions.ts
export const ACTIONS = ["View", "Create", "Update", "Delete"] as const;
export type Action = (typeof ACTIONS)[number];

export interface PermissionDef {
  key: string;
  label: string;
  group: string;
  resource?: string;
  action?: Action;
}

interface ResourceDef {
  id: string; // PascalCase, becomes part of the key
  noun: string; // used in labels
  group: string;
  actions: readonly Action[];
}

const CRUD = ["View", "Create", "Update", "Delete"] as const;
const NO_DELETE = ["View", "Create", "Update"] as const; // payments: refund = update
const VIEW_UPDATE = ["View", "Update"] as const; // company profile
const VIEW_ONLY = ["View"] as const; // audit log
const VIEW_UPDATE_DELETE = ["View", "Update", "Delete"] as const;

// inside RESOURCES
/** Single source of truth. Remove any resource your app doesn't have yet. */
const RESOURCES = [
  { id: "Enquiries", noun: "website enquiries", group: "People", actions: VIEW_UPDATE_DELETE },
  { id: "Appointments", noun: "appointments", group: "Clinic", actions: CRUD },
  { id: "Prescriptions", noun: "prescriptions", group: "Clinic", actions: CRUD },
  { id: "ExamRecords", noun: "exam records", group: "Clinic", actions: CRUD },

  { id: "Orders", noun: "spectacle orders", group: "Sales", actions: CRUD },
  { id: "Payments", noun: "payments & receipts", group: "Sales", actions: NO_DELETE },

  { id: "Products", noun: "frames, lenses & accessories", group: "Catalogue", actions: CRUD },

  { id: "Customers", noun: "customers", group: "People", actions: CRUD },
  { id: "Users", noun: "staff accounts", group: "People", actions: CRUD },
  { id: "Roles", noun: "roles & permissions", group: "People", actions: CRUD },

  { id: "Branches", noun: "branches", group: "Administration", actions: CRUD },
  { id: "Company", noun: "the company profile", group: "Administration", actions: VIEW_UPDATE },
  { id: "AuditLog", noun: "the audit log", group: "Administration", actions: VIEW_ONLY },
] as const satisfies readonly ResourceDef[];

/** Permissions that aren't create/read/update/delete on a resource. */
const EXTRA = [
  { key: "canViewDashboard", label: "View the dashboard", group: "Overview" },
  { key: "canViewReports", label: "View reports", group: "Overview" },
  { key: "canSwitchBranch", label: "Switch active branch", group: "Administration" },
  { key: "canViewAllAuditLogs", label: "View every actor's audit entries", group: "Administration" },
] as const satisfies readonly PermissionDef[];

/* ---------- types ---------- */

type ResourceId = (typeof RESOURCES)[number]["id"];
type ExtraKey = (typeof EXTRA)[number]["key"];
export type Permission = `can${Action}${ResourceId}` | ExtraKey;

/* ---------- catalogue ---------- */

const VERB: Record<Action, string> = {
  View: "View",
  Create: "Add",
  Update: "Edit",
  Delete: "Delete",
};

const RESOURCE_LIST: readonly ResourceDef[] = RESOURCES;

const resourcePerms: PermissionDef[] = RESOURCE_LIST.flatMap((r) =>
  r.actions.map((a) => ({
    key: `can${a}${r.id}`,
    label: `${VERB[a]} ${r.noun}`,
    group: r.group,
    resource: r.id,
    action: a,
  })),
);

export const PERMISSION_CATALOG: PermissionDef[] = [...EXTRA, ...resourcePerms];

export const ALL_PERMISSION_KEYS = PERMISSION_CATALOG.map((p) => p.key);
const VALID = new Set(ALL_PERMISSION_KEYS);

/** Display order for the role editor. */
export const GROUP_ORDER = [
  "Overview",
  "Clinic",
  "Sales",
  "Catalogue",
  "People",
  "Administration",
];

/** Catalogue grouped for the editor UI, in GROUP_ORDER. */
export function groupedCatalog() {
  const map = new Map<string, PermissionDef[]>();
  for (const p of PERMISSION_CATALOG) {
    map.set(p.group, [...(map.get(p.group) ?? []), p]);
  }
  return GROUP_ORDER.filter((g) => map.has(g)).map((g) => ({
    group: g,
    permissions: map.get(g)!,
  }));
}

/* ---------- normalising ---------- */

/** Create/Update/Delete on a resource is useless without View, so add it. */
export function withImplied(keys: string[]): string[] {
  const set = new Set(keys);
  for (const r of RESOURCE_LIST) {
    if (!r.actions.includes("View")) continue;
    const writes = r.actions.some((a) => a !== "View" && set.has(`can${a}${r.id}`));
    if (writes) set.add(`canView${r.id}`);
  }
  return [...set];
}

/** Keep only recognised keys (deduped) and add implied View grants. */
export function sanitizePermissions(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  const clean = [...new Set(input.map(String).filter((k) => VALID.has(k)))];
  return withImplied(clean);
}

/** Full-access set, handed to any `isAdmin` role. */
export const ADMIN_PERMISSIONS = ALL_PERMISSION_KEYS;

export function permissionsForRole(role: {
  isAdmin?: boolean | null;
  permissions?: string[] | null;
}): string[] {
  if (role?.isAdmin) return [...ADMIN_PERMISSIONS];
  return sanitizePermissions(role?.permissions ?? []);
}

/* ---------- checking (use on client AND server) ---------- */

export function can(
  access:
    | { permissions?: string[] | null; isSuperadmin?: boolean | null }
    | null
    | undefined,
  required: Permission | Permission[],
  mode: "all" | "any" = "all",
): boolean {
  if (!access) return false;
  if (access.isSuperadmin) return true;
  const granted = new Set(access.permissions ?? []);
  const list = Array.isArray(required) ? required : [required];
  return mode === "all"
    ? list.every((p) => granted.has(p))
    : list.some((p) => granted.has(p));
}

/* ---------- seed roles (editable afterwards under /roles) ---------- */

export const RECEPTIONIST_PERMISSIONS = [
  "canViewDashboard",
  "canViewAppointments",
  "canCreateAppointments",
  "canUpdateAppointments",
  "canViewCustomers",
  "canCreateCustomers",
  "canUpdateCustomers",
  "canViewOrders",
  "canCreateOrders",
  "canViewProducts",
  "canViewPayments",
  "canCreatePayments",
] as const satisfies readonly Permission[];

export const OPTOMETRIST_PERMISSIONS = [
  "canViewDashboard",
  "canViewAppointments",
  "canUpdateAppointments",
  "canViewCustomers",
  "canViewPrescriptions",
  "canCreatePrescriptions",
  "canUpdatePrescriptions",
  "canViewOrders",
] as const satisfies readonly Permission[];

/* ---------- one-off migration from the old catalogue ---------- */

const crud = (id: ResourceId): Permission[] =>
  ACTIONS.map((a) => `can${a}${id}` as Permission);

const LEGACY_MAP: Record<string, Permission[]> = {
  canViewDashboard: ["canViewDashboard"],
  canViewReports: ["canViewReports"],
  canViewCustomers: ["canViewCustomers"],
  canManageCustomers: ["canCreateCustomers", "canUpdateCustomers", "canDeleteCustomers"],
  canViewProducts: ["canViewProducts"],
  canManageProducts: ["canCreateProducts", "canUpdateProducts", "canDeleteProducts"],
  canManageUsers: crud("Users"),
  canManageRoles: crud("Roles"),
  canManageBranches: crud("Branches"),
  canManageCompany: ["canViewCompany", "canUpdateCompany"],
  canViewAuditLog: ["canViewAuditLog"],
  canViewAllAuditLogs: ["canViewAllAuditLogs"],
  canSwitchBranch: ["canSwitchBranch"],
};

/** Run once over existing roles. Unmapped legacy keys (POS etc.) are dropped. */
export function migrateLegacyPermissions(old: string[]): string[] {
  return sanitizePermissions(old.flatMap((k) => LEGACY_MAP[k] ?? (VALID.has(k) ? [k] : [])));
}

/** Rows for the role editor: one row per resource (View/Create/Update/Delete), plus one-off toggles. */
export function permissionMatrix() {
  return GROUP_ORDER.map((group) => ({
    group,
    resources: RESOURCE_LIST.filter((r) => r.group === group).map((r) => ({
      id: r.id,
      noun: r.noun,
      actions: r.actions as readonly Action[],
    })),
    extras: EXTRA.filter((e) => e.group === group) as readonly PermissionDef[],
  })).filter((g) => g.resources.length > 0 || g.extras.length > 0);
}