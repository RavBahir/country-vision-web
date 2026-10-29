"use client";

import About from "@/modules/website/About";
import Contact from "@/modules/website/Contact";
import ContactCta from "@/modules/website/ContactCTA";
import EyeCare from "@/modules/website/EyeCare";
import Eyewear from "@/modules/website/EyeWear";
import Footer from "@/modules/website/Footer";
import Hero from "@/modules/website/Hero";
import Lenses from "@/modules/website/Lenses";
import Reviews from "@/modules/website/Reviews";
import {
  useEffect
} from "react";
import { Header, PAGE_NAV, ScrollProgress, useActiveSection, usePrefersReducedMotion } from "./common";


/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function Page() {
  const ids = PAGE_NAV.map((n) => n.id);
  const [active, setActive] = useActiveSection(ids);
  const reduced = usePrefersReducedMotion();

  // Smooth anchor scrolling, unless the visitor prefers reduced motion.
  useEffect(() => {
    const root = document.documentElement;
    const previous = root.style.scrollBehavior;
    root.style.scrollBehavior = reduced ? "auto" : "smooth";
    return () => {
      root.style.scrollBehavior = previous;
    };
  }, [reduced]);

  return (
    <>
      <ScrollProgress />
      <a
        href="#eye-care"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-60 focus:rounded-full focus:bg-white focus:px-4 focus:py-2"
      >
        Skip to content
      </a>
      <Header active={active} onNavigate={setActive} />
      <main>
        <Hero />
        <EyeCare />
        <Eyewear />
        <Lenses />
        <About />
        <Reviews />
        <ContactCta />
        <Contact />
      </main>
      <Footer onNavigate={setActive} />
    </>
  );
}