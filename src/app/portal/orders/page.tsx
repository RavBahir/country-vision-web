// app/portal/orders/page.tsx
"use client";

import { Badge, Button, Card, EmptyState, inputCls, PageHeader, Segmented, Toast } from "@/components/portal/UI";
import { fmtDate, money } from "@/lib/format";
import { usePerms } from "@/lib/use-perms";
import { STATUS_LABEL, STATUS_TONE, type OrderStatus } from "@/modules/catalog/common/catalog";
import { useOrders } from "@/modules/catalog/common/catalog-api";
import { AlertTriangle, Lock, PackageSearch, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import StaffOrderModal from "./StaffOrderModal";

type Tab = OrderStatus | "all";
const ORDER: OrderStatus[] = ["requested", "reviewing", "confirmed", "in_lab", "ready", "collected", "cancelled"];
export const ORDERS_ROUTE = "/portal/orders";
const PAY_TONE = { paid: "success", partial: "warn", unpaid: "neutral" } as const;

const useDebounced = <T,>(value: T, ms = 300) => {
  const [v, setV] = useState(value);
  useEffect(() => { const t = setTimeout(() => setV(value), ms); return () => clearTimeout(t); }, [value, ms]);
  return v;
};

export default function OrdersPage() {
  const { can } = usePerms();
  const router = useRouter();
  const canView = can("canViewOrders");
  const [tab, setTab] = useState<Tab>("requested");
  const [search, setSearch] = useState("");
  const q = useDebounced(search.trim());
  const [creating, setCreating] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const { data, isPending, isError, error, refetch, isFetching } = useOrders({ ...(tab !== "all" ? { status: tab } : {}), ...(q ? { search: q } : {}) }, canView);
  const rows = data?.data ?? [];
  const counts = data?.counts;

  return (
    <div className="space-y-6">
      <PageHeader kicker="Orders" title="Spectacle orders" description="Review requests, confirm the price, track the lab and take payments."
        actions={can("canCreateOrders") ? <Button onClick={() => setCreating(true)}><Plus size={16} /> New order</Button> : undefined} />

      {!canView ? <EmptyState icon={Lock} title="Restricted" text="You don't have permission to view orders." /> : (
        <>
          <Segmented<Tab> label="Status" value={tab} onChange={setTab}
            options={[...ORDER.map((s) => ({ value: s as Tab, label: STATUS_LABEL[s], count: counts?.[s] })), { value: "all" as Tab, label: "All", count: counts?.all }]} />

          <div className="flex items-center gap-3">
            <div className="relative min-w-55 flex-1 sm:max-w-xs">
              <Search size={16} aria-hidden className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-[#1F1A15]/45" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search code, customer or item" aria-label="Search orders" className={`${inputCls} pl-11`} />
            </div>
            {isFetching && !isPending && <span role="status" className="text-xs text-[#1F1A15]/50">Refreshing…</span>}
          </div>

          {isPending ? <div className="space-y-3" aria-busy="true">{[0, 1, 2, 3].map((i) => <div key={i} className="h-16 animate-pulse rounded-2xl bg-[#F1E7D8]" />)}</div>
          : isError ? <EmptyState icon={AlertTriangle} title="Couldn't load orders" text={error.message} action={<Button variant="secondary" onClick={() => refetch()}>Try again</Button>} />
          : rows.length === 0 ? <EmptyState icon={PackageSearch} title="No orders found" text="Try a different status or search." />
          : (
            <>
              <Card className="hidden overflow-hidden md:block">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <caption className="sr-only">Orders</caption>
                    <thead>
                      <tr className="border-b border-[#E6D9C6] bg-[#FBF6EE] text-[11px] tracking-[0.16em] text-[#1F1A15]/50 uppercase">
                        {["Order", "Customer", "Total", "Payment", "Status"].map((h) => <th key={h} scope="col" className="px-6 py-4 font-medium">{h}</th>)}
                        <th className="px-6 py-4"><span className="sr-only">Open</span></th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((o) => (
                        <tr key={o.id} className="border-b border-[#E6D9C6] last:border-0 hover:bg-[#FBF6EE]/60">
                          <td className="px-6 py-4"><b className="block font-medium">{o.title}</b><span className="text-xs text-[#1F1A15]/45">{o.code} · {fmtDate(o.createdAt.slice(0, 10), { day: "numeric", month: "short", year: "numeric" })}</span></td>
                          <td className="px-6 py-4">{o.customer?.name}<span className="block text-xs text-[#1F1A15]/45">{o.customer?.code}</span></td>
                          <td className="px-6 py-4 tabular-nums">{money(o.total)}</td>
                          <td className="px-6 py-4">{o.status === "cancelled" ? "–" : <Badge tone={PAY_TONE[o.paymentStatus]}>{o.paymentStatus === "partial" ? `Balance ${money(o.balance)}` : o.paymentStatus === "paid" ? "Paid" : "Unpaid"}</Badge>}</td>
                          <td className="px-6 py-4"><Badge tone={STATUS_TONE[o.status]}>{STATUS_LABEL[o.status]}</Badge></td>
                          <td className="px-6 py-4 text-right"><Link href={`${ORDERS_ROUTE}/${o.id}`} className="inline-grid h-10 place-items-center rounded-full border border-[#E6D9C6] px-4 text-sm font-medium hover:bg-[#F1E7D8]">Open</Link></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
              <ul className="space-y-3 md:hidden">
                {rows.map((o) => (
                  <li key={o.id}><Link href={`${ORDERS_ROUTE}/${o.id}`} className="block"><Card className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0"><p className="truncate font-medium">{o.title}</p><p className="mt-1 text-xs text-[#1F1A15]/50">{o.customer?.name} · {o.code}</p></div>
                      <Badge tone={STATUS_TONE[o.status]}>{STATUS_LABEL[o.status]}</Badge>
                    </div>
                    <p className="mt-3 text-sm tabular-nums">{money(o.total)}</p>
                  </Card></Link></li>
                ))}
              </ul>
            </>
          )}
        </>
      )}

      {creating && <StaffOrderModal onClose={() => setCreating(false)} onSaved={(id) => router.push(`${ORDERS_ROUTE}/${id}`)} />}
      <Toast message={toast} onDone={() => setToast(null)} />
    </div>
  );
}