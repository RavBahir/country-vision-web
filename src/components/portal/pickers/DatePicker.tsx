// components/portal/pickers/DatePicker.tsx
"use client";

import { inputCls } from "@/components/portal/UI";
import { fmtDate, parseISO, toISO } from "@/lib/format";
import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { FieldShell, fieldRing, PopoverPortal } from "./popover";

/* ---------------- date helpers (ISO strings, local calendar days) ---------------- */

const pad = (n: number) => String(n).padStart(2, "0");
const todayISO = () => toISO(new Date());

const shiftDays = (iso: string, n: number) => {
  const d = parseISO(iso);
  d.setDate(d.getDate() + n);
  return toISO(d);
};
/** Moves by whole months and clamps the day (31 Jan + 1 month = 28/29 Feb). */
const shiftMonths = (iso: string, n: number) => {
  const d = parseISO(iso);
  const day = d.getDate();
  d.setDate(1);
  d.setMonth(d.getMonth() + n);
  d.setDate(Math.min(day, new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()));
  return toISO(d);
};
const endOfMonth = (iso: string) => shiftDays(shiftMonths(`${iso.slice(0, 7)}-01`, 1), -1);
const clamp = (iso: string, min?: string, max?: string) =>
  min && iso < min ? min : max && iso > max ? max : iso;

const MONTHS = Array.from({ length: 12 }, (_, i) => new Date(2000, i, 1).toLocaleDateString("en-GB", { month: "long" }));
const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const SHORT = { day: "numeric", month: "short", year: "numeric" } as const;
const LONG = { weekday: "long", day: "numeric", month: "long", year: "numeric" } as const;

/* ---------------- calendar ---------------- */

interface CalendarProps {
  start: string;            // selected date, or range start
  end?: string;             // range end ("" while unset)
  anchor?: string | null;   // range: first click waiting for its end
  min?: string;
  max?: string;
  onPick: (iso: string) => void;
  onClear?: () => void;
  autoFocus?: boolean;
}

