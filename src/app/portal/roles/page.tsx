// "use client"

// import { useEffect, useMemo, useState } from "react";
// import { Plus, ShieldCheck, Trash2, Save, Lock, Users } from "lucide-react";
// import PageHeader from "@/components/PageHeader";
// import LoadingComponent from "@/components/LoadingComponent";
// import StatCards from "@/components/StatCards";
// import ConfirmationDialog from "@/components/ConfirmationDialog";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Checkbox } from "@/components/ui/checkbox";
// import { showToast } from "@/components/CustomToast";
// import { cn } from "@/lib/utils";
// import {
//   useGetManagedRolesQuery,
//   useGetPermissionCatalogQuery,
//   useCreateRoleMutation,
//   useUpdateRoleMutation,
//   useDeleteRoleMutation,
// } from "@/lib/posApi";
// import type { PermissionDef, Role } from "@/lib/types";

// type Draft = { id: string | null; name: string; description: string; permissions: Set<string> };

// const NEW_DRAFT: Draft = { id: null, name: "", description: "", permissions: new Set() };

// export default function RolesPage() {
//   const { data: roleList, isLoading } = useGetManagedRolesQuery();
//   const { data: catalog } = useGetPermissionCatalogQuery();
//   const [createRole, { isLoading: creating }] = useCreateRoleMutation();
//   const [updateRole, { isLoading: updating }] = useUpdateRoleMutation();
//   const [deleteRole] = useDeleteRoleMutation();

//   const roles = roleList?.data ?? [];
//   const [selectedId, setSelectedId] = useState<string | null>(null);
//   const [draft, setDraft] = useState<Draft>(NEW_DRAFT);

//   const selected = useMemo(
//     () => (selectedId === "new" ? null : roles.find((r) => r.id === selectedId)),
//     [roles, selectedId],
//   );

//   // Default to the first non-admin role once loaded.
//   useEffect(() => {
//     if (selectedId === null && roles.length) {
//       setSelectedId(roles.find((r) => !r.isAdmin)?.id ?? roles[0].id);
//     }
//   }, [roles, selectedId]);

//   // Sync the draft to the selection.
//   useEffect(() => {
//     if (selectedId === "new") {
//       setDraft({ ...NEW_DRAFT, permissions: new Set() });
//     } else if (selected) {
//       setDraft({
//         id: selected.id,
//         name: selected.name,
//         description: selected.description ?? "",
//         permissions: new Set(
//           selected.isAdmin
//             ? selected.effectivePermissions ?? []
//             : selected.permissions ?? [],
//         ),
//       });
//     }
//   }, [selectedId, selected]);

//   const groups = useMemo(() => {
//     const map = new Map<string, PermissionDef[]>();
//     (catalog ?? []).forEach((p) => {
//       if (!map.has(p.group)) map.set(p.group, []);
//       map.get(p.group)!.push(p);
//     });
//     return [...map.entries()];
//   }, [catalog]);

//   const isNew = selectedId === "new";
//   const isAdminRole = !!selected?.isAdmin;
//   const isSystem = !!selected?.isSystem;
//   const readOnly = isAdminRole; // admin grant is fixed
//   const nameLocked = isSystem;

//   const toggle = (key: string) => {
//     if (readOnly) return;
//     setDraft((d) => {
//       const next = new Set(d.permissions);
//       next.has(key) ? next.delete(key) : next.add(key);
//       return { ...d, permissions: next };
//     });
//   };
//   const toggleGroup = (defs: PermissionDef[], on: boolean) => {
//     if (readOnly) return;
//     setDraft((d) => {
//       const next = new Set(d.permissions);
//       defs.forEach((p) => (on ? next.add(p.key) : next.delete(p.key)));
//       return { ...d, permissions: next };
//     });
//   };

