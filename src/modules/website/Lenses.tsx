import { Heading, ILensFeature, Photo, Reveal } from "@/app/common";
import { Contrast, Minus, Monitor, Plus, Ruler, ShieldCheck, Sparkles, Sun } from "lucide-react";
import { useState } from "react";

const LENS_FEATURES: ILensFeature[] = [
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

export default Lenses