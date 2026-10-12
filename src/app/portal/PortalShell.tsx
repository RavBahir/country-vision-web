"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Bell, CalendarCheck, CalendarDays, Eye, Glasses, Headset, LayoutDashboard, LogOut, Menu, Receipt, X,
  type LucideIcon,
} from "lucide-react";
import { PATIENT } from "@/lib/portal-data";
import { TODAY } from "@/lib/format";
import { allRoutes } from "@/routes/routes";
import { WHATSAPP_PHONE } from "../login/page";

const NAV: { href: string; label: string; icon: LucideIcon }[] = [
  { href: allRoutes.DASHBOARD, label: "Dashboard", icon: LayoutDashboard },
  { href: allRoutes.APPOINTMENTS, label: "Appointments", icon: CalendarCheck },
  { href: allRoutes.CHECKUPS, label: "Checkups", icon: Eye },
  { href: allRoutes.CATALOG, label: "Catalog", icon: Glasses },
  { href: allRoutes.TRANSACTIONS, label: "Transactions", icon: Receipt },
  { href: allRoutes.CALENDAR, label: "Calendar", icon: CalendarDays },
];

const NOTIFICATIONS = [
  { id: 1, title: "Appointment confirmed", text: "Eye checkup · Fri 16 Oct, 9:30 AM", href: allRoutes.APPOINTMENTS },
  { id: 2, title: "Your order is in the lab", text: "ORD-1042 · estimated ready 19 Oct", href: allRoutes.DASHBOARD },
  { id: 3, title: "Payment pending", text: "Blue-light lenses deposit", href: allRoutes.TRANSACTIONS },
];

function Brand() {
  return (
    <Link href={allRoutes.PORTAL+allRoutes.DASHBOARD} className="flex items-center gap-3">
       <img src="/assets/images/logo.png" className="w-8 h-8" alt="" />
      <span className="leading-none">
        <span className="block text-sm font-semibold">Country Vision</span>
        <span className="mt-0.5 block text-[9px] tracking-[0.25em] text-[#1F1A15]/55 uppercase">Client Portal</span>
      </span>
    </Link>
  );
}

