// app/portal/transactions/page.tsx
"use client";

import { Badge, Button, Card, EmptyState, PageHeader, Segmented, Toast, inputCls } from "@/components/portal/UI";
import { fmtDate, money, toISO } from "@/lib/format";
import { usePerms } from "@/lib/use-perms";
import { useSession } from "@/modules/auth/session";
import { PAY_LABEL, type PayMethod } from "@/modules/catalog/common/catalog";
import type { IPaymentRow } from "@/modules/payments/common/payments";
import { fetchReceipt, usePayments } from "@/modules/payments/common/payments-api";
import { AlertTriangle, Download, FileDown, Lock, Receipt, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { saveFile, toCsv, writeReceipt } from "./helpers";

type Kind = "all" | "frame" | "lenses_only";
type Range = "all" | "month" | "30d" | "year" | "custom";
type Tone = "success" | "warn" | "neutral" | "danger";

const STATUS: Record<IPaymentRow["status"], { label: string; tone: Tone }> = {
  paid: { label: "Paid", tone: "success" },
  voided: { label: "Voided", tone: "neutral" },
};
const KIND_LABEL = { frame: "Frames", lenses_only: "Lenses only" } as const;

const useDebounced = <T,>(value: T, ms = 300) => {
  const [v, setV] = useState(value);
  useEffect(() => { const t = setTimeout(() => setV(value), ms); return () => clearTimeout(t); }, [value, ms]);
  return v;
};

const daysAgo = (n: number) => { const d = new Date(); d.setDate(d.getDate() - n); return toISO(d); };

export default function TransactionsPage() {
  const { session } = useSession();
  const { can } = usePerms();
  const isCustomer = session?.kind === "customer";
  const scope = isCustomer ? "customer" : "staff";
  const allowed = !!session && (isCustomer || can("canViewPayments"));

  const [search, setSearch] = useState("");
  const q = useDebounced(search.trim());
  const [kind, setKind] = useState<Kind>("all");
  const [status, setStatus] = useState<"all" | "paid" | "voided">("all");
  const [method, setMethod] = useState<"all" | PayMethod>("all");
  const [range, setRange] = useState<Range>("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const dates = useMemo(() => {
    const today = toISO(new Date());
    if (range === "month") return { from: `${today.slice(0, 8)}01`, to: today };
    if (range === "30d") return { from: daysAgo(29), to: today };
    if (range === "year") return { from: `${today.slice(0, 4)}-01-01`, to: today };
    if (range === "custom") return { from: from || undefined, to: to || undefined };
    return {};
  }, [range, from, to]);

  const badRange = range === "custom" && !!from && !!to && from > to;
  const filters = {
    ...dates,
    ...(q ? { search: q } : {}),
    ...(kind !== "all" ? { kind } : {}),
    ...(!isCustomer && status !== "all" ? { status } : {}),
    ...(method !== "all" ? { method } : {}),
  };
  const hasFilters = !!q || kind !== "all" || status !== "all" || method !== "all" || range !== "all";
  const clear = () => { setSearch(""); setKind("all"); setStatus("all"); setMethod("all"); setRange("all"); setFrom(""); setTo(""); };

  const { data, isPending, isError, error, refetch, isFetching } = usePayments(scope, filters, allowed && !badRange);
  const rows = data?.data ?? [];
  const t = data?.totals;
  const year = String(new Date().getFullYear());

  const summary = isCustomer
    ? [
        { label: `Paid in ${year}`, value: t?.year, note: "Completed payments", dark: true },
        { label: "Balance due", value: t?.outstanding, note: "On confirmed orders. Pay in store." },
      ]
    : [
        { label: "Collected this month", value: t?.month, note: "Payments received", dark: true },
        { label: `Collected in ${year}`, value: t?.year, note: "Excluding voided payments" },
        { label: "Outstanding", value: t?.outstanding, note: "Balance on confirmed orders" },
        { label: "Voided this year", value: t?.voided, note: "Not counted as collected" },
      ];

  const openReceipt = async (p: IPaymentRow) => {
    const w = window.open("", "_blank"); // inside the click, so it isn't blocked
    if (!w) return setToast("Allow pop-ups to open the receipt.");
    setBusy(p.id);
    try {
      writeReceipt(w, await fetchReceipt(scope, p.id));
      setToast("Receipt opened. Choose “Save as PDF” to keep a copy.");
    } catch (e) {
      w.close();
      setToast(e instanceof Error ? e.message : "Couldn't load the receipt.");
    } finally {
      setBusy(null);
    }
  };

  const exportCsv = () => {
    saveFile("country-vision-payments.csv", toCsv(rows, !isCustomer), "text/csv");
    setToast(`Exported ${rows.length} ${rows.length === 1 ? "payment" : "payments"}.`);
  };

  const ReceiptBtn = ({ p }: { p: IPaymentRow }) => (
    <button
      onClick={() => openReceipt(p)} disabled={p.status === "voided" || busy === p.id}
      aria-label={`Download receipt ${p.code}`}
      className="grid h-9 w-9 place-items-center rounded-full border border-[#E6D9C6] hover:bg-[#F1E7D8] disabled:cursor-not-allowed disabled:opacity-35"
    >
      <Download size={15} />
    </button>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Transactions"
        title="Payments and receipts."
        description={isCustomer
          ? "Every payment for your frames and lenses. Download a receipt whenever you need one."
          : "Every payment recorded against an order. Record new payments from the order itself."}
        actions={<Button variant="secondary" onClick={exportCsv} disabled={rows.length === 0}><FileDown size={16} /> Export CSV</Button>}
      />

      {!allowed ? (
        !session ? null : <EmptyState icon={Lock} title="Restricted" text="You don't have permission to view payments." />
      ) : (
        <>
          <div className={`grid gap-4 sm:grid-cols-2 ${isCustomer ? "" : "xl:grid-cols-4"}`}>
            {summary.map((s) => (
              <div key={s.label} className={`rounded-3xl p-6 ${s.dark ? "bg-[#12100D] text-white" : "border border-[#E6D9C6] bg-white"}`}>
                <p className={`text-sm ${s.dark ? "text-white/60" : "text-[#1F1A15]/55"}`}>{s.label}</p>
                <p className="mt-3 text-3xl font-semibold tracking-tight tabular-nums">{t ? money(s.value ?? 0) : "–"}</p>
                <p className={`mt-1 text-xs ${s.dark ? "text-white/45" : "text-[#1F1A15]/50"}`}>{s.note}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
            <div className="relative min-w-55 flex-1 lg:max-w-xs">
              <Search size={16} className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-[#1F1A15]/45" aria-hidden />
              <input value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search payments"
                placeholder={isCustomer ? "Search item or reference" : "Search customer, item or reference"} className={`${inputCls} pl-11`} />
            </div>
            {!isCustomer && (
              <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} aria-label="Filter by status" className={`${inputCls} w-auto`}>
                <option value="all">All statuses</option><option value="paid">Paid</option><option value="voided">Voided</option>
              </select>
            )}
            <select value={method} onChange={(e) => setMethod(e.target.value as typeof method)} aria-label="Filter by method" className={`${inputCls} w-auto`}>
              <option value="all">All methods</option>
              {(Object.keys(PAY_LABEL) as PayMethod[]).map((m) => <option key={m} value={m}>{PAY_LABEL[m]}</option>)}
            </select>
            <select value={range} onChange={(e) => setRange(e.target.value as Range)} aria-label="Date range" className={`${inputCls} w-auto`}>
              <option value="all">All time</option><option value="month">This month</option>
              <option value="30d">Last 30 days</option><option value="year">This year</option><option value="custom">Custom range</option>
            </select>
            {range === "custom" && (
              <div className="flex items-center gap-2">
                <input type="date" aria-label="From" value={from} max={to || undefined} onChange={(e) => setFrom(e.target.value)} className={`${inputCls} w-auto`} />
                <span className="text-sm text-[#1F1A15]/50">to</span>
                <input type="date" aria-label="To" value={to} min={from || undefined} onChange={(e) => setTo(e.target.value)} className={`${inputCls} w-auto`} />
              </div>
            )}
            <div className="flex items-center gap-3 lg:ml-auto">
              {isFetching && !isPending && <span role="status" className="text-xs text-[#1F1A15]/50">Refreshing…</span>}
              {hasFilters && <button type="button" onClick={clear} className="border-b border-[#8A6A4A]/50 text-sm font-medium">Clear filters</button>}
            </div>
          </div>
          {badRange && <p role="alert" className="text-sm text-[#8E3524]">The start date must be before the end date.</p>}

          <Segmented<Kind> label="Order type" value={kind} onChange={setKind}
            options={[{ value: "all", label: "All" }, { value: "frame", label: "Frames" }, { value: "lenses_only", label: "Lenses only" }]} />

          {isPending && !badRange ? (
            <div className="space-y-3" aria-busy="true">{[0, 1, 2, 3].map((i) => <div key={i} className="h-16 animate-pulse rounded-2xl bg-[#F1E7D8]" />)}</div>
          ) : isError ? (
            <EmptyState icon={AlertTriangle} title="Couldn't load payments" text={error.message}
              action={<Button variant="secondary" onClick={() => refetch()}>Try again</Button>} />
          ) : rows.length === 0 ? (
            <EmptyState icon={Receipt} title="No payments found"
              text={hasFilters ? "Try a different filter or search term." : isCustomer ? "Payments for your orders will appear here." : "Payments recorded on orders will appear here."}
              action={hasFilters ? <Button variant="secondary" onClick={clear}>Clear filters</Button> : undefined} />
          ) : (
            <>
              <Card className="hidden overflow-hidden md:block">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <caption className="sr-only">Payment history</caption>
                    <thead>
                      <tr className="border-b border-[#E6D9C6] bg-[#FBF6EE] text-[11px] tracking-[0.16em] text-[#1F1A15]/50 uppercase">
                        {["Date", "Item", ...(isCustomer ? [] : ["Customer"]), "Method", "Amount", "Status"].map((h) => (
                          <th key={h} scope="col" className={`px-6 py-4 font-medium ${h === "Amount" ? "text-right" : ""}`}>{h}</th>
                        ))}
                        <th scope="col" className="px-6 py-4"><span className="sr-only">Receipt</span></th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((p) => (
                        <tr key={p.id} className="border-b border-[#E6D9C6] last:border-0 hover:bg-[#FBF6EE]/60">
                          <td className="px-6 py-4 whitespace-nowrap text-[#1F1A15]/70">{fmtDate(p.date)}</td>
                          <td className="px-6 py-4">
                            <b className="block font-medium">{p.order.title}</b>
                            <span className="text-xs text-[#1F1A15]/45">
                              {p.code} · {isCustomer ? p.order.code : <Link href={`/portal/orders/${p.order.id}`} className="underline decoration-[#8A6A4A]/50 underline-offset-2">{p.order.code}</Link>} · {KIND_LABEL[p.order.kind]}
                            </span>
                          </td>
                          {!isCustomer && <td className="px-6 py-4 text-[#1F1A15]/70">{p.customer?.name}<span className="block text-xs text-[#1F1A15]/45">{p.receivedBy ? `Received by ${p.receivedBy}` : ""}</span></td>}
                          <td className="px-6 py-4 text-[#1F1A15]/70">{PAY_LABEL[p.method]}{p.reference && <span className="block text-xs text-[#1F1A15]/45">{p.reference}</span>}</td>
                          <td className={`px-6 py-4 text-right font-semibold tabular-nums ${p.status === "voided" ? "line-through opacity-50" : ""}`}>{money(p.amount)}</td>
                          <td className="px-6 py-4">
                            <Badge tone={STATUS[p.status].tone}>{STATUS[p.status].label}</Badge>
                            {p.voidReason && <span className="mt-1 block text-xs text-[#8E3524]">{p.voidReason}</span>}
                          </td>
                          <td className="px-6 py-4 text-right"><ReceiptBtn p={p} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              <ul className="space-y-3 md:hidden">
                {rows.map((p) => (
                  <li key={p.id}>
                    <Card className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-medium">{p.order.title}</p>
                          <p className="mt-1 text-xs text-[#1F1A15]/50">{p.code} · {fmtDate(p.date)} · {PAY_LABEL[p.method]}</p>
                          {!isCustomer && <p className="mt-1 text-xs text-[#1F1A15]/50">{p.customer?.name}</p>}
                        </div>
                        <p className={`font-semibold tabular-nums ${p.status === "voided" ? "line-through opacity-50" : ""}`}>{money(p.amount)}</p>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex gap-2"><Badge tone={STATUS[p.status].tone}>{STATUS[p.status].label}</Badge><Badge>{KIND_LABEL[p.order.kind]}</Badge></div>
                        <ReceiptBtn p={p} />
                      </div>
                    </Card>
                  </li>
                ))}
              </ul>
              {rows.length === 300 && <p className="text-center text-xs text-[#1F1A15]/50">Showing the 300 most recent. Narrow the dates to see older payments.</p>}
            </>
          )}
        </>
      )}

      <Toast message={toast} onDone={() => setToast(null)} />
    </div>
  );
}