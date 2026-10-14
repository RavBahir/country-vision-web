"use client";

import { useState, type FormEvent } from "react";
import { Check, Circle, ShieldCheck } from "lucide-react";
import { Badge, Button, Card } from "@/components/portal/UI";
import { PasswordInput } from "./Fields";

const RULES = [
  { id: "len", label: "At least 8 characters", test: (p: string) => p.length >= 8, required: true },
  { id: "case", label: "Upper and lower case letters", test: (p: string) => /[a-z]/.test(p) && /[A-Z]/.test(p), required: true },
  { id: "num", label: "A number", test: (p: string) => /\d/.test(p), required: true },
  { id: "sym", label: "A symbol (recommended)", test: (p: string) => /[^A-Za-z0-9]/.test(p), required: false },
];
const STRENGTH = ["Too weak", "Weak", "Fair", "Good", "Strong"];
const STRENGTH_COLOR = ["#E6D9C6", "#C2542D", "#D4A24C", "#8FB070", "#3B5A2C"];

function Strength({ password }: { password: string }) {
  const score = password ? RULES.filter((r) => r.test(password)).length : 0;
  return (
    <div aria-live="polite">
      <div className="flex gap-1.5" aria-hidden>
        {[1, 2, 3, 4].map((i) => <span key={i} className="h-1.5 flex-1 rounded-full transition-colors" style={{ backgroundColor: i <= score ? STRENGTH_COLOR[score] : "#E6D9C6" }} />)}
      </div>
      <p className="mt-2 text-xs text-[#1F1A15]/60">Strength: <b className="text-[#1F1A15]">{password ? STRENGTH[score] : "–"}</b></p>
      <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
        {RULES.map((r) => {
          const ok = r.test(password);
          return (
            <li key={r.id} className={`flex items-center gap-2 text-xs ${ok ? "text-[#3B5A2C]" : "text-[#1F1A15]/55"}`}>
              {ok ? <Check size={13} strokeWidth={3} /> : <Circle size={11} />} {r.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export interface SecurityProps {
  hasPassword: boolean;
  passwordChangedDaysAgo: number | null;
  googleLinked: boolean;
  googleEmail: string;
  onPasswordSaved: (signOutOthers: boolean) => void;
  onGoogleChange: (linked: boolean) => void;
}

export default function SecurityPanel({ hasPassword, passwordChangedDaysAgo, googleLinked, googleEmail, onPasswordSaved, onGoogleChange }: SecurityProps) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [signOutOthers, setSignOutOthers] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  const rulesOk = RULES.filter((r) => r.required).every((r) => r.test(next));
  const matches = next === confirm;
  const sameAsOld = hasPassword && next !== "" && next === current;
  const errors = {
    current: hasPassword && !current ? "Enter your current password." : undefined,
    next: !rulesOk ? "Your new password doesn't meet the requirements yet." : sameAsOld ? "Choose a password you haven't used here." : undefined,
    confirm: !matches ? "The passwords don't match." : undefined,
  };
  const valid = !errors.current && !errors.next && !errors.confirm && next !== "";

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (!valid) return;
    // Demo: call your API here (verify current password, hash and store the new one,
    // revoke other sessions when signOutOthers is true).
    onPasswordSaved(signOutOthers);
    setCurrent(""); setNext(""); setConfirm(""); setSubmitted(false);
  };

  return (
    <div className="grid items-start gap-6 xl:grid-cols-[1.4fr_1fr]">
      <Card className="p-6 sm:p-8">
        <h2 className="text-lg font-semibold tracking-tight">{hasPassword ? "Change password" : "Set a password"}</h2>
        <p className="mt-1 text-sm text-[#1F1A15]/55">
          {hasPassword
            ? passwordChangedDaysAgo !== null ? `Last changed ${passwordChangedDaysAgo} days ago.` : "Use a password you don't use anywhere else."
            : "You currently sign in with Google or a WhatsApp code. Add a password as another way in."}
        </p>

        <form onSubmit={submit} noValidate className="mt-6 grid gap-5">
          {hasPassword && (
            <PasswordInput label="Current password" autoComplete="current-password" value={current} onChange={setCurrent} error={submitted ? errors.current : undefined} />
          )}
          <PasswordInput label="New password" autoComplete="new-password" value={next} onChange={setNext} error={submitted ? errors.next : undefined} />
          <Strength password={next} />
          <PasswordInput label="Confirm new password" autoComplete="new-password" value={confirm} onChange={setConfirm} error={(submitted || confirm) ? errors.confirm : undefined} />

          {hasPassword && (
            <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-[#E6D9C6] bg-[#FBF6EE] p-4 text-sm">
              <input type="checkbox" checked={signOutOthers} onChange={(e) => setSignOutOthers(e.target.checked)} className="mt-0.5 h-5 w-5 accent-[#1F1A15]" />
              <span><b className="block font-medium">Sign me out on other devices</b><span className="text-xs text-[#1F1A15]/55">Recommended. You'll stay signed in here.</span></span>
            </label>
          )}

          <div className="flex justify-end">
            <Button type="submit" disabled={next === ""}>{hasPassword ? "Update password" : "Set password"}</Button>
          </div>
        </form>
      </Card>

      <div className="space-y-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold tracking-tight">Connected accounts</h2>
          <div className="mt-5 flex items-center gap-4 rounded-2xl border border-[#E6D9C6] bg-[#FBF6EE] p-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white text-base font-semibold" aria-hidden>G</span>
            <div className="min-w-0 flex-1">
              <p className="font-medium">Google</p>
              <p className="truncate text-xs text-[#1F1A15]/55">{googleLinked ? googleEmail : "Not connected"}</p>
            </div>
            {googleLinked ? <Badge tone="success">Connected</Badge> : <Badge>Off</Badge>}
          </div>
          {googleLinked ? (
            <>
              <Button variant="secondary" className="mt-4 w-full" disabled={!hasPassword} onClick={() => onGoogleChange(false)}>Disconnect Google</Button>
              {!hasPassword && <p className="mt-2 text-xs text-[#1F1A15]/55">Set a password first. Google is currently your only way to sign in.</p>}
            </>
          ) : (
            // Real app: start the Google OAuth flow and link the returned `sub` to this patient.
            <Button variant="secondary" className="mt-4 w-full" onClick={() => onGoogleChange(true)}>Connect Google</Button>
          )}
        </Card>

        <div className="rounded-3xl bg-[#12100D] p-6 text-white">
          <ShieldCheck size={20} className="text-[#C9A57B]" />
          <h2 className="mt-3 font-semibold">Keep your account safe</h2>
          <ul className="mt-3 grid gap-2.5 text-sm text-white/65">
            <li>Use a unique password you don't use anywhere else.</li>
            <li>We'll never ask for your password or codes on WhatsApp.</li>
            <li>See a device you don't recognise? Sign it out in Sessions.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}