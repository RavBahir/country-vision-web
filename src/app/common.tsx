
/* ------------------------------------------------------------------ */
/* Content                                                             */
/* ------------------------------------------------------------------ */

import { COMPANY_NAME } from "@/lib/constants";
import { LucideIcon, Menu, X } from "lucide-react";
import { ElementType, ReactNode, useEffect, useRef, useState } from "react";

export type INavItem = { id: string; label: string };
export type IService = { icon: LucideIcon; title: string; text: string };
export type IFrame = { tag: string; name: string };
export type ILensFeature = {
  icon: LucideIcon;
  title: string;
  sub: string;
  body: string;
};
export type IReason = { title: string; text: string };
export type IStep = { title: string; text: string };
export type IReview = { quote: string; name: string; role: string };
export type IStat = { to: number; decimals?: number; suffix?: string; label: string };

export const PAGE_NAV: INavItem[] = [
  { id: "home", label: "Home" },
  { id: "eye-care", label: "Eye Care" },
  { id: "eyewear", label: "Eyewear" },
  { id: "lenses", label: "Lenses" },
  { id: "about", label: "About" },
  { id: "contact", label: "Contact" },
];


/* ------------------------------------------------------------------ */
/* Motion primitives                                                   */
/* ------------------------------------------------------------------ */

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

/** True when the visitor has asked their OS to reduce motion. */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

/** Fires once when the element enters the viewport. */
export function useInView<T extends Element>(
  threshold = 0.15,
  rootMargin = "0px 0px -8% 0px",
) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduced || typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold, rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced, threshold, rootMargin]);

  return [ref, inView, reduced] as const;
}

type Direction = "up" | "down" | "left" | "right" | "scale" | "fade";

const HIDDEN_TRANSFORM: Record<Direction, string> = {
  up: "translate3d(0, 28px, 0)",
  down: "translate3d(0, -28px, 0)",
  left: "translate3d(-36px, 0, 0)",
  right: "translate3d(36px, 0, 0)",
  scale: "scale(0.96)",
  fade: "none",
};

export type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  direction?: Direction;
  as?: "div" | "li" | "ul" | "article" | "figure" | "section" | "dl";
};

/** Fades and slides its children in the first time they scroll into view. */
export function Reveal({
  children,
  className = "",
  delay = 0,
  duration = 800,
  direction = "up",
  as = "div",
}: RevealProps) {
  const [ref, inView, reduced] = useInView<HTMLElement>();
  const Tag = as as ElementType;
  return (
    <Tag
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "none" : HIDDEN_TRANSFORM[direction],
        transition: reduced
          ? "none"
          : `opacity ${duration}ms ${EASE} ${delay}ms, transform ${duration}ms ${EASE} ${delay}ms`,
      }}
    >
      {children}
    </Tag>
  );
}

