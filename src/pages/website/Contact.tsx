import { Reveal } from "@/app/common";
import { COMPANY_EMAIL, COMPANY_PHONE, WHATSAPP_LINK, WHATSAPP_PHONE } from "@/lib/constants";
import { Clock, LucideIcon, Mail, MapPin, MessageCircle, Phone, Send } from "lucide-react";
import { FormEvent, useState } from "react";

function Contact() {
  const [sent, setSent] = useState(false);
  const details: { icon: LucideIcon; label: string; value: string }[] = [
    { icon: Phone, label: "Phone", value: COMPANY_PHONE },
    { icon: MessageCircle, label: "WhatsApp", value: WHATSAPP_PHONE },
    { icon: Mail, label: "Email", value: COMPANY_EMAIL },
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
              href={WHATSAPP_LINK}
              className="mt-8 flex items-center justify-center gap-2 rounded-full bg-[#1F3B2D] px-5 py-3 text-sm font-medium text-white transition-[background-color,transform] duration-200 hover:bg-[#2a4e3d] active:scale-[0.98]">
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
                  Prefer to talk? Call us on {COMPANY_PHONE}.
                </p>
              </form>
            )}
          </div>
        </div>
      </Reveal>
    </section>
  );
}

export default Contact