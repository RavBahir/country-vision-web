import { CButton, Heading, IReason, IStep, Photo, Reveal } from "@/app/common";
import { allRoutes } from "@/routes/routes";
import { ArrowRight, Clock, MapPin } from "lucide-react";

const REASONS: IReason[] = [
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

const STEPS: IStep[] = [
  { title: "Book", text: "Schedule your eye examination." },
  { title: "Check", text: "Complete your professional eye exam." },
  { title: "Choose", text: "Select frames and lenses suited to your needs." },
  { title: "See Clearly", text: "Walk away with eyewear designed for you." },
];


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
                <CButton href={allRoutes.LOGIN} dark={false} className="bg-[#FAF5EE]!">
                  Book Eye Checkup <ArrowRight size={14} />
                </CButton>
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

export default About