function NavList({ pathname }: { pathname: string }) {
  return (
    <nav aria-label="Portal sections">
      <ul className="grid gap-1">
        {NAV.map((n) => {
          const active = pathname === allRoutes.PORTAL + (n.href || pathname.startsWith(`${allRoutes.PORTAL + n.href}/`));
          return (
            <li key={n.href}>
              <Link
                href={allRoutes.PORTAL + n.href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 rounded-full px-4 py-3 text-sm font-medium transition-colors ${
                  active ? "bg-[#1F1A15] text-white" : "text-[#1F1A15]/70 hover:bg-[#F1E7D8] hover:text-[#1F1A15]"
                }`}
              >
                <n.icon size={17} /> {n.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function SidebarFooter() {
  return (
    <div className="mt-auto grid gap-3">
      <div className="rounded-2xl bg-[#181410] p-4 text-white">
        <Headset size={18} className="text-[#C9A57B]" />
        <p className="mt-3 text-sm font-medium">Need help?</p>
        <p className="mt-1 text-xs text-white/60">Chat with our team Mon–Sat.</p>
        <a href={`https://wa.me/${WHATSAPP_PHONE}`} className="mt-3 inline-block rounded-full bg-[#FAF5EE] px-4 py-2 text-xs font-medium text-[#1F1A15]">WhatsApp us</a>
      </div>
      <Link href={allRoutes.LOGIN} className="flex items-center gap-3 rounded-full px-4 py-3 text-sm text-[#1F1A15]/65 hover:bg-[#F1E7D8] hover:text-[#1F1A15]">
        <LogOut size={17} /> Sign out
      </Link>
    </div>
  );
}

export default function PortalShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [drawer, setDrawer] = useState(false);
  const [bell, setBell] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

  // close menus on navigation
  useEffect(() => { setDrawer(false); setBell(false); }, [pathname]);

  // close the notification popover on outside click / Escape; lock scroll with drawer
  useEffect(() => {
    const onDown = (e: MouseEvent) => { if (bellRef.current && !bellRef.current.contains(e.target as Node)) setBell(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setBell(false); setDrawer(false); } };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, []);

  useEffect(() => {
    document.body.style.overflow = drawer ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawer]);

  const initials = PATIENT.name.split(" ").map((p) => p[0]).join("");
  const today = TODAY.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="min-h-screen bg-[#FAF5EE] text-[#1F1A15]">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-90 focus:rounded-full focus:bg-white focus:px-4 focus:py-2">Skip to content</a>

      <div className="mx-auto flex gap-6 p-4 lg:p-6">
        {/* desktop sidebar */}
        <aside className="sticky top-6 hidden h-[calc(100vh-3rem)] w-64 shrink-0 flex-col gap-8 rounded-[2rem] border border-[#E6D9C6] bg-white p-5 lg:flex">
          <Brand />
          <NavList pathname={pathname} />
          <SidebarFooter />
        </aside>

        <div className="min-w-0 flex-1">
          {/* top bar */}
          <header className="flex items-center sticky top-6 justify-between gap-3 rounded-full border border-[#E6D9C6] bg-white py-2 pr-2 pl-3 sm:pl-5 z-70 ">
            <div className="flex items-center gap-3">
              <button onClick={() => setDrawer(true)} aria-label="Open menu" className="grid h-10 w-10 place-items-center rounded-full border border-[#E6D9C6] lg:hidden"><Menu size={18} /></button>
              <p className="hidden text-sm text-[#1F1A15]/60 sm:block">{today}</p>
              <span className="rounded-full border border-[#E6D9C6] bg-[#F6EFE4] px-3 py-1 text-xs font-medium lg:ml-2">Client Portal</span>
            </div>

            <div className="flex items-center gap-2">
              <div ref={bellRef} className="relative">
                <button
                  onClick={() => setBell((b) => !b)}
                  aria-expanded={bell}
                  aria-label="Notifications, 3 unread"
                  className="relative grid h-10 w-10 place-items-center rounded-full border border-[#E6D9C6] hover:bg-[#F1E7D8]"
                >
                  <Bell size={17} />
                  <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-[#C2542D]" />
                </button>
                {bell && (
                  <div className="absolute right-0 z-40 mt-3 w-80 max-w-[calc(100vw-2rem)] rounded-3xl border border-[#E6D9C6] bg-white p-2 shadow-xl">
                    <p className="px-4 pt-3 pb-2 text-xs font-medium tracking-[0.18em] text-[#8A6A4A] uppercase">Notifications</p>
                    <ul>
                      {NOTIFICATIONS.map((n) => (
                        <li key={n.id}>
                          <Link href={n.href} className="block rounded-2xl px-4 py-3 hover:bg-[#F6EFE4]">
                            <b className="block text-sm font-medium">{n.title}</b>
                            <span className="text-xs text-[#1F1A15]/55">{n.text}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3 rounded-full bg-[#F6EFE4] py-1 pr-4 pl-1">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-[#1F1A15] text-xs font-semibold text-white">{initials}</span>
                <span className="hidden text-sm leading-tight sm:block"><b className="block font-medium">{PATIENT.name}</b><span className="text-[10px] text-[#1F1A15]/50">ID {PATIENT.id}</span></span>
              </div>
            </div>
          </header>

          <main id="main" className="mt-6 pb-10">{children}</main>
        </div>
      </div>

      {/* mobile drawer */}
      {drawer && (
        <div className="fixed inset-0 z-60 lg:hidden">
          <div className="absolute inset-0 bg-[#181410]/50" onClick={() => setDrawer(false)} aria-hidden />
          <div role="dialog" aria-modal="true" aria-label="Menu" className="relative flex h-full w-72 max-w-[85vw] flex-col gap-8 rounded-r-[2rem] bg-white p-5">
            <div className="flex items-center justify-between">
              <Brand />
              <button onClick={() => setDrawer(false)} aria-label="Close menu" className="grid h-10 w-10 place-items-center rounded-full border border-[#E6D9C6]"><X size={17} /></button>
            </div>
            <NavList pathname={pathname} />
            <SidebarFooter />
          </div>
        </div>
      )}
    </div>
  );
}