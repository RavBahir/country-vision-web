"use client";

import {
  useEffect,
  useRef,
  useState,
  type ElementType,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  CalendarCheck,
  Clock,
  Eye,
  Glasses,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Phone,
  Plus,
  Minus,
  Quote,
  Send,
  ShieldCheck,
  Sparkles,
  Sun,
  Contrast,
  Monitor,
  Ruler,
  X,
  type LucideIcon,
} from "lucide-react";
import { EMAIL, PHONE, WHATSAPP_PHONE } from "./login/page";

/* ------------------------------------------------------------------ */
/* Content                                                             */
/* ------------------------------------------------------------------ */

type NavItem = { id: string; label: string };
type Service = { icon: LucideIcon; title: string; text: string };
type Frame = { tag: string; name: string };
type LensFeature = {
  icon: LucideIcon;
  title: string;
  sub: string;
  body: string;
};
type Reason = { title: string; text: string };
type Step = { title: string; text: string };
type Review = { quote: string; name: string; role: string };
type Stat = { to: number; decimals?: number; suffix?: string; label: string };

const BRAND = "Country Vision";

const NAV: NavItem[] = [
  { id: "home", label: "Home" },
  { id: "eye-care", label: "Eye Care" },
  { id: "eyewear", label: "Eyewear" },
  { id: "lenses", label: "Lenses" },
  { id: "about", label: "About" },
  { id: "contact", label: "Contact" },
];

const SERVICES: Service[] = [
  {
    icon: Eye,
    title: "Comprehensive Eye Checkups",
    text: "Professional eye examinations designed to assess your vision and help identify changes that may require attention.",
  },
  {
    icon: Glasses,
    title: "Prescription Eyewear",
    text: "Find glasses that match your prescription, comfort, lifestyle, and personal style.",
  },
  {
    icon: Sparkles,
    title: "Quality Lenses",
    text: "Explore quality lens options designed for clear and comfortable everyday vision.",
  },
  {
    icon: Ruler,
    title: "Frame Selection",
    text: "Discover contemporary frames that complement your face, personality, and lifestyle.",
  },
];

const FRAMES: Frame[] = [
  { tag: "Classic", name: "Timeless round acetate" },
  { tag: "Modern", name: "Sharp rectangular metal" },
  { tag: "Lightweight", name: "Featherlight rimless" },
  { tag: "Bold", name: "Statement square" },
];

const LENS_FEATURES: LensFeature[] = [
  {
    icon: ShieldCheck,
    title: "UV Protection",
    sub: "Full-spectrum defense",
    body: "Blocks harmful ultraviolet light so your eyes stay protected indoors and out.",
  },
  {
    icon: Contrast,
    title: "Anti-Reflective",
    sub: "Zero glare, pure clarity",
    body: "A thin coating removes reflections, which helps at night, on screens, and in photographs.",
  },
  {
    icon: Monitor,
    title: "Blue-Light Filtering",
    sub: "Easier on screen days",
    body: "Reduces strain from long hours on phones, tablets, and computers.",
  },
  {
    icon: Sun,
    title: "Photochromic",
    sub: "Adapts to sunlight",
    body: "Lenses darken outdoors and clear up again when you step inside.",
  },
  {
    icon: Ruler,
    title: "Prescription Precision",
    sub: "Surfaced to 0.01 diopter",
    body: "Every lens is surfaced, coated, and checked by hand against your prescription.",
  },
];

const REASONS: Reason[] = [
  { title: "Professional Care", text: "Your vision comes first." },
  {
    title: "Quality You Can Trust",
    text: "Carefully selected frames and lenses.",
  },
  {
    title: "Style Meets Vision",
    text: "Eyewear that works with your prescription and your personality.",
  },
  {
    title: "Personal Attention",
    text: "Guidance tailored to your individual needs.",
  },
];

const STEPS: Step[] = [
  { title: "Book", text: "Schedule your eye examination." },
  { title: "Check", text: "Complete your professional eye exam." },
  { title: "Choose", text: "Select frames and lenses suited to your needs." },
  { title: "See Clearly", text: "Walk away with eyewear designed for you." },
];

const SOCIALS = [
  { label: "Instagram", short: "IG" },
  { label: "Facebook", short: "FB" },
  { label: "X (Twitter)", short: "X" },
  { label: "LinkedIn", short: "in" },
];

