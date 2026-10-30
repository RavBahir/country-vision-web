"use client";

import Link from "next/link";
import { useEffect, useId, useRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Check, X, type LucideIcon } from "lucide-react";

/* ---------- tokens ---------- */

export const inputCls =
  "h-12 w-full rounded-2xl border border-[#1F1A15]/10 bg-[#F6EFE4] px-4 text-sm outline-none placeholder:text-[#1F1A15]/40 focus:border-[#8A6A4A] focus:bg-white";

/* ---------- layout ---------- */

export function Card({ className = "", children }: { className?: string; children: ReactNode }) {
  return <div className={`rounded-3xl border border-[#E6D9C6] bg-white ${className}`}>{children}</div>;
}

export function Kicker({ children, light }: { children: ReactNode; light?: boolean }) {
  return (
    <p className={`text-xs font-medium tracking-[0.2em] uppercase ${light ? "text-[#C9A57B]" : "text-[#8A6A4A]"}`}>{children}</p>
  );
}

export function PageHeader({
  kicker, title, description, actions,
}: { kicker: string; title: ReactNode; description?: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        <Kicker>{kicker}</Kicker>
        <h1 className="mt-2 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">{title}</h1>
        {description && <p className="mt-3 text-[15px] leading-relaxed text-[#1F1A15]/60">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
    </div>
  );
}

export function SectionTitle({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      {action}
    </div>
  );
}



/* ---------- buttons ---------- */

type Variant = "primary" | "secondary" | "light" | "danger";
const base = "inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50";
const variants: Record<Variant, string> = {
  primary: "bg-[#1F1A15] text-white hover:bg-[#3a3027]",
  secondary: "border border-[#1F1A15]/15 bg-white text-[#1F1A15] hover:bg-[#F6EFE4]",
  light: "bg-[#FAF5EE] text-[#1F1A15] hover:bg-white",
  danger: "border border-[#8E3524]/25 bg-white text-[#8E3524] hover:bg-[#F4DAD3]",
};

export function Button({
  variant = "primary", className = "", type = "button", ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button type={type} className={`${base} ${variants[variant]} ${className}`} {...props} />;
}

export function ButtonLink({
  href, variant = "primary", className = "", children,
}: { href: string; variant?: Variant; className?: string; children: ReactNode }) {
  return <Link href={href} className={`${base} ${variants[variant]} ${className}`}>{children}</Link>;
}

/* ---------- badges ---------- */

type Tone = "success" | "warn" | "danger" | "neutral" | "dark";
const tones: Record<Tone, string> = {
  success: "bg-[#E4EBDD] text-[#3B5A2C]",
  warn: "bg-[#F6E6C8] text-[#8A5A12]",
  danger: "bg-[#F4DAD3] text-[#8E3524]",
  neutral: "bg-[#EFE6D8] text-[#5C4A36]",
  dark: "bg-[#1F1A15] text-white",
};

export function Badge({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  return <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${tones[tone]}`}>{children}</span>;
}

/* ---------- stat card ---------- */

export function StatCard({ icon: Icon, label, value, sub }: { icon: LucideIcon; label: string; value: string; sub?: string }) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-3 text-sm text-[#1F1A15]/60">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#F1E7D8] text-[#8A6A4A]"><Icon size={18} /></span>
        {label}
      </div>
      <p className="mt-4 text-2xl font-semibold tracking-tight">{value}</p>
      {sub && <p className="mt-1 text-xs text-[#1F1A15]/55">{sub}</p>}
    </Card>
  );
}

/* ---------- segmented tabs ---------- */

export function Segmented<T extends string>({
  options, value, onChange, label,
}: { options: { value: T; label: string; count?: number }[]; value: T; onChange: (v: T) => void; label: string }) {
  return (
    <div role="tablist" aria-label={label} className="inline-flex max-w-full overflow-x-auto rounded-full border border-[#E6D9C6] bg-[#F1E7D8] p-1">
      {options.map((o) => (
        <button
          key={o.value}
          role="tab"
          aria-selected={value === o.value}
          onClick={() => onChange(o.value)}
          className={`flex hover:cursor-pointer shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-colors ${
            value === o.value ? "bg-[#1F1A15] text-white" : "text-[#1F1A15]/70 hover:text-[#1F1A15]"
          }`}
        >
          {o.label}
          {typeof o.count === "number" && (
            <span className={`rounded-full px-2 py-0.5 text-[11px] ${value === o.value ? "bg-white/20" : "bg-white/70"}`}>{o.count}</span>
          )}
        </button>
      ))}
    </div>
  );
}

/* ---------- step tracker ---------- */

export function StepTracker({ steps, current }: { steps: readonly string[]; current: number }) {
  return (
    <ol className="flex items-start">
      {steps.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={s} aria-current={active ? "step" : undefined} className="relative flex flex-1 flex-col items-center text-center">
            {i > 0 && <span aria-hidden className={`absolute top-3 right-1/2 left-[-50%] h-0.5 ${i <= current ? "bg-[#1F1A15]" : "bg-[#E6D9C6]"}`} />}
            <span className={`relative z-10 grid h-6 w-6 place-items-center rounded-full border-2 ${
              done ? "border-[#1F1A15] bg-[#1F1A15] text-white" : active ? "border-[#1F1A15] bg-white" : "border-[#E6D9C6] bg-white"
            }`}>
              {done && <Check size={12} strokeWidth={3} />}
              {active && <span className="h-2 w-2 rounded-full bg-[#1F1A15]" />}
            </span>
            <span className={`mt-2 text-[11px] leading-tight ${i <= current ? "font-medium" : "text-[#1F1A15]/45"}`}>{s}</span>
          </li>
        );
      })}
    </ol>
  );
}

/* ---------- modal / drawer ---------- */

export function Modal({
  open, onClose, title, children, footer, variant = "center",
}: {
  open: boolean; onClose: () => void; title: string; children: ReactNode; footer?: ReactNode; variant?: "center" | "drawer";
}) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeRef.current(); };
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      prev?.focus();
    };
  }, [open]);

  if (!open) return null;
  const drawer = variant === "drawer";

  return (
    <div className="fixed inset-0 z-70 flex">
      <div className="absolute inset-0 bg-[#181410]/50 backdrop-blur-[2px]" onClick={onClose} aria-hidden />
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`relative flex flex-col bg-[#FAF5EE] shadow-2xl outline-none ${
          drawer ? "ml-auto h-full w-full max-w-xl rounded-l-[2rem]" : "m-auto max-h-[92vh] w-[calc(100%-2rem)] max-w-lg rounded-[2rem]"
        }`}
      >
        <div className="flex items-center justify-between gap-4 border-b border-[#E6D9C6] px-6 py-5">
          <h2 id={titleId} className="text-xl font-semibold tracking-tight">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="grid h-10 w-10 place-items-center rounded-full border border-[#E6D9C6] bg-white hover:bg-[#F1E7D8]"><X size={17} /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-6">{children}</div>
        {footer && <div className="border-t border-[#E6D9C6] bg-white px-6 py-4 sm:rounded-b-[2rem]">{footer}</div>}
      </div>
    </div>
  );
}

/* ---------- toast ---------- */

export function Toast({ message, onDone }: { message: string | null; onDone: () => void }) {
  const doneRef = useRef(onDone);
  doneRef.current = onDone;
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => doneRef.current(), 3500);
    return () => clearTimeout(t);
  }, [message]);
  if (!message) return null;
  return (
    <div role="status" className="fixed bottom-6 left-1/2 z-80 flex -translate-x-1/2 items-center gap-3 rounded-full bg-[#1F1A15] px-5 py-3 text-sm text-white shadow-xl">
      <Check size={16} className="text-[#C9A57B]" /> {message}
    </div>
  );
}

/* ---------- empty state ---------- */

export function EmptyState({ icon: Icon, title, text, action }: { icon: LucideIcon; title: string; text: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-3xl border border-dashed border-[#E6D9C6] bg-white/60 px-6 py-14 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-[#F1E7D8] text-[#8A6A4A]"><Icon size={22} /></span>
      <p className="mt-5 font-semibold">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-[#1F1A15]/55">{text}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}