// app/portal/checkups/CheckoutRecords.tsx
import { Button, Card } from "@/components/portal/UI";
import { fmtDate } from "@/lib/format";
import { ChevronDown, Download, Eye } from "lucide-react";
import { SetStateAction } from "react";
import CheckupRx from "./CheckupRx";
import { CheckupFact } from "./common";
import { ICheckup, nextDueOf, pair, power, printReport, TYPE_LABEL } from "@/modules/checkups/common/checkups";

const long = { day: "numeric", month: "long", year: "numeric" } as const;

export default function CheckoutRecords({
  data, open, setOpen, setToast,
}: {
  data: ICheckup[];
  open: string | null;
  setOpen: (v: SetStateAction<string | null | undefined>) => void;
  setToast: (v: SetStateAction<string | null>) => void;
}) {
  const download = (c: ICheckup) =>
    setToast(printReport(c) ? "Report opened. Choose “Save as PDF” to keep a copy." : "Allow pop-ups to open the report.");

  return (
    <section aria-labelledby="records">
      <h2 id="records" className="mb-4 text-lg font-semibold tracking-tight">Exam records</h2>
      <ul className="space-y-3">
        {data.map((c) => {
          const isOpen = open === c.id;
          const rx = c.prescription;
          const due = nextDueOf(c);
          const hasVa = c.acuity.od.unaided || c.acuity.os.unaided || c.acuity.od.aided || c.acuity.os.aided;
          const hasIop = c.iop.od !== null || c.iop.os !== null;

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
                    <b className="block font-semibold">{fmtDate(c.date, long)}</b>
                    <span className="text-sm text-[#1F1A15]/60">{TYPE_LABEL[c.type]} · {c.clinician ?? "Optometrist"}</span>
                  </span>
                  {rx && (
                    <span className="hidden text-sm tabular-nums text-[#1F1A15]/60 sm:block">
                      OD {power(rx.right.sphere)} · OS {power(rx.left.sphere)}
                    </span>
                  )}
                  <ChevronDown size={18} className={`shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>

                {isOpen && (
                  <div id={`rec-${c.id}`} className="border-t border-[#E6D9C6] p-5 sm:p-6">
                    <div className="grid gap-6 lg:grid-cols-2">
                      <div>
                        {rx ? (
                          <CheckupRx rx={rx} />
                        ) : (
                          <p className="text-sm text-[#1F1A15]/55">No prescription was issued at this visit.</p>
                        )}
                        {(hasVa || hasIop) && (
                          <dl className="mt-5 grid grid-cols-2 gap-3">
                            {hasVa && (
                              <>
                                <CheckupFact label="Acuity, unaided (OD / OS)" value={pair(c.acuity.od.unaided, c.acuity.os.unaided)} />
                                <CheckupFact label="Acuity, corrected (OD / OS)" value={pair(c.acuity.od.aided, c.acuity.os.aided)} />
                              </>
                            )}
                            {hasIop && <CheckupFact label="Eye pressure (OD / OS)" value={`${pair(c.iop.od, c.iop.os)} mmHg`} />}
                          </dl>
                        )}
                      </div>

                      <div>
                        <p className="text-xs font-medium tracking-[0.18em] text-[#8A6A4A] uppercase">From your optometrist</p>
                        <p className="mt-3 rounded-2xl bg-[#FBF6EE] p-5 text-[15px] leading-relaxed text-[#1F1A15]/75">
                          {c.recommendations ?? "No recommendations were recorded."}
                        </p>
                        <p className="mt-4 text-sm text-[#1F1A15]/55">
                          {due.recommended ? "Recommended follow-up" : "Suggested next checkup"}:{" "}
                          <b className="text-[#1F1A15]">{fmtDate(due.date, long)}</b>
                        </p>
                        <Button variant="secondary" className="mt-5" onClick={() => download(c)}>
                          <Download size={15} /> Download report
                        </Button>
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
  );
}