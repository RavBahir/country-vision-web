import type { Metadata } from "next";
import type { ReactNode } from "react";
import PortalShell from "./PortalShell";

export const metadata: Metadata = {
  title: { default: "Client Portal | Country Vision", template: "%s | Country Vision" },
};

export default function PortalLayout({ children }: { children: ReactNode }) {
  return <PortalShell>{children}</PortalShell>;
}