//   const save = async () => {
//     if (!draft.name.trim()) {
//       showToast({ type: "info", title: "Info", message: "Give the role a name." });
//       return;
//     }
//     const perms = [...draft.permissions];
//     try {
//       if (isNew) {
//         await createRole({
//           name: draft.name.trim(),
//           description: draft.description.trim() || undefined,
//           permissions: perms,
//         }).unwrap();
//         showToast({ type: "success", title: "Role created", message: draft.name.trim() });
//         setSelectedId(null);
//       } else {
//         await updateRole({
//           id: draft.id!,
//           ...(nameLocked ? {} : { name: draft.name.trim() }),
//           description: draft.description.trim(),
//           ...(isAdminRole ? {} : { permissions: perms }),
//         }).unwrap();
//         showToast({ type: "success", title: "Saved", message: `${draft.name.trim()} updated.` });
//       }
//     } catch (e: any) {
//       showToast({
//         type: "error",
//         title: "Could not save",
//         message: e?.data?.error ?? "Please try again.",
//       });
//     }
//   };

//   const remove = async (role: Role) => {
//     try {
//       await deleteRole(role.id).unwrap();
//       showToast({ type: "success", title: "Role deleted", message: role.name });
//       setSelectedId(null);
//     } catch (e: any) {
//       showToast({
//         type: "error",
//         title: "Could not delete",
//         message: e?.data?.error ?? "Please try again.",
//       });
//     }
//   };

//   if (isLoading) {
//     return (
//       <div className="p-10">
//         <LoadingComponent loading />
//       </div>
//     );
//   }

//   const draftCount = draft.permissions.size;
//   const busy = creating || updating;

//   return (
//     <div className="pb-12">
//       <PageHeader
//         title="Roles & Permissions"
//         subtitle="Define what each role can do. Staff are assigned a role under Users."
//         actions={
//           <Button onClick={() => setSelectedId("new")}>
//             <Plus size={15} /> New role
//           </Button>
//         }
//       />

//       {roleList?.summary && (
//         <StatCards
//           stats={[
//             { label: "Roles", value: roleList.summary.total },
//             { label: "Custom roles", value: roleList.summary.custom },
//             { label: "Staff assigned", value: roleList.summary.staff },
//             { label: "Permissions", value: catalog?.length ?? 0 },
//           ]}
//         />
//       )}

//       <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
//         {/* Role list */}
//         <div className="space-y-1.5">
//           {roles.map((r) => (
//             <button
//               key={r.id}
//               onClick={() => setSelectedId(r.id)}
//               className={cn(
//                 "w-full rounded-xl border px-3.5 py-3 text-left transition-colors",
//                 selectedId === r.id
//                   ? "border-[#0D9488] bg-[#0D9488]/5"
//                   : "border-slate-200 bg-white hover:bg-slate-50",
//               )}
//             >
//               <div className="flex items-center justify-between">
//                 <span className="text-sm font-bold text-slate-800">{r.name}</span>
//                 {r.isAdmin ? (
//                   <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-semibold text-white">
//                     ADMIN
//                   </span>
//                 ) : r.isSystem ? (
//                   <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
//                     BUILT-IN
//                   </span>
//                 ) : null}
//               </div>
//               <p className="mt-0.5 flex items-center gap-2 text-[11px] text-slate-400">
//                 <span className="inline-flex items-center gap-1">
//                   <Users size={11} /> {r._count?.users ?? 0}
//                 </span>
//                 <span>·</span>
//                 <span>
//                   {r.isAdmin
//                     ? "all permissions"
//                     : `${r.permissions?.length ?? 0} permission${
//                         (r.permissions?.length ?? 0) === 1 ? "" : "s"
//                       }`}
//                 </span>
//               </p>
//             </button>
//           ))}
//           {isNew && (
//             <div className="rounded-xl border border-dashed border-[#0D9488] bg-[#0D9488]/5 px-3.5 py-3 text-sm font-bold text-[#0D9488]">
//               New role…
//             </div>
//           )}
//         </div>

