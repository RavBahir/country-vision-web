/* ------------------------------------------------------------------ */
/* Sign in / create account card                                       */
/* ------------------------------------------------------------------ */

import { WHATSAPP_LINK } from "@/lib/constants";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Globe,
  Headset,
  Lock,
  LucideIcon,
  Mail,
  MessageCircle,
  Phone,
  Sparkles,
  User,
} from "lucide-react";
import { ACCOUNT_TYPE } from "./page";
import { allRoutes } from "@/routes/routes";
import { useLoginCustomer, useLoginUser } from "@/pages/auth/auth-api";
import {
  ChangeEventHandler,
  FormEvent,
  ReactNode,
  useId,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { useSelfCreateCustomer } from "@/pages/customers/common/customers-api";
import { showToast } from "@/components/CustomToast";

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
  onChange?: ChangeEventHandler<HTMLInputElement, HTMLInputElement> | undefined;
};

export function InputField({
  label,
  icon: Icon,
  type = "text",
  placeholder,
  autoComplete,
  required = true,
  trailing,
  onChange,
  name,
}: FieldProps) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium">
        {label}
      </label>
      <div className="flex h-12 items-center gap-3 rounded-2xl border border-[#1F1A15]/10 bg-[#F6EFE4] px-4 focus-within:border-[#8A6A4A] focus-within:bg-white">
        <Icon size={17} className="shrink-0 text-[#1F1A15]/45" aria-hidden />
        <input
          id={id}
          name={name}
          onChange={onChange}
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

function PasswordField({
  label = "Password",
  name = "password",
  autoComplete,
  onChange,
}: {
  label?: string;
  name?: string;
  autoComplete: string;
  onChange?: ChangeEventHandler<HTMLInputElement, HTMLInputElement> | undefined;
}) {
  const [show, setShow] = useState(false);
  return (
    <InputField
      label={label}
      name={name}
      icon={Lock}
      type={show ? "text" : "password"}
      placeholder="Enter your password"
      onChange={onChange}
      autoComplete={autoComplete}
      trailing={
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-pressed={show}
          className="flex shrink-0 items-center gap-1.5 text-sm text-[#1F1A15]/55 hover:text-[#1F1A15]"
        >
          {show ? <EyeOff size={15} /> : <Eye size={15} />}{" "}
          {show ? "Hide" : "Show"}
        </button>
      }
    />
  );
}

type Mode = "signin" | "signup";

