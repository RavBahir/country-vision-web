export const TODAY = new Date();

/** Change this to match your market (e.g. "GHS"). */
export const CURRENCY = "GHS";

export function money(n: number): string {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: CURRENCY, maximumFractionDigits: 0 }).format(n);
}

export function parseISO(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function toISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function fmtDate(s: string, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }): string {
  return parseISO(s).toLocaleDateString("en-GB", opts);
}

export function fmtTime(t: string): string {
  const [h, m] = t.split(":").map(Number);
  const ap = h >= 12 ? "PM" : "AM";
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${ap}`;
}

export function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

/** Prescription value with a proper minus sign, e.g. −1.50 / +0.75 */
export function rx(n: number): string {
  if (n === 0) return "0.00";
  return `${n < 0 ? "−" : "+"}${Math.abs(n).toFixed(2)}`;
}