//         {/* Editor */}
//         {isNew || selected ? (
//           <div className="rounded-xl border border-slate-200 bg-white">
//             <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-3">
//               <div className="flex items-center gap-2">
//                 <ShieldCheck size={16} className="text-[#0D9488]" />
//                 <h2 className="text-sm font-bold text-slate-900">
//                   {isNew ? "New role" : selected!.name}
//                 </h2>
//                 {readOnly && (
//                   <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
//                     <Lock size={10} /> full access — not editable
//                   </span>
//                 )}
//               </div>
//               <div className="flex gap-2">
//                 {!isNew && selected && !isSystem && (
//                   <ConfirmationDialog
//                     title={`Delete ${selected.name}?`}
//                     destructive
//                     rightActionTitle="Delete role"
//                     content={
//                       <p>
//                         This role will be removed. Staff on it must be reassigned first.
//                       </p>
//                     }
//                     onConfirmClicked={() => remove(selected)}
//                     trigger={
//                       <Button
//                         variant="outline"
//                         className="text-red-600 hover:bg-red-50"
//                       >
//                         <Trash2 size={14} /> Delete
//                       </Button>
//                     }
//                   />
//                 )}
//                 <Button onClick={save} disabled={busy || readOnly}>
//                   <Save size={14} /> {busy ? "Saving…" : isNew ? "Create role" : "Save changes"}
//                 </Button>
//               </div>
//             </div>

//             <div className="space-y-4 p-5">
//               <div className="grid gap-3 sm:grid-cols-2">
//                 <div>
//                   <label className="mb-1 block text-[13px] font-semibold text-slate-700">
//                     Name {nameLocked && <span className="text-slate-400">(locked)</span>}
//                   </label>
//                   <Input
//                     value={draft.name}
//                     disabled={nameLocked}
//                     onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
//                     className="h-10 rounded-lg border-slate-200"
//                   />
//                 </div>
//                 <div>
//                   <label className="mb-1 block text-[13px] font-semibold text-slate-700">
//                     Description
//                   </label>
//                   <Input
//                     value={draft.description}
//                     onChange={(e) =>
//                       setDraft((d) => ({ ...d, description: e.target.value }))
//                     }
//                     className="h-10 rounded-lg border-slate-200"
//                   />
//                 </div>
//               </div>

//               <div>
//                 <div className="mb-2 flex items-center justify-between">
//                   <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
//                     Permissions
//                   </p>
//                   <span className="text-xs text-slate-400">
//                     {readOnly ? "all" : draftCount} selected
//                   </span>
//                 </div>

//                 <div className="space-y-3">
//                   {groups.map(([group, defs]) => {
//                     const on = defs.filter((p) => draft.permissions.has(p.key)).length;
//                     const allOn = on === defs.length;
//                     return (
//                       <div
//                         key={group}
//                         className="overflow-hidden rounded-lg border border-slate-200"
//                       >
//                         <div className="flex items-center justify-between bg-slate-50/70 px-3 py-2">
//                           <span className="text-xs font-bold text-slate-600">{group}</span>
//                           <button
//                             type="button"
//                             disabled={readOnly}
//                             onClick={() => toggleGroup(defs, !allOn)}
//                             className="text-[11px] font-semibold text-[#0D9488] disabled:opacity-40"
//                           >
//                             {allOn ? "Clear group" : "Select all"}
//                           </button>
//                         </div>
//                         <div className="divide-y divide-slate-50">
//                           {defs.map((p) => {
//                             const checked = draft.permissions.has(p.key);
//                             return (
//                               <label
//                                 key={p.key}
//                                 className={cn(
//                                   "flex cursor-pointer items-center gap-2.5 px-3 py-2 text-sm",
//                                   readOnly && "cursor-default opacity-70",
//                                 )}
//                               >
//                                 <Checkbox
//                                   checked={checked}
//                                   disabled={readOnly}
//                                   onCheckedChange={() => toggle(p.key)}
//                                 />
//                                 <span className="text-slate-700">{p.label}</span>
//                                 <span className="ml-auto font-mono text-[10px] text-slate-300">
//                                   {p.key}
//                                 </span>
//                               </label>
//                             );
//                           })}
//                         </div>
//                       </div>
//                     );
//                   })}
//                 </div>
//               </div>
//             </div>
//           </div>
//         ) : (
//           <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-400">
//             Pick a role to edit, or create a new one.
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }


const page = () => {
  return (
    <div>page</div>
  )
}

export default page