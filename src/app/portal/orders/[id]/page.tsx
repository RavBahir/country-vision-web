// app/portal/orders/[id]/page.tsx
"use client";

import { Badge, Button, Card, EmptyState, Modal, PageHeader, StepTracker, Toast } from "@/components/portal/UI";
import { FormError, SelectField, TextAreaField, TextField } from "@/components/portal/FormFields";
import { fmtDate, money } from "@/lib/format";
import { usePerms } from "@/lib/use-perms";
import {
  NEXT, ORDER_STEPS, PAY_LABEL, STATUS_LABEL, STATUS_TONE, stepOf, type ICatalogOrder, type OrderStatus, type PayMethod,
} from "@/modules/catalog/common/catalog";
import {
  useAddAdjustment, useOrder, useOrderStatus, useRecordPayment, useRemoveAdjustment, useSaveOrderNotes, useVoidPayment,
} from "@/modules/catalog/common/catalog-api";
import { AlertTriangle, ArrowLeft, Mail, Phone, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import CheckupRx from "../../checkups/CheckupRx";
import { ORDERS_ROUTE } from "../page";

const ACTION: Partial<Record<OrderStatus, string>> = {
  reviewing: "Start review", confirmed: "Confirm quote", in_lab: "Send to lab", ready: "Mark ready", collected: "Mark collected",
};
const PRICE_EDITABLE: OrderStatus[] = ["requested", "reviewing", "confirmed"];
const PAY_OPEN: OrderStatus[] = ["confirmed", "in_lab", "ready"];
const RX_NOTE = { file: "Using the prescription on file.", upload: "The customer will send a new prescription.", later: "The customer will bring it in." } as const;

function AdjustModal({ order, onClose, onDone }: { order: ICatalogOrder; onClose: () => void; onDone: (m: string) => void }) {
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const add = useAddAdjustment();
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const n = Number(amount);
    if (label.trim().length < 2) return setError("Describe the adjustment.");
    if (!amount || Number.isNaN(n) || n === 0) return setError("Enter an amount. Use a minus sign for a discount.");
    add.mutate({ id: order.id, body: { label: label.trim(), amount: n } }, { onSuccess: () => onDone("Adjustment added.") });
  };
  return (
    <Modal open onClose={add.isPending ? () => {} : onClose} title="Add an adjustment"
      footer={<div className="flex justify-end gap-3"><Button variant="secondary" onClick={onClose} disabled={add.isPending}>Cancel</Button><Button type="submit" form="adj-form" disabled={add.isPending}>{add.isPending ? "Adding…" : "Add"}</Button></div>}>
      <form id="adj-form" onSubmit={submit} className="grid gap-5" noValidate>
        <TextField label="Description" value={label} onChange={setLabel} placeholder="e.g. Loyalty discount" required />
        <TextField label="Amount" type="number" value={amount} onChange={setAmount} hint="Negative for a discount, positive for an extra charge." required />
        <FormError message={error ?? add.error?.message} />
      </form>
    </Modal>
  );
}

function PayModal({ order, onClose, onDone }: { order: ICatalogOrder; onClose: () => void; onDone: (m: string) => void }) {
  const [amount, setAmount] = useState(order.balance.toFixed(2));
  const [method, setMethod] = useState<PayMethod>("cash");
  const [reference, setReference] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const pay = useRecordPayment();
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const n = Number(amount);
    if (!amount || Number.isNaN(n) || n <= 0) return setError("Enter an amount.");
    if (n > order.balance) return setError(`That's more than the balance due (${money(order.balance)}).`);
    pay.mutate({ id: order.id, body: { amount: n, method, reference: reference.trim() || null, note: note.trim() || null } }, { onSuccess: () => onDone("Payment recorded.") });
  };
  return (
    <Modal open onClose={pay.isPending ? () => {} : onClose} title="Record a payment"
      footer={<div className="flex justify-end gap-3"><Button variant="secondary" onClick={onClose} disabled={pay.isPending}>Cancel</Button><Button type="submit" form="pay-form" disabled={pay.isPending}>{pay.isPending ? "Saving…" : "Record payment"}</Button></div>}>
      <form id="pay-form" onSubmit={submit} className="grid gap-5" noValidate>
        <p className="text-sm text-[#1F1A15]/65">Balance due: <b className="tabular-nums text-[#1F1A15]">{money(order.balance)}</b></p>
        <TextField label="Amount received" type="number" value={amount} onChange={setAmount} required />
        <SelectField label="Method" value={method} onChange={(v) => setMethod(v as PayMethod)} options={(Object.keys(PAY_LABEL) as PayMethod[]).map((m) => ({ value: m, label: PAY_LABEL[m] }))} />
        {method !== "cash" && <TextField label="Reference" value={reference} onChange={setReference} placeholder="Transaction ID or last digits" optional />}
        <TextAreaField label="Note" value={note} onChange={setNote} rows={2} optional />
        <FormError message={error ?? pay.error?.message} />
      </form>
    </Modal>
  );
}

