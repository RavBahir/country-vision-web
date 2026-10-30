
// app/portal/checkups/common.ts
import { fmtDate, parseISO, rx as fmtPower, toISO } from "@/lib/format";
import { TYPE_LABEL } from "@/app/portal/appointments/common";
import { IEyeRx } from "@/modules/appointments/common/staff";
// pages/checkups/common/checkups.ts

import { ApptType } from "@/lib/portal-data";
import { IPrescription } from "@/modules/appointments/common/staff";

interface IEyeVa { unaided: string | null; aided: string | null }

export interface ICheckup {
  id: string;                 // the appointment id
  code: string;
  type: ApptType;
  date: string;               // YYYY-MM-DD (clinic time)
  time: string;
  clinician: string | null;
  location: string | null;
  acuity: { od: IEyeVa; os: IEyeVa };
  iop: { od: number | null; os: number | null };
  recommendations: string | null;
  followUpDate: string | null;
  prescription: IPrescription | null;
}

export const checkupKeys = {
  all: ["my-checkups"] as const,
  list: () => [...checkupKeys.all, "list"] as const,
};

export { TYPE_LABEL };

export const power = (v: number | null) => (v === null ? "–" : fmtPower(v));
export const pair = (a: string | number | null, b: string | number | null) =>
  `${a ?? "–"} / ${b ?? "–"}`;

/** Follow-up the optometrist set, otherwise a year after the visit. */
export function nextDueOf(c: ICheckup) {
  if (c.followUpDate) return { date: c.followUpDate, recommended: true };
  const d = parseISO(c.date);
  d.setFullYear(d.getFullYear() + 1);
  return { date: toISO(d), recommended: false };
}

const esc = (s: unknown) =>
  String(s ?? "–").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const long = { day: "numeric", month: "long", year: "numeric" } as const;

export function printReport(c: ICheckup, brand = "Country Vision"): boolean {
  const rx = c.prescription;
  const row = (label: string, e: IEyeRx) =>
    `<tr><th>${label}</th><td>${power(e.sphere)}</td><td>${power(e.cylinder)}</td><td>${esc(e.axis)}</td><td>${power(e.add)}</td><td>${esc(e.pd)}</td></tr>`;

  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Checkup ${esc(c.date)}</title>
<style>
  body{font:15px/1.5 system-ui,sans-serif;color:#1F1A15;max-width:720px;margin:40px auto;padding:0 20px}
  h1{font-size:22px;margin:0}h2{font-size:13px;letter-spacing:.14em;text-transform:uppercase;color:#8A6A4A;margin:28px 0 8px}
  table{border-collapse:collapse;width:100%}th,td{border:1px solid #E6D9C6;padding:8px 10px;text-align:center}
  th:first-child{text-align:left}p{margin:4px 0}.muted{color:#666}
</style></head><body>
  <h1>${esc(brand)} · Eye checkup report</h1>
  <p class="muted">${esc(fmtDate(c.date, long))} · ${esc(c.clinician ?? "Optometrist")}${c.location ? " · " + esc(c.location) : ""}</p>
  <p class="muted">Reference ${esc(c.code)}</p>

  <h2>Prescription</h2>
  ${rx
    ? `<table><tr><th></th><th>Sphere</th><th>Cylinder</th><th>Axis</th><th>Add</th><th>PD</th></tr>${row("OD", rx.right)}${row("OS", rx.left)}</table>
       <p class="muted">${rx.pdDistance ? "PD distance " + esc(rx.pdDistance) + " mm · " : ""}${rx.expiresAt ? "Valid until " + esc(fmtDate(rx.expiresAt.slice(0, 10), long)) : ""}</p>`
    : "<p>No prescription was issued at this visit.</p>"}

  <h2>Measurements</h2>
  <p>Visual acuity, unaided (OD / OS): ${esc(pair(c.acuity.od.unaided, c.acuity.os.unaided))}</p>
  <p>Visual acuity, with correction (OD / OS): ${esc(pair(c.acuity.od.aided, c.acuity.os.aided))}</p>
  <p>Eye pressure (OD / OS): ${esc(pair(c.iop.od, c.iop.os))} mmHg</p>

  <h2>Recommendations</h2>
  <p>${esc(c.recommendations ?? "None recorded.")}</p>
  ${c.followUpDate ? `<p>Follow-up: ${esc(fmtDate(c.followUpDate, long))}</p>` : ""}
</body></html>`;

  const w = window.open("", "_blank");
  if (!w) return false; // popup blocked
  w.document.write(html);
  w.document.close();
  w.focus();
  w.print();
  return true;
}