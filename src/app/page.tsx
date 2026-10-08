"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
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
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

/** Photo slot. Drop files into /public/images and set `src`.
 *  Until then the tinted background and label keep the layout intact. */
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
  return (
    <div className={`relative overflow-hidden ${tone} ${className}`}>
      {src && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          className="absolute inset-0 h-full w-full object-cover"
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
      className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-medium transition-colors ${
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
    <div className={center ? "text-center" : ""}>
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
    </div>
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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (id: string) => {
    onNavigate(id);
    setOpen(false);
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all ${scrolled || open ? "bg-[#FAF5EE]/90 backdrop-blur border-b border-[#1F1A15]/10" : "bg-transparent"}`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <a
          href="#home"
          onClick={() => go("home")}
          className="flex items-center gap-3"
        >
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#1F1A15] text-white">
            <Eye size={18} />
          </span>
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
                className={`absolute inset-x-3 -bottom-0.5 h-px bg-[#8A6A4A] transition-transform origin-left ${active === n.id ? "scale-x-100" : "scale-x-0"}`}
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

      {open && (
        <nav
          aria-label="Mobile page sections"
          className="border-t border-[#1F1A15]/10 px-5 pb-5 md:hidden"
        >
          <ul className="py-2">
            {NAV.map((n) => (
              <li key={n.id}>
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
        </nav>
      )}
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* Sections                                                            */
/* ------------------------------------------------------------------ */

function Hero() {
  const stats: [string, string][] = [
    ["12k+", "Eye exams done"],
    ["4.9", "Patient rating"],
    ["350+", "Frames in store"],
  ];
  return (
    <section id="home" className="mx-auto max-w-6xl px-5 pt-6 pb-14">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <div>
          <p className="mb-5 flex items-center gap-3 text-xs font-medium tracking-[0.18em] text-[#8A6A4A] uppercase">
            <span className="h-px w-8 bg-[#8A6A4A]" /> See life clearly
          </p>
          <h1 className="text-5xl font-semibold leading-[1.02] tracking-tight sm:text-6xl">
            Better vision.
            <br />
            Better choices.
            <br />
            <span className="font-serif text-[1.1em] font-normal italic">
              Better care.
            </span>
          </h1>
          <p className="mt-6 max-w-md text-[15px] leading-relaxed text-[#1F1A15]/65">
            Professional eye care and carefully selected eyewear designed around
            your vision, comfort, and personal style.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button href="#contact">
              Book an Eye Checkup <ArrowRight size={16} />
            </Button>
            <Button href="#eyewear" dark={false}>
              Explore Eyewear
            </Button>
          </div>
          <p className="mt-6 flex items-center gap-2 text-xs text-[#1F1A15]/60">
            <BadgeCheck size={14} /> Professional Eye Care · Quality Lenses ·
            Stylish Frames
          </p>
          <dl className="mt-9 flex gap-9 border-t border-[#1F1A15]/10 pt-6">
            {stats.map(([n, l]) => (
              <div key={l}>
                <dt className="text-2xl font-semibold">{n}</dt>
                <dd className="mt-1 text-xs text-[#1F1A15]/55">{l}</dd>
              </div>
            ))}
          </dl>
        </div>

        <Photo
          src="/assets/images/vision-1.png"
          alt="Smiling woman wearing round glasses"
          tone="bg-[#CDBBA3]"
          className="aspect-[4/4.4] rounded-3xl"
        >
          <div className="absolute left-4 top-4 flex items-center gap-2 rounded-xl bg-white/90 px-3 py-2 shadow-sm backdrop-blur">
            <Eye size={16} />
            <span className="text-xs leading-tight">
              <b className="block font-medium">Certified Optometrists</b>
              <span className="text-[#1F1A15]/55">Trusted choice care</span>
            </span>
          </div>
          <div className="absolute inset-x-4 bottom-4 flex items-center justify-between rounded-2xl bg-[#1F1A15]/85 p-3 text-white backdrop-blur">
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
        </Photo>
      </div>

      {/* service marquee strip */}
      <ul className="mt-14 flex flex-wrap justify-between gap-x-6 gap-y-2 border-y border-[#1F1A15]/10 bg-[#F1E7D8]/60 px-4 py-3 text-[11px] font-medium tracking-[0.16em] text-[#1F1A15]/60 uppercase">
        {[
          "Comprehensive exams",
          "Prescription frames",
          "Precision lenses",
          "Personal styling",
          "Aftercare support",
        ].map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>

      {/* intro */}
      <div className="mt-20 grid items-center gap-12 lg:grid-cols-2">
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
        <div>
          <p className="mb-3 text-xs font-medium tracking-[0.18em] text-[#8A6A4A] uppercase">
            Your vision, our priority
          </p>
          <h2 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            Your vision deserves more than an ordinary pair of glasses.
          </h2>
          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-[#1F1A15]/65">
            Your eyes are unique. Your eyewear should be too. We combine
            professional eye examinations with carefully selected frames and
            quality lenses to give you a complete vision care experience.
          </p>
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
        </div>
      </div>
    </section>
  );
}

function EyeCare() {
  return (
    <section id="eye-care" className="mx-auto max-w-6xl px-5 py-20">
      <div className="mx-auto max-w-2xl text-center">
        <Heading kicker="What we do" center>
          Everything you need for better vision.
        </Heading>
        <p className="mt-4 text-[15px] text-[#1F1A15]/65">
          From understanding your eyes to finding eyewear that fits your
          lifestyle, we&rsquo;re here to make vision care simple.
        </p>
      </div>
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {SERVICES.map((s, i) => (
          <article
            key={s.title}
            className="flex flex-col rounded-2xl border border-[#1F1A15]/10 bg-white p-6"
          >
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
        ))}
      </div>
    </section>
  );
}

function Eyewear() {
  return (
    <section id="eyewear" className="bg-[#F1E7D8]/70 py-20">
      <div className="mx-auto max-w-6xl px-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
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
          </div>
          <Button href="#contact" dark={false}>
            Explore Our Frames <ArrowRight size={14} />
          </Button>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-[1fr_1.6fr]">
          <Photo
            src="/assets/images/person-1.jpg"
            alt="Black round acetate sunglasses"
            tone="bg-[#E8E3DC]"
            className="min-h-90 rounded-2xl"
          >
            <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-[11px]">
              {FRAMES[0].tag}
            </span>
            <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/60 to-transparent p-5 pt-16 text-white font-medium">
              {FRAMES[0].name}
            </div>
          </Photo>

          <div className="grid gap-4">
            <FrameCard
              f={FRAMES[1]}
              src="/assets/images/modern-rectangular.jpg"
              tone="bg-[#E2C9A0]"
              tall
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <FrameCard
                f={FRAMES[2]}
                src="/images/frame-light.jpg"
                tone="bg-[#BFC8B8]"
              />
              <FrameCard
                f={FRAMES[3]}
                src="/images/frame-bold.jpg"
                tone="bg-[#B58B5E]"
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#1F1A15] p-4 pl-6 text-white">
              <div>
                <p className="font-medium">Not sure what suits you?</p>
                <p className="text-xs text-white/60">
                  Try our guided face-shape styling in store.
                </p>
              </div>
              <a
                href="#contact"
                className="rounded-full bg-[#FAF5EE] px-4 py-2 text-sm font-medium text-[#1F1A15]"
              >
                Get styled
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

type FrameCardProps = { f: Frame; src: string; tone: string; tall?: boolean };

function FrameCard({ f, src, tone, tall }: FrameCardProps) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white">
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
  );
}

function Lenses() {
  const [open, setOpen] = useState(0);
  return (
    <section id="lenses" className="bg-[#181410] py-20 text-white">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 lg:grid-cols-2">
        <div>
          <Heading kicker="Lens technology" light>
            Clearer vision starts with the right lens.
          </Heading>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-white/60">
            Every prescription is surfaced, coated, and checked by hand, so what
            you see is crisp, comfortable, and protected.
          </p>
          <ul className="mt-8 space-y-2">
            {LENS_FEATURES.map((f, i) => {
              const isOpen = open === i;
              return (
                <li
                  key={f.title}
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
                  {isOpen && (
                    <p className="px-4 pb-4 pl-15 text-sm leading-relaxed text-white/60">
                      {f.body}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
          <a
            href="#contact"
            className="mt-7 inline-block rounded-full bg-[#FAF5EE] px-5 py-3 text-sm font-medium text-[#1F1A15]"
          >
            Explore Lens Options
          </a>
        </div>

        <Photo
          src="/images/lens-amber.jpg"
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
      </div>
    </section>
  );
}

function About() {
  return (
    <section id="about" className="mx-auto max-w-6xl px-5 py-20">
      <div className="grid items-start gap-12 lg:grid-cols-2">
        <div>
          <Heading kicker="Why choose us">
            Vision care with a personal touch.
          </Heading>
          <Photo
            src="/images/consultation.jpg"
            alt="Customer trying on glasses with an optometrist"
            tone="bg-[#D8C4A8]"
            className="mt-8 aspect-[4/2.7] rounded-2xl"
          />
        </div>
        <ol className="lg:pt-14">
          {REASONS.map((r, i) => (
            <li
              key={r.title}
              className="flex items-start gap-5 border-t border-[#1F1A15]/10 py-6 last:border-b"
            >
              <span className="text-sm text-[#8A6A4A]">0{i + 1}</span>
              <div className="flex-1">
                <h3 className="font-semibold">{r.title}</h3>
                <p className="mt-1 text-sm text-[#1F1A15]/60">{r.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* checkup banner */}
      <div className="mt-20">
        <Photo
          src="/images/checkup-booking.jpg"
          alt="Woman booking an appointment on her phone"
          tone="bg-[#6B4A2B]"
          className="rounded-3xl"
        >
          <div className="absolute inset-0 bg-linear-to-r from-black/70 via-black/40 to-transparent" />
          <div className="relative max-w-lg p-8 py-14 text-white sm:p-12 sm:py-20">
            <p className="mb-3 text-xs tracking-[0.18em] text-[#E3C49B] uppercase">
              Eye checkup
            </p>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              When was your last eye checkup?
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-white/75">
              Whether you&rsquo;re experiencing changes in your vision or simply
              due for a routine checkup, take the first step today.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button href="#contact" dark={false} className="bg-[#FAF5EE]!">
                Book Eye Checkup <ArrowRight size={14} />
              </Button>
              <a
                href="#contact"
                className="inline-flex items-center rounded-full border border-white/40 px-5 py-3 text-sm font-medium text-white hover:bg-white/10"
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
          </div>
        </Photo>
      </div>

      {/* how it works: a real sequence */}
      <div className="mt-24">
        <Heading kicker="How it works" center>
          Simple, from start to clear sight.
        </Heading>
        <ol className="mt-10 grid overflow-hidden rounded-2xl border border-[#1F1A15]/10 bg-white sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <li
              key={s.title}
              className="border-b border-[#1F1A15]/10 p-6 lg:border-b-0 lg:border-r lg:last:border-r-0"
            >
              <span className="text-3xl font-light text-[#1F1A15]/20">
                0{i + 1}
              </span>
              <h3 className="mt-4 font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm text-[#1F1A15]/60">{s.text}</p>
            </li>
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
          {REVIEWS.map((r) => (
            <figure
              key={r.name}
              className="flex flex-col rounded-2xl border border-[#1F1A15]/10 bg-white p-6"
            >
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
          ))}
        </div>
      </div>
    </section>
  );
}

function ContactCta() {
  return (
    <div className="mx-auto max-w-6xl px-5 pt-24 pb-20 text-center">
      <span className="mx-auto mb-5 grid h-12 w-12 place-items-center rounded-full bg-[#F1E7D8] text-[#8A6A4A]">
        <Eye size={20} />
      </span>
      <h2 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
        Ready to see the difference?
      </h2>
      <p className="mx-auto mt-4 max-w-md text-[15px] text-[#1F1A15]/65">
        Whether you need an eye checkup, a new prescription, or your next pair
        of glasses, we&rsquo;re ready to help.
      </p>
      <div className="mt-7 flex justify-center gap-3">
        <Button href="#enquiry">Book an Eye Checkup</Button>
        <Button href="#enquiry" dark={false}>
          Contact Us
        </Button>
      </div>
    </div>
  );
}

function Contact() {
  const [sent, setSent] = useState(false);
  const details: { icon: LucideIcon; label: string; value: string }[] = [
    { icon: Phone, label: "Phone", value: "+234 800 123 4567" },
    { icon: MessageCircle, label: "WhatsApp", value: "+234 800 123 4567" },
    { icon: Mail, label: "Email", value: "hello@countryvision.com" },
    {
      icon: MapPin,
      label: "Location",
      value: "14 Admiralty Way, Lekki Phase 1, Lagos",
    },
    { icon: Clock, label: "Opening hours", value: "Mon – Sat · 9:00 – 16:00" },
  ];
  const field =
    "w-full rounded-xl border border-[#1F1A15]/10 bg-[#FAF5EE] px-4 py-3 text-sm placeholder:text-[#1F1A15]/40 focus:border-[#8A6A4A] focus:outline-none";

  return (
    <section id="contact" className="mx-auto max-w-6xl px-5 pb-20">
      <div
        id="enquiry"
        className="grid overflow-hidden rounded-3xl border border-[#1F1A15]/10 bg-white lg:grid-cols-2"
      >
        <div className="p-8 sm:p-10">
          <p className="mb-3 text-xs font-medium tracking-[0.18em] text-[#8A6A4A] uppercase">
            Get in touch
          </p>
          <h2 className="text-3xl font-semibold tracking-tight">
            Let&rsquo;s talk about your vision.
          </h2>
          <ul className="mt-8 space-y-5">
            {details.map((d) => (
              <li key={d.label} className="flex items-start gap-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#F1E7D8] text-[#8A6A4A]">
                  <d.icon size={16} />
                </span>
                <span className="text-sm leading-tight">
                  <span className="block text-xs text-[#1F1A15]/50">
                    {d.label}
                  </span>
                  <b className="mt-1 block font-medium">{d.value}</b>
                </span>
              </li>
            ))}
          </ul>
          <a
            href="https://wa.me/2348001234567"
            className="mt-8 flex items-center justify-center gap-2 rounded-full bg-[#1F3B2D] px-5 py-3 text-sm font-medium text-white hover:bg-[#2a4e3d]"
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
            <p
              role="status"
              className="mt-8 rounded-xl bg-[#F1E7D8] p-5 text-sm"
            >
              Thanks, your enquiry is sent. We&rsquo;ll be in touch within one
              business day.
            </p>
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
                <select className={field} aria-label="Service" defaultValue="">
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
              <button className="mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-[#1F1A15] px-5 py-3 text-sm font-medium text-white hover:bg-[#3a3027]">
                Send Enquiry <Send size={14} />
              </button>
              <p className="text-center text-[11px] text-[#1F1A15]/50">
                Prefer to talk? Call us on +234 800 123 4567
              </p>
            </form>
          )}
        </div>
      </div>
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
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <p className="font-semibold">{BRAND}</p>
          <p className="mt-2 text-sm text-white/55">
            Better vision. Better choices. Better care.
          </p>
          <div className="mt-5 flex gap-2">
            {SOCIALS.map((so) => (
              <a
                key={so.label}
                href="#"
                aria-label={so.label}
                className="grid h-9 w-9 place-items-center rounded-full border border-white/15 text-[11px] font-medium text-white/70 hover:bg-white/10"
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
          <a href="tel:+2348001234567">+234 800 123 4567</a>
          <a href="https://wa.me/2348001234567">WhatsApp us</a>
        </FooterCol>
      </div>
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
      <div className="flex flex-col gap-3 text-sm text-white/75 [&_a:hover]:text-white">
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

  return (
    <>
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
