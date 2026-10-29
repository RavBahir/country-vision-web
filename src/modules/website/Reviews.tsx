import { Heading, Reveal, IReview } from "@/app/common";
import { Quote } from "lucide-react";

const REVIEWS: IReview[] = [
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

export default Reviews