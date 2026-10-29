import { CButton, Reveal } from "@/app/common";
import { Eye } from "lucide-react";

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
          <CButton href="#enquiry">Book an Eye Checkup</CButton>
          <CButton href="#enquiry" dark={false}>
            Contact Us
          </CButton>
        </div>
      </Reveal>
    </div>
  );
}

export default ContactCta