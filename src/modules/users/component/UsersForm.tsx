// pages/users/common/UserForm.tsx
"use client";

import { Button, Modal } from "@/components/portal/UI";
import {
  FormError,
  FormSection,
  SelectField,
  TextField,
  type Option,
} from "@/components/portal/FormFields";
import { useState, type FormEvent } from "react";
import { IUser } from "../common/users";
import { useCreateUser, useUpdateUser } from "../common/users-api";
import { BASIC_STATUS } from "@/lib/enums";
import { showToast } from "@/components/CustomToast";
import CustomToggler from "@/components/CustomToggler";

type Props = {
  /** null = create, a user = edit */
  initial: IUser | null;
  /** Options come from your roles endpoint, or a hard-coded list for now */
  roles: Option[];
  branches?: Option[];
  onClose: () => void;
  onSaved?: (user: IUser, mode: "created" | "updated") => void;
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
  phone: string;
  roleId: string;
  branchId: string;
  status: string;
  password: string;
};

export default function UserForm({
  initial,
  roles,
  branches = [],
  onClose,
  onSaved,
}: Props) {
  const isEdit = Boolean(initial);
  const [isOptometrist, setIsOptometrist] = useState<boolean>(() => {
    if (isEdit && initial) return !!initial?.isOptometrist;
    return false;
  });

  // Adjust these reads if IUser names them differently.
  const [values, setValues] = useState<Values>({
    name: initial?.name ?? "",
    email: initial?.email ?? "",
    phone: (initial as { phone?: string } | null)?.phone ?? "",
    roleId:
      initial?.role?.id ??
      (initial as { roleId?: string } | null)?.roleId ??
      "",
    branchId: (initial as { branchId?: string } | null)?.branchId ?? "",
    status: initial?.status ?? "active",
    password: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof Values, string>>>(
    {},
  );

  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const mutation = isEdit ? updateUser : createUser;
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
    if (!values.roleId) e.roleId = "Choose a role.";
    if (!isEdit && values.password.length < 8)
      e.password = "Password must be at least 8 characters.";
    if (isEdit && values.password && values.password.length < 8)
      e.password = "Password must be at least 8 characters.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = (ev: FormEvent) => {
    ev.preventDefault();
    if (isPending || !validate()) return;

    const payload = {
      name: values.name.trim(),
      email: values.email.trim().toLowerCase(),
      phone: values.phone.trim() || undefined,
      roleId: values.roleId,
      branchId: values.branchId || undefined,
      status: isEdit ? (values.status as BASIC_STATUS) : BASIC_STATUS.Active,
      isOptometrist: isOptometrist,
      // Never send an empty password when editing
      ...(values.password ? { password: values.password } : {}),
    };

    if (initial) {
      updateUser.mutate(
        { id: initial.id, data: payload },
        { onSuccess: (u) => onSaved?.(u, "updated") },
      );
      showToast({
        title: "User updated",
        message: "User account has been updated succesfully!",
        type: "success",
      });
    } else {
      createUser.mutate(payload, {
        onSuccess: (u) => onSaved?.(u, "created"),
      });
      showToast({
        title: "User created",
        message: "User account has been created succesfully!",
        type: "success",
      });
    }
  };

  return (
    <Modal
      open
      onClose={isPending ? () => {} : onClose}
      title={isEdit ? "Edit user" : "Add new user"}
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" form="user-form" disabled={isPending}>
            {isPending ? "Saving…" : isEdit ? "Save changes" : "Create user"}
          </Button>
        </div>
      }
    >
      <form id="user-form" onSubmit={submit} className="grid gap-6" noValidate>
        <FormSection title="Account">
          <TextField
            label="Full name"
            value={values.name}
            onChange={set("name")}
            error={errors.name}
            placeholder="e.g. Jane Mensah"
            autoComplete="name"
            required
          />
          <TextField
            label="Email"
            type="email"
            value={values.email}
            onChange={set("email")}
            error={errors.email}
            placeholder="e.g. jane@countryvision.com"
            autoComplete="off"
            required
          />
          <TextField
            label="Phone"
            type="tel"
            value={values.phone}
            onChange={set("phone")}
            placeholder="e.g. +233 24 000 0000"
            autoComplete="off"
            optional
          />
          <TextField
            label={isEdit ? "New password" : "Password"}
            type="password"
            value={values.password}
            onChange={set("password")}
            error={errors.password}
            hint={
              isEdit
                ? "Leave blank to keep the current password."
                : "At least 8 characters."
            }
            autoComplete="new-password"
            required={!isEdit}
          />
        </FormSection>

        <FormSection title="Access">
          <CustomToggler 
          setState={setIsOptometrist}
          state={isOptometrist}
          title="Is Optometrist?"
          description="Turn this on if user is an optometrist"
          />
          <SelectField
            label="Role"
            value={values.roleId}
            onChange={set("roleId")}
            options={roles}
            placeholder="Select a role"
            error={errors.roleId}
            required
          />
          {branches.length > 0 && (
            <SelectField
              label="Branch"
              value={values.branchId}
              onChange={set("branchId")}
              options={branches}
              placeholder="No specific branch"
              optional
            />
          )}
          <SelectField
            label="Status"
            value={values.status}
            onChange={set("status")}
            options={STATUS_OPTIONS}
          />
        </FormSection>

        <FormError message={mutation.error?.message} />
      </form>
    </Modal>
  );
}
