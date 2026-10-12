"use client";

import Link from "next/link";
import { useId, useState, type FormEvent, type ReactNode } from "react";
import {
  ArrowLeft, ArrowRight, CalendarCheck, Check, Clock, Eye, EyeOff, FileText, Glasses,
  Headset, Lock, MessageCircle, Package, Phone, ShieldCheck, ShoppingBag, Sparkles,
  User, Globe, Mail,
  type LucideIcon,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Content                                                             */
/* ------------------------------------------------------------------ */

const BRAND = "Country Vision";
export const PHONE = "+233 24 264 3330";
export const WHATSAPP_PHONE = "+233242643330";
export const EMAIL = "info@countryvision.com";

type Mode = "signin" | "signup";

const PERKS: { icon: LucideIcon; title: string; sub: string }[] = [
  { icon: CalendarCheck, title: "Book eye checkups in seconds", sub: "Pick a time, get instant confirmation" },
  { icon: ShoppingBag, title: "Order spectacles with your prescription", sub: "Frames + lenses, delivered to you" },
  { icon: FileText, title: "Prescriptions & receipts, always handy", sub: "Reorder lenses in one tap" },
];

const ONCE_IN: { icon: LucideIcon; title: string; sub: string; href: string }[] = [
  { icon: CalendarCheck, title: "Book appointments", sub: "Eye checkups that fit your week", href: "/#contact" },
  { icon: Glasses, title: "Order spectacles", sub: "Shop frames with Rx on file", href: "/#eyewear" },
  { icon: Package, title: "Track orders", sub: "From lab to your door", href: "/#contact" },
];

/* ------------------------------------------------------------------ */
/* Small building blocks                                               */
/* ------------------------------------------------------------------ */

type FieldProps = {
  label: string;
  icon: LucideIcon;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  trailing?: ReactNode;
  name: string;
};

function Field({ label, icon: Icon, type = "text", placeholder, autoComplete, required = true, trailing, name }: FieldProps) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium">{label}</label>
      <div className="flex h-12 items-center gap-3 rounded-2xl border border-[#1F1A15]/10 bg-[#F6EFE4] px-4 focus-within:border-[#8A6A4A] focus-within:bg-white">
        <Icon size={17} className="shrink-0 text-[#1F1A15]/45" aria-hidden />
        <input
          id={id}
          name={name}
          type={type}
          required={required}
          autoComplete={autoComplete}
          placeholder={placeholder}
          className="h-full w-full bg-transparent text-[15px] outline-none placeholder:text-[#1F1A15]/40"
        />
        {trailing}
      </div>
    </div>
  );
}

function PasswordField({ label = "Password", name = "password", autoComplete }: { label?: string; name?: string; autoComplete: string }) {
  const [show, setShow] = useState(false);
  return (
    <Field
      label={label}
      name={name}
      icon={Lock}
      type={show ? "text" : "password"}
      placeholder="Enter your password"
      autoComplete={autoComplete}
      trailing={
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-pressed={show}
          className="flex shrink-0 items-center gap-1.5 text-sm text-[#1F1A15]/55 hover:text-[#1F1A15]"
        >
          {show ? <EyeOff size={15} /> : <Eye size={15} />} {show ? "Hide" : "Show"}
        </button>
      }
    />
  );
}

/* ------------------------------------------------------------------ */
/* Sign in / create account card                                       */
/* ------------------------------------------------------------------ */

