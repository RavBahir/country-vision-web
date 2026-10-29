// pages/customers/common/CustomerForm.tsx
"use client";

import { Button, Modal } from "@/components/portal/UI";
import {
  FormError, FormSection, SelectField, TextAreaField, TextField, type Option,
} from "@/components/portal/FormFields";
import { useState, type FormEvent } from "react";
import { ICustomer } from "../common/customers";
import { useCreateNewCustomerByStaff, useUpdateCustomer } from "../common/customers-api";

type Props = {
  /** null = create, a customer = edit */
  initial: ICustomer | null;
  onClose: () => void;
  onSaved?: (customer: ICustomer, mode: "created" | "updated") => void;
};

const STATUS_OPTIONS: Option[] = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const blank = (v?: string | null) => v ?? "";
const opt = (v: string) => v.trim() || null;

type Values = {
  name: string; email: string; status: string;
  phone1: string; phone2: string;
  address: string; city: string; country: string;
  emergencyContactName: string; emergencyContactPhone: string; emergencyContactEmail: string;
  notes: string; password: string;
};

export default function CustomerForm({ initial, onClose, onSaved }: Props) {
  const isEdit = Boolean(initial);

  const [values, setValues] = useState<Values>({
    name: blank(initial?.name),
    email: blank(initial?.email),
    status: initial?.status === "inactive" ? "inactive" : "active",
    phone1: blank(initial?.phone1),
    phone2: blank(initial?.phone2),
    address: blank(initial?.address),
    city: blank(initial?.city),
    country: blank(initial?.country),
    emergencyContactName: blank(initial?.emergencyContactName),
    emergencyContactPhone: blank(initial?.emergencyContactPhone),
    emergencyContactEmail: blank(initial?.emergencyContactEmail),
    notes: blank(initial?.notes),
    password: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof Values, string>>>({});

  const createCustomer = useCreateNewCustomerByStaff();
  const updateCustomer = useUpdateCustomer();
  const mutation = isEdit ? updateCustomer : createCustomer;
  const isPending = mutation.isPending;

  const set = <K extends keyof Values>(key: K) => (v: Values[K]) => {
    setValues((s) => ({ ...s, [key]: v }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validate = () => {
    const e: typeof errors = {};
    if (values.name.trim().length < 2) e.name = "Name is required.";
    if (!values.email.trim()) e.email = "Email is required.";
    else if (!EMAIL_RE.test(values.email.trim())) e.email = "Enter a valid email.";
    if (values.emergencyContactEmail.trim() && !EMAIL_RE.test(values.emergencyContactEmail.trim()))
      e.emergencyContactEmail = "Enter a valid email.";
    if (!isEdit && values.password && (values.password.length < 8 || values.password.length > 72))
      e.password = "Password must be 8 to 72 characters.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = (ev: FormEvent) => {
    ev.preventDefault();
    if (isPending || !validate()) return;

    const base = {
      name: values.name.trim(),
      email: values.email.trim().toLowerCase(),
      status: values.status as "active" | "inactive",
      phone1: opt(values.phone1), phone2: opt(values.phone2),
      address: opt(values.address), city: opt(values.city), country: opt(values.country),
      emergencyContactName: opt(values.emergencyContactName),
      emergencyContactPhone: opt(values.emergencyContactPhone),
      emergencyContactEmail: opt(values.emergencyContactEmail),
      notes: opt(values.notes),
    };

    if (initial) {
      updateCustomer.mutate(
        { id: initial.id, data: base },
        { onSuccess: (c) => onSaved?.(c, "updated") },
      );
    } else {
      createCustomer.mutate(
        { ...base, ...(values.password ? { account: { password: values.password } } : {}) },
        { onSuccess: (c) => onSaved?.(c, "created") },
      );
    }
  };

  return (
    <Modal
      open
      onClose={isPending ? () => {} : onClose}
      title={isEdit ? "Edit customer" : "Add new customer"}
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={isPending}>Cancel</Button>
          <Button type="submit" form="customer-form" disabled={isPending}>
            {isPending ? "Saving…" : isEdit ? "Save changes" : "Create customer"}
          </Button>
        </div>
      }
    >
      <form id="customer-form" onSubmit={submit} className="grid gap-6" noValidate>
        <FormSection title="Basic details">
          <TextField label="Full name" value={values.name} onChange={set("name")} error={errors.name}
            placeholder="e.g. Kofi Asante" autoComplete="off" required />
          <TextField label="Email" type="email" value={values.email} onChange={set("email")} error={errors.email}
            placeholder="e.g. kofi@example.com" autoComplete="off" required />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Phone" type="tel" value={values.phone1} onChange={set("phone1")} placeholder="+233 24 000 0000" optional />
            <TextField label="Alternate phone" type="tel" value={values.phone2} onChange={set("phone2")} placeholder="+233 20 000 0000" optional />
          </div>
          <SelectField label="Status" value={values.status} onChange={set("status")} options={STATUS_OPTIONS} />
        </FormSection>

        <FormSection title="Address">
          <TextField label="Street address" value={values.address} onChange={set("address")} autoComplete="street-address" optional />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="City" value={values.city} onChange={set("city")} autoComplete="address-level2" optional />
            <TextField label="Country" value={values.country} onChange={set("country")} autoComplete="country-name" optional />
          </div>
        </FormSection>

        <FormSection title="Emergency contact">
          <TextField label="Contact name" value={values.emergencyContactName} onChange={set("emergencyContactName")} optional />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Contact phone" type="tel" value={values.emergencyContactPhone} onChange={set("emergencyContactPhone")} optional />
            <TextField label="Contact email" type="email" value={values.emergencyContactEmail}
              onChange={set("emergencyContactEmail")} error={errors.emergencyContactEmail} optional />
          </div>
        </FormSection>

        <FormSection title="Notes">
          <TextAreaField label="Internal notes" value={values.notes} onChange={set("notes")}
            placeholder="e.g. prefers morning appointments" optional />
        </FormSection>

        {!isEdit && (
          <FormSection title="Portal login">
            <TextField
              label="Temporary password"
              type="password"
              value={values.password}
              onChange={set("password")}
              error={errors.password}
              autoComplete="new-password"
              hint="Optional. Leave blank to create the record only. The customer can still claim their account later with “Forgot password”."
              optional
            />
          </FormSection>
        )}

        <FormError message={mutation.error?.message} />
      </form>
    </Modal>
  );
}