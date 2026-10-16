
/* ------------------------------------------------------------------ */
/* Left brand panel                                                    */
/* ------------------------------------------------------------------ */

import { COMPANY_NAME } from "@/lib/constants";
import { CalendarCheck, Clock, FileText, LucideIcon, ShieldCheck, ShoppingBag } from "lucide-react";
import Link from "next/link";


const PERKS: { icon: LucideIcon; title: string; sub: string }[] = [
  {
    icon: CalendarCheck,
    title: "Book eye checkups in seconds",
    sub: "Pick a time, get instant confirmation",
  },
  {
    icon: ShoppingBag,
    title: "Order spectacles with your prescription",
    sub: "Frames + lenses, delivered to you",
  },
  {
    icon: FileText,
    title: "Prescriptions & receipts, always handy",
    sub: "Reorder lenses in one tap",
  },
];

function BrandPanel() {
  return (
    <aside className="relative flex min-h-140 flex-col overflow-hidden rounded-[2rem] bg-[#4A3320] text-white lg:min-h-0">
      {/* photo slot: add /public/images/portal-hero.jpg */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/assets/images/login-banner.png"
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />
      <div className="absolute inset-0 bg-linear-to-b from-black/30 via-black/10 to-black/80" />

      <div className="relative flex items-start justify-between p-4 sm:p-10 sm:pb-0">
        <Link href="/" className="flex items-center gap-2">
          <img src="/assets/images/logo.png" className="w-9 h-9" alt={COMPANY_NAME} />
          <span className="leading-none">
            <span className="block text-base font-semibold">{COMPANY_NAME}</span>
            <span className=" block text-xs tracking-[0.3em] text-white/70 uppercase">
              Vision Care
            </span>
          </span>
        </Link>
        <span className="rounded-full border border-white/30 bg-black/20 px-4 py-2 text-sm font-medium backdrop-blur">
          Patient Portal
        </span>
      </div>

      <div className="relative mt-auto p-8 pt-40 sm:p-14 sm:pt-56">
        <h2 className="max-w-xl text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
          Your eyes, your frames, one account.
        </h2>
        <ul className="mt-8 grid gap-3">
          {PERKS.map((p) => (
            <li
              key={p.title}
              className="flex items-center gap-4 rounded-2xl border border-white/15 bg-black/25 p-4 backdrop-blur-md"
            >
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#FAF5EE] text-[#1F1A15]">
                <p.icon size={19} />
              </span>
              <span className="leading-snug">
                <b className="block font-medium">{p.title}</b>
                <span className="text-sm text-white/65">{p.sub}</span>
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-6 flex flex-wrap gap-x-8 gap-y-2 border-t border-white/15 pt-5 text-sm text-white/85">
          <span className="flex items-center gap-2">
            <ShieldCheck size={15} /> Secure &amp; private
          </span>
          <span className="flex items-center gap-2">
            <Clock size={15} /> Support Mon–Sat
          </span>
        </p>
      </div>
    </aside>
  );
}

export default BrandPanel