const REVIEWS: Review[] = [
  {
    quote:
      "The whole experience was simple and professional. I finally found glasses that look great and feel comfortable all day.",
    name: "Amara O.",
    role: "Classic round frames",
  },
  {
    quote:
      "From the eye examination to choosing my frames, I felt properly guided throughout the process.",
    name: "Kwame D.",
    role: "Blue-light lenses",
  },
  {
    quote:
      "Great service, quality eyewear, and a team that actually takes the time to listen.",
    name: "Zanele M.",
    role: "Bold square frames",
  },
];

/* ------------------------------------------------------------------ */
/* Motion primitives                                                   */
/* ------------------------------------------------------------------ */

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

/** True when the visitor has asked their OS to reduce motion. */
function usePrefersReducedMotion(): boolean {
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
function useInView<T extends Element>(
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

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  direction?: Direction;
  as?: "div" | "li" | "ul" | "article" | "figure" | "section" | "dl";
};

/** Fades and slides its children in the first time they scroll into view. */
function Reveal({
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
function MaskLine({
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
function CountUp({
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
function ScrollProgress() {
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
type PhotoProps = {
  src?: string;
  alt: string;
  className?: string;
  tone?: string;
  children?: ReactNode;
};

function Photo({
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

type ButtonProps = {
  href: string;
  dark?: boolean;
  children: ReactNode;
  className?: string;
};

function Button({ href, dark = true, children, className = "" }: ButtonProps) {
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

type HeadingProps = {
  kicker?: string;
  children: ReactNode;
  center?: boolean;
  light?: boolean;
};

function Heading({ kicker, children, center, light }: HeadingProps) {
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

function useActiveSection(ids: string[]): [string, (id: string) => void] {
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

function Header({ active, onNavigate }: HeaderProps) {
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
            <span className="block text-sm font-semibold">{BRAND}</span>
            <span className="block pt-1 text-[10px] tracking-[0.2em] text-[#1F1A15]/55 uppercase">
              Vision Care
            </span>
          </span>
        </a>

        <nav
          aria-label="Page sections"
          className="hidden items-center gap-1 md:flex"
        >
          {NAV.map((n) => (
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
          <Button href="#contact">Book an Eye Checkup</Button>

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
              {NAV.map((n, i) => (
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
            <Button href="#contact" className="w-full">
              Book an Eye Checkup
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* Sections                                                            */
/* ------------------------------------------------------------------ */

function Hero() {
  const stats: Stat[] = [
    { to: 12, suffix: "k+", label: "Eye exams done" },
    { to: 4.9, decimals: 1, label: "Patient rating" },
    { to: 350, suffix: "+", label: "Frames in store" },
  ];
  return (
    <section id="home" className="mx-auto max-w-6xl px-5 pt-6 pb-14">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <div>
          <Reveal delay={100}>
            <p className="mb-5 flex items-center gap-3 text-xs font-medium tracking-[0.18em] text-[#8A6A4A] uppercase">
              <span className="h-px w-8 bg-[#8A6A4A]" /> See life clearly
            </p>
          </Reveal>
          <h1 className="text-5xl font-semibold leading-[1.02] tracking-tight sm:text-6xl">
            <MaskLine delay={200}>Better vision.</MaskLine>
            <MaskLine delay={320}>Better choices.</MaskLine>
            <MaskLine delay={440}>
              <span className="font-serif text-[1.1em] font-normal italic">
                Better care.
              </span>
            </MaskLine>
          </h1>
          <Reveal delay={600}>
            <p className="mt-6 max-w-md text-[15px] leading-relaxed text-[#1F1A15]/65">
              Professional eye care and carefully selected eyewear designed
              around your vision, comfort, and personal style.
            </p>
          </Reveal>
          <Reveal delay={720}>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button href="#contact">
                Book an Eye Checkup <ArrowRight size={16} />
              </Button>
              <Button href="#eyewear" dark={false}>
                Explore Eyewear
              </Button>
            </div>
          </Reveal>
          <Reveal delay={840}>
            <p className="mt-6 flex items-center gap-2 text-xs text-[#1F1A15]/60">
              <BadgeCheck size={14} /> Professional Eye Care · Quality Lenses ·
              Stylish Frames
            </p>
          </Reveal>
          <Reveal delay={960} as="dl" className="mt-9 flex gap-9 border-t border-[#1F1A15]/10 pt-6">
            {stats.map((s) => (
              <div key={s.label}>
                <dt className="text-2xl font-semibold">
                  <CountUp
                    to={s.to}
                    decimals={s.decimals}
                    suffix={s.suffix}
                    delay={1000}
                  />
                </dt>
                <dd className="mt-1 text-xs text-[#1F1A15]/55">{s.label}</dd>
              </div>
            ))}
          </Reveal>
        </div>

        <Reveal direction="right" delay={250} duration={1100}>
          <Photo
            src="/assets/images/vision-1.png"
            alt="Smiling woman wearing round glasses"
            tone="bg-[#CDBBA3]"
            className="aspect-[4/4.4] rounded-3xl"
          >
            <Reveal
              direction="down"
              delay={1000}
              className="absolute left-4 top-4"
            >
              <div className="flex items-center gap-2 rounded-xl bg-white/90 px-3 py-2 shadow-sm backdrop-blur">
                <Eye size={16} />
                <span className="text-xs leading-tight">
                  <b className="block font-medium">Certified Optometrists</b>
                  <span className="text-[#1F1A15]/55">Trusted choice care</span>
                </span>
              </div>
            </Reveal>
            <Reveal
              delay={1150}
              className="absolute inset-x-4 bottom-4"
            >
              <div className="flex items-center justify-between rounded-2xl bg-[#1F1A15]/85 p-3 text-white backdrop-blur">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-lg bg-white/10">
                    <CalendarCheck size={18} />
                  </span>
                  <span className="text-xs leading-tight">
                    <span className="text-white/60">Next available</span>
                    <b className="block text-sm font-medium">Tomorrow 9:30</b>
                  </span>
                  <a
                    href="#contact"
                    className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-[#1F1A15]"
                  >
                    Book
                  </a>
                </div>
                <span className="hidden text-right text-[11px] leading-tight text-white/70 sm:block">
                  UV · Blue light · AR
                  <br />
                  <b className="text-sm text-white">Lenses that work harder</b>
                </span>
              </div>
            </Reveal>
          </Photo>
        </Reveal>
      </div>

      {/* service strip */}
      <ul className="mt-14 flex flex-wrap justify-between gap-x-6 gap-y-2 border-y border-[#1F1A15]/10 bg-[#F1E7D8]/60 px-4 py-3 text-[11px] font-medium tracking-[0.16em] text-[#1F1A15]/60 uppercase">
        {[
          "Comprehensive exams",
          "Prescription frames",
          "Precision lenses",
          "Personal styling",
          "Aftercare support",
        ].map((t, i) => (
          <Reveal as="li" key={t} delay={i * 80} direction="fade">
            {t}
          </Reveal>
        ))}
      </ul>

      {/* intro */}
      <div className="mt-20 grid items-center gap-12 lg:grid-cols-2">
        <Reveal direction="left" duration={1000}>
          <div className="relative pb-10 pr-10">
            <Photo
              src="/assets/images/hero.png"
              alt="Glassware beside olive branches"
              tone="bg-[#B9C4B0]"
              className="relative aspect-[4/3.4] rounded-2xl"
            >
              <>
                <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[11px]">
                  Complete vision care experience
                </span>
                {/* <div className="absolute right-0 bottom-0 hidden lg:block">
                  <Photo
                    src="/assets/images/vision-3.jpg"
                    alt="Optometrist in white coat"
                    tone="bg-[#D9C7AF]"
                    className="absolute bottom-0 right-0 h-40 w-36 rounded-xl border-4 border-[#FAF5EE]"
                  />
                </div> */}
              </>
            </Photo>
          </div>
        </Reveal>
        <div>
          <Reveal>
            <p className="mb-3 text-xs font-medium tracking-[0.18em] text-[#8A6A4A] uppercase">
              Your vision, our priority
            </p>
            <h2 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              Your vision deserves more than an ordinary pair of glasses.
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-[#1F1A15]/65">
              Your eyes are unique. Your eyewear should be too. We combine
              professional eye examinations with carefully selected frames and
              quality lenses to give you a complete vision care experience.
            </p>
          </Reveal>
          <Reveal delay={240}>
            <div className="mt-6 flex flex-wrap gap-6 text-sm">
              <span className="flex items-center gap-2">
                <BadgeCheck size={16} className="text-[#8A6A4A]" /> Licensed
                clinicians
              </span>
              <span className="flex items-center gap-2">
                <Glasses size={16} className="text-[#8A6A4A]" /> Curated frames
              </span>
            </div>
            <a
              href="#eye-care"
              className="mt-7 inline-flex items-center gap-2 border-b border-[#1F1A15] pb-0.5 text-sm font-medium"
            >
              Our approach to eye care
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function EyeCare() {
  return (
    <section id="eye-care" className="mx-auto max-w-6xl scroll-mt-16 px-5 py-20">
      <div className="mx-auto max-w-2xl text-center">
        <Heading kicker="What we do" center>
          Everything you need for better vision.
        </Heading>
        <Reveal delay={120}>
          <p className="mt-4 text-[15px] text-[#1F1A15]/65">
            From understanding your eyes to finding eyewear that fits your
            lifestyle, we&rsquo;re here to make vision care simple.
          </p>
        </Reveal>
      </div>
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {SERVICES.map((s, i) => (
          <Reveal key={s.title} delay={i * 100} className="h-full">
            <article className="flex h-full flex-col rounded-2xl border border-[#1F1A15]/10 bg-white p-6 transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#1F1A15]/5 motion-reduce:transition-none motion-reduce:hover:translate-y-0">
              <div className="flex items-center justify-between">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#F1E7D8] text-[#8A6A4A]">
                  <s.icon size={18} />
                </span>
                <span className="text-xs text-[#1F1A15]/35">0{i + 1}</span>
              </div>
              <h3 className="mt-6 text-lg font-semibold leading-snug">
                {s.title}
              </h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-[#1F1A15]/60">
                {s.text}
              </p>
              <a
                href="#contact"
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium"
              >
                Learn more <ArrowRight size={14} />
              </a>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Eyewear() {
  return (
    <section id="eyewear" className="scroll-mt-16 bg-[#F1E7D8]/70 py-20">
      <div className="mx-auto max-w-6xl px-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <Reveal>
            <p className="mb-3 text-xs font-medium tracking-[0.18em] text-[#8A6A4A] uppercase">
              The collection
            </p>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Find a frame that feels like you.
            </h2>
            <p className="mt-3 text-[15px] text-[#1F1A15]/65">
              Your glasses should fit your face, your lifestyle, and your
              personality.
            </p>
          </Reveal>
          <Reveal delay={150} direction="left">
            <Button href="#contact" dark={false}>
              Explore Our Frames <ArrowRight size={14} />
            </Button>
          </Reveal>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-[1fr_1.6fr]">
          <Reveal direction="left" duration={1000} className="h-full">
            <Photo
              src="/assets/images/person-1.jpg"
              alt="Black round acetate sunglasses"
              tone="bg-[#E8E3DC]"
              className="h-full min-h-90 rounded-2xl"
            >
              <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-[11px]">
                {FRAMES[0].tag}
              </span>
              <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/60 to-transparent p-5 pt-16 text-white font-medium">
                {FRAMES[0].name}
              </div>
            </Photo>
          </Reveal>

          <div className="grid gap-4">
            <FrameCard
              f={FRAMES[1]}
              src="/assets/images/modern-rectangular.jpg"
              tone="bg-[#E2C9A0]"
              delay={100}
              tall
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <FrameCard
                f={FRAMES[2]}
                src="/assets/images/frame-light.png"
                tone="bg-[#BFC8B8]"
                delay={200}
              />
              <FrameCard
                f={FRAMES[3]}
                src="/assets/images/frame-bold.png"
                tone="bg-[#B58B5E]"
                delay={300}
              />
            </div>
            <Reveal delay={400}>
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#1F1A15] p-4 pl-6 text-white">
                <div>
                  <p className="font-medium">Not sure what suits you?</p>
                  <p className="text-xs text-white/60">
                    Try our guided face-shape styling in store.
                  </p>
                </div>
                <a
                  href="#contact"
                  className="rounded-full bg-[#FAF5EE] px-4 py-2 text-sm font-medium text-[#1F1A15] transition-transform duration-200 active:scale-[0.97]"
                >
                  Get styled
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

type FrameCardProps = {
  f: Frame;
  src: string;
  tone: string;
  tall?: boolean;
  delay?: number;
};

function FrameCard({ f, src, tone, tall, delay = 0 }: FrameCardProps) {
  return (
    <Reveal delay={delay}>
      <div className="overflow-hidden rounded-2xl bg-white transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#1F1A15]/5 motion-reduce:transition-none motion-reduce:hover:translate-y-0">
        <Photo
          src={src}
          alt={f.name}
          tone={tone}
          className={tall ? "h-44" : "h-36"}
        >
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[11px]">
            {f.tag}
          </span>
        </Photo>
        <div className="flex items-center justify-between px-4 py-3 text-sm font-medium">
          {f.name}
          <ArrowUpRight size={14} className="text-[#1F1A15]/40" />
        </div>
      </div>
    </Reveal>
  );
}

function Lenses() {
  const [open, setOpen] = useState(0);
  return (
    <section id="lenses" className="scroll-mt-16 bg-[#181410] py-20 text-white">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 lg:grid-cols-2">
        <div>
          <Heading kicker="Lens technology" light>
            Clearer vision starts with the right lens.
          </Heading>
          <Reveal delay={100}>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/60">
              Every prescription is surfaced, coated, and checked by hand, so
              what you see is crisp, comfortable, and protected.
            </p>
          </Reveal>
          <ul className="mt-8 space-y-2">
            {LENS_FEATURES.map((f, i) => {
              const isOpen = open === i;
              return (
                <Reveal
                  as="li"
                  key={f.title}
                  delay={i * 80}
                  className="rounded-xl border border-white/10 bg-white/4"
                >
                  <button
                    onClick={() => setOpen(isOpen ? -1 : i)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
                  >
                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/10">
                      <f.icon size={15} />
                    </span>
                    <span className="text-sm font-medium">{f.title}</span>
                    <span className="text-xs text-white/45">{f.sub}</span>
                    <span className="ml-auto text-white/50">
                      {isOpen ? <Minus size={15} /> : <Plus size={15} />}
                    </span>
                  </button>
                  <div
                    className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none ${
                      isOpen
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="px-4 pb-4 pl-15 text-sm leading-relaxed text-white/60">
                        {f.body}
                      </p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </ul>
          <Reveal delay={200}>
            <a
              href="#contact"
              className="mt-7 inline-block rounded-full bg-[#FAF5EE] px-5 py-3 text-sm font-medium text-[#1F1A15] transition-transform duration-200 active:scale-[0.98]"
            >
              Explore Lens Options
            </a>
          </Reveal>
        </div>

        <Reveal direction="right" duration={1000}>
          <Photo
            src="/assets/images/frame-kids.png"
            alt="Amber beads in warm light"
            tone="bg-[#5A3A1C]"
            className="aspect-[4/4.2] rounded-3xl"
          >
            <span className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-black/55 px-3 py-1.5 text-[11px] backdrop-blur">
              <Sparkles size={12} /> Anti-reflective coating
            </span>
            <span className="absolute bottom-4 right-4 flex items-center gap-2 rounded-full bg-black/55 px-3 py-1.5 text-[11px] backdrop-blur">
              <Sun size={12} /> 100% UV protection
            </span>
          </Photo>
        </Reveal>
      </div>
    </section>
  );
}

function About() {
  return (
    <section id="about" className="mx-auto max-w-6xl scroll-mt-16 px-5 py-20">
      <div className="grid items-start gap-12 lg:grid-cols-2">
        <div>
          <Heading kicker="Why choose us">
            Vision care with a personal touch.
          </Heading>
          <Reveal delay={150} className="mt-8">
            <Photo
              src="/assets/images/try-frame.png"
              alt="Customer trying on glasses with an optometrist"
              tone="bg-[#D8C4A8]"
              className="aspect-[4/2.7] rounded-2xl"
            />
          </Reveal>
        </div>
        <ol className="lg:pt-14">
          {REASONS.map((r, i) => (
            <Reveal
              as="li"
              key={r.title}
              delay={i * 110}
              direction="right"
              className="flex items-start gap-5 border-t border-[#1F1A15]/10 py-6 last:border-b"
            >
              <span className="text-sm text-[#8A6A4A]">0{i + 1}</span>
              <div className="flex-1">
                <h3 className="font-semibold">{r.title}</h3>
                <p className="mt-1 text-sm text-[#1F1A15]/60">{r.text}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>

      {/* checkup banner */}
      <Reveal direction="scale" duration={1000} className="mt-20">
        <Photo
          src="/assets/images/book-appointment.png"
          alt="Woman booking an appointment on her phone"
          tone="bg-[#6B4A2B]"
          className="rounded-3xl"
        >
          <div className="absolute inset-0 bg-linear-to-r from-black/70 via-black/40 to-transparent" />
          <div className="relative max-w-lg p-8 py-14 text-white sm:p-12 sm:py-20">
            <Reveal delay={200}>
              <p className="mb-3 text-xs tracking-[0.18em] text-[#E3C49B] uppercase">
                Eye checkup
              </p>
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                When was your last eye checkup?
              </h2>
            </Reveal>
            <Reveal delay={350}>
              <p className="mt-4 text-sm leading-relaxed text-white/75">
                Whether you&rsquo;re experiencing changes in your vision or
                simply due for a routine checkup, take the first step today.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button href="#contact" dark={false} className="bg-[#FAF5EE]!">
                  Book Eye Checkup <ArrowRight size={14} />
                </Button>
                <a
                  href="#contact"
                  className="inline-flex items-center rounded-full border border-white/40 px-5 py-3 text-sm font-medium text-white transition-[background-color,transform] duration-200 hover:bg-white/10 active:scale-[0.98]"
                >
                  Contact Us
                </a>
              </div>
              <p className="mt-6 flex flex-wrap gap-5 text-xs text-white/65">
                <span className="flex items-center gap-1.5">
                  <Clock size={13} /> 40-minute appointments
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin size={13} /> Walk-ins welcome
                </span>
              </p>
            </Reveal>
          </div>
        </Photo>
      </Reveal>

      {/* how it works: a real sequence */}
      <div className="mt-24">
        <Heading kicker="How it works" center>
          Simple, from start to clear sight.
        </Heading>
        <ol className="mt-10 grid overflow-hidden rounded-2xl border border-[#1F1A15]/10 bg-white sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <Reveal
              as="li"
              key={s.title}
              delay={i * 130}
              className="border-b border-[#1F1A15]/10 p-6 lg:border-b-0 lg:border-r lg:last:border-r-0"
            >
              <span className="text-3xl font-light text-[#1F1A15]/20">
                0{i + 1}
              </span>
              <h3 className="mt-4 font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm text-[#1F1A15]/60">{s.text}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Reviews() {
  return (
    <section className="bg-[#F1E7D8]/70 py-20">
      <div className="mx-auto max-w-6xl px-5">
        <Heading kicker="Client stories" center>
          Loved by people who value their vision.
        </Heading>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {REVIEWS.map((r, i) => (
            <Reveal key={r.name} delay={i * 120} className="h-full">
              <figure className="flex h-full flex-col rounded-2xl border border-[#1F1A15]/10 bg-white p-6 transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#1F1A15]/5 motion-reduce:transition-none motion-reduce:hover:translate-y-0">
                <Quote size={22} className="text-[#C9A57B]" />
                <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed">
                  &ldquo;{r.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-[#E6D9C6] text-sm font-semibold">
                    {r.name[0]}
                  </span>
                  <span className="text-sm leading-tight">
                    <b className="block font-medium">{r.name}</b>
                    <span className="text-xs text-[#1F1A15]/50">{r.role}</span>
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function ContactCta() {
  return (
    <div className="mx-auto max-w-6xl px-5 pt-24 pb-20 text-center">
      <Reveal direction="scale">
        <span className="mx-auto mb-5 grid h-12 w-12 place-items-center rounded-full bg-[#F1E7D8] text-[#8A6A4A]">
          <Eye size={20} />
        </span>
      </Reveal>
      <Reveal delay={100}>
        <h2 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
          Ready to see the difference?
        </h2>
      </Reveal>
      <Reveal delay={200}>
        <p className="mx-auto mt-4 max-w-md text-[15px] text-[#1F1A15]/65">
          Whether you need an eye checkup, a new prescription, or your next pair
          of glasses, we&rsquo;re ready to help.
        </p>
      </Reveal>
      <Reveal delay={300}>
        <div className="mt-7 flex justify-center gap-3">
          <Button href="#enquiry">Book an Eye Checkup</Button>
          <Button href="#enquiry" dark={false}>
            Contact Us
          </Button>
        </div>
      </Reveal>
    </div>
  );
}

function Contact() {
  const [sent, setSent] = useState(false);
  const details: { icon: LucideIcon; label: string; value: string }[] = [
    { icon: Phone, label: "Phone", value: PHONE },
    { icon: MessageCircle, label: "WhatsApp", value: WHATSAPP_PHONE },
    { icon: Mail, label: "Email", value: EMAIL },
    {
      icon: MapPin,
      label: "Location",
      value: "Awoshie Baah Yard, Accra, Ghana",
    },
    { icon: Clock, label: "Opening hours", value: "Mon – Sat · 9:00 – 16:00" },
  ];
  const field =
    "w-full rounded-xl border border-[#1F1A15]/10 bg-[#FAF5EE] px-4 py-3 text-sm transition-colors duration-200 placeholder:text-[#1F1A15]/40 focus:border-[#8A6A4A] focus:outline-none";

  return (
    <section id="contact" className="mx-auto max-w-6xl scroll-mt-16 px-5 pb-20">
      <Reveal duration={1000}>
        <div
          id="enquiry"
          className="grid scroll-mt-20 overflow-hidden rounded-3xl border border-[#1F1A15]/10 bg-white lg:grid-cols-2"
        >
          <div className="p-8 sm:p-10">
            <p className="mb-3 text-xs font-medium tracking-[0.18em] text-[#8A6A4A] uppercase">
              Get in touch
            </p>
            <h2 className="text-3xl font-semibold tracking-tight">
              Let&rsquo;s talk about your vision.
            </h2>
            <ul className="mt-8 space-y-5">
              {details.map((d, i) => (
                <Reveal
                  as="li"
                  key={d.label}
                  delay={200 + i * 90}
                  className="flex items-start gap-4"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#F1E7D8] text-[#8A6A4A]">
                    <d.icon size={16} />
                  </span>
                  <span className="text-sm leading-tight">
                    <span className="block text-xs text-[#1F1A15]/50">
                      {d.label}
                    </span>
                    <b className="mt-1 block font-medium">{d.value}</b>
                  </span>
                </Reveal>
              ))}
            </ul>
            <a
              href={`https://wa.me/${WHATSAPP_PHONE.replace(/\s/g, '')}`}
              className="mt-8 flex items-center justify-center gap-2 rounded-full bg-[#1F3B2D] px-5 py-3 text-sm font-medium text-white transition-[background-color,transform] duration-200 hover:bg-[#2a4e3d] active:scale-[0.98]"
            >
              <MessageCircle size={16} /> Chat on WhatsApp
            </a>
          </div>

          <div className="border-t border-[#1F1A15]/10 bg-[#FBF8F3] p-8 sm:p-10 lg:border-l lg:border-t-0">
            <h3 className="font-semibold">Send an enquiry</h3>
            <p className="mt-1 text-xs text-[#1F1A15]/55">
              We reply within one business day.
            </p>
            {sent ? (
              <Reveal direction="scale" duration={500}>
                <p
                  role="status"
                  className="mt-8 rounded-xl bg-[#F1E7D8] p-5 text-sm"
                >
                  Thanks, your enquiry is sent. We&rsquo;ll be in touch within
                  one business day.
                </p>
              </Reveal>
            ) : (
              <form
                className="mt-6 grid gap-3"
                onSubmit={(e: FormEvent<HTMLFormElement>) => {
                  e.preventDefault();
                  setSent(true);
                }}
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    required
                    className={field}
                    placeholder="Name"
                    aria-label="Name"
                  />
                  <input
                    required
                    type="email"
                    className={field}
                    placeholder="Email"
                    aria-label="Email"
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    className={field}
                    placeholder="Phone"
                    aria-label="Phone"
                  />
                  <select
                    className={field}
                    aria-label="Service"
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Service
                    </option>
                    <option>Eye checkup</option>
                    <option>Prescription eyewear</option>
                    <option>Lenses</option>
                    <option>Frame styling</option>
                  </select>
                </div>
                <textarea
                  required
                  rows={5}
                  className={field}
                  placeholder="Tell us how we can help"
                  aria-label="Message"
                />
                <button className="mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-[#1F1A15] px-5 py-3 text-sm font-medium text-white transition-[background-color,transform] duration-200 hover:bg-[#3a3027] active:scale-[0.98]">
                  Send Enquiry <Send size={14} />
                </button>
                <p className="text-center text-[11px] text-[#1F1A15]/50">
                  Prefer to talk? Call us on {PHONE}.
                </p>
              </form>
            )}
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function Footer({ onNavigate }: { onNavigate: (id: string) => void }) {
  const visit = NAV.filter((n) =>
    ["home", "eye-care", "eyewear", "lenses"].includes(n.id),
  );
  const company: [string, string][] = [
    ["About", "about"],
    ["Contact", "contact"],
    ["Book an Eye Checkup", "enquiry"],
  ];
  return (
    <footer className="bg-[#181410] text-white">
      <Reveal direction="fade" duration={1000}>
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2">

            <img src="/assets/images/logo.png" className="w-9 h-9" alt={BRAND} />
            <p className="font-semibold">{BRAND}</p>
            </div>
            <p className="mt-2 text-sm text-white/55">
              Better vision. Better choices. Better care.
            </p>
            <div className="mt-5 flex gap-2">
              {SOCIALS.map((so) => (
                <a
                  key={so.label}
                  href="#"
                  aria-label={so.label}
                  className="grid h-9 w-9 place-items-center rounded-full border border-white/15 text-[11px] font-medium text-white/70 transition-colors duration-200 hover:bg-white/10"
                >
                  {so.short}
                </a>
              ))}
            </div>
          </div>
          <FooterCol title="Visit">
            {visit.map((n) => (
              <a key={n.id} href={`#${n.id}`} onClick={() => onNavigate(n.id)}>
                {n.label}
              </a>
            ))}
          </FooterCol>
          <FooterCol title="Company">
            {company.map(([l, id]) => (
              <a key={id} href={`#${id}`} onClick={() => onNavigate(id)}>
                {l}
              </a>
            ))}
          </FooterCol>
          <FooterCol title="Contact">
            <a href={`tel:${PHONE.replace(/\s/g, '')}`}>{PHONE}</a>
            <a href={`https://wa.me/${WHATSAPP_PHONE}`} target="_blank" rel="noopener noreferrer">
              WhatsApp us
            </a>
            <a href="/login">Login</a>
          </FooterCol>
        </div>
      </Reveal>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-3 px-5 py-5 text-xs text-white/45">
          <p>
            © {new Date().getFullYear()} {BRAND}. All rights reserved.
          </p>
          <p className="flex gap-5">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms &amp; Conditions</a>
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div>
      <p className="mb-4 text-xs tracking-[0.16em] text-white/45 uppercase">
        {title}
      </p>
      <div className="flex flex-col gap-3 text-sm text-white/75 [&_a]:transition-colors [&_a:hover]:text-white">
        {children}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function Page() {
  const ids = NAV.map((n) => n.id);
  const [active, setActive] = useActiveSection(ids);
  const reduced = usePrefersReducedMotion();

  // Smooth anchor scrolling, unless the visitor prefers reduced motion.
  useEffect(() => {
    const root = document.documentElement;
    const previous = root.style.scrollBehavior;
    root.style.scrollBehavior = reduced ? "auto" : "smooth";
    return () => {
      root.style.scrollBehavior = previous;
    };
  }, [reduced]);

  return (
    <>
      <ScrollProgress />
      <a
        href="#eye-care"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-60 focus:rounded-full focus:bg-white focus:px-4 focus:py-2"
      >
        Skip to content
      </a>
      <Header active={active} onNavigate={setActive} />
      <main>
        <Hero />
        <EyeCare />
        <Eyewear />
        <Lenses />
        <About />
        <Reviews />
        <ContactCta />
        <Contact />
      </main>
      <Footer onNavigate={setActive} />
    </>
  );
}