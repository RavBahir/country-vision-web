import { PAGE_NAV, Reveal } from "@/app/common";
import { COMPANY_NAME, COMPANY_PHONE, WHATSAPP_LINK } from "@/lib/constants";
import { ReactNode } from "react";

const SOCIALS = [
  { label: "Instagram", short: "IG" },
  { label: "Facebook", short: "FB" },
  { label: "X (Twitter)", short: "X" },
  { label: "LinkedIn", short: "in" },
];

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
      <div className="flex flex-col gap-3 text-sm text-white/75 [&_a]:transition-colors [&_a:hover]:text-white">
        {children}
      </div>
    </div>
  );
}

function Footer({ onNavigate }: { onNavigate: (id: string) => void }) {
  const visit = PAGE_NAV.filter((n) =>
    ["home", "eye-care", "eyewear", "lenses"].includes(n.id),
  );
  const company: [string, string][] = [
    ["About", "about"],
    ["Contact", "contact"],
    ["Book an Eye Checkup", "enquiry"],
  ];
  return (
    <footer className="bg-[#181410] text-white">
      <Reveal direction="fade" duration={1000}>
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2">
              <img
                src="/assets/images/logo.png"
                className="w-9 h-9"
                alt={COMPANY_NAME}
              />
              <p className="font-semibold">{COMPANY_NAME}</p>
            </div>
            <p className="mt-2 text-sm text-white/55">
              Better vision. Better choices. Better care.
            </p>
            <div className="mt-5 flex gap-2">
              {SOCIALS.map((so) => (
                <a
                  key={so.label}
                  href="#"
                  aria-label={so.label}
                  className="grid h-9 w-9 place-items-center rounded-full border border-white/15 text-[11px] font-medium text-white/70 transition-colors duration-200 hover:bg-white/10"
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
            <a href={`tel:${COMPANY_PHONE.replace(/\s/g, "")}`}>
              {COMPANY_PHONE}
            </a>
            <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
              WhatsApp us
            </a>
            <a href="/login">Login</a>
          </FooterCol>
        </div>
      </Reveal>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-3 px-5 py-5 text-xs text-white/45">
          <p>
            © {new Date().getFullYear()} {COMPANY_PHONE}. All rights reserved.
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

export default Footer;
