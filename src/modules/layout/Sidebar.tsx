import { ScrollArea } from "@/components/ui/scroll-area";
import { WHATSAPP_LINK } from "@/lib/constants";
import { allRoutes } from "@/routes/routes";
import {
  CalendarCheck,
  CalendarDays,
  Eye,
  Glasses,
  Headset,
  LayoutDashboard,
  LogOut,
  LucideIcon,
  MessageCircleQuestionMark,
  Receipt,
  User2,
  UserRoundKey,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dispatch, SetStateAction } from "react";
import { useLogout, useSession } from "../auth/session";

interface ISidebarNav {
  href: string;
  label: string;
  icon: LucideIcon;
  isUserOnly?: boolean;
  isCustomerOnly?: boolean;
  isComingSoon?: boolean;
}

const NAV: ISidebarNav[] = [
  { href: allRoutes.DASHBOARD, label: "Dashboard", icon: LayoutDashboard },
  {
    href: allRoutes.APPOINTMENTS,
    label: "Appointments",
    icon: CalendarCheck,
    isCustomerOnly: true,
  },
  {
    href: allRoutes.SCHEDULES,
    label: "Schedules",
    icon: CalendarCheck,
    isUserOnly: true,
  },
  { href: allRoutes.CHECKUPS, label: "Checkups", icon: Eye, isCustomerOnly: true },
  { href: allRoutes.CATALOG, label: "Catalog", icon: Glasses , isComingSoon: true},
  { href: allRoutes.TRANSACTIONS, label: "Transactions", icon: Receipt, isComingSoon: true},
  { href: allRoutes.CALENDAR, label: "Calendar", icon: CalendarDays },
  { href: allRoutes.ENQUIRIES, label: "Enquiries", icon: MessageCircleQuestionMark, isUserOnly: true },
  {
    href: allRoutes.CUSTOMERS,
    label: "Customers",
    icon: Users,
    isUserOnly: true,
  },
  { href: allRoutes.USERS, label: "Users", icon: User2, isUserOnly: true },
  { href: allRoutes.ROLES, label: "Roles", icon: UserRoundKey, isUserOnly: true },
];

function Brand() {
  return (
    <Link
      href={allRoutes.PORTAL + allRoutes.DASHBOARD}
      className="flex items-center gap-3"
    >
      <img src="/assets/images/logo.png" className="w-8 h-8" alt="" />
      <span className="leading-none">
        <span className="block text-sm font-semibold">Country Vision</span>
        <span className="mt-0.5 block text-[9px] tracking-[0.25em] text-[#1F1A15]/55 uppercase">
          Client Portal
        </span>
      </span>
    </Link>
  );
}

function NavList({
  pathname,
  isStaff,
}: {
  pathname: string;
  isStaff: boolean;
}) {
  return (
    <ScrollArea className={"max-h-[50vh]"}>
      <nav aria-label="Portal sections">
        <ul className="grid gap-1">
          {NAV.map((n) => {
            const active =
              pathname ===
              allRoutes.PORTAL +
                (n.href ||
                  pathname.startsWith(`${allRoutes.PORTAL + n.href}/`));

            const userOnly = n.isUserOnly;
            const customerOnly = n.isCustomerOnly;

            const isComingSoon = !!n.isComingSoon;

            if (userOnly && !isStaff) return;
            if (customerOnly && isStaff) return;
            return (
              <li key={n.href}>
                <Link
                  href={isComingSoon ? "" : allRoutes.PORTAL + n.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-full px-4 py-2.5 text-sm font-medium transition-colors ${
                    isComingSoon ? "hover:cursor-not-allowed bg-gray-200 opacity-20" :
                    active
                      ? "bg-[#1F1A15] text-white"
                      : "text-[#1F1A15]/70 hover:bg-[#F1E7D8] hover:text-[#1F1A15]"
                  }`}
                >
                  <n.icon size={17} /> {n.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </ScrollArea>
  );
}

function SidebarFooter() {
  const logout = useLogout();
  const logoutUser = () => {
    logout();
  };
  return (
    <div className="grid gap-3">
      <div className="rounded-2xl bg-[#181410] p-4 text-white">
        <div className="flex items-center gap-2">
          <Headset size={18} className="text-[#C9A57B]" />
          <p className=" text-sm font-medium">Need help?</p>
        </div>
        <p className="mt-1 text-xs text-white/60">
          Chat with our team Mon–Sat.
        </p>
        <a
          href={WHATSAPP_LINK}
          className="mt-3 inline-block rounded-full bg-[#FAF5EE] px-4 py-2 text-xs font-medium text-[#1F1A15]"
        >
          WhatsApp us
        </a>
      </div>
      <Link
        href={allRoutes.LOGIN}
        onClick={logoutUser}
        className="flex items-center gap-3 rounded-full px-4 py-2.5 text-sm text-[#1F1A15]/65 hover:bg-[#F1E7D8] hover:text-[#1F1A15]"
      >
        <LogOut size={17} /> Sign out
      </Link>
    </div>
  );
}

const Sidebar = ({
  setDrawer,
  drawer,
}: {
  drawer: boolean;
  setDrawer: Dispatch<SetStateAction<boolean>>;
}) => {
  const pathname = usePathname();
  const { session } = useSession();

  const isStaff = session?.user_validation_info.kind === "user";
  return (
    <>
      <aside className="sticky top-6 hidden h-[calc(100vh-3rem)] w-64 shrink-0 flex-col gap-4 rounded-[2rem] border border-[#E6D9C6] bg-white p-5 lg:flex">
        <Brand />
        <NavList isStaff={isStaff} pathname={pathname ?? ""} />
        <SidebarFooter />
      </aside>
      {/* mobile drawer */}
      {drawer && (
        <div className="fixed inset-0 z-80 lg:hidden">
          <div
            className="absolute inset-0 bg-[#181410]/50"
            onClick={() => setDrawer(false)}
            aria-hidden
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="relative flex h-full w-72 max-w-[85vw] flex-col gap-8 rounded-r-[2rem] bg-white p-5"
          >
            <div className="flex items-center justify-between">
              <Brand />
              <button
                onClick={() => setDrawer(false)}
                aria-label="Close menu"
                className="grid h-10 w-10 place-items-center rounded-full border border-[#E6D9C6]"
              >
                <X size={17} />
              </button>
            </div>
            <NavList isStaff={isStaff} pathname={pathname ?? ""} />
            <SidebarFooter />
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
