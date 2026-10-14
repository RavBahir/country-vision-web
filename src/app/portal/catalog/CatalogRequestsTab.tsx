import { Badge, Button, Card, EmptyState, StepTracker } from "@/components/portal/UI"
import { IFrameTab } from "./common"
import { PackageSearch } from "lucide-react"
import { fmtDate, money } from "@/lib/format"
import { CatalogRequest, REQUEST_STEPS } from "@/lib/portal-data"
import { SetStateAction } from "react"

const CatalogRequestsTab = ({tab, requests, setTab}:{tab: IFrameTab, setTab: (value: SetStateAction<IFrameTab>) => void, requests: CatalogRequest[]}) => {
  return (
    <>
        {tab === "requests" &&
        (requests.length === 0 ? (
          <EmptyState
            icon={PackageSearch}
            title="No requests yet"
            text="Customize a frame or request new lenses and track it here."
            action={
              <Button onClick={() => setTab("frames")}>Browse frames</Button>
            }
          />
        ) : (
          <ul className="space-y-4">
            {requests.map((r) => (
              <li key={r.id}>
                <Card className="p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs text-[#1F1A15]/50">
                        {r.id} · Requested {fmtDate(r.date)}
                      </p>
                      <h2 className="mt-1 text-lg font-semibold">{r.title}</h2>
                      <p className="mt-1 max-w-xl text-sm text-[#1F1A15]/60">
                        {r.summary}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold tabular-nums">
                        {money(r.total)}
                      </p>
                      <Badge
                        tone={
                          r.step === 0
                            ? "warn"
                            : r.step === REQUEST_STEPS.length - 1
                              ? "success"
                              : "neutral"
                        }
                      >
                        {REQUEST_STEPS[r.step]}
                      </Badge>
                    </div>
                  </div>
                  <div className="mt-7 max-w-2xl">
                    <StepTracker steps={REQUEST_STEPS} current={r.step} />
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        ))}
    </>
  )
}

export default CatalogRequestsTab