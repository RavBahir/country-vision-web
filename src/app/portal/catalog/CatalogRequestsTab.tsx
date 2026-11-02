// app/portal/catalog/CatalogRequestsTab.tsx
import { Badge, Button, Card, EmptyState, StepTracker } from "@/components/portal/UI";
import { FormError } from "@/components/portal/FormFields";
import { fmtDate, money } from "@/lib/format";
import { ORDER_STEPS, STATUS_LABEL, STATUS_TONE, stepOf, type ICatalogOrder } from "@/modules/catalog/common/catalog";
import { useCancelMyOrder } from "@/modules/catalog/common/catalog-api";
import { PackageSearch } from "lucide-react";
import { SetStateAction } from "react";
import type { IFrameTab } from "./common";

export default function CatalogRequestsTab({
  requests, setTab, onMessage,
}: { requests: ICatalogOrder[]; setTab: (v: SetStateAction<IFrameTab>) => void; onMessage: (m: string) => void }) {
  const cancel = useCancelMyOrder();

  if (requests.length === 0) {
    return (
      <EmptyState icon={PackageSearch} title="No requests yet" text="Customize a frame or request new lenses and track it here."
        action={<Button onClick={() => setTab("frames")}>Browse frames</Button>} />
    );
  }

  return (
    <ul className="space-y-4">
      {requests.map((r) => {
        const cancellable = (r.status === "requested" || r.status === "reviewing") && r.paid === 0;
        return (
          <li key={r.id}>
            <Card className="p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-[#1F1A15]/50">{r.code} · Requested {fmtDate(r.createdAt.slice(0, 10))}</p>
                  <h2 className="mt-1 text-lg font-semibold">{r.title}</h2>
                  <p className="mt-1 max-w-xl text-sm text-[#1F1A15]/60">{r.summary}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold tabular-nums">{money(r.total)}</p>
                  <Badge tone={STATUS_TONE[r.status]}>{STATUS_LABEL[r.status]}</Badge>
                </div>
              </div>

              {r.status === "cancelled" ? (
                <p className="mt-4 text-sm text-[#1F1A15]/55">Cancelled{r.cancelReason ? `: ${r.cancelReason}` : "."}</p>
              ) : (
                <div className="mt-7 max-w-2xl"><StepTracker steps={ORDER_STEPS} current={stepOf(r.status)} /></div>
              )}

              {r.status !== "cancelled" && r.status !== "requested" && r.status !== "reviewing" && (
                <p className="mt-4 text-sm text-[#1F1A15]/60">
                  Paid <b className="tabular-nums text-[#1F1A15]">{money(r.paid)}</b>
                  {r.balance > 0 ? <> · Balance due <b className="tabular-nums text-[#1F1A15]">{money(r.balance)}</b>. Pay in store.</> : " · Fully paid"}
                </p>
              )}

              {cancellable && (
                <div className="mt-5">
                  <Button variant="secondary" disabled={cancel.isPending}
                    onClick={() => {
                      if (!confirm("Cancel this request?")) return;
                      cancel.mutate({ id: r.id }, { onSuccess: () => onMessage("Request cancelled."), onError: (e) => onMessage(e.message) });
                    }}>
                    Cancel request
                  </Button>
                </div>
              )}
            </Card>
          </li>
        );
      })}
    </ul>
  );
}