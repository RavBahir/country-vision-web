"use client"

import { useEffect, useRef, useState } from "react";

export interface Section {
  id: string;
  label: string;
}

interface SectionNavProps {
  sections: Section[];
  /** Height (px) reserved for the fixed header so a section doesn't land underneath it */
  offset?: number;
}

const SectionNav = ({ sections, offset = 100 }: SectionNavProps) => {
  const [activeId, setActiveId] = useState(sections[0]?.id);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const isProgrammaticScroll = useRef(false);
  const scrollEndTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const elements = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => !!el);

    if (elements.length === 0) return;

    // Apply scroll-margin-top so scrollIntoView() naturally stops below
    // the fixed header, on whichever element/container actually scrolls.
    elements.forEach((el) => {
      el.style.scrollMarginTop = `${offset}px`;
    });

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (isProgrammaticScroll.current) return;

        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: "-35% 0px -50% 0px",
        threshold: 0,
      }
    );

    elements.forEach((el) => observerRef.current?.observe(el));
    return () => observerRef.current?.disconnect();
  }, [sections, offset]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;

    setActiveId(id);
    isProgrammaticScroll.current = true;
    if (scrollEndTimeout.current) clearTimeout(scrollEndTimeout.current);

    el.scrollIntoView({ behavior: "smooth", block: "start" });

    scrollEndTimeout.current = setTimeout(() => {
      isProgrammaticScroll.current = false;
    }, 700);
  };

  return (
    <nav
      aria-label="Section navigation"
      className="fixed right-4 lg:right-6 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col gap-3 bg-white/80 backdrop-blur-md border border-gray-200 rounded-full px-2.5 py-4 shadow-lg"
    >
      {sections.map((section) => {
        const isActive = section.id === activeId;
        return (
          <button
            key={section.id}
            type="button"
            onClick={() => scrollToSection(section.id)}
            aria-label={`Go to ${section.label} section`}
            aria-current={isActive}
            className="group relative flex items-center justify-center"
          >
            <span className="absolute right-full mr-3 whitespace-nowrap px-2.5 py-1 rounded-md text-xs font-medium bg-green-800 text-white shadow-md opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 pointer-events-none">
              {section.label}
            </span>

            <span
              className={`h-1.5 rounded-full transition-all duration-300 ${
                isActive
                  ? "w-7 bg-green-700"
                  : "w-3.5 bg-gray-300 group-hover:bg-amber-400 group-hover:w-5"
              }`}
            />
          </button>
        );
      })}
    </nav>
  );
};

export default SectionNav;