function VoidModal({ order, paymentId, onClose, onDone }: { order: ICatalogOrder; paymentId: string; onClose: () => void; onDone: (m: string) => void }) {
  const [reason, setReason] = useState("");
  const del = useVoidPayment();
  return (
    <Modal open onClose={del.isPending ? () => {} : onClose} title="Void this payment?"
      footer={<div className="flex justify-end gap-3"><Button variant="secondary" onClick={onClose} disabled={del.isPending}>Keep it</Button>
        <Button variant="danger" disabled={reason.trim().length < 3 || del.isPending} onClick={() => del.mutate({ id: order.id, paymentId, reason: reason.trim() }, { onSuccess: () => onDone("Payment voided.") })}>{del.isPending ? "Voiding…" : "Void payment"}</Button></div>}>
      <div className="grid gap-4">
        <p className="text-sm text-[#1F1A15]/65">The payment stays on record as voided and no longer counts toward the balance.</p>
        <TextAreaField label="Reason" value={reason} onChange={setReason} rows={2} />
        <FormError message={del.error?.message} />
      </div>
    </Modal>
  );
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { can } = usePerms();
  const { data: o, isPending, isError, error, refetch } = useOrder(id);
  const status = useOrderStatus();
  const removeAdj = useRemoveAdjustment();
  const saveNotes = useSaveOrderNotes();

  const [dialog, setDialog] = useState<"adjust" | "pay" | null>(null);
  const [voiding, setVoiding] = useState<string | null>(null);
  const [notes, setNotes] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  if (isPending) return <div className="h-64 animate-pulse rounded-3xl bg-[#F1E7D8]" aria-busy="true" />;
  if (isError || !o) return <EmptyState icon={AlertTriangle} title="Couldn't load this order" text={error?.message || "It may not exist."} action={<Button variant="secondary" onClick={() => refetch()}>Try again</Button>} />;

  const canUpdate = can("canUpdateOrders");
  const canPay = can("canCreatePayments") && PAY_OPEN.includes(o.status) && o.balance > 0;
  const editable = canUpdate && PRICE_EDITABLE.includes(o.status);
  const noteValue = notes ?? o.staffNotes ?? "";
  const done = (m: string) => { setDialog(null); setVoiding(null); setToast(m); };

  const move = (to: OrderStatus) => {
    let reason: string | null = null;
    if (to === "cancelled") {
      if (!confirm("Cancel this order?")) return;
      reason = prompt("Reason (optional)") || null;
    }
    status.mutate({ id: o.id, body: { status: to, reason } }, { onSuccess: () => setToast(`Order ${STATUS_LABEL[to].toLowerCase()}.`), onError: (e) => setToast(e.message) });
  };

  return (
    <div className="space-y-6">
      <Link href={ORDERS_ROUTE} className="inline-flex items-center gap-2 text-sm text-[#1F1A15]/65 hover:text-[#1F1A15]"><ArrowLeft size={16} /> Back to orders</Link>

      <PageHeader kicker={o.code} title={o.title} description={`${o.summary} · Requested ${fmtDate(o.createdAt.slice(0, 10), { day: "numeric", month: "long", year: "numeric" })}`}
        actions={<Badge tone={STATUS_TONE[o.status]}>{STATUS_LABEL[o.status]}</Badge>} />

      {o.status !== "cancelled" && <Card className="p-6"><StepTracker steps={ORDER_STEPS} current={stepOf(o.status)} /></Card>}
      {o.status === "cancelled" && <p className="text-sm text-[#1F1A15]/60">Cancelled by {o.cancelledBy ?? "staff"}{o.cancelReason ? `: ${o.cancelReason}` : "."}</p>}

      <div className="grid items-start gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">Items and price</h2>
              {editable && <Button variant="secondary" className="px-4 py-2" onClick={() => setDialog("adjust")}><Plus size={15} /> Adjustment</Button>}
            </div>
            <ul className="mt-4 divide-y divide-[#E6D9C6] text-sm">
              {o.lines.map((l) => (
                <li key={l.id} className="flex items-center gap-3 py-3">
                  <span className="min-w-0 flex-1">{l.label}{l.kind === "adjustment" && <Badge tone="neutral">Adjustment</Badge>}</span>
                  <span className={`tabular-nums ${l.amount < 0 ? "text-[#3B5A2C]" : ""}`}>{l.amount === 0 ? "Included" : money(l.amount)}</span>
                  {editable && l.kind === "adjustment" && (
                    <button aria-label={`Remove ${l.label}`} disabled={removeAdj.isPending} onClick={() => removeAdj.mutate({ id: o.id, lineId: l.id }, { onError: (e) => setToast(e.message) })} className="grid h-8 w-8 place-items-center rounded-full border border-[#E6D9C6] text-[#8E3524]"><Trash2 size={14} /></button>
                  )}
                </li>
              ))}
            </ul>
            <dl className="mt-4 grid gap-2 border-t border-[#E6D9C6] pt-4 text-sm">
              <div className="flex justify-between"><dt>Total</dt><dd className="font-semibold tabular-nums">{money(o.total)}</dd></div>
              <div className="flex justify-between text-[#1F1A15]/65"><dt>Paid</dt><dd className="tabular-nums">{money(o.paid)}</dd></div>
              <div className="flex justify-between"><dt>Balance due</dt><dd className="font-semibold tabular-nums">{money(o.balance)}</dd></div>
            </dl>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">Payments</h2>
              {canPay && <Button className="px-4 py-2" onClick={() => setDialog("pay")}><Plus size={15} /> Record payment</Button>}
            </div>
            {o.payments.length === 0 ? <p className="mt-4 text-sm text-[#1F1A15]/55">{PAY_OPEN.includes(o.status) ? "No payments yet." : "Payments open once the quote is confirmed."}</p> : (
              <ul className="mt-4 divide-y divide-[#E6D9C6] text-sm">
                {o.payments.map((p) => (
                  <li key={p.id} className="flex flex-wrap items-center gap-3 py-3">
                    <span className="min-w-0 flex-1">
                      <b className={`font-medium ${p.voidedAt ? "line-through opacity-50" : ""}`}>{PAY_LABEL[p.method]}</b>
                      <span className="block text-xs text-[#1F1A15]/50">{p.code} · {fmtDate(p.paidAt.slice(0, 10), { day: "numeric", month: "short", year: "numeric" })}{p.receivedBy ? ` · ${p.receivedBy}` : ""}{p.reference ? ` · ${p.reference}` : ""}</span>
                      {p.voidedAt && <span className="block text-xs text-[#8E3524]">Voided: {p.voidReason}</span>}
                    </span>
                    <span className={`tabular-nums ${p.voidedAt ? "line-through opacity-50" : ""}`}>{money(p.amount)}</span>
                    {!p.voidedAt && can("canUpdatePayments") && o.status !== "collected" && <button className="text-xs text-[#8E3524] underline" onClick={() => setVoiding(p.id)}>Void</button>}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          {canUpdate && NEXT[o.status].length > 0 && (
            <Card className="grid gap-2 p-4">
              {NEXT[o.status].filter((s) => s !== "cancelled").map((s) => <Button key={s} disabled={status.isPending} onClick={() => move(s)}>{ACTION[s]}</Button>)}
              {o.status === "ready" && o.balance > 0 && <p className="text-xs text-[#8A5A12]">Take the remaining {money(o.balance)} before handing over.</p>}
              {NEXT[o.status].includes("cancelled") && <Button variant="danger" disabled={status.isPending} onClick={() => move("cancelled")}>Cancel order</Button>}
            </Card>
          )}

          {o.customer && (
            <Card className="p-6">
              <h2 className="font-semibold">{o.customer.name}</h2>
              <p className="text-xs text-[#1F1A15]/50">{o.customer.code}</p>
              <ul className="mt-3 grid gap-2 text-sm">
                <li className="flex items-center gap-2"><Mail size={14} className="text-[#8A6A4A]" /> {o.customer.email}</li>
                {o.customer.phone1 && <li className="flex items-center gap-2"><Phone size={14} className="text-[#8A6A4A]" /> <a href={`tel:${o.customer.phone1}`}>{o.customer.phone1}</a></li>}
              </ul>
              {o.customerNotes && <p className="mt-4 rounded-xl bg-[#FBF6EE] px-4 py-3 text-sm"><b className="block text-xs tracking-wide text-[#1F1A15]/50 uppercase">Customer note</b>{o.customerNotes}</p>}
            </Card>
          )}

          <Card className="p-6">
            <h2 className="font-semibold">Prescription</h2>
            <p className="mt-1 text-sm text-[#1F1A15]/60">{RX_NOTE[o.rxSource]}</p>
            {o.prescription && <div className="mt-3"><CheckupRx rx={o.prescription} /></div>}
          </Card>

          {canUpdate && (
            <Card className="grid gap-3 p-6">
              <TextAreaField label="Internal notes" value={noteValue} onChange={setNotes} rows={3} placeholder="Lab reference, fitting details…" optional />
              {notes !== null && notes.trim() !== (o.staffNotes ?? "") && (
                <div className="flex justify-end"><Button disabled={saveNotes.isPending} onClick={() => saveNotes.mutate({ id: o.id, body: { staffNotes: notes.trim() || null } }, { onSuccess: () => { setNotes(null); setToast("Notes saved."); } })}>Save notes</Button></div>
              )}
            </Card>
          )}
        </div>
      </div>

      {dialog === "adjust" && <AdjustModal order={o} onClose={() => setDialog(null)} onDone={done} />}
      {dialog === "pay" && <PayModal order={o} onClose={() => setDialog(null)} onDone={done} />}
      {voiding && <VoidModal order={o} paymentId={voiding} onClose={() => setVoiding(null)} onDone={done} />}
      <Toast message={toast} onDone={() => setToast(null)} />
    </div>
  );
}