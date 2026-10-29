import { CButton, IFrame, Photo, Reveal } from "@/app/common";
import { ArrowRight, ArrowUpRight } from "lucide-react";

const FRAMES: IFrame[] = [
  { tag: "Classic", name: "Timeless round acetate" },
  { tag: "Modern", name: "Sharp rectangular metal" },
  { tag: "Lightweight", name: "Featherlight rimless" },
  { tag: "Bold", name: "Statement square" },
];

type FrameCardProps = {
  f: IFrame;
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
            <CButton href="#contact" dark={false}>
              Explore Our Frames <ArrowRight size={14} />
            </CButton>
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


export default Eyewear