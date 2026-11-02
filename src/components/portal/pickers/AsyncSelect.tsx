// components/portal/pickers/AsyncSelect.tsx
"use client";

import { inputCls } from "@/components/portal/UI";
import { Check, ChevronDown, Lock, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { FieldShell, fieldRing, PopoverPortal } from "./popover";

export interface SelectOption<T extends string | number = string> {
  value: T;
  label: string;
  /** Optional second line, e.g. a customer's code or email. */
  hint?: string;
}

export interface AsyncSelectProps<T extends string | number = string> {
  label?: string;
  ariaLabel?: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  placeholder?: string;
  disabled?: boolean;
  /** Can't be changed because of a business rule. Shows a lock instead of just dimming. */
  locked?: boolean;
  clearable?: boolean;
  value: SelectOption<T> | null;
  onChange: (option: SelectOption<T> | null) => void;
  /** Receives the search text. Honour `signal` (pass it to fetch) so stale requests are cancelled. */
  loadOptions: (query: string, signal: AbortSignal) => Promise<SelectOption<T>[]>;
  /** Don't search until this many characters are typed. Default 0 loads a default list on open. */
  minChars?: number;
  debounceMs?: number;
  /** Change this to throw away cached results (e.g. when a branch filter changes). */
  cacheKey?: string | number;
  emptyText?: string;
  name?: string;
  id?: string;
}

export function AsyncSelect<T extends string | number = string>({
  label, ariaLabel, hint, error, optional, placeholder = "Search…", disabled, locked, clearable = true,
  value, onChange, loadOptions, minChars = 0, debounceMs = 300, cacheKey, emptyText = "No matches", name, id: idProp,
}: AsyncSelectProps<T>) {
  const auto = useId();
  const id = idProp ?? auto;
  const listId = `${id}-list`;

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState<SelectOption<T>[]>([]);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [active, setActive] = useState(0);
  const [attempt, setAttempt] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const cache = useRef(new Map<string, SelectOption<T>[]>());
  const loadRef = useRef(loadOptions);
  loadRef.current = loadOptions; // callers can pass an inline function without re-triggering loads

  useEffect(() => { cache.current.clear(); }, [cacheKey]);

  useEffect(() => {
    if (!open) return;
    const q = query.trim();
    if (q.length < minChars) { setOptions([]); setLoading(false); setFailed(false); return; }

    const hit = cache.current.get(q);
    if (hit) { setOptions(hit); setLoading(false); setFailed(false); return; }

    const ctrl = new AbortController();
    setLoading(true);
    setFailed(false);
    const timer = setTimeout(async () => {
      try {
        const res = await loadRef.current(q, ctrl.signal);
        if (ctrl.signal.aborted) return;
        cache.current.set(q, res);
        setOptions(res);
      } catch {
        if (!ctrl.signal.aborted) { setFailed(true); setOptions([]); }
      } finally {
        if (!ctrl.signal.aborted) setLoading(false);
      }
    }, q ? debounceMs : 0); // the default list loads immediately
    return () => { clearTimeout(timer); ctrl.abort(); };
  }, [open, query, minChars, debounceMs, cacheKey, attempt]);

  // Start on the current choice when it's in the list
  useEffect(() => {
    const i = options.findIndex((o) => o.value === value?.value);
    setActive(i >= 0 ? i : 0);
  }, [options, value]);

  useEffect(() => {
    if (open) document.getElementById(`${listId}-${active}`)?.scrollIntoView({ block: "nearest" });
  }, [active, open, listId]);

  const inert = disabled || locked;
  const close = () => { setOpen(false); setQuery(""); };
  const choose = (o: SelectOption<T>) => { onChange(o); close(); };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) setOpen(true); else setActive((i) => Math.min(i + 1, options.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && open && options[active]) {
      e.preventDefault(); // don't submit the form while choosing
      choose(options[active]);
    } else if (e.key === "Tab") {
      close();
    }
  };

  const showClear = clearable && !!value && !inert;
  const status = loading && options.length === 0 ? "Searching…"
    : failed ? null
    : query.trim().length < minChars ? `Type at least ${minChars} character${minChars === 1 ? "" : "s"}`
    : !loading && options.length === 0 ? emptyText : null;

  return (
    <FieldShell id={id} label={label} hint={hint} error={error} optional={optional}>
      <div ref={wrapRef} className="relative" title={locked ? "This field is locked and can't be changed" : undefined}>
        <input
          ref={inputRef} id={id} role="combobox" autoComplete="off" aria-label={ariaLabel}
          aria-expanded={open} aria-autocomplete="list" aria-haspopup="listbox"
          aria-controls={open && options.length > 0 ? listId : undefined}
          aria-activedescendant={open && options[active] ? `${listId}-${active}` : undefined}
          aria-invalid={error ? true : undefined} aria-describedby={error || hint ? `${id}-msg` : undefined}
          disabled={disabled} readOnly={locked}
          value={open ? query : value?.label ?? ""}
          placeholder={open && value ? value.label : placeholder}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => !inert && setOpen(true)}
          onClick={() => !inert && setOpen(true)}
          onKeyDown={onKeyDown}
          className={`${inputCls} ${showClear ? "pr-20" : "pr-12"} ${locked ? "cursor-not-allowed bg-[#F1E7D8]/50" : ""} disabled:cursor-not-allowed disabled:opacity-60 ${fieldRing(error)}`}
        />
        {showClear && (
          <button type="button" aria-label="Clear selection"
            onClick={() => { onChange(null); setQuery(""); inputRef.current?.focus(); }}
            className="absolute top-1/2 right-10 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-[#1F1A15]/50 hover:bg-[#F1E7D8] hover:text-[#1F1A15]">
            <X size={14} />
          </button>
        )}
        <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-[#1F1A15]/45" aria-hidden>
          {locked ? <Lock size={15} /> : <ChevronDown size={16} className={`transition-transform ${open ? "rotate-180" : ""}`} />}
        </span>
      </div>
      {name && <input type="hidden" name={name} value={value?.value ?? ""} />}

      <PopoverPortal
        open={open} anchorRef={wrapRef} matchWidth
        onClose={(reason) => { close(); if (reason === "escape") inputRef.current?.focus(); }}
        className="overflow-hidden rounded-2xl border border-[#E6D9C6] bg-white shadow-xl"
      >
        {/* keep focus in the input while clicking an option */}
        <div onMouseDown={(e) => e.preventDefault()}>
          {status && <p role="status" className="px-4 py-3 text-sm text-[#1F1A15]/55">{status}</p>}
          {failed && (
            <div role="alert" className="flex items-center justify-between gap-3 px-4 py-3 text-sm text-[#8E3524]">
              Couldn&rsquo;t load results.
              <button type="button" onClick={() => setAttempt((n) => n + 1)} className="border-b border-[#8E3524]/50 font-medium">Retry</button>
            </div>
          )}
          {options.length > 0 && (
            <ul id={listId} role="listbox" aria-label={label ?? ariaLabel} aria-busy={loading}
              className={`max-h-64 overflow-y-auto py-1 ${loading ? "opacity-60" : ""}`}>
              {options.map((o, i) => {
                const selected = o.value === value?.value;
                return (
                  <li
                    key={String(o.value)} id={`${listId}-${i}`} role="option" aria-selected={selected}
                    onMouseEnter={() => setActive(i)} onClick={() => choose(o)}
                    className={`flex cursor-pointer items-center gap-3 px-4 py-2.5 ${i === active ? "bg-[#F1E7D8]" : ""}`}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{o.label}</span>
                      {o.hint && <span className="block truncate text-xs text-[#1F1A15]/50">{o.hint}</span>}
                    </span>
                    {selected && <Check size={14} className="shrink-0 text-[#8A6A4A]" />}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </PopoverPortal>
    </FieldShell>
  );
}