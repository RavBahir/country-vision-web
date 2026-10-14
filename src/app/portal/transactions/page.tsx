"use client";

import { useMemo, useState } from "react";
import { Download, FileDown, Receipt, Search } from "lucide-react";
import { Badge, Button, Card, EmptyState, PageHeader, Segmented, Toast, inputCls } from "@/components/portal/UI";
import { fmtDate, money, TODAY } from "@/lib/format";
import { TRANSACTIONS, type Transaction, type TxCategory, type TxStatus } from "@/lib/portal-data";

type CatFilter = "All" | TxCategory;
type StatusFilter = "all" | TxStatus;

const TONE: Record<TxStatus, "success" | "warn" | "neutral" | "danger"> = {
  paid: "success", pending: "warn", refunded: "neutral", failed: "danger",
};
const LABEL: Record<TxStatus, string> = { paid: "Paid", pending: "Pending", refunded: "Refunded", failed: "Failed" };

function save(filename: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function TransactionsPage() {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<CatFilter>("All");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [toast, setToast] = useState<string | null>(null);

  const year = String(TODAY.getFullYear());
  const totals = useMemo(() => ({
    paid: TRANSACTIONS.filter((t) => t.status === "paid" && t.date.startsWith(year)).reduce((s, t) => s + t.amount, 0),
    pending: TRANSACTIONS.filter((t) => t.status === "pending").reduce((s, t) => s + t.amount, 0),
    refunded: TRANSACTIONS.filter((t) => t.status === "refunded").reduce((s, t) => s + t.amount, 0),
  }), [year]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return TRANSACTIONS
      .filter((t) => (cat === "All" || t.category === cat) && (status === "all" || t.status === status) && (!q || `${t.id} ${t.description}`.toLowerCase().includes(q)))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [query, cat, status]);

  const exportCsv = () => {
    const head = ["ID", "Date", "Description", "Category", "Method", "Amount", "Status"];
    const body = rows.map((t) => [t.id, t.date, t.description, t.category, t.method, t.amount, t.status]);
    const csv = [head, ...body].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    save("country-vision-transactions.csv", csv, "text/csv");
    setToast(`Exported ${rows.length} transactions.`);
  };

  const receipt = (t: Transaction) => {
    // Demo: plain-text receipt. Replace with a call to your PDF receipt endpoint.
    const text = ["Country Vision · Receipt", `Reference: ${t.id}`, `Date: ${fmtDate(t.date)}`, `Item: ${t.description}`, `Method: ${t.method}`, `Amount: ${money(t.amount)}`, `Status: ${LABEL[t.status]}`].join("\n");
    save(`receipt-${t.id}.txt`, text, "text/plain");
    setToast(`Receipt ${t.id} downloaded.`);
  };

  const summary = [
    { label: `Paid in ${year}`, value: money(totals.paid), note: "Completed payments" },
    { label: "Pending", value: money(totals.pending), note: "Awaiting confirmation" },
    { label: "Refunded", value: money(totals.refunded), note: "Returned to you" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Transactions"
        title="Payments and receipts."
        description="Every payment for eye checkups, frames and lenses. Download a receipt whenever you need one."
        actions={<Button variant="secondary" onClick={exportCsv} disabled={rows.length === 0}><FileDown size={16} /> Export CSV</Button>}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {summary.map((s, i) => (
          <div key={s.label} className={`rounded-3xl p-6 ${i === 0 ? "bg-[#12100D] text-white" : "border border-[#E6D9C6] bg-white"}`}>
            <p className={`text-sm ${i === 0 ? "text-white/60" : "text-[#1F1A15]/55"}`}>{s.label}</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight tabular-nums">{s.value}</p>
            <p className={`mt-1 text-xs ${i === 0 ? "text-white/45" : "text-[#1F1A15]/50"}`}>{s.note}</p>
          </div>
        ))}
      </div>

      {/* filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-55 flex-1 sm:max-w-xs">
          <Search size={16} className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-[#1F1A15]/45" aria-hidden />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by item or reference" aria-label="Search transactions" className={`${inputCls} pl-11`} />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value as StatusFilter)} aria-label="Filter by status" className={`${inputCls} w-auto`}>
          <option value="all">All statuses</option>
          {(Object.keys(LABEL) as TxStatus[]).map((s) => <option key={s} value={s}>{LABEL[s]}</option>)}
        </select>
      </div>
      <Segmented<CatFilter>
        label="Category"
        value={cat}
        onChange={setCat}
        options={(["All", "Eye checkup", "Frames", "Lenses", "Accessories"] as CatFilter[]).map((c) => ({ value: c, label: c }))}
      />

      {rows.length === 0 ? (
        <EmptyState icon={Receipt} title="No transactions found" text="Try a different filter or search term." action={<Button variant="secondary" onClick={() => { setQuery(""); setCat("All"); setStatus("all"); }}>Clear filters</Button>} />
      ) : (
        <>
          {/* desktop table */}
          <Card className="hidden overflow-hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <caption className="sr-only">Transaction history</caption>
                <thead>
                  <tr className="border-b border-[#E6D9C6] bg-[#FBF6EE] text-[11px] tracking-[0.16em] text-[#1F1A15]/50 uppercase">
                    {["Date", "Description", "Category", "Method", "Amount", "Status"].map((h) => <th key={h} scope="col" className={`px-6 py-4 font-medium ${h === "Amount" ? "text-right" : ""}`}>{h}</th>)}
                    <th scope="col" className="px-6 py-4"><span className="sr-only">Receipt</span></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((t) => (
                    <tr key={t.id} className="border-b border-[#E6D9C6] last:border-0 hover:bg-[#FBF6EE]/60">
                      <td className="px-6 py-4 whitespace-nowrap text-[#1F1A15]/70">{fmtDate(t.date)}</td>
                      <td className="px-6 py-4"><b className="block font-medium">{t.description}</b><span className="text-xs text-[#1F1A15]/45">{t.id}</span></td>
                      <td className="px-6 py-4 text-[#1F1A15]/70">{t.category}</td>
                      <td className="px-6 py-4 text-[#1F1A15]/70">{t.method}</td>
                      <td className="px-6 py-4 text-right font-semibold tabular-nums">{money(t.amount)}</td>
                      <td className="px-6 py-4"><Badge tone={TONE[t.status]}>{LABEL[t.status]}</Badge></td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => receipt(t)} disabled={t.status === "failed"} aria-label={`Download receipt ${t.id}`} className="grid h-9 w-9 place-items-center rounded-full border border-[#E6D9C6] hover:bg-[#F1E7D8] disabled:cursor-not-allowed disabled:opacity-35"><Download size={15} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* mobile list */}
          <ul className="space-y-3 md:hidden">
            {rows.map((t) => (
              <li key={t.id}>
                <Card className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium">{t.description}</p>
                      <p className="mt-1 text-xs text-[#1F1A15]/50">{t.id} · {fmtDate(t.date)} · {t.method}</p>
                    </div>
                    <p className="font-semibold tabular-nums">{money(t.amount)}</p>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex gap-2"><Badge tone={TONE[t.status]}>{LABEL[t.status]}</Badge><Badge>{t.category}</Badge></div>
                    <button onClick={() => receipt(t)} disabled={t.status === "failed"} aria-label={`Download receipt ${t.id}`} className="grid h-9 w-9 place-items-center rounded-full border border-[#E6D9C6] disabled:opacity-35"><Download size={15} /></button>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        </>
      )}

      <Toast message={toast} onDone={() => setToast(null)} />
    </div>
  );
}