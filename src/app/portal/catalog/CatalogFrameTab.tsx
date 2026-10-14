import {
  Badge,
  Button,
  Card,
  EmptyState,
  inputCls,
} from "@/components/portal/UI";
import { Glasses, Search } from "lucide-react";
import React, { SetStateAction } from "react";
import { ISort } from "./common";
import { money } from "@/lib/format";
import { Frame } from "@/lib/portal-data";

const CatalogFrameTab = ({
  setSort,
  sort,
  query,
  setShape,
  shape,
  shapes,
  setQuery,
  frames,
  setCustomizing
}: {
  shape: string;
  shapes: string[];
  setShape: (value: SetStateAction<string>) => void;
  query: string;
  setSort: (value: SetStateAction<ISort>) => void;
  sort: ISort;
  setQuery: (value: SetStateAction<string>) => void;
  setCustomizing: (value: SetStateAction<Frame | null>) => void
  frames: Frame[]
}) => {
  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-55 flex-1 sm:max-w-xs">
          <Search
            size={16}
            className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-[#1F1A15]/45"
            aria-hidden
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search frames"
            aria-label="Search frames"
            className={`${inputCls} pl-11`}
          />
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as ISort)}
          aria-label="Sort frames"
          className={`${inputCls} w-auto`}
        >
          <option value="featured">Featured</option>
          <option value="low">Price: low to high</option>
          <option value="high">Price: high to low</option>
        </select>
      </div>
      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label="Filter by shape"
      >
        {shapes.map((s) => (
          <button
            key={s}
            aria-pressed={shape === s}
            onClick={() => setShape(s)}
            className={`rounded-full border px-4 py-2 text-sm transition-colors ${shape === s ? "border-[#1F1A15] bg-[#1F1A15] text-white" : "border-[#E6D9C6] bg-white hover:bg-[#F1E7D8]"}`}
          >
            {s}
          </button>
        ))}
      </div>

      {frames.length === 0 ? (
        <EmptyState
          icon={Glasses}
          title="No frames match"
          text="Try a different shape or clear your search."
          action={
            <Button
              variant="secondary"
              onClick={() => {
                setQuery("");
                setShape("All");
              }}
            >
              Clear filters
            </Button>
          }
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {frames.map((f) => (
            <li key={f.id}>
              <Card className="flex h-full flex-col overflow-hidden">
                <div
                  className="grid h-44 place-items-center"
                  style={{ backgroundColor: `${f.colors[0].hex}1F` }}
                >
                  <Glasses
                    size={64}
                    strokeWidth={1.4}
                    style={{ color: f.colors[0].hex }}
                    aria-hidden
                  />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <Badge>{f.shape}</Badge>
                  <h2 className="mt-3 font-semibold">{f.name}</h2>
                  <p className="mt-1 flex-1 text-sm text-[#1F1A15]/55">
                    {f.blurb}
                  </p>
                  <div
                    className="mt-4 flex items-center gap-1.5"
                    aria-label={`${f.colors.length} colours`}
                  >
                    {f.colors.map((c) => (
                      <span
                        key={c.name}
                        title={c.name}
                        className="h-4 w-4 rounded-full border border-black/10"
                        style={{ backgroundColor: c.hex }}
                      />
                    ))}
                    <span className="ml-1 text-xs text-[#1F1A15]/50">
                      {f.material}
                    </span>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-sm">
                      <span className="text-[#1F1A15]/50">From </span>
                      <b className="tabular-nums">{money(f.price)}</b>
                    </p>
                    <Button
                      className="px-4 py-2"
                      onClick={() => setCustomizing(f)}
                    >
                      Customize
                    </Button>
                  </div>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </>
  );
};

export default CatalogFrameTab;
