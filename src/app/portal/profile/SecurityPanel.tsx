// app/portal/profile/SecurityPanel.tsx
"use client";

import { Button, Card } from "@/components/portal/UI";
import { FormError } from "@/components/portal/FormFields";
import { useChangePassword } from "@/modules/profile/common/profile-api";
import { Check, Circle, ShieldCheck } from "lucide-react";
import { useState, type FormEvent } from "react";
import { PasswordInput } from "./Fields";

// The server requires 8 to 72 characters. The extra rules here are guidance.
const RULES = [
  { id: "len", label: "At least 8 characters", test: (p: string) => p.length >= 8 && p.length <= 72 },
  { id: "case", label: "Upper and lower case letters", test: (p: string) => /[a-z]/.test(p) && /[A-Z]/.test(p) },
  { id: "num", label: "A number", test: (p: string) => /\d/.test(p) },
];

export default function SecurityPanel({ onSaved }: { onSaved: (m: string) => void }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const change = useChangePassword();

  const rulesOk = RULES.every((r) => r.test(next));
  const errors = {
    current: !current ? "Enter your current password." : undefined,
    next: !rulesOk ? "Your new password doesn't meet the requirements yet."
      : next === current ? "Choose a password you haven't used here." : undefined,
    confirm: next !== confirm ? "The passwords don't match." : undefined,
  };
  const valid = !errors.current && !errors.next && !errors.confirm;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (!valid || change.isPending) return;
    change.mutate(
      { currentPassword: current, newPassword: next },
      {
        onSuccess: () => {
          setCurrent(""); setNext(""); setConfirm(""); setSubmitted(false);
          onSaved("Password updated.");
        },
      },
    );
  };

  return (
    <div className="grid items-start gap-6 xl:grid-cols-[1.4fr_1fr]">
      <Card className="p-6 sm:p-8">
        <h2 className="text-lg font-semibold tracking-tight">Change password</h2>
        <p className="mt-1 text-sm text-[#1F1A15]/55">Use a password you don&rsquo;t use anywhere else.</p>

        <form onSubmit={submit} noValidate className="mt-6 grid gap-5">
          <PasswordInput label="Current password" autoComplete="current-password" value={current}
            onChange={setCurrent} error={submitted ? errors.current : undefined} />
          <PasswordInput label="New password" autoComplete="new-password" value={next}
            onChange={setNext} error={submitted ? errors.next : undefined} />
          <ul className="grid gap-1.5 sm:grid-cols-2" aria-live="polite">
            {RULES.map((r) => {
              const ok = r.test(next);
              return (
                <li key={r.id} className={`flex items-center gap-2 text-xs ${ok ? "text-[#3B5A2C]" : "text-[#1F1A15]/55"}`}>
                  {ok ? <Check size={13} strokeWidth={3} /> : <Circle size={11} />} {r.label}
                </li>
              );
            })}
          </ul>
          <PasswordInput label="Confirm new password" autoComplete="new-password" value={confirm}
            onChange={setConfirm} error={submitted || confirm ? errors.confirm : undefined} />

          <FormError message={change.error?.message} />

          <div className="flex justify-end">
            <Button type="submit" disabled={!next || change.isPending}>
              {change.isPending ? "Updating…" : "Update password"}
            </Button>
          </div>
        </form>
      </Card>

      <div className="rounded-3xl bg-[#12100D] p-6 text-white">
        <ShieldCheck size={20} className="text-[#C9A57B]" />
        <h2 className="mt-3 font-semibold">Keep your account safe</h2>
        <ul className="mt-3 grid gap-2.5 text-sm text-white/65">
          <li>Use a unique password you don&rsquo;t use anywhere else.</li>
          <li>We&rsquo;ll never ask for your password or codes on WhatsApp.</li>
        </ul>
      </div>
    </div>
  );
}