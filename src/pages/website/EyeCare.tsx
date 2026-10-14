import { Heading, Reveal, IService } from "@/app/common";
import { ArrowRight, Eye, Glasses, Ruler, Sparkles } from "lucide-react";

const SERVICES: IService[] = [
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

export default EyeCare