/** A line of headline text that slides up from behind a mask. */
export function MaskLine({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const [ref, inView, reduced] = useInView<HTMLSpanElement>(0);
  return (
    <span ref={ref} className="my-[-0.06em] block overflow-hidden py-[0.06em]">
      <span
        className={`block ${className}`}
        style={{
          transform: inView ? "none" : "translate3d(0, 110%, 0)",
          transition: reduced
            ? "none"
            : `transform 950ms ${EASE} ${delay}ms`,
        }}
      >
        {children}
      </span>
    </span>
  );
}

/** Counts up to a number when it scrolls into view. */
export function CountUp({
  to,
  decimals = 0,
  suffix = "",
  delay = 0,
  duration = 1600,
}: {
  to: number;
  decimals?: number;
  suffix?: string;
  delay?: number;
  duration?: number;
}) {
  const [ref, inView, reduced] = useInView<HTMLSpanElement>(0.3);
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      setValue(to);
      return;
    }
    let raf = 0;
    const timer = window.setTimeout(() => {
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min((now - start) / duration, 1);
        setValue(to * (1 - Math.pow(1 - t, 3)));
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, delay);
    return () => {
      window.clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, [inView, reduced, to, delay, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {value.toFixed(decimals)}
      {suffix}
    </span>
  );
}

/** Thin bar at the top of the page showing how far you have scrolled. */
export function ScrollProgress() {
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const progress = max > 0 ? doc.scrollTop / max : 0;
      if (bar.current) bar.current.style.transform = `scaleX(${progress})`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-60 h-0.5"
    >
      <div
        ref={bar}
        className="h-full origin-left bg-[#8A6A4A]"
        style={{ transform: "scaleX(0)" }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

/** Photo slot. Drop files into /public/images and set `src`.
 *  Until then the tinted background and label keep the layout intact.
 *  The image eases from a slight zoom to rest as it scrolls into view. */
export type PhotoProps = {
  src?: string;
  alt: string;
  className?: string;
  tone?: string;
  children?: ReactNode;
};

export function Photo({
  src,
  alt,
  className = "",
  tone = "bg-[#E6D9C6]",
  children,
}: PhotoProps) {
  const [ref, inView, reduced] = useInView<HTMLDivElement>(0.1);
  return (
    <div
      ref={ref}
      className={`relative overflow-hidden ${tone} ${className}`}
    >
      {src && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          className="absolute inset-0 h-full w-full object-cover"
          style={{
            transform: inView ? "scale(1)" : "scale(1.12)",
            transition: reduced ? "none" : `transform 1600ms ${EASE}`,
          }}
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      )}
      {children}
    </div>
  );
}

export type ButtonProps = {
  href: string;
  dark?: boolean;
  children: ReactNode;
  className?: string;
};

export function CButton({ href, dark = true, children, className = "" }: ButtonProps) {
  return (
    <a
      href={href}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-medium transition-[background-color,transform] duration-200 active:scale-[0.98] motion-reduce:transition-none ${
        dark
          ? "bg-[#1F1A15] text-white hover:bg-[#3a3027]"
          : "border border-[#1F1A15]/15 bg-white/60 text-[#1F1A15] hover:bg-white"
      } ${className}`}
    >
      {children}
    </a>
  );
}

export type HeadingProps = {
  kicker?: string;
  children: ReactNode;
  center?: boolean;
  light?: boolean;
};

export function Heading({ kicker, children, center, light }: HeadingProps) {
  return (
    <Reveal className={center ? "text-center" : ""}>
      {kicker && (
        <p
          className={`mb-3 text-xs font-medium tracking-[0.18em] uppercase ${light ? "text-[#C9A57B]" : "text-[#8A6A4A]"}`}
        >
          {kicker}
        </p>
      )}
      <h2
        className={`text-3xl font-semibold leading-tight tracking-tight sm:text-4xl ${light ? "text-white" : ""}`}
      >
        {children}
      </h2>
    </Reveal>
  );
}

/* ------------------------------------------------------------------ */
/* Section navigation                                                  */
/* ------------------------------------------------------------------ */

export function useActiveSection(ids: string[]): [string, (id: string) => void] {
  const [active, setActive] = useState<string>(ids[0]);
  useEffect(() => {
    const els = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0, 0.2, 0.5] },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [ids]);
  return [active, setActive];
}

type HeaderProps = { active: string; onNavigate: (id: string) => void };

export function Header({ active, onNavigate }: HeaderProps) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const go = (id: string) => {
    onNavigate(id);
    setOpen(false);
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all ${scrolled || open ? "bg-[#FAF5EE]/90 backdrop-blur border-b border-[#1F1A15]/10" : "bg-transparent"}`}
    >
      <div
        className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? "none" : "translate3d(0, -12px, 0)",
          transition: reduced ? "none" : `opacity 700ms ${EASE}, transform 700ms ${EASE}`,
        }}
      >
        <a
          href="#home"
          onClick={() => go("home")}
          className="flex items-center gap-3"
        >
          <img src="/assets/images/logo.png" className="w-9 h-9" alt="" />
         
          <span className="leading-none">
            <span className="block text-sm font-semibold">{COMPANY_NAME}</span>
            <span className="block pt-1 text-[10px] tracking-[0.2em] text-[#1F1A15]/55 uppercase">
              Vision Care
            </span>
          </span>
        </a>

        <nav
          aria-label="Page sections"
          className="hidden items-center gap-1 md:flex"
        >
          {PAGE_NAV.map((n) => (
            <a
              key={n.id}
              href={`#${n.id}`}
              onClick={() => go(n.id)}
              aria-current={active === n.id ? "true" : undefined}
              className={`relative rounded-full px-3 py-2 text-sm transition-colors ${
                active === n.id
                  ? "text-[#1F1A15]"
                  : "text-[#1F1A15]/60 hover:text-[#1F1A15]"
              }`}
            >
              {n.label}
              <span
                className={`absolute inset-x-3 -bottom-0.5 h-px origin-left bg-[#8A6A4A] transition-transform duration-300 motion-reduce:transition-none ${active === n.id ? "scale-x-100" : "scale-x-0"}`}
              />
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <a
            href="#eyewear"
            onClick={() => go("eyewear")}
            className="text-sm text-[#1F1A15]/70 hover:text-[#1F1A15]"
          >
            Explore Eyewear
          </a>
          <CButton href="#contact">Book an Eye Checkup</CButton>

        </div>

        <button
          className="grid h-10 w-10 place-items-center rounded-full border border-[#1F1A15]/15 md:hidden"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile menu: height animates open and closed, links stagger in */}
      <div
        className={`grid transition-[grid-template-rows,visibility] duration-300 ease-out motion-reduce:transition-none md:hidden ${
          open ? "visible grid-rows-[1fr]" : "invisible grid-rows-[0fr]"
        }`}
      >
        <nav aria-label="Mobile page sections" className="overflow-hidden">
          <div className="border-t border-[#1F1A15]/10 px-5 pb-5">
            <ul className="py-2">
              {PAGE_NAV.map((n, i) => (
                <li
                  key={n.id}
                  style={{
                    opacity: open ? 1 : 0,
                    transform: open ? "none" : "translate3d(0, -8px, 0)",
                    transition: reduced
                      ? "none"
                      : `opacity 350ms ${EASE} ${open ? 60 + i * 45 : 0}ms, transform 350ms ${EASE} ${open ? 60 + i * 45 : 0}ms`,
                  }}
                >
                  <a
                    href={`#${n.id}`}
                    onClick={() => go(n.id)}
                    aria-current={active === n.id ? "true" : undefined}
                    className={`block border-b border-[#1F1A15]/5 py-3 text-base ${active === n.id ? "font-semibold text-[#8A6A4A]" : ""}`}
                  >
                    {n.label}
                  </a>
                </li>
              ))}
            </ul>
            <CButton href="#contact" className="w-full">
              Book an Eye Checkup
            </CButton>
          </div>
        </nav>
      </div>
    </header>
  );
}
