"use client";

import { useId, useState, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";
import { inputCls } from "@/components/portal/UI";

interface ShellProps { id: string; label: string; hint?: string; error?: string; optional?: boolean; children: ReactNode }

function Shell({ id, label, hint, error, optional, children }: ShellProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium">
        {label}{optional && <span className="font-normal text-[#1F1A15]/45"> (optional)</span>}
      </label>
      {children}
      {(error || hint) && (
        <p id={`${id}-msg`} className={`mt-2 text-xs ${error ? "text-[#8E3524]" : "text-[#1F1A15]/50"}`}>{error ?? hint}</p>
      )}
    </div>
  );
}

const ring = (error?: string) => (error ? "!border-[#8E3524] !bg-white" : "");

type Common = { label: string; hint?: string; error?: string; optional?: boolean };

export function TextField({
  label, hint, error, optional, trailing, value, onChange, ...input
}: Common & { value: string; onChange: (v: string) => void; trailing?: ReactNode } & Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "className">) {
  const id = useId();
  return (
    <Shell id={id} label={label} hint={hint} error={error} optional={optional}>
      <div className="relative">
        <input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? `${id}-msg` : undefined}
          className={`${inputCls} ${ring(error)} ${trailing ? "pr-24" : ""}`}
          {...input}
        />
        {trailing && <div className="absolute inset-y-0 right-4 flex items-center">{trailing}</div>}
      </div>
    </Shell>
  );
}

export function PasswordInput(props: Common & { value: string; onChange: (v: string) => void } & Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "className" | "type">) {
  const [show, setShow] = useState(false);
  return (
    <TextField
      {...props}
      type={show ? "text" : "password"}
      trailing={
        <button type="button" onClick={() => setShow((s) => !s)} aria-pressed={show} aria-label={show ? "Hide password" : "Show password"} className="flex items-center gap-1.5 text-xs text-[#1F1A15]/55 hover:text-[#1F1A15]">
          {show ? <EyeOff size={14} /> : <Eye size={14} />} {show ? "Hide" : "Show"}
        </button>
      }
    />
  );
}

export function SelectField({
  label, hint, error, optional, value, onChange, children, ...rest
}: Common & { value: string; onChange: (v: string) => void; children: ReactNode } & Omit<SelectHTMLAttributes<HTMLSelectElement>, "value" | "onChange" | "className">) {
  const id = useId();
  return (
    <Shell id={id} label={label} hint={hint} error={error} optional={optional}>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} aria-describedby={error || hint ? `${id}-msg` : undefined} className={inputCls} {...rest}>{children}</select>
    </Shell>
  );
}

export function TextAreaField({
  label, hint, error, optional, value, onChange, maxLength, ...rest
}: Common & { value: string; onChange: (v: string) => void } & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "value" | "onChange" | "className">) {
  const id = useId();
  return (
    <Shell id={id} label={label} hint={hint} error={error} optional={optional}>
      <textarea id={id} value={value} maxLength={maxLength} onChange={(e) => onChange(e.target.value)} aria-describedby={error || hint ? `${id}-msg` : undefined} className={`${inputCls} h-auto py-3`} {...rest} />
      {maxLength && <p className="mt-1.5 text-right text-[11px] text-[#1F1A15]/40">{value.length}/{maxLength}</p>}
    </Shell>
  );
}