// app/portal/enquiries/page.tsx
"use client";

import { Badge, Button, Card, EmptyState, inputCls, Modal, PageHeader, Segmented, Toast } from "@/components/portal/UI";
import { FormError, TextAreaField } from "@/components/portal/FormFields";
import { usePerms } from "@/lib/use-perms";
import { SERVICE_LABEL, type EnquiryStatus, type IEnquiry } from "@/modules/enquiries/common/enquiries";
import { useDeleteEnquiry, useEnquiries, useUpdateEnquiry } from "@/modules/enquiries/common/enquiries-api";
import { AlertTriangle, Inbox, Lock, Mail, MessageCircle, Phone, Search } from "lucide-react";
import { useEffect, useState } from "react";

type Tab = EnquiryStatus | "all";
type Tone = "success" | "warn" | "neutral" | "danger";

const LABEL: Record<EnquiryStatus, string> = {
  open: "New", in_progress: "In progress", resolved: "Resolved", closed: "Closed", spam: "Spam",
};
const TONE: Record<EnquiryStatus, Tone> = {
  open: "warn", in_progress: "neutral", resolved: "success", closed: "neutral", spam: "danger",
};
const ORDER: EnquiryStatus[] = ["open", "in_progress", "resolved", "closed", "spam"];

const when = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

const useDebounced = <T,>(value: T, ms = 300) => {
  const [v, setV] = useState(value);
  useEffect(() => { const t = setTimeout(() => setV(value), ms); return () => clearTimeout(t); }, [value, ms]);
  return v;
};

