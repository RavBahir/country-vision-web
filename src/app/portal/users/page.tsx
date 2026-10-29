"use client";

import {
  Badge,
  Button,
  Card,
  EmptyState,
  inputCls,
  PageHeader,
  Segmented,
  Toast,
} from "@/components/portal/UI";
import { BASIC_STATUS } from "@/lib/enums";
import { fmtDate } from "@/lib/format";
import { useGetUsers } from "@/modules/users/common/users-api";
import type { IUser } from "@/modules/users/common/users"; // adjust if IUser lives elsewhere
import {
  AlertTriangle,
  Edit2,
  Plus,
  RefreshCw,
  Search,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import UserForm from "@/modules/users/component/UsersForm";
import { useGetRoles } from "@/modules/roles/common/roles-api";
import { IRole } from "@/modules/auth/auth";
import { format } from "date-fns";

type StatusFilter = "all" | BASIC_STATUS;

const TONE: Record<BASIC_STATUS, "success" | "warn" | "neutral" | "danger"> = {
  active: "success",
  inactive: "warn",
  archived: "neutral",
};

const LABEL: Record<BASIC_STATUS, string> = {
  active: "Active",
  inactive: "Inactive",
  archived: "Archived",
};

const roleName = (u: IUser) => (u.role.name as string | undefined) ?? "-";

function StatusBadge({ status }: { status?: string | null }) {
  const s = (status ?? "inactive") as BASIC_STATUS;
  return <Badge tone={TONE[s] ?? "neutral"}>{LABEL[s] ?? s}</Badge>;
}

function EditButton({ user, onClick }: { user: IUser; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Edit ${user.name}`}
      className="grid h-9 w-9 place-items-center rounded-full border border-[#E6D9C6] hover:bg-[#F1E7D8] disabled:cursor-not-allowed disabled:opacity-35"
    >
      <Edit2 size={15} />
    </button>
  );
}

function TableSkeleton() {
  return (
    <Card
      className="overflow-hidden"
      aria-busy="true"
      aria-label="Loading users"
    >
      <ul>
        {Array.from({ length: 6 }).map((_, i) => (
          <li
            key={i}
            className="flex items-center gap-4 border-b border-[#E6D9C6] px-6 py-5 last:border-0"
          >
            <span className="h-4 w-24 animate-pulse rounded bg-[#F1E7D8]" />
            <span className="h-4 w-40 animate-pulse rounded bg-[#F1E7D8]" />
            <span className="hidden h-4 w-48 animate-pulse rounded bg-[#F1E7D8] md:block" />
            <span className="ml-auto h-6 w-16 animate-pulse rounded-full bg-[#F1E7D8]" />
          </li>
        ))}
      </ul>
    </Card>
  );
}

export default function UsersPage() {
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<string>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [editing, setEditing] = useState<IUser | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const {
    data: users,
    isPending,
    isError,
    error,
    refetch,
    isFetching,
  } = useGetUsers();
  const [toast, setToast] = useState<string | null>(null);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (u: IUser) => {
    setEditing(u);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    refetch();
  };

  const { data: roles } = useGetRoles();

  // Role filter options come from the data itself.
  const roleOptions = useMemo(() => {
    const options: { label: string; value: string }[] = (roles ?? []).map(
      (r) => ({ label: r.name, value: r.id as string }),
    );
    return options;
  }, [roles]);

  // Depends on `users`, so it updates whenever the query data changes.
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();

    return (users ?? [])
      .filter((u) => {
        if (role !== "all" && roleName(u) !== role) return false;
        if (status !== "all" && u.status !== status) return false;
        if (!q) return true;
        return `${u.id} ${u.name} ${u.email} ${roleName(u)}`
          .toLowerCase()
          .includes(q);
      })
      .sort((a, b) =>
        String(b.createdAt ?? "").localeCompare(String(a.createdAt ?? "")),
      );
  }, [users, query, role, status]);

  const hasFilters = query.trim() !== "" || role !== "all" || status !== "all";
  const totalCount = users?.length ?? 0;

  const clearFilters = () => {
    setQuery("");
    setRole("all");
    setStatus("all");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Users"
        title="System Users / Staff"
        description="Every staff member, including admins, that has access to the system."
        actions={
          <Button variant="secondary" onClick={openCreate}>
            <Plus size={16} /> Add New User
          </Button>
        }
      />

      {/* filters */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative min-w-55 flex-1 sm:max-w-xs">
          <Search
            size={16}
            className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-[#1F1A15]/45"
            aria-hidden
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, email or role"
            aria-label="Search users"
            className={`${inputCls} pl-11`}
          />
        </div>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as StatusFilter)}
          aria-label="Filter by status"
          className={`${inputCls} w-auto`}
        >
          <option value="all">All statuses</option>
          {(Object.keys(LABEL) as BASIC_STATUS[]).map((s) => (
            <option key={s} value={s}>
              {LABEL[s]}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-3 md:ml-auto">
          {isFetching && !isPending && (
            <span role="status" className="text-xs text-[#1F1A15]/50">
              Refreshing…
            </span>
          )}
          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="border-b border-[#8A6A4A]/50 text-sm font-medium"
            >
              Clear filters
            </button>
          )}
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            aria-label="Refresh users"
            className="grid h-9 w-9 place-items-center rounded-full border border-[#E6D9C6] hover:bg-[#F1E7D8] disabled:opacity-40"
          >
            <RefreshCw size={15} className={isFetching ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {roleOptions.length > 2 && (
        <Segmented<string>
          label="Role"
          value={role}
          onChange={setRole}
          options={roleOptions}
        />
      )}

      {/* content: exactly one of these renders */}
      {isPending ? (
        <TableSkeleton />
      ) : isError ? (
        <EmptyState
          icon={AlertTriangle}
          title="Couldn't load users"
          text={error?.message || "Something went wrong. Please try again."}
          action={
            <Button variant="secondary" onClick={() => refetch()}>
              Try again
            </Button>
          }
        />
      ) : totalCount === 0 ? (
        <EmptyState
          icon={Users}
          title="No users yet"
          text="Add your first staff member to give them access to the system."
        />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No users match your filters"
          text="Try a different search term or clear the filters."
          action={
            <Button variant="secondary" onClick={clearFilters}>
              Clear filters
            </Button>
          }
        />
      ) : (
        <>
          <p className="text-sm text-[#1F1A15]/55" aria-live="polite">
            Showing {rows.length} of {totalCount} user
            {totalCount === 1 ? "" : "s"}
          </p>

          {/* desktop table */}
          <Card className="hidden overflow-hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <caption className="sr-only">All users</caption>
                <thead>
                  <tr className="border-b border-[#E6D9C6] bg-[#FBF6EE] text-[11px] tracking-[0.16em] text-[#1F1A15]/50 uppercase">
                    {["Created", "Name", "Email", "Role", "Status"].map((h) => (
                      <th key={h} scope="col" className="px-6 py-4 font-medium">
                        {h}
                      </th>
                    ))}
                    <th scope="col" className="px-6 py-4">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((u) => (
                    <tr
                      key={u.id}
                      className="border-b border-[#E6D9C6] last:border-0 hover:bg-[#FBF6EE]/60"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-[#1F1A15]/70">
                        {u.createdAt
                          ? format(u.createdAt as string, "dd/MM/yyyy")
                          : "-"}
                      </td>
                      <td className="px-6 py-4">
                        <b className="block font-medium">{u.name}</b>
                        <span className="text-xs text-[#1F1A15]/45">
                          {u.phone}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[#1F1A15]/70">{u.email}</td>
                      <td className="px-6 py-4 text-[#1F1A15]/70">
                        {roleName(u)}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={u.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <EditButton onClick={() => openEdit(u)} user={u} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* mobile list */}
          <ul className="space-y-3 md:hidden">
            {rows.map((u) => (
              <li key={u.id}>
                <Card className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{u.name}</p>
                      <p className="mt-1 truncate text-xs text-[#1F1A15]/50">
                        {u.email}
                      </p>
                      <p className="mt-1 text-xs text-[#1F1A15]/50">
                        {roleName(u)} - {" "}
                        {u.createdAt
                          ? format(u.createdAt as string, "dd/MM/yyyy")
                          : "-"}
                      </p>
                    </div>
                    <EditButton onClick={() => openEdit(u)} user={u} />
                  </div>
                  <div className="mt-4">
                    <StatusBadge status={u.status} />
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        </>
      )}

      {formOpen && (
        <UserForm
          initial={editing}
          roles={roleOptions} // see notes below
          onClose={closeForm}
          onSaved={(_, mode) => {
            closeForm();
            setToast(mode === "created" ? "User created." : "User updated.");
          }}
        />
      )}

      <Toast message={toast} onDone={() => setToast(null)} />
    </div>
  );
}
