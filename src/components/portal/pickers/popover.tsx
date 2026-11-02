// components/portal/pickers/popover.tsx
"use client";

import { createPortal } from "react-dom";
import {
  useEffect, useLayoutEffect, useRef, useState,
  type CSSProperties, type ReactNode, type RefObject,
} from "react";

export function FieldShell({
  id, label, hint, error, optional, children,
}: { id: string; label?: string; hint?: string; error?: string; optional?: boolean; children: ReactNode }) {
  return (
    <div>
      {label && (
        <label htmlFor={id} className="mb-2 block text-sm font-medium">
          {label}{optional && <span className="font-normal text-[#1F1A15]/45"> (optional)</span>}
        </label>
      )}
      {children}
      {(error || hint) && (
        <p id={`${id}-msg`} className={`mt-2 text-xs ${error ? "text-[#8E3524]" : "text-[#1F1A15]/50"}`}>{error ?? hint}</p>
      )}
    </div>
  );
}

export const fieldRing = (error?: string) => (error ? "!border-[#8E3524] !bg-white" : "");

const GAP = 6;
const MARGIN = 8;

/**
 * Renders children in a fixed-position panel under `anchorRef`, flips above when
 * there's no room, and closes on outside press or Escape. Inside a modal it
 * portals into the dialog, because modals block pointer events on anything
 * outside their own content.
 */
export function PopoverPortal({
  open, anchorRef, onClose, matchWidth = false, className = "", children,
}: {
  open: boolean;
  anchorRef: RefObject<HTMLElement | null>;
  onClose: (reason: "escape" | "outside") => void;
  matchWidth?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  // opacity, not visibility: hidden elements can't take focus, and children focus on mount
  const [style, setStyle] = useState<CSSProperties>({ position: "fixed", top: 0, left: 0, opacity: 0 });

  useLayoutEffect(() => {
    if (!open) return;
    const place = (e?: Event) => {
      const a = anchorRef.current, p = panelRef.current;
      if (!a || !p) return;
      if (e?.target instanceof Node && p.contains(e.target)) return; // scrolling inside the panel
      const r = a.getBoundingClientRect();
      const vw = document.documentElement.clientWidth;
      const vh = window.innerHeight;
      const w = matchWidth ? r.width : p.offsetWidth;
      const left = Math.max(MARGIN, Math.min(r.left, vw - w - MARGIN));
      let top = r.bottom + GAP;
      if (top + p.offsetHeight > vh - MARGIN) {
        const above = r.top - GAP - p.offsetHeight;
        top = above >= MARGIN ? above : Math.max(MARGIN, vh - MARGIN - p.offsetHeight);
      }
      setStyle({ position: "fixed", top, left, width: matchWidth ? r.width : undefined, zIndex: 9999, opacity: 1 });
    };
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    const ro = new ResizeObserver(() => place()); // options load, height changes
    if (panelRef.current) ro.observe(panelRef.current);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
      ro.disconnect();
    };
  }, [open, matchWidth, anchorRef]);

  useEffect(() => {
    if (!open) return;
    const down = (e: PointerEvent) => {
      const t = e.target as Node;
      if (panelRef.current?.contains(t) || anchorRef.current?.contains(t)) return;
      closeRef.current("outside");
    };
    const key = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.stopPropagation(); // don't also close a modal behind it
      closeRef.current("escape");
    };
    document.addEventListener("pointerdown", down);
    document.addEventListener("keydown", key, true);
    return () => {
      document.removeEventListener("pointerdown", down);
      document.removeEventListener("keydown", key, true);
    };
  }, [open, anchorRef]);

  if (!open) return null;
  const target = anchorRef.current?.closest('[role="dialog"]') ?? document.body;
  return createPortal(<div ref={panelRef} style={style} className={className}>{children}</div>, target);
}