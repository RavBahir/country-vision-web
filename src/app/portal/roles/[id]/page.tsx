// app/portal/roles/[id]/page.tsx
"use client";

import { Badge, Button, Card, EmptyState, PageHeader, Toast } from "@/components/portal/UI";
import { FormError, SelectField, TextAreaField, TextField } from "@/components/portal/FormFields";
import { ALL_PERMISSION_KEYS, can as canDo } from "@/lib/permissions";
import { usePerms } from "@/lib/use-perms";
import { useSession } from "@/modules/auth/session";
import { AlertTriangle, ArrowLeft, Lock, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import PermissionGrid from "../PermissionGrid";
import { IRole } from "@/modules/roles/common/roles";
import { useCreateRole, useRole, useUpdateRole } from "@/modules/roles/common/roles-api";

const ROLES_ROUTE = "/portal/roles";

function RoleForm({
  role, onSaved,
}: {
  role: IRole | null;
  onSaved: (message: string, saved: IRole, created: boolean) => void;
}) {
  const { can, fullAccess } = usePerms();
  const { session } = useSession();
  const isEdit = Boolean(role);
  const locked = Boolean(role?.isSystem);

  const [name, setName] = useState(role?.name ?? "");
  const [description, setDescription] = useState(role?.description ?? "");
  const [status, setStatus] = useState<"active" | "inactive">(role?.status === "inactive" ? "inactive" : "active");
  const [isAdmin, setIsAdmin] = useState(role?.isAdmin ?? false);
  const [perms, setPerms] = useState(() => new Set(role?.permissions ?? []));
  const [error, setError] = useState<string | null>(null);

  const create = useCreateRole();
  const update = useUpdateRole();
  const mutation = isEdit ? update : create;

  const canSave = isEdit ? can("canUpdateRoles") : can("canCreateRoles");
  const access = session
    ? { permissions: session.access.permissions, isSuperadmin: session.isSuperadmin }
    : null;
  /** Non-admins can only hand out what they hold. The server enforces this too. */
  const canGrant = (p: string) => fullAccess || canDo(access, p as never);

  const initial = JSON.stringify([role?.name ?? "", role?.description ?? "", role?.status === "inactive" ? "inactive" : "active", role?.isAdmin ?? false, [...(role?.permissions ?? [])].sort()]);
  const current = JSON.stringify([name, description, status, isAdmin, [...perms].sort()]);
  const dirty = initial !== current;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!canSave || mutation.isPending) return;
    if (name.trim().length < 2) return setError("Give the role a name (at least 2 characters).");

    const body = {
      name: name.trim(),
      description: description.trim() || null,
      status,
      isAdmin,
      permissions: [...perms],
    };

    if (role) {
      update.mutate(
        { id: role.id, data: body },
        { onSuccess: (r) => onSaved("Role saved.", r, false) },
      );
    } else {
      create.mutate(body, { onSuccess: (r) => onSaved("Role created.", r, true) });
    }
  };

  const shownPerms = isAdmin ? new Set(ALL_PERMISSION_KEYS) : perms;

  return (
    <form onSubmit={submit} className="grid items-start gap-6 lg:grid-cols-[1fr_2fr]">
      <div className="space-y-4 lg:sticky lg:top-6">
        <Card className="grid gap-5 p-6">
          {locked && (
            <p className="flex items-start gap-2 rounded-xl bg-[#FBF6EE] px-4 py-3 text-sm text-[#1F1A15]/65">
              <Lock size={15} className="mt-0.5 shrink-0" />
              System role. You can change its description and permissions, but not its name, status or admin access, and it can&rsquo;t be deleted.
            </p>
          )}

          <TextField label="Role name" value={name} onChange={setName} placeholder="e.g. Receptionist"
            disabled={locked || !canSave} required />
          <TextAreaField label="Description" value={description} onChange={setDescription} rows={3}
            placeholder="What is this role for?" optional />
          <SelectField
            label="Status" value={status} onChange={(v) => setStatus(v as "active" | "inactive")}
            options={[{ value: "active", label: "Active" }, { value: "inactive", label: "Inactive" }]}
            hint={status === "inactive" ? "Users with an inactive role can't sign in." : undefined}
          />

          {fullAccess && (
            <label className={`flex items-start gap-3 rounded-2xl border border-[#E6D9C6] bg-[#FBF6EE] p-4 ${locked ? "opacity-60" : "cursor-pointer"}`}>
              <input
                type="checkbox" checked={isAdmin} disabled={locked}
                onChange={(e) => setIsAdmin(e.target.checked)}
                className="mt-1 h-4 w-4 accent-[#1F1A15]"
              />
              <span className="text-sm">
                <b className="flex items-center gap-1.5 font-semibold"><ShieldCheck size={15} /> Administrator</b>
                <span className="text-[#1F1A15]/60">Full access to everything, including permissions added in future.</span>
              </span>
            </label>
          )}
        </Card>

        <FormError message={error ?? mutation.error?.message} />

        {canSave && (
          <div className="flex items-center justify-end gap-3">
            {dirty && <span className="text-xs text-[#1F1A15]/50">Unsaved changes</span>}
            <Button type="submit" disabled={!dirty || mutation.isPending}>
              {mutation.isPending ? "Saving…" : isEdit ? "Save changes" : "Create role"}
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold tracking-tight">Permissions</h2>
          <span className="text-sm text-[#1F1A15]/55">
            {isAdmin ? "All permissions" : `${perms.size} of ${ALL_PERMISSION_KEYS.length} selected`}
          </span>
        </div>
        {isAdmin && (
          <p className="rounded-xl bg-[#FBF6EE] px-4 py-3 text-sm text-[#1F1A15]/65">
            Administrator roles always have every permission, so these can&rsquo;t be edited individually.
          </p>
        )}
        <PermissionGrid
          value={shownPerms}
          onChange={setPerms}
          disabled={isAdmin || !canSave}
          canGrant={canGrant}
        />
      </div>
    </form>
  );
}

export default function RoleEditorPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const isNew = id === "new";
  const [toast, setToast] = useState<string | null>(null);

  const { data: role, isPending, isError, error, refetch } = useRole(id, !isNew);

  return (
    <div className="space-y-6">
      <Link href={ROLES_ROUTE} className="inline-flex items-center gap-2 text-sm text-[#1F1A15]/65 hover:text-[#1F1A15]">
        <ArrowLeft size={16} /> Back to roles
      </Link>

      <PageHeader
        kicker="Roles"
        title={isNew ? "New role" : (role?.name ?? "Role")}
        description={
          isNew
            ? "Name the role, then choose what it can see and do."
            : "Changes apply the next time each user's session refreshes, which is immediately for most actions."
        }
        actions={
          role && (
            <>
              {role.isSystem && <Badge tone="neutral">System</Badge>}
              {role.isAdmin && <Badge tone="success">Admin</Badge>}
              <Badge tone="neutral">{role.userCount} user{role.userCount === 1 ? "" : "s"}</Badge>
            </>
          )
        }
      />

      {!isNew && isPending ? (
        <div aria-busy="true" className="grid gap-6 lg:grid-cols-[1fr_2fr]">
          <div className="h-72 animate-pulse rounded-3xl bg-[#F1E7D8]" />
          <div className="h-96 animate-pulse rounded-3xl bg-[#F1E7D8]" />
        </div>
      ) : !isNew && (isError || !role) ? (
        <EmptyState
          icon={AlertTriangle} title="Couldn't load this role"
          text={error?.message || "It may have been deleted."}
          action={<Button variant="secondary" onClick={() => refetch()}>Try again</Button>}
        />
      ) : (
        <RoleForm
          key={role?.updatedAt ?? "new"}
          role={isNew ? null : (role ?? null)}
          onSaved={(message, saved, created) => {
            setToast(message);
            if (created) router.replace(`${ROLES_ROUTE}/${saved.id}`);
          }}
        />
      )}

      <Toast message={toast} onDone={() => setToast(null)} />
    </div>
  );
}