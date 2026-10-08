import { MessagesCircle } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";

export const SUPPORT_PHONES = [
  { position: "Sales Team 1", phone: "+233242643330" },
  { position: "Sales Team 2", phone: "+233208325272" },
];

const WHATSAPP_GREEN = "#25D366";

const formatPhone = (raw: string) =>
  raw.replace(/^\+233(\d{2})(\d{3})(\d{4})$/, "+233 $1 $2 $3");

// wa.me links take digits only — no "+" or spaces.
const toWaLink = (raw: string) => `https://wa.me/${raw.replace(/\D/g, "")}`;


// isNormal: rendered outside the portal (public/logged-out pages), where
// there's no persistent sidebar to clear, so it sits at a flat left-6.
// Inside the portal (default), it tracks the sidebar's collapsed/expanded
// width so it never overlaps it.
export default function WhatsappFab({  }: { isNormal?: boolean }) {

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={
          <button
          className={`group fixed bottom-6 left-6 z-90 flex items-center rounded-full p-5 text-white shadow-lg transition-all duration-300 ease-in-out animate-in fade-in slide-in-from-bottom-4 zoom-in-90 hover:shadow-xl`}
          style={{ background: WHATSAPP_GREEN, animationDuration: "500ms" }}
          title="Chat with us on WhatsApp"
        >
          {/* Soft attention ring, looping behind the icon — off on hover (so
              it doesn't fight the label reveal) and for
              prefers-reduced-motion via motion-safe:. */}
          <span
            aria-hidden="true"
            className="absolute inset-0 rounded-full transition-opacity duration-300 motion-safe:animate-fab-pulse group-hover:opacity-0"
            style={{ background: WHATSAPP_GREEN }}
          />
          <span className="relative flex shrink-0 items-center justify-center">
            <MessagesCircle size={26}/>
          </span>
          <span className="relative max-w-0 overflow-hidden whitespace-nowrap text-xs font-semibold opacity-0 transition-all duration-300 ease-in-out group-hover:ml-2 group-hover:max-w-28 group-hover:opacity-100">
            Chat with us
          </span>
        </button>
      } />

      <DropdownMenuContent
        align="start"
        side="top"
        sideOffset={12}
        className="min-w-64 max-w-80 rounded-xl border-slate-200 bg-white p-1.5 text-slate-700 shadow-xl"
      >
        <div
          className="mb-1 rounded-lg px-2.5 py-2 text-white"
          style={{ background: WHATSAPP_GREEN }}
        >
          <p className="text-sm font-bold">Start a conversation</p>
          <p className="text-[10px] opacity-90">
            Click on any member of our team to chat with them on WhatsApp.
          </p>
        </div>

        {SUPPORT_PHONES.map((val) => (
          <DropdownMenuItem
            key={val.phone}
            className="hover:cursor-pointer focus:bg-slate-50"
          >
            <a
              href={toWaLink(val.phone)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 px-2.5 py-2 text-[12.5px] hover:bg-slate-50"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: `${WHATSAPP_GREEN}1A` }}
              >
                            <MessagesCircle size={15}/>

              </div>
              <div className="flex flex-col">
                <span className="text-slate-400 text-xs">{val.position}</span>
                <span className="font-medium text-slate-800 text-sm">
                  {formatPhone(val.phone)}
                </span>
              </div>
            </a>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
