"use client";

import { COMPANY_NAME, COMPANY_PHONE, WHATSAPP_LINK } from "@/lib/constants";
import {
  ArrowLeft,
  ArrowRight,
  CalendarCheck,
  Glasses,
  MessageCircle,
  Package,
  Phone,
  type LucideIcon
} from "lucide-react";
import Link from "next/link";
import AuthCard from "./AuthCard";
import BrandPanel from "./BrandPanel";

/* ------------------------------------------------------------------ */
/* Content                                                             */
/* ------------------------------------------------------------------ */


export type ACCOUNT_TYPE = "user" | "customer";

const ONCE_IN: {
  icon: LucideIcon;
  title: string;
  sub: string;
  href: string;
}[] = [
  {
    icon: CalendarCheck,
    title: "Book appointments",
    sub: "Eye checkups that fit your week",
    href: "/#contact",
  },
  {
    icon: Glasses,
    title: "Order spectacles",
    sub: "Shop frames with Rx on file",
    href: "/#eyewear",
  },
  {
    icon: Package,
    title: "Track orders",
    sub: "From lab to your door",
    href: "/#contact",
  },
];

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#FAF5EE] text-[#1F1A15]">
      <div className="mx-auto max-w-7xl px-5 py-8">
        {/* top bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-[#1F1A15]/65">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-sm hover:text-[#1F1A15]"
          >
            <ArrowLeft size={17} /> Back to homepage
          </Link>
          <div className="flex items-center gap-5">
            <a
              href="tel:+2348001234567"
              className="flex  text-sm items-center gap-2 hover:text-[#1F1A15]"
            >
              <Phone size={15} /> {COMPANY_PHONE}
            </a>
            <a
              href={WHATSAPP_LINK}
              className="flex items-center gap-2  text-sm hover:text-[#1F1A15]"
            >
              <MessageCircle size={15} /> WhatsApp help
            </a>
          </div>
        </div>

        {/* main grid */}
        <main className="mt-4 grid gap-4 lg:grid-cols-2">
          <BrandPanel />
          <AuthCard />
        </main>

        {/* once you are in */}
        <section aria-labelledby="once-in" className="mt-24 text-center">
          <p className="mb-3 text-xs font-medium tracking-[0.3em] text-[#8A6A4A] uppercase">
            Once you are in
          </p>
          <h2
            id="once-in"
            className="text-3xl font-semibold tracking-tight sm:text-4xl"
          >
            One login for appointments and orders.
          </h2>
          <ul className="mt-10 grid gap-5 text-left md:grid-cols-3">
            {ONCE_IN.map((c) => (
              <li key={c.title}>
                <Link
                  href={c.href}
                  className="flex h-full items-start gap-5 rounded-3xl border border-[#E6D9C6] bg-white p-6 transition-shadow hover:shadow-md"
                >
                  <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-[#E6D9C6] bg-[#F6EFE4]">
                    <c.icon size={22} />
                  </span>
                  <span>
                    <b className="block text-lg font-semibold">{c.title}</b>
                    <span className="mt-1 block text-sm text-[#1F1A15]/55">
                      {c.sub}
                    </span>
                    <span className="mt-3 flex items-center gap-1.5 text-sm font-medium">
                      Open <ArrowRight size={14} />
                    </span>
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
            <h2 className="text-2xl font-semibold tracking-tight">
              Signed in? Reorder lenses in one tap.
            </h2>
            <p className="mt-1 text-[15px] text-white/60">
              Your last prescription (OD −1.50 · OS −1.25) is saved and ready at
              checkout.
            </p>
          </div>
          <Link
            href="/#eyewear"
            className="rounded-full bg-[#FAF5EE] px-7 py-3.5 text-[15px] font-medium text-[#1F1A15] hover:bg-white"
          >
            Start an order
          </Link>
        </section>

        <p className="mt-12 text-center text-sm text-[#1F1A15]/55">
          Protected by {COMPANY_NAME} ·{" "}
          <a href="#" className="hover:text-[#1F1A15]">
            Privacy Policy
          </a>{" "}
          ·{" "}
          <a href="#" className="hover:text-[#1F1A15]">
            Terms &amp; Conditions
          </a>
        </p>
      </div>
    </div>
  );
}
