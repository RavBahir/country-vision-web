// app/portal/dashboard/StatTile.tsx
import { Card } from "@/components/portal/UI";
import type { ReactNode } from "react";

export default function StatTile({
  label, value, note, dark,
}: { label: string; value: ReactNode; note?: ReactNode; dark?: boolean }) {
  const body = (
    <>
      <p className={`text-sm ${dark ? "text-white/60" : "text-[#1F1A15]/55"}`}>{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight tabular-nums">{value}</p>
      {note && <p className={`mt-1 text-xs ${dark ? "text-white/45" : "text-[#1F1A15]/50"}`}>{note}</p>}
    </>
  );
  return dark
    ? <div className="rounded-3xl bg-[#12100D] p-6 text-white">{body}</div>
    : <Card className="p-6">{body}</Card>;
}

export const TilesSkeleton = () => (
  <div aria-busy="true" className="space-y-6">
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {[0, 1, 2, 3].map((i) => <div key={i} className="h-32 animate-pulse rounded-3xl bg-[#F1E7D8]" />)}
    </div>
    <div className="h-64 animate-pulse rounded-3xl bg-[#F1E7D8]" />
  </div>
);