import { Button, Card } from "@/components/portal/UI";
import { fmtDate, rx } from "@/lib/format";
import { CHECKUPS } from "@/lib/portal-data";
import { ChevronDown, Download, Eye } from "lucide-react";
import { SetStateAction } from "react";
import RxTable from "../RxTable";
import { checkout_download, CheckupFact } from "./common";

const CheckoutRecords = ({open, setOpen, setToast}: {open: string | null, setOpen: (value: SetStateAction<string | null>) => void, setToast: (value: SetStateAction<string | null>) => void}) => {
  return (
        <section aria-labelledby="records">
        <h2 id="records" className="mb-4 text-lg font-semibold tracking-tight">Exam records</h2>
        <ul className="space-y-3">
          {CHECKUPS.map((c) => {
            const isOpen = open === c.id;
            return (
              <li key={c.id}>
                <Card>
                  <button
                    onClick={() => setOpen(isOpen ? null : c.id)}
                    aria-expanded={isOpen}
                    aria-controls={`rec-${c.id}`}
                    className="flex w-full items-center gap-4 p-5 text-left sm:p-6"
                  >
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#F1E7D8] text-[#8A6A4A]"><Eye size={20} /></span>
                    <span className="min-w-0 flex-1">
                      <b className="block font-semibold">{fmtDate(c.date, { day: "numeric", month: "long", year: "numeric" })}</b>
                      <span className="text-sm text-[#1F1A15]/60">{c.headline} · {c.clinician}</span>
                    </span>
                    <span className="hidden text-sm tabular-nums text-[#1F1A15]/60 sm:block">OD {rx(c.od.sph)} · OS {rx(c.os.sph)}</span>
                    <ChevronDown size={18} className={`shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </button>

                  {isOpen && (
                    <div id={`rec-${c.id}`} className="border-t border-[#E6D9C6] p-5 sm:p-6">
                      <div className="grid gap-6 lg:grid-cols-2">
                        <div>
                          <RxTable od={c.od} os={c.os} pd={c.pd} />
                          <dl className="mt-5 grid grid-cols-2 gap-3">
                            <CheckupFact label="Visual acuity (OD / OS)" value={`${c.acuity.od} / ${c.acuity.os}`} />
                            <CheckupFact label="Eye pressure (OD / OS)" value={`${c.iop.od} / ${c.iop.os} mmHg`} />
                          </dl>
                        </div>
                        <div>
                          <p className="text-xs font-medium tracking-[0.18em] text-[#8A6A4A] uppercase">Clinician notes</p>
                          <p className="mt-3 rounded-2xl bg-[#FBF6EE] p-5 text-[15px] leading-relaxed text-[#1F1A15]/75">{c.notes}</p>
                          <p className="mt-4 text-sm text-[#1F1A15]/55">Recommended follow-up: <b className="text-[#1F1A15]">{fmtDate(c.nextDue, { day: "numeric", month: "long", year: "numeric" })}</b></p>
                          <Button variant="secondary" className="mt-5" onClick={() => checkout_download({c, setToast})}><Download size={15} /> Download report</Button>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              </li>
            );
          })}
        </ul>
      </section>
  )
}

export default CheckoutRecords