function EnquiryModal({
  enquiry, canEdit, canDelete, userId, onChange, onClose, onMessage,
}: {
  enquiry: IEnquiry; canEdit: boolean; canDelete: boolean; userId: string | null;
  onChange: (e: IEnquiry) => void; onClose: () => void; onMessage: (m: string) => void;
}) {
  const [notes, setNotes] = useState(enquiry.notes ?? "");
  const update = useUpdateEnquiry();
  const del = useDeleteEnquiry();
  const busy = update.isPending || del.isPending;

  const patch = (data: Parameters<typeof update.mutate>[0]["data"], message: string) =>
    update.mutate({ id: enquiry.id, data }, { onSuccess: (e) => { onChange(e); onMessage(message); } });

  const mine = enquiry.assignedTo?.id === userId;
  const waDigits = enquiry.phone?.startsWith("+") ? enquiry.phone.replace(/\D/g, "") : null;
  const notesDirty = notes.trim() !== (enquiry.notes ?? "");

  return (
    <Modal
      open
      onClose={busy ? () => {} : onClose}
      title={`Enquiry ${enquiry.code}`}
      footer={
        <div className="flex justify-between gap-3">
          {canDelete ? (
            <Button
              variant="danger" disabled={busy}
              onClick={() => {
                if (!confirm("Delete this enquiry?")) return;
                del.mutate(enquiry.id, { onSuccess: () => { onMessage("Enquiry deleted."); onClose(); } });
              }}
            >
              Delete
            </Button>
          ) : <span />}
          <Button variant="secondary" onClick={onClose} disabled={busy}>Close</Button>
        </div>
      }
    >
      <div className="grid gap-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-lg font-semibold">{enquiry.name}</p>
            <p className="text-sm text-[#1F1A15]/55">{when(enquiry.createdAt)} · {SERVICE_LABEL[enquiry.service]}</p>
          </div>
          <Badge tone={TONE[enquiry.status]}>{LABEL[enquiry.status]}</Badge>
        </div>

        <div className="flex flex-wrap gap-2 text-sm">
          <a href={`mailto:${enquiry.email}?subject=${encodeURIComponent(`Re: your enquiry ${enquiry.code}`)}`}
            className="inline-flex items-center gap-2 rounded-full border border-[#E6D9C6] px-4 py-2 hover:bg-[#F1E7D8]">
            <Mail size={14} /> {enquiry.email}
          </a>
          {enquiry.phone && (
            <a href={`tel:${enquiry.phone}`} className="inline-flex items-center gap-2 rounded-full border border-[#E6D9C6] px-4 py-2 hover:bg-[#F1E7D8]">
              <Phone size={14} /> {enquiry.phone}
            </a>
          )}
          {waDigits && (
            <a href={`https://wa.me/${waDigits}`} target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-[#E6D9C6] px-4 py-2 hover:bg-[#F1E7D8]">
              <MessageCircle size={14} /> WhatsApp
            </a>
          )}
        </div>

        <p className="whitespace-pre-wrap rounded-2xl bg-[#FBF6EE] p-5 text-[15px] leading-relaxed text-[#1F1A15]/80">
          {enquiry.message}
        </p>

        {canEdit && (
          <>
            <div>
              <p className="mb-2 text-sm font-medium">Status</p>
              <div className="flex flex-wrap gap-2" role="group" aria-label="Set status">
                {ORDER.map((s) => (
                  <button
                    key={s} type="button" disabled={busy} aria-pressed={enquiry.status === s}
                    onClick={() => enquiry.status !== s && patch({ status: s }, `Marked as ${LABEL[s].toLowerCase()}.`)}
                    className={`rounded-full border px-4 py-2 text-sm transition-colors disabled:opacity-50 ${
                      enquiry.status === s ? "border-[#1F1A15] bg-[#1F1A15] text-white" : "border-[#E6D9C6] bg-white hover:bg-[#F1E7D8]"
                    }`}
                  >
                    {LABEL[s]}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
              <span className="text-[#1F1A15]/60">
                Assigned to <b className="text-[#1F1A15]">{enquiry.assignedTo?.name ?? "nobody"}</b>
              </span>
              {userId && (
                <Button
                  variant="secondary" disabled={busy}
                  onClick={() => patch({ assignedToId: mine ? null : userId }, mine ? "Unassigned." : "Assigned to you.")}
                >
                  {mine ? "Unassign me" : "Assign to me"}
                </Button>
              )}
            </div>

            <TextAreaField label="Internal notes" value={notes} onChange={setNotes} rows={3}
              placeholder="Visible to staff only, e.g. called back, booked for Friday" optional />
            {notesDirty && (
              <div className="flex justify-end">
                <Button disabled={busy} onClick={() => patch({ notes: notes.trim() || null }, "Notes saved.")}>Save notes</Button>
              </div>
            )}
          </>
        )}

        <FormError message={update.error?.message ?? del.error?.message} />
      </div>
    </Modal>
  );
}

export default function EnquiriesPage() {
  const { can, userId } = usePerms();
  const canView = can("canViewEnquiries");

  const [tab, setTab] = useState<Tab>("open");
  const [mine, setMine] = useState(false);
  const [search, setSearch] = useState("");
  const q = useDebounced(search.trim());
  const [selected, setSelected] = useState<IEnquiry | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const { data, isPending, isError, error, refetch, isFetching } = useEnquiries(
    { ...(tab !== "all" ? { status: tab } : {}), ...(mine ? { mine: true } : {}), ...(q ? { search: q } : {}) },
    canView,
  );
  const rows = data?.data ?? [];
  const counts = data?.counts;

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Enquiries"
        title="Website enquiries"
        description="Messages sent from the contact form by people who haven't signed in. Assign them, follow up and update the status as you go."
      />

      {!canView ? (
        <EmptyState icon={Lock} title="Restricted" text="You don't have permission to view enquiries." />
      ) : (
        <>
          <Segmented<Tab>
            label="Status"
            value={tab}
            onChange={setTab}
            options={[
              ...ORDER.map((s) => ({ value: s as Tab, label: LABEL[s], count: counts?.[s] })),
              { value: "all" as Tab, label: "All", count: counts?.all },
            ]}
          />

          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative min-w-55 flex-1 sm:max-w-xs">
              <Search size={16} aria-hidden className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-[#1F1A15]/45" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, email or message"
                aria-label="Search enquiries" className={`${inputCls} pl-11`} />
            </div>
            {userId && (
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input type="checkbox" checked={mine} onChange={(e) => setMine(e.target.checked)} className="h-4 w-4 accent-[#1F1A15]" />
                Assigned to me
              </label>
            )}
            {isFetching && !isPending && <span role="status" className="text-xs text-[#1F1A15]/50 md:ml-auto">Refreshing…</span>}
          </div>

          {isPending ? (
            <div aria-busy="true" className="space-y-3">
              {[0, 1, 2, 3].map((i) => <div key={i} className="h-20 animate-pulse rounded-2xl bg-[#F1E7D8]" />)}
            </div>
          ) : isError ? (
            <EmptyState icon={AlertTriangle} title="Couldn't load enquiries" text={error?.message || "Something went wrong."}
              action={<Button variant="secondary" onClick={() => refetch()}>Try again</Button>} />
          ) : rows.length === 0 ? (
            <EmptyState icon={Inbox}
              title={tab === "open" && !q && !mine ? "Inbox zero" : "No enquiries found"}
              text={tab === "open" && !q && !mine ? "New enquiries from the website will appear here." : "Try a different status or search."} />
          ) : (
            <ul className="space-y-3">
              {rows.map((e) => (
                <li key={e.id}>
                  <button type="button" onClick={() => setSelected(e)} className="block w-full text-left">
                    <Card className="p-5 transition-colors hover:bg-[#FBF6EE]">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                            <b className="font-semibold">{e.name}</b>
                            <span className="text-xs text-[#1F1A15]/50">{e.code} · {SERVICE_LABEL[e.service]}</span>
                          </div>
                          <p className="mt-1 line-clamp-2 text-sm text-[#1F1A15]/65">{e.message}</p>
                          <p className="mt-2 text-xs text-[#1F1A15]/45">
                            {when(e.createdAt)}{e.assignedTo ? ` · ${e.assignedTo.name}` : " · Unassigned"}
                          </p>
                        </div>
                        <Badge tone={TONE[e.status]}>{LABEL[e.status]}</Badge>
                      </div>
                    </Card>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {selected && (
        <EnquiryModal
          key={selected.id}
          enquiry={selected}
          canEdit={can("canUpdateEnquiries")}
          canDelete={can("canDeleteEnquiries")}
          userId={userId}
          onChange={setSelected}
          onClose={() => setSelected(null)}
          onMessage={setToast}
        />
      )}
      <Toast message={toast} onDone={() => setToast(null)} />
    </div>
  );
}