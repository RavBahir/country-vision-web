// pages/customers/common/CustomerForm.tsx
"use client";

import { Button, Modal } from "@/components/portal/UI";
import {
  FormError,
  FormSection,
  SelectField,
  TextAreaField,
  TextField,
  type Option,
} from "@/components/portal/FormFields";
import { useState, type FormEvent } from "react";
import { BASIC_STATUS } from "@/lib/enums";
import { ICustomer } from "../common/customers";
import { useCreateCustomer, useUpdateCustomer } from "../common/customers-api";

type Props = {
  /** null = create, a customer = edit */
  initial: ICustomer | null;
  branches: Option[];
  onClose: () => void;
  onSaved?: (customer: ICustomer, mode: "created" | "updated") => void;
};

const STATUS_OPTIONS: Option[] = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "archived", label: "Archived" },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Values = {
  name: string;
  email: string;
  code: string;
  branchId: string;
  status: string;
  phone1: string;
  phone2: string;
  address: string;
  city: string;
  country: string;
  emergencyContactName: string;
  emergencyContactEmail: string;
  emergencyContactPhone: string;
  notes: string;
};

const blank = (v?: string | null) => v ?? "";

export default function CustomerForm({
  initial,
  branches,
  onClose,
  onSaved,
}: Props) {
  const isEdit = Boolean(initial);

  const [values, setValues] = useState<Values>({
    name: blank(initial?.name),
    email: blank(initial?.email),
    code: blank(initial?.code),
    branchId: blank(initial?.branchId),
    status: initial?.status ?? "active",
    phone1: blank(initial?.phone1),
    phone2: blank(initial?.phone2),
    address: blank(initial?.address),
    city: blank(initial?.city),
    country: blank(initial?.country),
    emergencyContactName: blank(initial?.emergencyContactName),
    emergencyContactEmail: blank(initial?.emergencyContactEmail),
    emergencyContactPhone: blank(initial?.emergencyContactPhone),
    notes: blank(initial?.notes),
  });
  const [errors, setErrors] = useState<Partial<Record<keyof Values, string>>>(
    {},
  );

  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();
  const mutation = isEdit ? updateCustomer : createCustomer;
  const isPending = mutation.isPending;

  const set =
    <K extends keyof Values>(key: K) =>
    (v: Values[K]) => {
      setValues((s) => ({ ...s, [key]: v }));
      if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
    };

  const validate = () => {
    const e: typeof errors = {};
    if (!values.name.trim()) e.name = "Name is required.";
    if (!values.email.trim()) e.email = "Email is required.";
    else if (!EMAIL_RE.test(values.email.trim()))
      e.email = "Enter a valid email.";
    if (!values.branchId) e.branchId = "Choose a branch.";
    if (
      values.emergencyContactEmail.trim() &&
      !EMAIL_RE.test(values.emergencyContactEmail.trim())
    )
      e.emergencyContactEmail = "Enter a valid email.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = (ev: FormEvent) => {
    ev.preventDefault();
    if (isPending || !validate()) return;

    // Optional text columns: send null when blank so edits can clear a value.
    const opt = (v: string) => v.trim() || null;

    const payload = {
      name: values.name.trim(),
      email: values.email.trim().toLowerCase(),
      branchId: values.branchId,
      status: values.status as BASIC_STATUS,
      // Blank code on create = let the backend generate it
      ...(values.code.trim() ? { code: values.code.trim() } : {}),
      phone1: opt(values.phone1),
      phone2: opt(values.phone2),
      address: opt(values.address),
      city: opt(values.city),
      country: opt(values.country),
      emergencyContactName: opt(values.emergencyContactName),
      emergencyContactEmail: opt(values.emergencyContactEmail),
      emergencyContactPhone: opt(values.emergencyContactPhone),
      notes: opt(values.notes),
    };

    if (initial) {
      updateCustomer.mutate(
        { id: initial.id, data: payload },
        { onSuccess: (c) => onSaved?.(c, "updated") },
      );
    } else {
      createCustomer.mutate(payload, {
        onSuccess: (c) => onSaved?.(c, "created"),
      });
    }
  };

  return (
    <Modal
      open
      onClose={isPending ? () => {} : onClose}
      title={isEdit ? "Edit customer" : "Add new customer"}
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" form="customer-form" disabled={isPending}>
            {isPending
              ? "Saving…"
              : isEdit
                ? "Save changes"
                : "Create customer"}
          </Button>
        </div>
      }
    >
      <form
        id="customer-form"
        onSubmit={submit}
        className="grid gap-6"
        noValidate
      >
        <FormSection title="Basic details">
          <TextField
            label="Full name"
            value={values.name}
            onChange={set("name")}
            error={errors.name}
            placeholder="e.g. Kofi Asante"
            autoComplete="off"
            required
          />
          <TextField
            label="Email"
            type="email"
            value={values.email}
            onChange={set("email")}
            error={errors.email}
            placeholder="e.g. kofi@example.com"
            autoComplete="off"
            required
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Phone"
              type="tel"
              value={values.phone1}
              onChange={set("phone1")}
              placeholder="+233 24 000 0000"
              optional
            />
            <TextField
              label="Alternate phone"
              type="tel"
              value={values.phone2}
              onChange={set("phone2")}
              placeholder="+233 20 000 0000"
              optional
            />
          </div>
        </FormSection>

        <FormSection title="Account">
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField
              label="Branch"
              value={values.branchId}
              onChange={set("branchId")}
              options={branches}
              placeholder="Select a branch"
              error={errors.branchId}
              required
            />
            <SelectField
              label="Status"
              value={values.status}
              onChange={set("status")}
              options={STATUS_OPTIONS}
            />
          </div>
          <TextField
            label="Customer code"
            value={values.code}
            onChange={set("code")}
            hint={isEdit ? undefined : "Leave blank to generate automatically."}
            optional={!isEdit}
            disabled={isEdit}
          />
        </FormSection>

        <FormSection title="Address">
          <TextField
            label="Street address"
            value={values.address}
            onChange={set("address")}
            autoComplete="street-address"
            optional
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="City"
              value={values.city}
              onChange={set("city")}
              autoComplete="address-level2"
              optional
            />
            <TextField
              label="Country"
              value={values.country}
              onChange={set("country")}
              autoComplete="country-name"
              optional
            />
          </div>
        </FormSection>

        <FormSection title="Emergency contact">
          <TextField
            label="Contact name"
            value={values.emergencyContactName}
            onChange={set("emergencyContactName")}
            optional
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Contact phone"
              type="tel"
              value={values.emergencyContactPhone}
              onChange={set("emergencyContactPhone")}
              optional
            />
            <TextField
              label="Contact email"
              type="email"
              value={values.emergencyContactEmail}
              onChange={set("emergencyContactEmail")}
              error={errors.emergencyContactEmail}
              optional
            />
          </div>
        </FormSection>

        <FormSection title="Notes">
          <TextAreaField
            label="Internal notes"
            value={values.notes}
            onChange={set("notes")}
            placeholder="e.g. prefers morning appointments"
            optional
          />
        </FormSection>

        <FormError message={mutation.error?.message} />
      </form>
    </Modal>
  );
}
