// app/portal/products/page.tsx
"use client";

import { Badge, Button, Card, EmptyState, Modal, PageHeader, Segmented, Toast } from "@/components/portal/UI";
import { FormError, SelectField, TextAreaField, TextField } from "@/components/portal/FormFields";
import { money } from "@/lib/format";
import { usePerms } from "@/lib/use-perms";
import {
  OPTION_GROUPS, type IFrame, type IOption, type OptionKind,
} from "@/modules/catalog/common/catalog";
import {
  useCatalogAdmin, useDeleteFrame, useDeleteOption, useSaveFrame, useSaveOption, useSeedStarter,
} from "@/modules/catalog/common/catalog-api";
import { AlertTriangle, Edit2, Glasses, Lock, Plus, Trash2 } from "lucide-react";
import { useState, type FormEvent } from "react";

type Tab = "frames" | "options";
const HEX = /^#[0-9a-fA-F]{6}$/;
const STATUSES = [{ value: "active", label: "Active (visible to customers)" }, { value: "inactive", label: "Hidden" }];

/* ---------------- frame form ---------------- */

function FrameForm({ initial, shapes, onClose, onSaved }: { initial: IFrame | null; shapes: string[]; onClose: () => void; onSaved: (m: string) => void }) {
  const [v, setV] = useState({
    name: initial?.name ?? "", shape: initial?.shape ?? "", material: initial?.material ?? "",
    blurb: initial?.blurb ?? "", price: initial ? String(initial.price) : "",
    status: initial?.status === "inactive" ? "inactive" : "active", sortOrder: String(initial?.sortOrder ?? 0),
  });
  const [colors, setColors] = useState(initial?.colors.map((c) => ({ name: c.name, hex: c.hex })) ?? [{ name: "", hex: "#1F1A15" }]);
  const [error, setError] = useState<string | null>(null);
  const save = useSaveFrame();
  const set = (k: keyof typeof v) => (x: string) => setV((s) => ({ ...s, [k]: x }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const price = Number(v.price);
    if (v.name.trim().length < 2 || v.shape.trim().length < 2 || v.material.trim().length < 2) return setError("Name, shape and material are required.");
    if (v.price.trim() === "" || Number.isNaN(price) || price < 0) return setError("Enter a valid price.");
    if (colors.some((c) => !c.name.trim() || !HEX.test(c.hex))) return setError("Every colour needs a name.");
    if (new Set(colors.map((c) => c.name.trim().toLowerCase())).size !== colors.length) return setError("Colour names must be different.");

    save.mutate(
      {
        id: initial?.id,
        body: {
          name: v.name.trim(), shape: v.shape.trim(), material: v.material.trim(),
          blurb: v.blurb.trim() || null, price, status: v.status as "active" | "inactive",
          sortOrder: Number(v.sortOrder) || 0, colors: colors.map((c) => ({ name: c.name.trim(), hex: c.hex })),
        },
      },
      { onSuccess: () => onSaved(initial ? "Frame updated." : "Frame added.") },
    );
  };

  return (
    <Modal open onClose={save.isPending ? () => {} : onClose} title={initial ? "Edit frame" : "Add frame"}
      footer={<div className="flex justify-end gap-3"><Button variant="secondary" onClick={onClose} disabled={save.isPending}>Cancel</Button><Button type="submit" form="frame-form" disabled={save.isPending}>{save.isPending ? "Saving…" : "Save frame"}</Button></div>}>
      <form id="frame-form" onSubmit={submit} className="grid gap-5" noValidate>
        <TextField label="Name" value={v.name} onChange={set("name")} required placeholder="e.g. Aria" />
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <TextField label="Shape" value={v.shape} onChange={set("shape")} required placeholder="e.g. Round" />
            {shapes.length > 0 && <p className="mt-1.5 text-xs text-[#1F1A15]/50">Existing: {shapes.join(", ")}</p>}
          </div>
          <TextField label="Material" value={v.material} onChange={set("material")} required placeholder="e.g. Acetate" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Base price" type="number" value={v.price} onChange={set("price")} required hint="Frame only. Lenses are priced separately." />
          <TextField label="Display order" type="number" value={v.sortOrder} onChange={set("sortOrder")} hint="Lower numbers show first." />
        </div>
        <TextAreaField label="Short description" value={v.blurb} onChange={set("blurb")} rows={2} optional />
        <SelectField label="Visibility" value={v.status} onChange={set("status")} options={STATUSES} />

        <fieldset>
          <legend className="mb-2 text-sm font-medium">Colours</legend>
          <ul className="grid gap-2">
            {colors.map((c, i) => (
              <li key={i} className="flex items-center gap-2">
                <input type="color" aria-label={`Colour ${i + 1} swatch`} value={c.hex} onChange={(e) => setColors((a) => a.map((x, j) => (j === i ? { ...x, hex: e.target.value } : x)))} className="h-11 w-12 shrink-0 cursor-pointer rounded-xl border border-[#E6D9C6] bg-white p-1" />
                <input aria-label={`Colour ${i + 1} name`} value={c.name} maxLength={40} placeholder="e.g. Tortoise" onChange={(e) => setColors((a) => a.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} className="h-11 min-w-0 flex-1 rounded-xl border border-[#1F1A15]/10 bg-[#F6EFE4] px-4 text-sm outline-none focus:border-[#8A6A4A] focus:bg-white" />
                <button type="button" aria-label="Remove colour" disabled={colors.length === 1} onClick={() => setColors((a) => a.filter((_, j) => j !== i))} className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[#E6D9C6] disabled:opacity-35"><Trash2 size={15} /></button>
              </li>
            ))}
          </ul>
          {colors.length < 12 && <button type="button" onClick={() => setColors((a) => [...a, { name: "", hex: "#8A6A4A" }])} className="mt-3 border-b border-[#8A6A4A]/50 text-sm font-medium">Add a colour</button>}
        </fieldset>
        <FormError message={error ?? save.error?.message} />
      </form>
    </Modal>
  );
}

/* ---------------- option form ---------------- */

function OptionForm({ kind, initial, onClose, onSaved }: { kind: OptionKind; initial: IOption | null; onClose: () => void; onSaved: (m: string) => void }) {
  const group = OPTION_GROUPS.find((g) => g.kind === kind)!;
  const [v, setV] = useState({
    name: initial?.name ?? "", note: initial?.note ?? "", price: initial ? String(initial.price) : "0",
    mm: initial?.mm ? String(initial.mm) : "", status: initial?.status === "inactive" ? "inactive" : "active",
    sortOrder: String(initial?.sortOrder ?? 0), isDefault: initial?.isDefault ?? false,
  });
  const [error, setError] = useState<string | null>(null);
  const save = useSaveOption();
  const set = (k: "name" | "note" | "price" | "mm" | "status" | "sortOrder") => (x: string) => setV((s) => ({ ...s, [k]: x }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const price = Number(v.price);
    if (!v.name.trim()) return setError("Enter a name.");
    if (v.price.trim() === "" || Number.isNaN(price) || price < 0) return setError("Enter a valid price (0 for included).");
    if (kind === "frame_size" && v.mm && (!/^\d+$/.test(v.mm) || +v.mm < 30 || +v.mm > 80)) return setError("Width must be 30 to 80 mm.");

    const body = {
      name: v.name.trim(), note: v.note.trim() || null, price, status: v.status as "active" | "inactive",
      sortOrder: Number(v.sortOrder) || 0, mm: kind === "frame_size" && v.mm ? Number(v.mm) : null,
      isDefault: group.defaultable ? v.isDefault : false,
    };
    save.mutate({ id: initial?.id, body: initial ? body : { ...body, kind } }, { onSuccess: () => onSaved(initial ? "Option updated." : "Option added.") });
  };

  return (
    <Modal open onClose={save.isPending ? () => {} : onClose} title={`${initial ? "Edit" : "Add"} · ${group.title.toLowerCase()}`}
      footer={<div className="flex justify-end gap-3"><Button variant="secondary" onClick={onClose} disabled={save.isPending}>Cancel</Button><Button type="submit" form="option-form" disabled={save.isPending}>{save.isPending ? "Saving…" : "Save"}</Button></div>}>
      <form id="option-form" onSubmit={submit} className="grid gap-5" noValidate>
        <TextField label="Name" value={v.name} onChange={set("name")} required />
        <TextField label="Description" value={v.note} onChange={set("note")} optional placeholder="Shown to customers under the name" />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Price" type="number" value={v.price} onChange={set("price")} required hint="Added to the order. 0 shows as “Included”." />
          {kind === "frame_size" && <TextField label="Width (mm)" type="number" value={v.mm} onChange={set("mm")} optional />}
          <TextField label="Display order" type="number" value={v.sortOrder} onChange={set("sortOrder")} />
        </div>
        <SelectField label="Visibility" value={v.status} onChange={set("status")} options={STATUSES} />
        {group.defaultable && (
          <label className="flex cursor-pointer items-center gap-3 text-sm">
            <input type="checkbox" checked={v.isDefault} onChange={(e) => setV((s) => ({ ...s, isDefault: e.target.checked }))} className="h-4 w-4 accent-[#1F1A15]" />
            Pre-select this choice for customers
          </label>
        )}
        <FormError message={error ?? save.error?.message} />
      </form>
    </Modal>
  );
}

/* ---------------- page ---------------- */

export default function ProductsPage() {
  const { can } = usePerms();
  const canView = can("canViewProducts"), canCreate = can("canCreateProducts"), canEdit = can("canUpdateProducts"), canDelete = can("canDeleteProducts");

  const [tab, setTab] = useState<Tab>("frames");
  const [frameForm, setFrameForm] = useState<IFrame | "new" | null>(null);
  const [optionForm, setOptionForm] = useState<{ kind: OptionKind; initial: IOption | null } | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const { data, isPending, isError, error, refetch } = useCatalogAdmin(canView);
  const delFrame = useDeleteFrame();
  const delOption = useDeleteOption();
  const starter = useSeedStarter();

  const frames = data?.frames ?? [];
  const options = data?.options ?? [];
  const shapes = [...new Set(frames.map((f) => f.shape))];

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Catalogue"
        title="Frames & lens pricing"
        description="Everything customers can choose, and what it costs. Changes apply to new orders only. Existing orders keep the price they were quoted."
        actions={canCreate && tab === "frames" ? <Button onClick={() => setFrameForm("new")}><Plus size={16} /> Add frame</Button> : undefined}
      />

      {!canView ? (
        <EmptyState icon={Lock} title="Restricted" text="You don't have permission to manage the catalogue." />
      ) : isPending ? (
        <div className="h-64 animate-pulse rounded-3xl bg-[#F1E7D8]" aria-busy="true" />
      ) : isError ? (
        <EmptyState icon={AlertTriangle} title="Couldn't load the catalogue" text={error.message} action={<Button variant="secondary" onClick={() => refetch()}>Try again</Button>} />
      ) : (
        <>
          <Segmented<Tab> label="Catalogue sections" value={tab} onChange={setTab}
            options={[{ value: "frames", label: "Frames", count: frames.length }, { value: "options", label: "Lens options & fits", count: options.length }]} />

          {tab === "frames" ? (
            frames.length === 0 ? (
              <EmptyState icon={Glasses} title="No frames yet" text="Add your first frame with its colours and base price."
                action={canCreate ? <Button onClick={() => setFrameForm("new")}><Plus size={16} /> Add frame</Button> : undefined} />
            ) : (
              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <caption className="sr-only">Frames</caption>
                    <thead>
                      <tr className="border-b border-[#E6D9C6] bg-[#FBF6EE] text-[11px] tracking-[0.16em] text-[#1F1A15]/50 uppercase">
                        {["Frame", "Shape", "Colours", "Price", "Status"].map((h) => <th key={h} scope="col" className="px-6 py-4 font-medium">{h}</th>)}
                        <th scope="col" className="px-6 py-4"><span className="sr-only">Actions</span></th>
                      </tr>
                    </thead>
                    <tbody>
                      {frames.map((f) => (
                        <tr key={f.id} className="border-b border-[#E6D9C6] last:border-0 hover:bg-[#FBF6EE]/60">
                          <td className="px-6 py-4"><b className="block font-medium">{f.name}</b><span className="text-xs text-[#1F1A15]/45">{f.code} · {f.material}</span></td>
                          <td className="px-6 py-4 text-[#1F1A15]/70">{f.shape}</td>
                          <td className="px-6 py-4"><span className="flex gap-1.5">{f.colors.map((c) => <span key={c.id} title={c.name} className="h-4 w-4 rounded-full border border-black/10" style={{ backgroundColor: c.hex }} />)}</span></td>
                          <td className="px-6 py-4 tabular-nums">{money(f.price)}</td>
                          <td className="px-6 py-4"><Badge tone={f.status === "active" ? "success" : "neutral"}>{f.status === "active" ? "Visible" : "Hidden"}</Badge></td>
                          <td className="px-6 py-4"><div className="flex justify-end gap-2">
                            {canEdit && <button aria-label={`Edit ${f.name}`} onClick={() => setFrameForm(f)} className="grid h-9 w-9 place-items-center rounded-full border border-[#E6D9C6] hover:bg-[#F1E7D8]"><Edit2 size={15} /></button>}
                            {canDelete && <button aria-label={`Remove ${f.name}`} disabled={delFrame.isPending} onClick={() => confirm(`Remove ${f.name}? Existing orders keep it.`) && delFrame.mutate(f.id, { onSuccess: () => setToast("Frame removed."), onError: (e) => setToast(e.message) })} className="grid h-9 w-9 place-items-center rounded-full border border-[#E6D9C6] text-[#8E3524] hover:bg-[#F1E7D8]"><Trash2 size={15} /></button>}
                          </div></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )
          ) : (
            <div className="space-y-6">
              {options.length === 0 && canCreate && (
                <EmptyState icon={Glasses} title="No lens options yet" text="Add a starter set of lens types, thicknesses, coatings and fits. They start hidden with a price of 0, so nothing reaches customers until you set prices and make them visible."
                  action={<Button disabled={starter.isPending} onClick={() => starter.mutate(undefined, { onSuccess: () => setToast("Starter options added. Set their prices next."), onError: (e) => setToast(e.message) })}>{starter.isPending ? "Adding…" : "Add starter options"}</Button>} />
              )}
              {OPTION_GROUPS.map((g) => {
                const list = options.filter((o) => o.kind === g.kind);
                return (
                  <Card key={g.kind} className="overflow-hidden">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E6D9C6] bg-[#FBF6EE] px-6 py-4">
                      <div><h2 className="font-semibold">{g.title}</h2><p className="text-xs text-[#1F1A15]/50">{g.hint}</p></div>
                      {canCreate && <Button variant="secondary" className="px-4 py-2" onClick={() => setOptionForm({ kind: g.kind, initial: null })}><Plus size={15} /> Add</Button>}
                    </div>
                    {list.length === 0 ? <p className="px-6 py-5 text-sm text-[#1F1A15]/55">Nothing here yet.</p> : (
                      <ul className="divide-y divide-[#E6D9C6]">
                        {list.map((o) => (
                          <li key={o.id} className="flex flex-wrap items-center gap-3 px-6 py-4">
                            <div className="min-w-0 flex-1">
                              <p className="flex flex-wrap items-center gap-2 font-medium">{o.name}{o.mm ? <span className="text-xs font-normal text-[#1F1A15]/50">{o.mm} mm</span> : null}{o.isDefault && <Badge tone="neutral">Default</Badge>}{o.status !== "active" && <Badge tone="warn">Hidden</Badge>}</p>
                              {o.note && <p className="text-xs text-[#1F1A15]/55">{o.note}</p>}
                            </div>
                            <span className="tabular-nums text-sm">{money(o.price)}</span>
                            {canEdit && <button aria-label={`Edit ${o.name}`} onClick={() => setOptionForm({ kind: g.kind, initial: o })} className="grid h-9 w-9 place-items-center rounded-full border border-[#E6D9C6] hover:bg-[#F1E7D8]"><Edit2 size={15} /></button>}
                            {canDelete && <button aria-label={`Remove ${o.name}`} disabled={delOption.isPending} onClick={() => confirm(`Remove ${o.name}? Existing orders keep it.`) && delOption.mutate(o.id, { onSuccess: () => setToast("Option removed."), onError: (e) => setToast(e.message) })} className="grid h-9 w-9 place-items-center rounded-full border border-[#E6D9C6] text-[#8E3524] hover:bg-[#F1E7D8]"><Trash2 size={15} /></button>}
                          </li>
                        ))}
                      </ul>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}

      {frameForm && <FrameForm key={frameForm === "new" ? "new" : frameForm.id} initial={frameForm === "new" ? null : frameForm} shapes={shapes} onClose={() => setFrameForm(null)} onSaved={(m) => { setFrameForm(null); setToast(m); }} />}
      {optionForm && <OptionForm key={optionForm.initial?.id ?? optionForm.kind} kind={optionForm.kind} initial={optionForm.initial} onClose={() => setOptionForm(null)} onSaved={(m) => { setOptionForm(null); setToast(m); }} />}
      <Toast message={toast} onDone={() => setToast(null)} />
    </div>
  );
}