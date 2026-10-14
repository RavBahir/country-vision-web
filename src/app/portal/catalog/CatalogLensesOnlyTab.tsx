import { Button, Card, inputCls, Kicker } from "@/components/portal/UI";
import React, { Dispatch, SetStateAction } from "react";
import { IFrameTab, LensConfigurator } from "./common";
import { LensConfig, lensPrice, lensSummary } from "@/lib/portal-data";
import { money } from "@/lib/format";
import { Sparkles } from "lucide-react";

const CatalogLensesOnlyTab = ({
  tab,
  lensFor,
  setLensFor,
  lensCfg,
  setLensCfg,
  submitLenses
}: {
  tab: IFrameTab;
  setLensFor: (value: SetStateAction<string>) => void;
  lensFor: string;
  setLensCfg: Dispatch<SetStateAction<LensConfig>>
  lensCfg: LensConfig
  submitLenses: () => void
}) => {
  return (
    <>
      {tab === "lenses" && (
        <div className="grid items-start gap-6 xl:grid-cols-[1.6fr_1fr]">
          <Card className="p-6 sm:p-8">
            <h2 className="text-xl font-semibold tracking-tight">
              Request new lenses
            </h2>
            <p className="mt-1 mb-6 text-sm text-[#1F1A15]/55">
              Keep your favourite frames and refresh the lenses.
            </p>
            <div className="mb-7">
              <label
                htmlFor="lens-for"
                className="mb-2 block text-sm font-semibold"
              >
                Which frames are these for?
              </label>
              <input
                id="lens-for"
                value={lensFor}
                onChange={(e) => setLensFor(e.target.value)}
                className={inputCls}
                placeholder="e.g. Black acetate round frames"
              />
              <p className="mt-2 text-xs text-[#1F1A15]/50">
                Bring the frames to your next visit so we can measure and fit
                the lenses.
              </p>
            </div>
            <LensConfigurator
              value={lensCfg}
              onChange={setLensCfg}
              prefix="lens"
            />
          </Card>

          <div className="space-y-4 xl:sticky xl:top-6">
            <div className="rounded-3xl bg-[#12100D] p-6 text-white">
              <Kicker light>Your lens request</Kicker>
              <p className="mt-4 text-sm leading-relaxed text-white/70">
                {lensSummary(lensCfg)}
              </p>
              <p className="mt-6 text-xs text-white/50">Estimated total</p>
              <p className="text-3xl font-semibold tabular-nums">
                {money(lensPrice(lensCfg))}
              </p>
              <Button
                variant="light"
                className="mt-6 w-full"
                onClick={submitLenses}
              >
                Request lenses
              </Button>
            </div>
            <p className="flex items-start gap-3 rounded-2xl border border-[#E6D9C6] bg-white p-4 text-xs leading-relaxed text-[#1F1A15]/60">
              <Sparkles size={16} className="mt-0.5 shrink-0 text-[#8A6A4A]" />
              Prices are estimates. Our optician confirms the final price and
              lens compatibility before anything goes to the lab.
            </p>
          </div>
        </div>
      )}
      
    </>
  );
};

export default CatalogLensesOnlyTab;
