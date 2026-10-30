// app/portal/dashboard/page.tsx
"use client";

import { useSession } from "@/modules/auth/session";
import CustomerDashboard from "./CustomerDashboard";
import StaffDashboard from "./StaffDashboard";
import { TilesSkeleton } from "./StatTile";

export default function DashboardPage() {
  const { session, isLoading } = useSession();
  if (isLoading || !session) return <TilesSkeleton />;

  const name = session.user_validation_info.name ?? "";
  return session.kind === "customer"
    ? <CustomerDashboard name={name} />
    : <StaffDashboard name={name} />;
}