function AuthCard() {
  const [mode, setMode] = useState<Mode>("signin");
  const [remember, setRemember] = useState(true);
  const [status, setStatus] = useState<string | null>(null);
  const isSignIn = mode === "signin";

  const switchMode = (m: Mode) => { setMode(m); setStatus(null); };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: replace with your auth call (NextAuth, Supabase, custom API...)
    setStatus(isSignIn ? "Signing you in…" : "Account created. Check your email to verify it.");
  };

  return (
    <section aria-labelledby="auth-title" className="rounded-[2rem] border border-[#E6D9C6] bg-white p-6 sm:p-9">
      {/* tabs */}
      <div role="tablist" aria-label="Sign in or create account" className="inline-flex rounded-full border border-[#E6D9C6] bg-[#F1E7D8] p-1">
        {([["signin", "Sign in"], ["signup", "Create account"]] as [Mode, string][]).map(([m, label]) => (
          <button
            key={m}
            role="tab"
            aria-selected={mode === m}
            onClick={() => switchMode(m)}
            className={`rounded-full hover:cursor-pointer px-5 py-2.5 text-sm font-medium transition-colors sm:px-7 ${
              mode === m ? "bg-[#1F1A15] text-white" : "text-[#1F1A15]/70 hover:text-[#1F1A15]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <h1 id="auth-title" className="mt-4 text-4xl font-semibold tracking-tight">
        {isSignIn ? "Welcome back" : "Create your account"}
      </h1>
      <p className="mt-1 max-w-lg text-sm leading-relaxed text-[#1F1A15]/60">
        {isSignIn
          ? "Sign in to book appointments and order spectacles with your prescription on file."
          : "Save your prescription, track orders, and book faster eye checkups."}
      </p>

      <form onSubmit={onSubmit} className="mt-4 grid gap-5">
        {!isSignIn && <Field label="Full name" name="name" icon={User} placeholder="e.g. Amara Okafor" autoComplete="name" />}
        {isSignIn ? (
          <Field label="Email or phone number" name="identifier" icon={User} placeholder="e.g. amara@example.com" autoComplete="username" />
        ) : (
          <>
            <Field label="Email" name="email" type="email" icon={Mail} placeholder="e.g. amara@example.com" autoComplete="email" />
            <Field label="Phone number" name="phone" type="tel" icon={Phone} placeholder="e.g. +234 800 000 0000" autoComplete="tel" />
          </>
        )}
        <PasswordField autoComplete={isSignIn ? "current-password" : "new-password"} />

        {isSignIn && (
          <div className="flex items-center justify-between gap-3 text-sm">
            <label className="flex cursor-pointer items-center gap-3">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="peer sr-only" />
              <span className="grid h-5 w-5 place-items-center rounded-sm border border-[#1F1A15]/30 text-white peer-checked:border-[#1F1A15] peer-checked:bg-[#1F1A15] peer-focus-visible:outline peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#8A6A4A]">
                {remember && <Check size={14} strokeWidth={3} />}
              </span>
              Remember me
            </label>
            <Link href="/forgot-password" className="border-b border-[#8A6A4A]/50 font-medium">Forgot password?</Link>
          </div>
        )}

        <button type="submit" className=" flex h-12 items-center justify-center gap-2 rounded-full bg-[#1F1A15] text-[15px] font-medium text-white transition-colors hover:bg-[#3a3027]">
          {isSignIn ? "Sign in to my account" : "Create my account"} <ArrowRight size={17} />
        </button>
        {status && <p role="status" className="rounded-xl bg-[#F1E7D8] px-4 py-3 text-sm">{status}</p>}
      </form>

      {/* alt methods */}
      <div className="my-6 flex items-center gap-4 text-xs tracking-wide text-[#1F1A15]/55 uppercase">
        <span className="h-px flex-1 bg-[#E6D9C6]" /> or continue with <span className="h-px flex-1 bg-[#E6D9C6]" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <button type="button" className="flex h-12 items-center justify-center gap-2.5 rounded-full border border-[#E6D9C6] bg-[#FBF6EE] text-[15px] font-medium hover:bg-[#F1E7D8]">
          <MessageCircle size={18} /> WhatsApp OTP
        </button>
        <button type="button" className="flex h-12 items-center justify-center gap-2.5 rounded-full border border-[#E6D9C6] bg-[#FBF6EE] text-[15px] font-medium hover:bg-[#F1E7D8]">
          <Globe size={18} /> Google
        </button>
      </div>

      {/* nudge */}
      <div className="mt-6 flex items-start gap-4 rounded-2xl border border-[#E6D9C6] bg-[#FBF6EE] p-5">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#F1E7D8] text-[#1F1A15]"><Sparkles size={18} /></span>
        <p className="text-sm leading-relaxed text-[#1F1A15]/60">
          {isSignIn ? (
            <>
              <b className="font-semibold text-[#1F1A15]">New here?</b> Create a free account to save your prescription, track orders, and book faster checkups.{" "}
              <button type="button" onClick={() => switchMode("signup")} className="border-b border-[#8A6A4A]/50 font-medium text-[#1F1A15] hover:cursor-pointer">Get started</button>
            </>
          ) : (
            <>
              <b className="font-semibold text-[#1F1A15]">Already have an account?</b>{" "}
              <button type="button" onClick={() => switchMode("signin")} className="border-b border-[#8A6A4A]/50 font-medium text-[#1F1A15] hover:cursor-pointer">Sign in instead</button>
            </>
          )}
        </p>
      </div>

      <p className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-[#1F1A15]/55">
        <span className="flex items-center gap-2"><Lock size={14} /> 256-bit encrypted</span>
        <a href={`https://wa.me/${WHATSAPP_PHONE}`} className="flex items-center gap-2 hover:text-[#1F1A15]"><Headset size={14} /> Need help? Chat with us</a>
      </p>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Left brand panel                                                    */
/* ------------------------------------------------------------------ */

function BrandPanel() {
  return (
    <aside className="relative flex min-h-140 flex-col overflow-hidden rounded-[2rem] bg-[#4A3320] text-white lg:min-h-0">
      {/* photo slot: add /public/images/portal-hero.jpg */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/assets/images/login-banner.png" alt="" className="absolute inset-0 h-full w-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />
      <div className="absolute inset-0 bg-linear-to-b from-black/30 via-black/10 to-black/80" />

      <div className="relative flex items-start justify-between p-4 sm:p-10 sm:pb-0">
        <Link href="/" className="flex items-center gap-2">
         <img src="/assets/images/logo.png" className="w-9 h-9" alt={BRAND} />
          <span className="leading-none">
            <span className="block text-base font-semibold">{BRAND}</span>
            <span className=" block text-xs tracking-[0.3em] text-white/70 uppercase">Vision Care</span>
          </span>
        </Link>
        <span className="rounded-full border border-white/30 bg-black/20 px-4 py-2 text-sm font-medium backdrop-blur">Patient Portal</span>
      </div>

      <div className="relative mt-auto p-8 pt-40 sm:p-14 sm:pt-56">
        <h2 className="max-w-xl text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">Your eyes, your frames, one account.</h2>
        <ul className="mt-8 grid gap-3">
          {PERKS.map((p) => (
            <li key={p.title} className="flex items-center gap-4 rounded-2xl border border-white/15 bg-black/25 p-4 backdrop-blur-md">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#FAF5EE] text-[#1F1A15]"><p.icon size={19} /></span>
              <span className="leading-snug">
                <b className="block font-medium">{p.title}</b>
                <span className="text-sm text-white/65">{p.sub}</span>
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-6 flex flex-wrap gap-x-8 gap-y-2 border-t border-white/15 pt-5 text-sm text-white/85">
          <span className="flex items-center gap-2"><ShieldCheck size={15} /> Secure &amp; private</span>
          <span className="flex items-center gap-2"><Clock size={15} /> Support Mon–Sat</span>
        </p>
      </div>
    </aside>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#FAF5EE] text-[#1F1A15]">
      <div className="mx-auto max-w-7xl px-5 py-8">
        {/* top bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-[#1F1A15]/65">
          <Link href="/" className="flex items-center gap-2.5 text-sm hover:text-[#1F1A15]"><ArrowLeft size={17} /> Back to homepage</Link>
          <div className="flex items-center gap-5">
            <a href="tel:+2348001234567" className="flex  text-sm items-center gap-2 hover:text-[#1F1A15]"><Phone size={15} /> {PHONE}</a>
            <a href={`https://wa.me/${WHATSAPP_PHONE}`} className="flex items-center gap-2  text-sm hover:text-[#1F1A15]"><MessageCircle size={15} /> WhatsApp help</a>
          </div>
        </div>

        {/* main grid */}
        <main className="mt-4 grid gap-4 lg:grid-cols-2">
          <BrandPanel />
          <AuthCard />
        </main>

        {/* once you are in */}
        <section aria-labelledby="once-in" className="mt-24 text-center">
          <p className="mb-3 text-xs font-medium tracking-[0.3em] text-[#8A6A4A] uppercase">Once you are in</p>
          <h2 id="once-in" className="text-3xl font-semibold tracking-tight sm:text-4xl">One login for appointments and orders.</h2>
          <ul className="mt-10 grid gap-5 text-left md:grid-cols-3">
            {ONCE_IN.map((c) => (
              <li key={c.title}>
                <Link href={c.href} className="flex h-full items-start gap-5 rounded-3xl border border-[#E6D9C6] bg-white p-6 transition-shadow hover:shadow-md">
                  <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-[#E6D9C6] bg-[#F6EFE4]"><c.icon size={22} /></span>
                  <span>
                    <b className="block text-lg font-semibold">{c.title}</b>
                    <span className="mt-1 block text-sm text-[#1F1A15]/55">{c.sub}</span>
                    <span className="mt-3 flex items-center gap-1.5 text-sm font-medium">Open <ArrowRight size={14} /></span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* reorder banner */}
        <section className="mt-6 flex flex-col items-start gap-6 rounded-[2rem] bg-[#12100D] p-8 text-white sm:flex-row sm:items-center sm:px-12">
          <div className="flex shrink-0 overflow-hidden rounded-xl" aria-hidden>
            <div className="h-20 w-32 bg-linear-to-br from-[#D9B58A] to-[#8C5E3A]" />
            <div className="-ml-1 h-20 w-32 rounded-l-xl bg-linear-to-br from-[#F0DFC8] to-[#CDA982]" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-semibold tracking-tight">Signed in? Reorder lenses in one tap.</h2>
            <p className="mt-1 text-[15px] text-white/60">Your last prescription (OD −1.50 · OS −1.25) is saved and ready at checkout.</p>
          </div>
          <Link href="/#eyewear" className="rounded-full bg-[#FAF5EE] px-7 py-3.5 text-[15px] font-medium text-[#1F1A15] hover:bg-white">Start an order</Link>
        </section>

        <p className="mt-12 text-center text-sm text-[#1F1A15]/55">
          Protected by {BRAND} · <a href="#" className="hover:text-[#1F1A15]">Privacy Policy</a> · <a href="#" className="hover:text-[#1F1A15]">Terms &amp; Conditions</a>
        </p>
      </div>
    </div>
  );
}
