// app/portal/roles/page.tsx
"use client";

import { Badge, Button, ButtonLink, Card, EmptyState, inputCls, Modal, PageHeader, Toast } from "@/components/portal/UI";
import { FormError } from "@/components/portal/FormFields";
import { usePerms } from "@/lib/use-perms";
import { AlertTriangle, Edit2, Lock, Plus, Search, ShieldCheck, Trash2, Users } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useDeleteRole, useRoles } from "@/modules/roles/common/roles-api";
import { IRole } from "@/modules/roles/common/roles";

const ROLES_ROUTE = "/portal/roles";

function DeleteRoleModal({ role, onClose, onDone }: { role: IRole; onClose: () => void; onDone: () => void }) {
  const del = useDeleteRole();
  const blocked = role.isSystem || role.userCount > 0;

  return (
    <Modal
      open
      onClose={del.isPending ? () => {} : onClose}
      title="Delete this role?"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={del.isPending}>Keep it</Button>
          <Button
            variant="danger"
            disabled={blocked || del.isPending}
            onClick={() => del.mutate(role.id, { onSuccess: onDone })}
          >
            {del.isPending ? "Deleting…" : "Yes, delete"}
          </Button>
        </div>
      }
    >
      <div className="grid gap-4">
        <p className="text-[15px] leading-relaxed text-[#1F1A15]/70">
          <b>{role.name}</b> will be removed. This can&rsquo;t be undone.
        </p>
        {role.userCount > 0 && (
          <p className="rounded-xl bg-[#FBF6EE] px-4 py-3 text-sm text-[#1F1A15]/70">
            {role.userCount} user{role.userCount === 1 ? " is" : "s are"} assigned to this role. Move
            {role.userCount === 1 ? " them" : " them"} to another role on the{" "}
            <Link href="/portal/users" className="border-b border-[#8A6A4A]/50 font-medium">Users page</Link>{" "}
            first.
          </p>
        )}
        <FormError message={del.error?.message} />
      </div>
    </Modal>
  );
}

export default function RolesPage() {
  const { can } = usePerms();
  const [query, setQuery] = useState("");
  const [deleting, setDeleting] = useState<IRole | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const { data, isPending, isError, error, refetch, isFetching } = useRoles(can("canViewRoles"));

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data ?? []).filter((r) => !q || `${r.name} ${r.description ?? ""}`.toLowerCase().includes(q));
  }, [data, query]);

  const canCreate = can("canCreateRoles");
  const canEdit = can("canUpdateRoles");
  const canDelete = can("canDeleteRoles");

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Roles"
        title="Roles & permissions"
        description="Decide what each kind of staff member can see and do. Every user has exactly one role."
        actions={
          canCreate ? (
            <ButtonLink href={`${ROLES_ROUTE}/new`}><Plus size={16} /> New role</ButtonLink>
          ) : undefined
        }
      />

      {!can("canViewRoles") ? (
        <EmptyState icon={Lock} title="Restricted" text="You don't have permission to view roles." />
      ) : (
        <>
          <div className="flex items-center gap-3">
            <div className="relative min-w-55 flex-1 sm:max-w-xs">
              <Search size={16} aria-hidden className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-[#1F1A15]/45" />
              <input
                value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder="Search roles" aria-label="Search roles" className={`${inputCls} pl-11`}
              />
            </div>
            {isFetching && !isPending && <span role="status" className="text-xs text-[#1F1A15]/50">Refreshing…</span>}
          </div>

          {isPending ? (
            <div aria-busy="true" className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {[0, 1, 2].map((i) => <div key={i} className="h-44 animate-pulse rounded-3xl bg-[#F1E7D8]" />)}
            </div>
          ) : isError ? (
            <EmptyState
              icon={AlertTriangle} title="Couldn't load roles"
              text={error?.message || "Something went wrong."}
              action={<Button variant="secondary" onClick={() => refetch()}>Try again</Button>}
            />
          ) : rows.length === 0 ? (
            <EmptyState
              icon={ShieldCheck}
              title={query ? "No roles match your search" : "No roles yet"}
              text={query ? "Try a different search term." : "Create your first role to start assigning access."}
              action={
                query ? (
                  <Button variant="secondary" onClick={() => setQuery("")}>Clear search</Button>
                ) : canCreate ? (
                  <ButtonLink href={`${ROLES_ROUTE}/new`}><Plus size={16} /> New role</ButtonLink>
                ) : undefined
              }
            />
          ) : (
            <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {rows.map((r) => (
                <li key={r.id}>
                  <Card className="flex h-full flex-col p-6">
                    <div className="flex items-start justify-between gap-3">
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#F1E7D8] text-[#8A6A4A]">
                        {r.isAdmin ? <ShieldCheck size={19} /> : <Users size={19} />}
                      </span>
                      <div className="flex flex-wrap justify-end gap-1.5">
                        {r.isSystem && <Badge tone="neutral">System</Badge>}
                        {r.isAdmin && <Badge tone="success">Admin</Badge>}
                        {r.status === "inactive" && <Badge tone="warn">Inactive</Badge>}
                      </div>
                    </div>

                    <h2 className="mt-4 text-lg font-semibold">{r.name}</h2>
                    <p className="mt-1 line-clamp-2 min-h-10 text-sm text-[#1F1A15]/55">
                      {r.description || "No description."}
                    </p>

                    <p className="mt-4 text-xs text-[#1F1A15]/55">
                      {r.userCount} user{r.userCount === 1 ? "" : "s"} ·{" "}
                      {r.isAdmin ? "all permissions" : `${r.permissions.length} permission${r.permissions.length === 1 ? "" : "s"}`}
                    </p>

                    <div className="mt-auto flex gap-2 pt-5">
                      <Link
                        href={`${ROLES_ROUTE}/${r.id}`}
                        className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full border border-[#E6D9C6] text-sm font-medium hover:bg-[#F1E7D8]"
                      >
                        <Edit2 size={14} /> {canEdit ? "Edit" : "View"}
                      </Link>
                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => setDeleting(r)}
                          disabled={r.isSystem}
                          aria-label={r.isSystem ? `${r.name} is a system role and can't be deleted` : `Delete ${r.name}`}
                          title={r.isSystem ? "System roles can't be deleted" : undefined}
                          className="grid h-11 w-11 place-items-center rounded-full border border-[#E6D9C6] text-[#8E3524] hover:bg-[#F1E7D8] disabled:cursor-not-allowed disabled:text-[#1F1A15]/25 disabled:hover:bg-transparent"
                        >
                          {r.isSystem ? <Lock size={15} /> : <Trash2 size={15} />}
                        </button>
                      )}
                    </div>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {deleting && (
        <DeleteRoleModal
          role={deleting}
          onClose={() => setDeleting(null)}
          onDone={() => { setDeleting(null); setToast("Role deleted."); }}
        />
      )}
      <Toast message={toast} onDone={() => setToast(null)} />
    </div>
  );
}