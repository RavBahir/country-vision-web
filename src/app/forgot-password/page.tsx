// app/forgot-password/page.tsx
"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, KeyRound, Lock, Mail } from "lucide-react";
import { InputField, PasswordField } from "../login/AuthCard"; // export PasswordField from AuthCard
import { showToast } from "@/components/CustomToast";
import { allRoutes } from "@/routes/routes";
import {
  useResetCustomerOTP, useResetUserOTP,
  useVerifyResetCustomerOTP, useVerifyResetUserOTP,
} from "@/modules/auth/auth-api";

type Kind = "customer" | "user";
type Step = "email" | "reset" | "done";

const RESEND_SECONDS = 60;
const RULES = [
  { id: "len", label: "At least 8 characters", test: (p: string) => p.length >= 8 && p.length <= 72 },
  { id: "case", label: "Upper and lower case letters", test: (p: string) => /[a-z]/.test(p) && /[A-Z]/.test(p) },
  { id: "num", label: "A number", test: (p: string) => /\d/.test(p) },
];

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [kind, setKind] = useState<Kind>("customer");
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  const sendCustomer = useResetCustomerOTP();
  const sendUser = useResetUserOTP();
  const verifyCustomer = useVerifyResetCustomerOTP();
  const verifyUser = useVerifyResetUserOTP();

  const send = kind === "customer" ? sendCustomer : sendUser;
  const verify = kind === "customer" ? verifyCustomer : verifyUser;
  const busy = send.isPending || verify.isPending;

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const requestCode = (e?: FormEvent) => {
    e?.preventDefault();
    if (busy) return;
    setError(null);
    const clean = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) return setError("Enter a valid email address.");

    send.mutate({ email: clean }, {
      onSuccess: () => {
        setEmail(clean);
        setCooldown(RESEND_SECONDS);
        setStep("reset");
        showToast({ title: "Check your email", message: "If that email is registered, a code is on its way.", type: "success" });
      },
      onError: (err) => setError(err.message || "Something went wrong."),
    });
  };

  const rulesOk = RULES.every((r) => r.test(password));

  const resetPassword = (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setError(null);
    if (!/^\d{6}$/.test(otp.trim())) return setError("Enter the 6-digit code from your email.");
    if (!rulesOk) return setError("Your new password doesn't meet the requirements yet.");
    if (password !== confirm) return setError("The passwords don't match.");

    verify.mutate({ email, otp: otp.trim(), newPassword: password }, {
      onSuccess: () => {
        setPassword(""); setConfirm(""); setOtp("");
        setStep("done");
        showToast({ title: "Password updated", message: "You can now sign in.", type: "success" });
        setTimeout(() => router.replace(allRoutes.LOGIN ?? "/login"), 2500);
      },
      onError: (err) => setError(err.message || "Something went wrong."),
    });
  };

  return (
    <div className="grid min-h-screen place-items-center bg-[#FAF5EE] px-5 py-10 text-[#1F1A15]">
      <div className="w-full max-w-md">
        <Link href="/login" className="mb-5 inline-flex items-center gap-2 text-sm text-[#1F1A15]/65 hover:text-[#1F1A15]">
          <ArrowLeft size={16} /> Back to sign in
        </Link>

        <section className="rounded-[2rem] border border-[#E6D9C6] bg-white p-6 sm:p-9" aria-labelledby="fp-title">
          {step === "done" ? (
            <div className="text-center" role="status">
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#E4EBDD] text-[#3B5A2C]"><Check size={26} strokeWidth={3} /></span>
              <h1 id="fp-title" className="mt-5 text-2xl font-semibold tracking-tight">Password updated</h1>
              <p className="mt-2 text-sm text-[#1F1A15]/60">Taking you to sign in…</p>
              <Link href="/login" className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-[#1F1A15] px-8 text-[15px] font-medium text-white hover:bg-[#3a3027]">Sign in now</Link>
            </div>
          ) : (
            <>
              <h1 id="fp-title" className="text-3xl font-semibold tracking-tight">
                {step === "email" ? "Reset your password" : "Enter your code"}
              </h1>
              <p className="mt-1 text-sm leading-relaxed text-[#1F1A15]/60">
                {step === "email"
                  ? "Enter the email on your account and we'll send you a 6-digit code."
                  : <>We sent a code to <b className="text-[#1F1A15]">{email}</b>. It expires in 15 minutes.</>}
              </p>

              {step === "email" && (
                <div role="radiogroup" aria-label="Account type" className="mt-5 grid grid-cols-2 rounded-full border border-[#E6D9C6] bg-[#F6EFE4] p-1 text-sm font-medium">
                  {([["customer", "I'm a patient"], ["user", "I'm staff"]] as [Kind, string][]).map(([v, label]) => (
                    <button key={v} type="button" role="radio" aria-checked={kind === v} onClick={() => setKind(v)}
                      className={`rounded-full py-2 transition-colors ${kind === v ? "bg-white shadow-sm" : "text-[#1F1A15]/60 hover:text-[#1F1A15]"}`}>
                      {label}
                    </button>
                  ))}
                </div>
              )}

              {step === "email" ? (
                <form onSubmit={requestCode} className="mt-5 grid gap-5" noValidate>
                  <InputField label="Email" name="email" type="email" icon={Mail} placeholder="e.g. joe@example.com"
                    autoComplete="username" onChange={(e) => setEmail(e.target.value)} />
                  {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
                  <button type="submit" disabled={busy}
                    className="flex h-12 items-center justify-center gap-2 rounded-full bg-[#1F1A15] text-[15px] font-medium text-white transition-colors hover:bg-[#3a3027] disabled:cursor-not-allowed disabled:opacity-60">
                    {busy ? "Sending…" : <>Send code <ArrowRight size={17} /></>}
                  </button>
                </form>
              ) : (
                <form onSubmit={resetPassword} className="mt-5 grid gap-5" noValidate>
                  <InputField label="6-digit code" name="otp" icon={KeyRound} placeholder="123456"
                    autoComplete="one-time-code" onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} />
                  <PasswordField label="New password" name="newPassword" autoComplete="new-password" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} />
                  <ul className="-mt-2 grid gap-1.5" aria-live="polite">
                    {RULES.map((r) => {
                      const ok = r.test(password);
                      return (
                        <li key={r.id} className={`flex items-center gap-2 text-xs ${ok ? "text-[#3B5A2C]" : "text-[#1F1A15]/55"}`}>
                          {ok ? <Check size={13} strokeWidth={3} /> : <Lock size={11} />} {r.label}
                        </li>
                      );
                    })}
                  </ul>
                  <PasswordField label="Confirm new password" name="confirm" autoComplete="new-password" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirm(e.target.value)} />
                  {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
                  <button type="submit" disabled={busy}
                    className="flex h-12 items-center justify-center gap-2 rounded-full bg-[#1F1A15] text-[15px] font-medium text-white transition-colors hover:bg-[#3a3027] disabled:cursor-not-allowed disabled:opacity-60">
                    {busy ? "Updating…" : "Update password"}
                  </button>
                  <div className="flex items-center justify-between text-sm text-[#1F1A15]/60">
                    <button type="button" onClick={() => { setStep("email"); setError(null); }} className="hover:text-[#1F1A15]">Use a different email</button>
                    <button type="button" disabled={cooldown > 0 || busy} onClick={() => requestCode()}
                      className="border-b border-[#8A6A4A]/50 font-medium text-[#1F1A15] disabled:cursor-not-allowed disabled:border-transparent disabled:text-[#1F1A15]/40">
                      {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}