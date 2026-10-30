// app/portal/roles/PermissionGrid.tsx
"use client";

import { Card } from "@/components/portal/UI";
import { ACTIONS, permissionMatrix, type Action } from "@/lib/permissions";

const matrix = permissionMatrix();
const key = (a: Action, id: string) => `can${a}${id}`;

type Resource = { id: string; noun: string; actions: readonly Action[] };

/** Create/Update/Delete need View. Removing View removes the rest. */
function setOne(set: Set<string>, r: Resource, action: Action, on: boolean) {
  const next = new Set(set);
  if (on) {
    next.add(key(action, r.id));
    if (action !== "View" && r.actions.includes("View")) next.add(key("View", r.id));
  } else {
    next.delete(key(action, r.id));
    if (action === "View") r.actions.forEach((a) => next.delete(key(a, r.id)));
  }
  return next;
}

export default function PermissionGrid({
  value, onChange, disabled, canGrant,
}: {
  value: Set<string>;
  onChange: (next: Set<string>) => void;
  disabled?: boolean;
  /** Whether the person editing may hand out this permission */
  canGrant: (permission: string) => boolean;
}) {
  const allowed = (k: string) => !disabled && (canGrant(k) || value.has(k));

  const toggleMany = (keys: string[]) => {
    const usable = keys.filter(allowed);
    if (usable.length === 0) return;
    const next = new Set(value);
    const allOn = usable.every((k) => value.has(k));
    usable.forEach((k) => (allOn ? next.delete(k) : next.add(k)));
    onChange(next);
  };

  return (
    <div className="space-y-5">
      {matrix.map((g) => {
        const groupKeys = [
          ...g.resources.flatMap((r) => r.actions.map((a) => key(a, r.id))),
          ...g.extras.map((e) => e.key),
        ];
        const selected = groupKeys.filter((k) => value.has(k)).length;

        return (
          <Card key={g.group} className="overflow-hidden">
            <div className="flex items-center justify-between gap-3 border-b border-[#E6D9C6] bg-[#FBF6EE] px-5 py-3.5">
              <div>
                <h3 className="text-sm font-semibold">{g.group}</h3>
                <p className="text-xs text-[#1F1A15]/50">{selected} of {groupKeys.length} selected</p>
              </div>
              <button
                type="button"
                disabled={disabled}
                onClick={() => toggleMany(groupKeys)}
                className="border-b border-[#8A6A4A]/50 text-xs font-medium disabled:opacity-40"
              >
                {selected === groupKeys.length ? "Clear all" : "Select all"}
              </button>
            </div>

            {g.resources.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full min-w-120 text-sm">
                  <thead>
                    <tr className="text-[11px] tracking-wide text-[#1F1A15]/45 uppercase">
                      <th scope="col" className="px-5 py-2.5 text-left font-medium">Resource</th>
                      {ACTIONS.map((a) => (
                        <th key={a} scope="col" className="w-20 px-2 py-2.5 text-center font-medium">{a}</th>
                      ))}
                      <th scope="col" className="w-16 px-3"><span className="sr-only">Row</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {g.resources.map((r) => (
                      <tr key={r.id} className="border-t border-[#E6D9C6]/70">
                        <th scope="row" className="px-5 py-3 text-left font-medium capitalize">{r.noun}</th>
                        {ACTIONS.map((a) => {
                          if (!r.actions.includes(a)) {
                            return <td key={a} className="text-center text-[#1F1A15]/20" aria-hidden>–</td>;
                          }
                          const k = key(a, r.id);
                          return (
                            <td key={a} className="text-center">
                              <input
                                type="checkbox"
                                checked={value.has(k)}
                                disabled={!allowed(k)}
                                onChange={(e) => onChange(setOne(value, r, a, e.target.checked))}
                                aria-label={`${a} ${r.noun}`}
                                className="h-4 w-4 cursor-pointer accent-[#1F1A15] disabled:cursor-not-allowed disabled:opacity-40"
                              />
                            </td>
                          );
                        })}
                        <td className="px-3 text-right">
                          <button
                            type="button"
                            disabled={disabled}
                            onClick={() => toggleMany(r.actions.map((a) => key(a, r.id)))}
                            className="text-xs text-[#1F1A15]/55 hover:text-[#1F1A15] disabled:opacity-40"
                          >
                            All
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {g.extras.length > 0 && (
              <ul className="divide-y divide-[#E6D9C6]/70 border-t border-[#E6D9C6]/70">
                {g.extras.map((e) => (
                  <li key={e.key}>
                    <label className="flex cursor-pointer items-center gap-3 px-5 py-3 text-sm">
                      <input
                        type="checkbox"
                        checked={value.has(e.key)}
                        disabled={!allowed(e.key)}
                        onChange={(ev) => {
                          const next = new Set(value);
                          if (ev.target.checked) next.add(e.key); else next.delete(e.key);
                          onChange(next);
                        }}
                        className="h-4 w-4 accent-[#1F1A15] disabled:opacity-40"
                      />
                      {e.label}
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        );
      })}
    </div>
  );
}