function Calendar({ start, end = "", anchor = null, min, max, onPick, onClear, autoFocus }: CalendarProps) {
  const today = todayISO();
  const first = clamp(start || today, min, max);
  const [focusISO, setFocusISO] = useState(first);
  const [month, setMonth] = useState(first.slice(0, 7));
  const [hover, setHover] = useState("");
  const gridRef = useRef<HTMLDivElement>(null);
  const moveFocus = useRef(!!autoFocus);

  // One tabbable day (roving tabindex), always inside the visible month
  const tabStop = focusISO.slice(0, 7) === month ? focusISO : clamp(`${month}-01`, min, max);

  useEffect(() => {
    if (!moveFocus.current) return;
    moveFocus.current = false;
    gridRef.current?.querySelector<HTMLElement>(`[data-iso="${tabStop}"]`)?.focus();
  });

  const [y, m] = month.split("-").map(Number);
  const offset = (new Date(y, m - 1, 1).getDay() + 6) % 7; // Monday first
  const days = new Date(y, m, 0).getDate();
  const cells = Array.from({ length: Math.ceil((offset + days) / 7) * 7 }, (_, i) => {
    const d = i - offset + 1;
    return d >= 1 && d <= days ? `${month}-${pad(d)}` : null;
  });

  // Selection band. While picking a range the end follows the pointer.
  let lo = anchor ?? start;
  let hi = anchor ? hover || anchor : end;
  if (lo && hi && lo > hi) [lo, hi] = [hi, lo];
  const isEdge = (iso: string) => iso === lo || (!!hi && iso === hi);
  const isBetween = (iso: string) => !!lo && !!hi && iso > lo && iso < hi;
  const isOff = (iso: string) => (!!min && iso < min) || (!!max && iso > max);

  const thisYear = new Date().getFullYear();
  const yLo = Math.min(min ? +min.slice(0, 4) : thisYear - 100, y);
  const yHi = Math.max(max ? +max.slice(0, 4) : thisYear + 10, y);
  const years = Array.from({ length: yHi - yLo + 1 }, (_, i) => yHi - i);

  const prevOff = !!min && shiftMonths(`${month}-01`, -1).slice(0, 7) < min.slice(0, 7);
  const nextOff = !!max && shiftMonths(`${month}-01`, 1).slice(0, 7) > max.slice(0, 7);
  const goMonth = (n: number) => setMonth(shiftMonths(`${month}-01`, n).slice(0, 7));

  const jump = (iso: string) => {
    const next = clamp(iso, min, max);
    moveFocus.current = true;
    setFocusISO(next);
    setMonth(next.slice(0, 7));
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const weekday = (parseISO(tabStop).getDay() + 6) % 7;
    const next: Record<string, string> = {
      ArrowLeft: shiftDays(tabStop, -1), ArrowRight: shiftDays(tabStop, 1),
      ArrowUp: shiftDays(tabStop, -7), ArrowDown: shiftDays(tabStop, 7),
      Home: shiftDays(tabStop, -weekday), End: shiftDays(tabStop, 6 - weekday),
      PageUp: shiftMonths(tabStop, -1), PageDown: shiftMonths(tabStop, 1),
    };
    if (!next[e.key]) return;
    e.preventDefault();
    jump(next[e.key]);
  };

  const sel = "h-9 rounded-lg border border-[#E6D9C6] bg-white px-2 text-sm font-medium outline-none focus:border-[#8A6A4A]";
  const nav = "grid h-9 w-9 place-items-center rounded-full hover:bg-[#F1E7D8] disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent";

  return (
    <div className="w-70 select-none">
      <div className="mb-3 flex items-center justify-between gap-1">
        <button type="button" aria-label="Previous month" disabled={prevOff} onClick={() => goMonth(-1)} className={nav}><ChevronLeft size={17} /></button>
        <div className="flex items-center gap-1.5">
          <select aria-label="Month" value={m - 1} className={sel} onChange={(e) => setMonth(`${y}-${pad(+e.target.value + 1)}`)}>
            {MONTHS.map((n, i) => <option key={n} value={i}>{n}</option>)}
          </select>
          <select aria-label="Year" value={y} className={sel} onChange={(e) => setMonth(`${e.target.value}-${pad(m)}`)}>
            {years.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
        <button type="button" aria-label="Next month" disabled={nextOff} onClick={() => goMonth(1)} className={nav}><ChevronRight size={17} /></button>
      </div>

      <div className="mb-1 grid grid-cols-7 text-center text-[11px] tracking-wide text-[#1F1A15]/45 uppercase" aria-hidden>
        {WEEKDAYS.map((d) => <span key={d} className="py-1">{d}</span>)}
      </div>

      <div ref={gridRef} role="group" aria-label={`${MONTHS[m - 1]} ${y}`} onKeyDown={onKeyDown} onMouseLeave={() => setHover("")} className="grid grid-cols-7">
        {cells.map((iso, i) => {
          if (!iso) return <span key={i} aria-hidden />;
          const off = isOff(iso);
          const edge = isEdge(iso);
          return (
            <div key={iso} className={`flex h-10 items-center justify-center ${isBetween(iso) ? "bg-[#F1E7D8]" : ""}`}>
              <button
                type="button"
                data-iso={iso}
                disabled={off}
                tabIndex={iso === tabStop ? 0 : -1}
                aria-label={fmtDate(iso, LONG)}
                aria-pressed={edge}
                aria-current={iso === today ? "date" : undefined}
                onClick={() => onPick(iso)}
                onFocus={() => setFocusISO(iso)}
                onMouseEnter={() => anchor && setHover(iso)}
                className={`h-9 w-9 rounded-full text-sm tabular-nums transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#8A6A4A] ${
                  edge ? "bg-[#1F1A15] font-semibold text-white"
                  : off ? "cursor-not-allowed text-[#1F1A15]/25"
                  : `hover:bg-[#F1E7D8] ${iso === today ? "font-semibold ring-1 ring-[#8A6A4A]" : ""}`
                }`}
              >
                {+iso.slice(8)}
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-2 flex items-center justify-between border-t border-[#E6D9C6] pt-2 text-xs font-medium">
        <button type="button" onClick={() => jump(today)} className="rounded-lg px-2 py-1.5 text-[#8A6A4A] hover:bg-[#F1E7D8]">Today</button>
        {onClear && <button type="button" onClick={onClear} className="rounded-lg px-2 py-1.5 text-[#8E3524] hover:bg-[#F1E7D8]">Clear</button>}
      </div>
    </div>
  );
}

/* ---------------- shared trigger ---------------- */

interface FieldProps {
  label?: string;
  ariaLabel?: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  disabled?: boolean;
  placeholder?: string;
  clearable?: boolean;
  min?: string;   // YYYY-MM-DD
  max?: string;
  name?: string;
  id?: string;
}

const panelCls = "overflow-hidden rounded-3xl border border-[#E6D9C6] bg-white shadow-xl max-w-[calc(100vw-16px)]";

function Trigger({
  id, text, placeholder, open, disabled, error, hint, ariaLabel, clearable, hasValue, onToggle, onClear, triggerRef, wrapRef,
}: {
  id: string; text: string | null; placeholder: string; open: boolean; disabled?: boolean; error?: string; hint?: string;
  ariaLabel?: string; clearable: boolean; hasValue: boolean; onToggle: () => void; onClear: () => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>; wrapRef: React.RefObject<HTMLDivElement | null>;
}) {
  const showClear = clearable && hasValue && !disabled;
  return (
    <div ref={wrapRef} className="relative">
      <button
        ref={triggerRef} id={id} type="button" disabled={disabled}
        aria-haspopup="dialog" aria-expanded={open} aria-label={ariaLabel}
        aria-invalid={error ? true : undefined} aria-describedby={error || hint ? `${id}-msg` : undefined}
        onClick={onToggle}
        className={`${inputCls} flex items-center gap-3 text-left disabled:cursor-not-allowed disabled:opacity-60 ${showClear ? "pr-20" : "pr-12"} ${fieldRing(error)}`}
      >
        <CalendarDays size={17} className="shrink-0 text-[#1F1A15]/45" aria-hidden />
        <span className={`truncate ${text ? "" : "text-[#1F1A15]/40"}`}>{text ?? placeholder}</span>
      </button>
      {showClear && (
        <button type="button" aria-label="Clear date" onClick={onClear}
          className="absolute top-1/2 right-4 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-[#1F1A15]/50 hover:bg-[#F1E7D8] hover:text-[#1F1A15]">
          <X size={14} />
        </button>
      )}
    </div>
  );
}

/* ---------------- single date ---------------- */

export function DatePicker({
  value, onChange, label, ariaLabel, hint, error, optional, disabled, placeholder = "Select a date",
  clearable = true, min, max, name, id: idProp,
}: FieldProps & { value: string; onChange: (iso: string) => void }) {
  const auto = useId();
  const id = idProp ?? auto;
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const close = (restore = false) => { setOpen(false); if (restore) triggerRef.current?.focus(); };

  return (
    <FieldShell id={id} label={label} hint={hint} error={error} optional={optional}>
      <Trigger
        id={id} text={value ? fmtDate(value, SHORT) : null} placeholder={placeholder} open={open} disabled={disabled}
        error={error} hint={hint} ariaLabel={ariaLabel} clearable={clearable} hasValue={!!value}
        onToggle={() => setOpen((o) => !o)} onClear={() => onChange("")} triggerRef={triggerRef} wrapRef={wrapRef}
      />
      {name && <input type="hidden" name={name} value={value} />}
      <PopoverPortal open={open} anchorRef={wrapRef} onClose={(r) => close(r === "escape")} className={panelCls}>
        <div role="dialog" aria-label="Choose a date" className="p-3">
          <Calendar
            autoFocus start={value} min={min} max={max}
            onPick={(iso) => { onChange(iso); close(true); }}
            onClear={clearable && value ? () => { onChange(""); close(true); } : undefined}
          />
        </div>
      </PopoverPortal>
    </FieldShell>
  );
}

/* ---------------- date range ---------------- */

export interface DateRange { from: string; to: string }
export interface RangePreset { id: string; label: string; range: () => DateRange }

export const DEFAULT_PRESETS: RangePreset[] = [
  { id: "today", label: "Today", range: () => ({ from: todayISO(), to: todayISO() }) },
  { id: "7d", label: "Last 7 days", range: () => ({ from: shiftDays(todayISO(), -6), to: todayISO() }) },
  { id: "30d", label: "Last 30 days", range: () => ({ from: shiftDays(todayISO(), -29), to: todayISO() }) },
  { id: "month", label: "This month", range: () => ({ from: `${todayISO().slice(0, 7)}-01`, to: endOfMonth(todayISO()) }) },
  { id: "lastmonth", label: "Last month", range: () => { const f = shiftMonths(`${todayISO().slice(0, 7)}-01`, -1); return { from: f, to: endOfMonth(f) }; } },
  { id: "year", label: "This year", range: () => { const y = todayISO().slice(0, 4); return { from: `${y}-01-01`, to: `${y}-12-31` }; } },
];

/** For schedule-style pages that look forward. */
export const UPCOMING_PRESETS: RangePreset[] = [
  { id: "today", label: "Today", range: () => ({ from: todayISO(), to: todayISO() }) },
  { id: "next7", label: "Next 7 days", range: () => ({ from: todayISO(), to: shiftDays(todayISO(), 6) }) },
  { id: "next30", label: "Next 30 days", range: () => ({ from: todayISO(), to: shiftDays(todayISO(), 29) }) },
  { id: "nextmonth", label: "Next month", range: () => { const f = shiftMonths(`${todayISO().slice(0, 7)}-01`, 1); return { from: f, to: endOfMonth(f) }; } },
];

export function DateRangePicker({
  value, onChange, presets = DEFAULT_PRESETS, label, ariaLabel, hint, error, optional, disabled,
  placeholder = "Select dates", clearable = true, min, max, name, id: idProp,
}: FieldProps & { value: DateRange; onChange: (r: DateRange) => void; presets?: RangePreset[] }) {
  const auto = useId();
  const id = idProp ?? auto;
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<string | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const close = (restore = false) => { setOpen(false); setAnchor(null); if (restore) triggerRef.current?.focus(); };
  const fit = (r: DateRange): DateRange => ({ from: clamp(r.from, min, max), to: clamp(r.to, min, max) });
  const complete = !!(value.from && value.to);

  const pick = (iso: string) => {
    if (!anchor) return setAnchor(iso);
    onChange(iso < anchor ? { from: iso, to: anchor } : { from: anchor, to: iso });
    close(true);
  };

  const activeId = presets.find((p) => { const r = fit(p.range()); return r.from === value.from && r.to === value.to; })?.id;
  const text = complete ? (value.from === value.to ? fmtDate(value.from, SHORT) : `${fmtDate(value.from, SHORT)} – ${fmtDate(value.to, SHORT)}`) : null;

  return (
    <FieldShell id={id} label={label} hint={hint} error={error} optional={optional}>
      <Trigger
        id={id} text={text} placeholder={placeholder} open={open} disabled={disabled} error={error} hint={hint}
        ariaLabel={ariaLabel} clearable={clearable} hasValue={complete}
        onToggle={() => { setAnchor(null); setOpen((o) => !o); }} onClear={() => onChange({ from: "", to: "" })}
        triggerRef={triggerRef} wrapRef={wrapRef}
      />
      {name && <><input type="hidden" name={`${name}From`} value={value.from} /><input type="hidden" name={`${name}To`} value={value.to} /></>}
      <PopoverPortal open={open} anchorRef={wrapRef} onClose={(r) => close(r === "escape")} className={panelCls}>
        <div role="dialog" aria-label="Choose a date range" className="flex flex-col sm:flex-row">
          <div className="p-3">
            <p className="mb-2 px-1 text-xs text-[#1F1A15]/55" aria-live="polite">
              {anchor ? "Now pick the last day." : "Pick the first day."}
            </p>
            <Calendar
              autoFocus start={value.from} end={value.to} anchor={anchor} min={min} max={max} onPick={pick}
              onClear={clearable && complete ? () => { onChange({ from: "", to: "" }); close(true); } : undefined}
            />
          </div>
          {presets.length > 0 && (
            <div className="border-t border-[#E6D9C6] p-3 sm:w-44 sm:border-t-0 sm:border-l">
              <p className="mb-2 hidden px-2 text-[11px] tracking-wide text-[#1F1A15]/45 uppercase sm:block">Quick select</p>
              <div className="flex flex-wrap gap-2 sm:flex-col sm:gap-0.5">
                {presets.map((p) => (
                  <button
                    key={p.id} type="button" aria-pressed={activeId === p.id}
                    onClick={() => { onChange(fit(p.range())); close(true); }}
                    className={`rounded-full border px-3 py-1.5 text-xs transition-colors sm:rounded-xl sm:border-transparent sm:text-left sm:text-sm ${
                      activeId === p.id ? "border-[#1F1A15] bg-[#1F1A15] text-white" : "border-[#E6D9C6] hover:bg-[#F1E7D8]"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </PopoverPortal>
    </FieldShell>
  );
}