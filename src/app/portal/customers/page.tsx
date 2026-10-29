// src/app/portal/customers/page.tsx
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
import { fmtDate } from "@/lib/format";
import { useGetCustomers } from "@/modules/customers/common/customers-api";
import type { ICustomer } from "@/modules/customers/common/customers";
import {
  AlertTriangle,
  Edit2,
  Plus,
  RefreshCw,
  Search,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import CustomerForm from "@/modules/customers/component/CustomerForm";
import { format } from "date-fns";

type Tone = "success" | "warn" | "neutral" | "danger";

const TONE: Record<string, Tone> = {
  active: "success",
  inactive: "warn",
  archived: "neutral",
  blocked: "danger",
};

const titleCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const phoneOf = (c: ICustomer) => c.phone1 || c.phone2 || "-";
const locationOf = (c: ICustomer) =>
  [c.city, c.country].filter(Boolean).join(", ") || "-";
// const branchOf = (c: ICustomer) => c.branch?.name ?? "-";
const statusOf = (c: ICustomer) => c.status ?? "active"; // schema default is active

function StatusBadge({ customer }: { customer: ICustomer }) {
  const s = statusOf(customer);
  return <Badge tone={TONE[s] ?? "neutral"}>{titleCase(s)}</Badge>;
}

function EditButton({ customer, onClick }: { customer: ICustomer, onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={`Edit ${customer.name}`}
      onClick={onClick}
      className="grid h-9 w-9 place-items-center rounded-full border border-[#E6D9C6] hover:bg-[#F1E7D8]"
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
      aria-label="Loading customers"
    >
      <ul>
        {Array.from({ length: 6 }).map((_, i) => (
          <li
            key={i}
            className="flex items-center gap-4 border-b border-[#E6D9C6] px-6 py-5 last:border-0"
          >
            <span className="h-4 w-20 animate-pulse rounded bg-[#F1E7D8]" />
            <span className="h-4 w-40 animate-pulse rounded bg-[#F1E7D8]" />
            <span className="hidden h-4 w-48 animate-pulse rounded bg-[#F1E7D8] md:block" />
            <span className="ml-auto h-6 w-16 animate-pulse rounded-full bg-[#F1E7D8]" />
          </li>
        ))}
      </ul>
    </Card>
  );
}

export default function CustomersPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  // const [branch, setBranch] = useState("all");
  const [editing, setEditing] = useState<ICustomer | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (u: ICustomer) => {
    setEditing(u);
    setFormOpen(true);
  };
  const closeForm = () => setFormOpen(false);

  const {
    data: customers,
    isPending,
    isError,
    error,
    refetch,
    isFetching,
  } = useGetCustomers();

  // Defensive: guarantees an array even if the API shape changes again.
  const list = useMemo<ICustomer[]>(
    () => (Array.isArray(customers) ? customers : []),
    [customers],
  );

  // Filter options come from the data itself.
  const statusOptions = useMemo(
    () => Array.from(new Set(list.map(statusOf))).sort(),
    [list],
  );

  // const branchOptions = useMemo(() => {
  //   const names = new Set<string>();
  //   list.forEach((c) => {
  //     const n = branchOf(c);
  //     if (n !== "-") names.add(n);
  //   });
  //   return [
  //     { value: "all", label: "All branches" },
  //     ...Array.from(names)
  //       .sort((a, b) => a.localeCompare(b))
  //       .map((n) => ({ value: n, label: n })),
  //   ];
  // }, [list]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return list
      .filter((c) => {
        if (status !== "all" && statusOf(c) !== status) return false;
        // if (branch !== "all" && branchOf(c) !== branch) return false;
        if (!q) return true;
        return [c.code, c.name, c.email, c.phone1, c.phone2, c.city, c.country]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(q);
      })
      .sort((a, b) =>
        String(b.createdAt ?? "").localeCompare(String(a.createdAt ?? "")),
      );
  }, [list, query, status]);

  const hasFilters =
    query.trim() !== "" || status !== "all";
  const totalCount = list.length;

  const clearFilters = () => {
    setQuery("");
    setStatus("all");
    // setBranch("all");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Customers"
        title="Customers"
        description="Patients and customers registered with your organization."
        actions={
          <Button variant="secondary" onClick={openCreate}>
            <Plus size={16} /> Add New Customer
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
            placeholder="Search name, email, code or phone"
            aria-label="Search customers"
            className={`${inputCls} pl-11`}
          />
        </div>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          aria-label="Filter by status"
          className={`${inputCls} w-auto`}
        >
          <option value="all">All statuses</option>
          {statusOptions.map((s) => (
            <option key={s} value={s}>
              {titleCase(s)}
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
            aria-label="Refresh customers"
            className="grid h-9 w-9 place-items-center rounded-full border border-[#E6D9C6] hover:bg-[#F1E7D8] disabled:opacity-40"
          >
            <RefreshCw size={15} className={isFetching ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* {branchOptions.length > 2 && (
        <Segmented<string>
          label="Branch"
          value={branch}
          onChange={setBranch}
          options={branchOptions}
        />
      )} */}

      {/* content: exactly one of these renders */}
      {isPending ? (
        <TableSkeleton />
      ) : isError ? (
        <EmptyState
          icon={AlertTriangle}
          title="Couldn't load customers"
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
          title="No customers yet"
          text="Customers appear here once they register or you add them."
        />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No customers match your filters"
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
            Showing {rows.length} of {totalCount} customer
            {totalCount === 1 ? "" : "s"}
          </p>

          {/* desktop table */}
          <Card className="hidden overflow-hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <caption className="sr-only">All customers</caption>
                <thead>
                  <tr className="border-b border-[#E6D9C6] bg-[#FBF6EE] text-[11px] tracking-[0.16em] text-[#1F1A15]/50 uppercase">
                    {[
                      "Code",
                      "Customer",
                      "Phone",
                      "Location",
                      // "Branch",
                      "Joined",
                      "Status",
                    ].map((h) => (
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
                  {rows.map((c) => (
                    <tr
                      key={c.id}
                      className="border-b border-[#E6D9C6] last:border-0 hover:bg-[#FBF6EE]/60"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-[#1F1A15]/70">
                        {c.code}
                      </td>
                      <td className="px-6 py-4">
                        <b className="block font-medium">{c.name}</b>
                        <span className="text-xs text-[#1F1A15]/45">
                          {c.email}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-[#1F1A15]/70">
                        {phoneOf(c)}
                      </td>
                      <td className="px-6 py-4 text-[#1F1A15]/70">
                        {locationOf(c)}
                      </td>
                      {/* <td className="px-6 py-4 text-[#1F1A15]/70">
                        {branchOf(c)}
                      </td> */}
                      <td className="px-6 py-4 whitespace-nowrap text-[#1F1A15]/70">
                        {c.createdAt
                          ? format(c.createdAt as string, "dd/MM/yyyy")
                          : "-"}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge customer={c} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <EditButton onClick={() => openEdit(c)} customer={c} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* mobile list */}
          <ul className="space-y-3 md:hidden">
            {rows.map((c) => (
              <li key={c.id}>
                <Card className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{c.name}</p>
                      <p className="mt-1 truncate text-xs text-[#1F1A15]/50">
                        {c.email}
                      </p>
                      <p className="mt-1 text-xs text-[#1F1A15]/50">
                        {c.code} · {phoneOf(c)}
                      </p>
                      <p className="mt-1 text-xs text-[#1F1A15]/50">
                        {locationOf(c)}
                        {/* {branchOf(c) !== "-" ? ` · ${branchOf(c)}` : ""} */}
                      </p>
                    </div>
                    <EditButton onClick={() => openEdit(c)} customer={c} />
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <StatusBadge customer={c} />
                    <span className="text-xs text-[#1F1A15]/50">
                      {c.createdAt
                        ? format(c.createdAt as string, "dd/MM/yyyy")
                        : "-"}
                    </span>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        </>
      )}

      {formOpen && (
        <CustomerForm
          initial={editing}
          // branches={[]}
          onClose={closeForm}
          onSaved={(_, mode) => {
            closeForm();
            setToast(
              mode === "created" ? "Customer created." : "Customer updated.",
            );
          }}
        />
      )}

      <Toast message={toast} onDone={() => setToast(null)} />
    </div>
  );
}
