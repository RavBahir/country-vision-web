// components/portal/FormFields.tsx
import { inputCls } from "@/components/portal/UI";
import { useId, type ReactNode } from "react";

export type Option = { value: string; label: string };

type BaseProps = {
  label: string;
  error?: string;
  hint?: string;
  optional?: boolean;
};

function Wrapper({
  id,
  label,
  error,
  hint,
  optional,
  children,
}: BaseProps & { id: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium">
        {label}
        {optional && <span className="text-[#1F1A15]/45"> (optional)</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="mt-1.5 text-xs text-[#1F1A15]/50">{hint}</p>
      )}
      {error && (
        <p id={`${id}-err`} className="mt-1.5 text-sm text-[#8E3524]">
          {error}
        </p>
      )}
    </div>
  );
}

export function TextField({
  label,
  value,
  onChange,
  type = "text",
  required,
  optional,
  placeholder,
  autoComplete,
  error,
  hint,
  disabled,
  minLength,
}: BaseProps & {
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  autoComplete?: string;
  disabled?: boolean;
  minLength?: number;
}) {
  const id = useId();
  return (
    <Wrapper id={id} label={label} error={error} hint={hint} optional={optional}>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        minLength={minLength}
        disabled={disabled}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-err` : undefined}
        className={`${inputCls} disabled:cursor-not-allowed disabled:opacity-60`}
      />
    </Wrapper>
  );
}

export function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
  required,
  optional,
  error,
  hint,
}: BaseProps & {
  value: string;
  onChange: (v: string) => void;
  options: Option[];
  placeholder?: string;
  required?: boolean;
}) {
  const id = useId();
  return (
    <Wrapper id={id} label={label} error={error} hint={hint} optional={optional}>
      <select
        id={id}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-err` : undefined}
        className={inputCls}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Wrapper>
  );
}

export function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  optional,
  rows = 3,
}: BaseProps & {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  const id = useId();
  return (
    <Wrapper id={id} label={label} optional={optional}>
      <textarea
        id={id}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${inputCls} h-auto py-3`}
      />
    </Wrapper>
  );
}

export function FormSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <fieldset className="grid gap-4 border-t border-[#E6D9C6] pt-5 first:border-0 first:pt-0">
      <legend className="mb-3 text-xs font-medium tracking-[0.16em] text-[#8A6A4A] uppercase">
        {title}
      </legend>
      {children}
    </fieldset>
  );
}

export function FormError({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      {message}
    </p>
  );
}