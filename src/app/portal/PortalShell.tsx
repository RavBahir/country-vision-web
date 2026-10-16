"use client";

import TopNav from "@/pages/layout/Header";
import Sidebar from "@/pages/layout/Sidebar";
import { useState, type ReactNode } from "react";

export default function PortalShell({ children }: { children: ReactNode }) {
  const [drawer, setDrawer] = useState(false);

  return (
    <div className="min-h-screen bg-[#FAF5EE] text-[#1F1A15]">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-90 focus:rounded-full focus:bg-white focus:px-4 focus:py-2"
      >
        Skip to content
      </a>

      <div className="mx-auto flex gap-6 p-4 lg:p-6">
        {/* desktop sidebar */}
        <Sidebar drawer={drawer} setDrawer={setDrawer} />

        <div className="min-w-0 flex-1">
          {/* top bar */}

          <TopNav drawer={drawer} setDrawer={setDrawer} />

          <main id="main" className="mt-6 pb-10">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
