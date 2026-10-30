// Contact.tsx
import { Reveal } from "@/app/common";
import { COMPANY_EMAIL, COMPANY_PHONE, WHATSAPP_LINK, WHATSAPP_PHONE } from "@/lib/constants";
import { Clock, LucideIcon, Mail, MapPin, MessageCircle, Phone, Send } from "lucide-react";
import { FormEvent, useState } from "react";
import { submitEnquiry } from "../enquiries/common/enquiries-api";
import { SERVICE_OPTIONS } from "../enquiries/common/enquiries";

const EMPTY = { name: "", email: "", phone: "", service: "", message: "", website: "" };

function Contact() {
  const [values, setValues] = useState(EMPTY);
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof typeof EMPTY) => (e: { target: { value: string } }) =>
    setValues((v) => ({ ...v, [k]: e.target.value }));

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (state === "sending") return;
    setError(null);
    setState("sending");
    try {
      await submitEnquiry({
        name: values.name.trim(),
        email: values.email.trim(),
        phone: values.phone.trim() || undefined,
        service: values.service || "other",
        message: values.message.trim(),
        website: values.website, // honeypot
      });
      setValues(EMPTY);
      setState("sent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setState("idle");
    }
  };

  const details: { icon: LucideIcon; label: string; value: string }[] = [
    { icon: Phone, label: "Phone", value: COMPANY_PHONE },
    { icon: MessageCircle, label: "WhatsApp", value: WHATSAPP_PHONE },
    { icon: Mail, label: "Email", value: COMPANY_EMAIL },
    { icon: MapPin, label: "Location", value: "Awoshie Baah Yard, Accra, Ghana" },
    { icon: Clock, label: "Opening hours", value: "Mon – Sat · 9:00 – 16:00" },
  ];
  const field =
    "w-full rounded-xl border border-[#1F1A15]/10 bg-[#FAF5EE] px-4 py-3 text-sm transition-colors duration-200 placeholder:text-[#1F1A15]/40 focus:border-[#8A6A4A] focus:outline-none disabled:opacity-60";
  const busy = state === "sending";

  return (
    <section id="contact" className="mx-auto max-w-6xl scroll-mt-16 px-5 pb-20">
      <Reveal duration={1000}>
        <div id="enquiry" className="grid scroll-mt-20 overflow-hidden rounded-3xl border border-[#1F1A15]/10 bg-white lg:grid-cols-2">
          <div className="p-8 sm:p-10">
            <p className="mb-3 text-xs font-medium tracking-[0.18em] text-[#8A6A4A] uppercase">Get in touch</p>
            <h2 className="text-3xl font-semibold tracking-tight">Let&rsquo;s talk about your vision.</h2>
            <ul className="mt-8 space-y-5">
              {details.map((d, i) => (
                <Reveal as="li" key={d.label} delay={200 + i * 90} className="flex items-start gap-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#F1E7D8] text-[#8A6A4A]">
                    <d.icon size={16} />
                  </span>
                  <span className="text-sm leading-tight">
                    <span className="block text-xs text-[#1F1A15]/50">{d.label}</span>
                    <b className="mt-1 block font-medium">{d.value}</b>
                  </span>
                </Reveal>
              ))}
            </ul>
            <a
              href={WHATSAPP_LINK}
              className="mt-8 flex items-center justify-center gap-2 rounded-full bg-[#1F3B2D] px-5 py-3 text-sm font-medium text-white transition-[background-color,transform] duration-200 hover:bg-[#2a4e3d] active:scale-[0.98]"
            >
              <MessageCircle size={16} /> Chat on WhatsApp
            </a>
          </div>

          <div className="border-t border-[#1F1A15]/10 bg-[#FBF8F3] p-8 sm:p-10 lg:border-l lg:border-t-0">
            <h3 className="font-semibold">Send an enquiry</h3>
            <p className="mt-1 text-xs text-[#1F1A15]/55">We reply within one business day.</p>

            {state === "sent" ? (
              <Reveal direction="scale" duration={500}>
                <div role="status" className="mt-8 rounded-xl bg-[#F1E7D8] p-5 text-sm">
                  <p>Thanks, your enquiry is sent. We&rsquo;ll be in touch within one business day.</p>
                  <button
                    type="button"
                    onClick={() => setState("idle")}
                    className="mt-3 border-b border-[#8A6A4A]/50 font-medium"
                  >
                    Send another enquiry
                  </button>
                </div>
              </Reveal>
            ) : (
              <form className="mt-6 grid gap-3" onSubmit={submit}>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input required minLength={2} maxLength={100} className={field} placeholder="Name" aria-label="Name"
                    autoComplete="name" value={values.name} onChange={set("name")} disabled={busy} />
                  <input required type="email" maxLength={254} className={field} placeholder="Email" aria-label="Email"
                    autoComplete="email" value={values.email} onChange={set("email")} disabled={busy} />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input type="tel" maxLength={30} className={field} placeholder="Phone" aria-label="Phone"
                    autoComplete="tel" value={values.phone} onChange={set("phone")} disabled={busy} />
                  <select className={field} aria-label="Service" value={values.service} onChange={set("service")} disabled={busy}>
                    <option value="" disabled>Service</option>
                    {SERVICE_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
                <textarea required minLength={10} maxLength={2000} rows={5} className={field}
                  placeholder="Tell us how we can help" aria-label="Message"
                  value={values.message} onChange={set("message")} disabled={busy} />

                {/* honeypot: hidden from people and assistive tech, bots fill it */}
                <input
                  type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true"
                  value={values.website} onChange={set("website")}
                  className="absolute left-[-9999px] h-0 w-0 opacity-0"
                />

                {error && (
                  <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
                )}

                <button
                  disabled={busy}
                  className="mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-[#1F1A15] px-5 py-3 text-sm font-medium text-white transition-[background-color,transform] duration-200 hover:bg-[#3a3027] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {busy ? "Sending…" : <>Send Enquiry <Send size={14} /></>}
                </button>
                <p className="text-center text-[11px] text-[#1F1A15]/50">Prefer to talk? Call us on {COMPANY_PHONE}.</p>
              </form>
            )}
          </div>
        </div>
      </Reveal>
    </section>
  );
}

export default Contact;