import { WHATSAPP_LINK } from "@/lib/constants";
import { allRoutes } from "@/routes/routes";
import { CalendarCheck, Glasses, Headset, LucideIcon } from "lucide-react";

export const QUICK: { href: string; label: string; sub: string; icon: LucideIcon }[] = [
  { href: allRoutes.PORTAL + allRoutes.APPOINTMENTS, label: "Book a visit", sub: "Instant confirmation", icon: CalendarCheck },
  { href: allRoutes.PORTAL + allRoutes.CATALOG, label: "Order spectacles", sub: "Rx on file", icon: Glasses },
  { href: WHATSAPP_LINK, label: "Chat with us", sub: "Mon–Sat", icon: Headset },
];

export function greeting(): string {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

export function CheckupRing({ elapsed, total, left }: { elapsed: number; total: number; left: number }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const pct = Math.min(1, Math.max(0, elapsed / total));
  return (
    <div className="relative grid h-36 w-36 place-items-center">
      <svg viewBox="0 0 120 120" className="absolute inset-0 -rotate-90" aria-hidden>
        <circle cx="60" cy="60" r={r} fill="none" stroke="#F1E7D8" strokeWidth="10" />
        <circle cx="60" cy="60" r={r} fill="none" stroke="#8A6A4A" strokeWidth="10" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct)} />
      </svg>
      <div className="text-center">
        <p className="text-3xl font-semibold tabular-nums">{Math.max(left, 0)}</p>
        <p className="text-xs text-[#1F1A15]/55">days left</p>
      </div>
    </div>
  );
}