function AuthCard() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [accountType, setAccountType] = useState<ACCOUNT_TYPE>("customer");
  const [remember, setRemember] = useState(true);
  const [status, setStatus] = useState<{
    type: "ok" | "error";
    text: string;
  } | null>(null);

  const loginCustomer = useLoginCustomer();
  const loginUser = useLoginUser();
  const createCustomer = useSelfCreateCustomer();

  const isSignIn = mode === "signin";
  const isPending =
    loginCustomer.isPending || loginUser.isPending || createCustomer.isPending;

  const switchMode = (m: Mode) => {
    setMode(m);
    setStatus(null);
  };

  
  const proceedToSignUp = ({
    email,
    onError,
    password,
    form,
  }: {
    form: FormData;
    email: string;
    password: string;
    onError: (error: Error) => void;
  }) => {
    createCustomer.mutate(
      {
        name: String(form.get("name") ?? "").trim(),
        email,
        phone1: String(form.get("phone") ?? "").trim(),
        password : password,
      },
      {
        onSuccess: () => {
          setStatus({
            type: "ok",
            text: "Account created. You can now sign in.",
          });
          showToast({
            title: "Account created",
            message: "Account created successfully. You can sign in now.",
            type: "success",
          });
          setMode("signin");
          setAccountType("customer");
           proceedToLogin({ email, password, onError });
        },
        onError,
      },
    );
    return;
  };

  const proceedToLogin = ({
    email,
    onError,
    password,
  }: {
    email: string;
    password: string;
    onError: (error: Error) => void;
  }) => {
    const login = accountType === "customer" ? loginCustomer : loginUser;
    login.mutate(
      { email, password },
      {
        onSuccess: () => {
          // Adjust these routes to your app
          showToast({
            title: "Login Successful",
            message: "You have succesfully logged in!",
            type: "success",
          });
          router.replace(
            accountType === "customer"
              ? allRoutes.PORTAL + allRoutes.DASHBOARD
              : allRoutes.PORTAL + allRoutes.DASHBOARD,
          );
        },
        onError,
      },
    );
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isPending) return;
    setStatus(null);

    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");

    const onError = (error: Error) =>
      setStatus({
        type: "error",
        text: error.message || "Something went wrong.",
      });

    if (!isSignIn) {
      proceedToSignUp({ email, password, onError, form });
    }

    proceedToLogin({ email, password, onError });
  };


  return (
    <section
      aria-labelledby="auth-title"
      className="rounded-[2rem] border border-[#E6D9C6] bg-white p-6 sm:p-9"
    >
      {/* mode tabs: unchanged from your version */}

      <h1
        id="auth-title"
        className="mt-4 text-4xl font-semibold tracking-tight"
      >
        {isSignIn ? "Welcome back" : "Create your account"}
      </h1>
      <p className="mt-1 max-w-lg text-sm leading-relaxed text-[#1F1A15]/60">
        {isSignIn
          ? "Sign in to book appointments and order spectacles with your prescription on file."
          : "Save your prescription, track orders, and book faster eye checkups."}
      </p>

      {/* customer / staff toggle, sign-in only */}
      {isSignIn && (
        <div
          role="radiogroup"
          aria-label="Account type"
          className="mt-5 grid grid-cols-2 rounded-full border border-[#E6D9C6] bg-[#F6EFE4] p-1 text-sm font-medium"
        >
          {(
            [
              ["customer", "I'm a patient"],
              ["user", "I'm staff"],
            ] as [ACCOUNT_TYPE, string][]
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={accountType === value}
              onClick={() => setAccountType(value)}
              className={`rounded-full py-2 transition-colors ${
                accountType === value
                  ? "bg-white shadow-sm"
                  : "text-[#1F1A15]/60 hover:text-[#1F1A15]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      <form className="mt-4 grid gap-5" onSubmit={onSubmit} noValidate={false}>
        {!isSignIn && (
          <InputField
            label="Full name"
            name="name"
            icon={User}
            placeholder="e.g. John Doe"
            autoComplete="name"
          />
        )}

        <InputField
          label="Email"
          name="email"
          type="email"
          icon={Mail}
          placeholder="e.g. joe@example.com"
          autoComplete={isSignIn ? "username" : "email"}
        />

        {!isSignIn && (
          <InputField
            label="Phone number"
            name="phone"
            type="tel"
            icon={Phone}
            placeholder="e.g. +233 24 000 0000"
            autoComplete="tel"
          />
        )}

        <PasswordField
          autoComplete={isSignIn ? "current-password" : "new-password"}
        />

        {isSignIn &&
          /* remember me + forgot password: unchanged */
          null}

        <button
          type="submit"
          disabled={isPending}
          className="flex h-12 items-center justify-center gap-2 rounded-full bg-[#1F1A15] text-[15px] font-medium text-white transition-colors hover:bg-[#3a3027] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending
            ? "Please wait…"
            : isSignIn
              ? "Sign in to my account"
              : "Create my account"}
          {!isPending && <ArrowRight size={17} />}
        </button>

        {status && (
          <p
            role={status.type === "error" ? "alert" : "status"}
            className={`rounded-xl px-4 py-3 text-sm ${
              status.type === "error"
                ? "bg-red-50 text-red-700"
                : "bg-[#F1E7D8]"
            }`}
          >
            {status.text}
          </p>
        )}
      </form>

      {/* alt methods */}
      <div className="my-6 flex items-center gap-4 text-xs tracking-wide text-[#1F1A15]/55 uppercase">
        <span className="h-px flex-1 bg-[#E6D9C6]" /> or continue with{" "}
        <span className="h-px flex-1 bg-[#E6D9C6]" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          className="flex h-12 items-center justify-center gap-2.5 rounded-full border border-[#E6D9C6] bg-[#FBF6EE] text-[15px] font-medium hover:bg-[#F1E7D8]"
        >
          <MessageCircle size={18} /> WhatsApp OTP
        </button>
        <button
          type="button"
          className="flex h-12 items-center justify-center gap-2.5 rounded-full border border-[#E6D9C6] bg-[#FBF6EE] text-[15px] font-medium hover:bg-[#F1E7D8]"
        >
          <Globe size={18} /> Google
        </button>
      </div>

      {/* nudge */}
      <div className="mt-6 flex items-start gap-4 rounded-2xl border border-[#E6D9C6] bg-[#FBF6EE] p-5">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#F1E7D8] text-[#1F1A15]">
          <Sparkles size={18} />
        </span>
        <p className="text-sm leading-relaxed text-[#1F1A15]/60">
          {isSignIn ? (
            <>
              <b className="font-semibold text-[#1F1A15]">New here?</b> Create a
              free account to save your prescription, track orders, and book
              faster checkups.{" "}
              <button
                type="button"
                onClick={() => switchMode("signup")}
                className="border-b border-[#8A6A4A]/50 font-medium text-[#1F1A15] hover:cursor-pointer"
              >
                Get started
              </button>
            </>
          ) : (
            <>
              <b className="font-semibold text-[#1F1A15]">
                Already have an account?
              </b>{" "}
              <button
                type="button"
                onClick={() => switchMode("signin")}
                className="border-b border-[#8A6A4A]/50 font-medium text-[#1F1A15] hover:cursor-pointer"
              >
                Sign in instead
              </button>
            </>
          )}
        </p>
      </div>

      <p className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-[#1F1A15]/55">
        <span className="flex items-center gap-2">
          <Lock size={14} /> 256-bit encrypted
        </span>
        <a
          href={WHATSAPP_LINK}
          className="flex items-center gap-2 hover:text-[#1F1A15]"
        >
          <Headset size={14} /> Need help? Chat with us
        </a>
      </p>
    </section>
  );
}

export default AuthCard;
