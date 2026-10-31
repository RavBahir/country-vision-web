import { ButtonProps, CountUp, MaskLine, Photo, Reveal, IStat } from "@/app/common";
import { allRoutes } from "@/routes/routes";
import { ArrowRight, BadgeCheck, CalendarCheck, Eye, Glasses } from "lucide-react";

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


function Hero() {
  const stats: IStat[] = [
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
                Better care.``
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
              <Button href={allRoutes.LOGIN}>
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
                    href={allRoutes.LOGIN}
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

export default Hero