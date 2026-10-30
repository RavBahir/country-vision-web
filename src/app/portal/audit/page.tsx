// app/portal/audit/page.tsx
"use client";

import { Badge, Button, Card, EmptyState, inputCls, Modal, PageHeader, Segmented } from "@/components/portal/UI";
import { toISO } from "@/lib/format";
import { usePerms } from "@/lib/use-perms";
import {
  actionLabel, actionTone, CATEGORIES, type CategoryId, type IAuditLog,
} from "@/modules/audit/common/audit";
import { useAuditLogs } from "@/modules/audit/common/audit-api";
import { AlertTriangle, ChevronLeft, ChevronRight, Lock, ScrollText, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type Cat = CategoryId | "all";
type Range = "today" | "7d" | "30d" | "all" | "custom";

const SIZE = 25;

const useDebounced = <T,>(value: T, ms = 300) => {
  const [v, setV] = useState(value);
  useEffect(() => { const t = setTimeout(() => setV(value), ms); return () => clearTimeout(t); }, [value, ms]);
  return v;
};

const daysAgo = (n: number) => { const d = new Date(); d.setDate(d.getDate() - n); return toISO(d); };

const stamp = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit",
  });

function DetailModal({ log, onClose }: { log: IAuditLog; onClose: () => void }) {
  const rows: [string, string][] = [
    ["When", stamp(log.createdAt)],
    ["Action", actionLabel(log.action)],
    ["Who", log.actor ? `${log.actor.name} (${log.actorEmail})` : log.actorEmail],
    ["Record", `${log.entityType}${log.entityId ? ` · ${log.entityId}` : ""}`],
    ["IP address", log.ipAddress ?? "–"],
  ];
  return (
    <Modal
      open onClose={onClose} title="Activity details"
      footer={<div className="flex justify-end"><Button variant="secondary" onClick={onClose}>Close</Button></div>}
    >
      <div className="grid gap-5">
        <p className="text-[15px] leading-relaxed">{log.summary}</p>
        <dl className="grid gap-3 text-sm">
          {rows.map(([k, v]) => (
            <div key={k} className="grid gap-1 sm:grid-cols-[7rem_1fr]">
              <dt className="text-[#1F1A15]/50">{k}</dt>
              <dd className="break-all font-medium">{v}</dd>
            </div>
          ))}
        </dl>
        {log.metadata && Object.keys(log.metadata).length > 0 && (
          <div>
            <p className="mb-2 text-xs font-medium tracking-[0.18em] text-[#8A6A4A] uppercase">Extra details</p>
            <pre className="max-h-60 overflow-auto rounded-2xl bg-[#FBF6EE] p-4 text-xs leading-relaxed">
              {JSON.stringify(log.metadata, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </Modal>
  );
}

export default function AuditPage() {
  const { can } = usePerms();
  const canView = can("canViewAuditLog");
  const seesAll = can("canViewAllAuditLogs");

  const [cat, setCat] = useState<Cat>("all");
  const [range, setRange] = useState<Range>("7d");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [search, setSearch] = useState("");
  const q = useDebounced(search.trim());
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState<IAuditLog | null>(null);

  // Back to page 1 whenever a filter changes
  useEffect(() => { setPage(1); }, [cat, range, from, to, q]);

  const dates = useMemo(() => {
    if (range === "today") return { startDate: daysAgo(0), endDate: daysAgo(0) };
    if (range === "7d") return { startDate: daysAgo(6), endDate: daysAgo(0) };
    if (range === "30d") return { startDate: daysAgo(29), endDate: daysAgo(0) };
    if (range === "custom") return { startDate: from || undefined, endDate: to || undefined };
    return {};
  }, [range, from, to]);

  const actions = cat === "all" ? undefined : [...(CATEGORIES.find((c) => c.id === cat)?.actions ?? [])];
  const badRange = range === "custom" && from && to && from > to;

  const { data, isPending, isError, error, refetch, isFetching } = useAuditLogs(
    { actions, ...dates, search: q || undefined, page, size: SIZE },
    canView && !badRange,
  );

  const rows = data?.data ?? [];
  const total = data?.meta.total ?? 0;
  const pages = data?.meta.totalPages ?? Math.max(1, Math.ceil(total / SIZE));
  const hasFilters = cat !== "all" || range !== "7d" || q !== "";

  const reset = () => { setCat("all"); setRange("7d"); setFrom(""); setTo(""); setSearch(""); };

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Audit trail"
        title="Activity log"
        description={
          seesAll
            ? "A record of who did what across the organization."
            : "A record of your own activity. Ask an administrator for access to the full log."
        }
      />

      {!canView ? (
        <EmptyState icon={Lock} title="Restricted" text="You don't have permission to view the audit log." />
      ) : (
        <>
          <Segmented<Cat>
            label="Category"
            value={cat}
            onChange={setCat}
            options={[{ value: "all", label: "All" }, ...CATEGORIES.map((c) => ({ value: c.id as Cat, label: c.label }))]}
          />

          <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
            <div className="relative min-w-55 flex-1 lg:max-w-xs">
              <Search size={16} aria-hidden className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-[#1F1A15]/45" />
              <input
                value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search summary or email" aria-label="Search activity"
                className={`${inputCls} pl-11`}
              />
            </div>

            <select
              value={range} onChange={(e) => setRange(e.target.value as Range)}
              aria-label="Date range" className={`${inputCls} w-auto`}
            >
              <option value="today">Today</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="all">All time</option>
              <option value="custom">Custom range</option>
            </select>

            {range === "custom" && (
              <div className="flex items-center gap-2">
                <input type="date" aria-label="From" value={from} max={to || undefined}
                  onChange={(e) => setFrom(e.target.value)} className={`${inputCls} w-auto`} />
                <span className="text-sm text-[#1F1A15]/50">to</span>
                <input type="date" aria-label="To" value={to} min={from || undefined}
                  onChange={(e) => setTo(e.target.value)} className={`${inputCls} w-auto`} />
              </div>
            )}

            <div className="flex items-center gap-3 lg:ml-auto">
              {isFetching && !isPending && <span role="status" className="text-xs text-[#1F1A15]/50">Refreshing…</span>}
              {hasFilters && (
                <button type="button" onClick={reset} className="border-b border-[#8A6A4A]/50 text-sm font-medium">
                  Clear filters
                </button>
              )}
            </div>
          </div>

          {badRange && <p role="alert" className="text-sm text-[#8E3524]">The start date must be before the end date.</p>}

          {isPending && !badRange ? (
            <div aria-busy="true" className="space-y-2">
              {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-14 animate-pulse rounded-2xl bg-[#F1E7D8]" />)}
            </div>
          ) : isError ? (
            <EmptyState
              icon={AlertTriangle} title="Couldn't load the activity log"
              text={error?.message || "Something went wrong."}
              action={<Button variant="secondary" onClick={() => refetch()}>Try again</Button>}
            />
          ) : rows.length === 0 ? (
            <EmptyState
              icon={ScrollText} title="No activity found"
              text="Try a different category or date range."
              action={hasFilters ? <Button variant="secondary" onClick={reset}>Clear filters</Button> : undefined}
            />
          ) : (
            <>
              <p className="text-sm text-[#1F1A15]/55" aria-live="polite">
                {total} {total === 1 ? "entry" : "entries"}
              </p>

              <Card className="hidden overflow-hidden md:block">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <caption className="sr-only">Audit log</caption>
                    <thead>
                      <tr className="border-b border-[#E6D9C6] bg-[#FBF6EE] text-[11px] tracking-[0.16em] text-[#1F1A15]/50 uppercase">
                        {["When", "Who", "Action", "Summary"].map((h) => (
                          <th key={h} scope="col" className="px-6 py-4 font-medium">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((l) => (
                        <tr
                          key={l.id} onClick={() => setOpen(l)} tabIndex={0}
                          onKeyDown={(e) => e.key === "Enter" && setOpen(l)}
                          className="cursor-pointer border-b border-[#E6D9C6] last:border-0 hover:bg-[#FBF6EE]/60 focus:bg-[#FBF6EE]/60 focus:outline-none"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-[#1F1A15]/70">{stamp(l.createdAt)}</td>
                          <td className="px-6 py-4">
                            <b className="block font-medium">{l.actor?.name ?? "System"}</b>
                            <span className="text-xs text-[#1F1A15]/45">{l.actorEmail}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap"><Badge tone={actionTone(l.action)}>{actionLabel(l.action)}</Badge></td>
                          <td className="max-w-md px-6 py-4 text-[#1F1A15]/75"><span className="line-clamp-2">{l.summary}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              <ul className="space-y-3 md:hidden">
                {rows.map((l) => (
                  <li key={l.id}>
                    <button type="button" onClick={() => setOpen(l)} className="block w-full text-left">
                      <Card className="p-5">
                        <div className="flex items-start justify-between gap-3">
                          <Badge tone={actionTone(l.action)}>{actionLabel(l.action)}</Badge>
                          <span className="text-xs text-[#1F1A15]/50">{stamp(l.createdAt)}</span>
                        </div>
                        <p className="mt-3 text-sm">{l.summary}</p>
                        <p className="mt-2 truncate text-xs text-[#1F1A15]/50">{l.actor?.name ?? l.actorEmail}</p>
                      </Card>
                    </button>
                  </li>
                ))}
              </ul>

              {pages > 1 && (
                <nav aria-label="Pagination" className="flex items-center justify-between gap-3">
                  <Button variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                    <ChevronLeft size={16} /> Previous
                  </Button>
                  <span className="text-sm text-[#1F1A15]/60">Page {page} of {pages}</span>
                  <Button variant="secondary" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
                    Next <ChevronRight size={16} />
                  </Button>
                </nav>
              )}
            </>
          )}
        </>
      )}

      {open && <DetailModal log={open} onClose={() => setOpen(null)} />}
    </div>
  );
}