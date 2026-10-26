import { TODAY } from "@/lib/format";
import { allRoutes } from "@/routes/routes";
import { Bell, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import { useSession } from "../auth/session";
import { format } from "date-fns";

const NOTIFICATIONS = [
  {
    id: 1,
    title: "Appointment confirmed",
    text: "Eye checkup · Fri 16 Oct, 9:30 AM",
    href: allRoutes.APPOINTMENTS,
  },
  {
    id: 2,
    title: "Your order is in the lab",
    text: "ORD-1042 · estimated ready 19 Oct",
    href: allRoutes.DASHBOARD,
  },
  {
    id: 3,
    title: "Payment pending",
    text: "Blue-light lenses deposit",
    href: allRoutes.TRANSACTIONS,
  },
];

const TopNav = ({
  drawer,
  setDrawer,
}: {
  drawer: boolean;
  setDrawer: Dispatch<SetStateAction<boolean>>;
}) => {
  const router = useRouter();

  const { session } = useSession();

  const navigateToProfile = () => {
    router.push(allRoutes.PORTAL + allRoutes.PROFILE);
  };

  const pathname = usePathname();
  const [bell, setBell] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

  // close menus on navigation
  useEffect(() => {
    setDrawer(false);
    setBell(false);
  }, [pathname]);

  // close the notification popover on outside click / Escape; lock scroll with drawer
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node))
        setBell(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setBell(false);
        setDrawer(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = drawer ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawer]);

  const user = session?.user_validation_info

  const initials = user?.name.split(" ")
    .map((p) => p[0])
    .join("");

  const today = TODAY.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <header className="flex items-center sticky top-6 justify-between gap-3 rounded-full border border-[#E6D9C6] bg-white py-2 pr-2 pl-3 sm:pl-5 z-70 ">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setDrawer(true)}
          aria-label="Open menu"
          className="grid h-10 w-10 place-items-center rounded-full border border-[#E6D9C6] lg:hidden"
        >
          <Menu size={18} />
        </button>
        <p className="hidden text-[12px] text-[#1F1A15]/60 sm:block">{format(new Date(), "eee do MMM yyyy")}</p>
        <span className="rounded-full border border-[#E6D9C6] bg-[#F6EFE4] px-3 py-1 text-xs font-medium lg:ml-2">
          Client Portal
        </span>
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
              <p className="px-4 pt-3 pb-2 text-xs font-medium tracking-[0.18em] text-[#8A6A4A] uppercase">
                Notifications
              </p>
              <ul>
                {NOTIFICATIONS.map((n) => (
                  <li key={n.id}>
                    <Link
                      href={n.href}
                      className="block rounded-2xl px-4 py-3 hover:bg-[#F6EFE4]"
                    >
                      <b className="block text-sm font-medium">{n.title}</b>
                      <span className="text-xs text-[#1F1A15]/55">
                        {n.text}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div
          onClick={navigateToProfile}
          className="flex items-center gap-3 rounded-full bg-[#F6EFE4] py-1 pr-4 pl-1 hover:cursor-pointer"
        >
          <span className="grid h-8 w-8 place-items-center rounded-full bg-[#1F1A15] text-xs font-semibold text-white">
            {initials}
          </span>
          <span className="hidden text-xs leading-tight sm:block">
            <b className="block font-medium">{user?.name}</b>
            <span className="text-[10px] text-[#1F1A15]/50">
               {user?.roleName}
            </span>
          </span>
        </div>
      </div>
    </header>
  );
};

export default TopNav;
