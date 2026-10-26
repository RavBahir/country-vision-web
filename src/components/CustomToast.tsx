import { Ban, CheckCircle2, Info } from "lucide-react";
import { toast } from "sonner";

// ── Per-type design tokens (Monochrome / Black & White theme) ─────────────────

const CONFIG = {
  success: {
    icon: CheckCircle2,
    // Using high-contrast black/white accents instead of color
  },
  error: {
    icon: Ban,
  },
  info: {
    icon: Info,
  },
  warning: {
    icon: Ban,
  },
} as const;

// ── Custom toast content ──────────────────────────────────────────────────────

function ToastContent({
  type,
  title,
  message,
}: {
  type: keyof typeof CONFIG;
  title: string;
  message: string;
}) {
  const { icon: Icon } = CONFIG[type];

  return (
    <div className="flex items-start gap-3 w-full font-sans">
      {/* Icon bubble */}
      <div className="shrink-0 w-9 h-9 rounded-[10px] bg-[#181410]/6 border border-[#181410]/15 flex items-center justify-center mt-0.5">
        <Icon size={16} className="text-[#181410]" strokeWidth={2.2} />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-[#181410] tracking-[-0.01em] leading-[1.3] m-0">
          {title}
        </p>
        {message && (
          <p className="text-[12px] text-[#181410]/60 leading-normal mt-0.75 mb-0">
            {message}
          </p>
        )}
      </div>

      {/* Accent dot — top-right corner */}
      <div className="shrink-0 w-1.5 h-1.5 rounded-full bg-[#181410] mt-1.5 shadow-[0_0_6px_rgba(24,20,16,0.4)]" />
    </div>
  );
}

// ── Public API ────────────────────────────────────────────────────────────────

export function showToast({
  type,
  message,
  title,
  duration = 3000,
}: {
  message: string;
  type: "error" | "success" | "info" | "warning";
  title: string;
  duration?: number;
}) {
  return toast.custom(
    () => <ToastContent type={type} title={title} message={message} />,
    {
      duration,
      position: "top-right",
      id: message,
      className: "!p-[14px_16px] !bg-[#ffffff] !border !border-[#181410]/10 !rounded-2xl !shadow-[0_4px_24px_rgba(24,20,16,0.08),_0_0_0_1px_rgba(24,20,16,0.03)] !border-l-[3px] !border-l-[#181410] !min-w-[280px] !max-w-[380px]",
    },
  );
}