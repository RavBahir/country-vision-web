// app/portal/transactions/helpers.ts
import { fmtDate, money } from "@/lib/format";
import { PAY_LABEL } from "@/modules/catalog/common/catalog";
import type { IPaymentRow, IReceipt } from "@/modules/payments/common/payments";

const esc = (s: unknown) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/**
 * Open the window inside the click handler, before any await, so pop-up blockers allow it.
 * Pass it here once the receipt data has loaded.
 */
export function writeReceipt(w: Window, r: IReceipt) {
  const long = { day: "numeric", month: "long", year: "numeric" } as const;
  const org = r.organization;
  w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Receipt ${esc(r.code)}</title>
<style>
  body{font:15px/1.5 system-ui,sans-serif;color:#1F1A15;max-width:640px;margin:40px auto;padding:0 20px}
  h1{font-size:22px;margin:0}h2{font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#8A6A4A;margin:28px 0 8px}
  table{border-collapse:collapse;width:100%}td{padding:8px 0;border-bottom:1px solid #E6D9C6}td:last-child{text-align:right}
  .muted{color:#666}.total td{font-weight:600;border-bottom:0}
</style></head><body>
  <h1>${esc(org?.name ?? "Receipt")}</h1>
  <p class="muted">${esc([org?.address, org?.phone, org?.email].filter(Boolean).join(" · "))}</p>
  <h2>Receipt ${esc(r.code)}</h2>
  <p>${esc(fmtDate(r.date, long))} · ${esc(r.time)}<br>
     Customer: ${esc(r.customer.name)} (${esc(r.customer.code)})<br>
     Order ${esc(r.order.code)}: ${esc(r.order.title)}</p>
  <h2>Order</h2>
  <table>${r.order.lines.map((l) => `<tr><td>${esc(l.label)}</td><td>${l.amount === 0 ? "Included" : esc(money(l.amount))}</td></tr>`).join("")}
    <tr class="total"><td>Order total</td><td>${esc(money(r.order.total))}</td></tr></table>
  <h2>This payment</h2>
  <table>
    <tr><td>${esc(PAY_LABEL[r.method])}${r.reference ? " · " + esc(r.reference) : ""}</td><td>${esc(money(r.amount))}</td></tr>
    <tr><td class="muted">Paid to date</td><td>${esc(money(r.order.paid))}</td></tr>
    <tr class="total"><td>Balance due</td><td>${esc(money(r.order.balance))}</td></tr>
  </table>
  ${r.receivedBy ? `<p class="muted">Received by ${esc(r.receivedBy)}</p>` : ""}
  <p class="muted">Thank you.</p>
</body></html>`);
  w.document.close();
  w.focus();
  w.print();
}

/** A leading = + - or @ makes spreadsheets run the cell as a formula, so neutralise it. */
const cell = (v: unknown) => {
  const s = String(v ?? "");
  return `"${(/^[=+\-@\t\r]/.test(s) ? `'${s}` : s).replace(/"/g, '""')}"`;
};

export function toCsv(rows: IPaymentRow[], staff: boolean) {
  const head = ["Receipt", "Date", "Order", "Item", ...(staff ? ["Customer"] : []), "Method", "Reference", "Amount", "Status"];
  const body = rows.map((p) => [
    p.code, p.date, p.order.code, p.order.title, ...(staff ? [p.customer?.name ?? ""] : []),
    PAY_LABEL[p.method], p.reference ?? "", p.amount.toFixed(2), p.status,
  ]);
  return [head, ...body].map((r) => r.map(cell).join(",")).join("\n");
}

export function saveFile(filename: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}