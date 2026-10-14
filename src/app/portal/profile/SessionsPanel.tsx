"use client";

import { useState } from "react";
import { LogOut, MapPin, Monitor, ShieldAlert, Smartphone, Tablet, type LucideIcon } from "lucide-react";
import { Badge, Button, Card, Modal } from "@/components/portal/UI";
import type { AuthSessionInfo } from "@/lib/portal-data";

const ICONS: Record<AuthSessionInfo["device"], LucideIcon> = { desktop: Monitor, mobile: Smartphone, tablet: Tablet };

export function activeLabel(minutes: number): string {
  if (minutes < 2) return "Active now";
  if (minutes < 60) return `${minutes} minutes ago`;
  const h = Math.floor(minutes / 60);
  if (h < 24) return `${h} ${h === 1 ? "hour" : "hours"} ago`;
  const d = Math.floor(h / 24);
  return `${d} ${d === 1 ? "day" : "days"} ago`;
}

export default function SessionsPanel({
  sessions, onRevoke, onRevokeOthers,
}: { sessions: AuthSessionInfo[]; onRevoke: (id: string) => void; onRevokeOthers: () => void }) {
  const [confirmAll, setConfirmAll] = useState(false);
  const [target, setTarget] = useState<AuthSessionInfo | null>(null);
  const current = sessions.find((s) => s.current);
  const others = sessions.filter((s) => !s.current);

  const Row = ({ s }: { s: AuthSessionInfo }) => {
    const Icon = ICONS[s.device];
    return (
      <li className="flex flex-wrap items-center gap-4 py-5 first:pt-0 last:pb-0">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#F1E7D8] text-[#8A6A4A]"><Icon size={20} /></span>
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-2 font-semibold">
            {s.browser} on {s.os}
            {s.current && <Badge tone="success">This device</Badge>}
          </p>
          <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-[#1F1A15]/60">
            <span className="flex items-center gap-1.5"><MapPin size={13} /> {s.location}</span>
            <span>IP {s.ip}</span>
            <span>Signed in with {s.method}</span>
          </p>
          <p className={`mt-1 text-xs ${s.lastActiveMinutesAgo < 2 ? "text-[#3B5A2C]" : "text-[#1F1A15]/50"}`}>{activeLabel(s.lastActiveMinutesAgo)}</p>
        </div>
        {!s.current && <Button variant="secondary" className="px-4 py-2" onClick={() => setTarget(s)}><LogOut size={14} /> Sign out</Button>}
      </li>
    );
  };

  return (
    <div className="grid items-start gap-6 xl:grid-cols-[1.6fr_1fr]">
      <div className="space-y-6">
        {current && (
          <Card className="p-6">
            <h2 className="mb-5 text-lg font-semibold tracking-tight">This device</h2>
            <ul><Row s={current} /></ul>
          </Card>
        )}
        <Card className="p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold tracking-tight">Other devices <span className="font-normal text-[#1F1A15]/45">({others.length})</span></h2>
            {others.length > 0 && <Button variant="danger" className="px-4 py-2" onClick={() => setConfirmAll(true)}>Sign out of all other devices</Button>}
          </div>
          {others.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-[#E6D9C6] p-6 text-center text-sm text-[#1F1A15]/55">You're only signed in on this device.</p>
          ) : (
            <ul className="divide-y divide-[#E6D9C6]">{others.map((s) => <Row key={s.id} s={s} />)}</ul>
          )}
        </Card>
      </div>

      <div className="rounded-3xl bg-[#12100D] p-6 text-white">
        <ShieldAlert size={20} className="text-[#C9A57B]" />
        <h2 className="mt-3 font-semibold">Don't recognise a device?</h2>
        <p className="mt-2 text-sm leading-relaxed text-white/65">Sign it out straight away, then change your password in the Security tab. Sessions also expire on their own after 30 days of inactivity.</p>
      </div>

      <Modal
        open={target !== null}
        onClose={() => setTarget(null)}
        title="Sign out this device?"
        footer={<div className="flex justify-end gap-3"><Button variant="secondary" onClick={() => setTarget(null)}>Cancel</Button><Button onClick={() => { if (target) onRevoke(target.id); setTarget(null); }}>Sign out</Button></div>}
      >
        {target && <p className="text-[15px] leading-relaxed text-[#1F1A15]/70"><b>{target.browser} on {target.os}</b> ({target.location}) will be signed out and will need to sign in again.</p>}
      </Modal>

      <Modal
        open={confirmAll}
        onClose={() => setConfirmAll(false)}
        title="Sign out of all other devices?"
        footer={<div className="flex justify-end gap-3"><Button variant="secondary" onClick={() => setConfirmAll(false)}>Cancel</Button><Button onClick={() => { onRevokeOthers(); setConfirmAll(false); }}>Sign out {others.length} {others.length === 1 ? "device" : "devices"}</Button></div>}
      >
        <p className="text-[15px] leading-relaxed text-[#1F1A15]/70">You'll stay signed in here. Every other browser and phone will need to sign in again.</p>
      </Modal>
    </div>
  );
}