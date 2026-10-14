"use client";

import { PageHeader, Segmented, Toast } from "@/components/portal/UI";
import { TODAY, toISO } from "@/lib/format";
import {
  DEFAULT_LENS,
  FRAMES,
  INITIAL_REQUESTS,
  lensPrice,
  lensSummary,
  type CatalogRequest,
  type Frame,
  type LensConfig,
} from "@/lib/portal-data";
import { useMemo, useState } from "react";
import CatalogFrameTab from "./CatalogFrameTab";
import CatalogLensesOnlyTab from "./CatalogLensesOnlyTab";
import CatalogRequestsTab from "./CatalogRequestsTab";
import { FrameCustomizer, IFrameTab, ISort } from "./common";

export default function CatalogPage() {
  const [tab, setTab] = useState<IFrameTab>("frames");
  const [query, setQuery] = useState("");
  const [shape, setShape] = useState("All");
  const [sort, setSort] = useState<ISort>("featured");
  const [customizing, setCustomizing] = useState<Frame | null>(null);
  const [requests, setRequests] = useState<CatalogRequest[]>(INITIAL_REQUESTS);
  const [toast, setToast] = useState<string | null>(null);

  // lens-only form
  const [lensFor, setLensFor] = useState("My current frames");
  const [lensCfg, setLensCfg] = useState<LensConfig>(DEFAULT_LENS);

  const shapes = useMemo(
    () => ["All", ...Array.from(new Set(FRAMES.map((f) => f.shape)))],
    [],
  );
  const frames = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = FRAMES.filter(
      (f) =>
        (shape === "All" || f.shape === shape) &&
        (!q || `${f.name} ${f.shape} ${f.material}`.toLowerCase().includes(q)),
    );
    if (sort === "low") list.sort((a, b) => a.price - b.price);
    if (sort === "high") list.sort((a, b) => b.price - a.price);
    return list;
  }, [query, shape, sort]);

  const addRequest = (r: CatalogRequest) => {
    setRequests((prev) => [r, ...prev]);
    setCustomizing(null);
    setTab("requests");
    setToast("Request sent. Our optician will review it shortly.");
  };

  const submitLenses = () => {
    addRequest({
      id: `REQ-${Math.floor(Math.random() * 900 + 100)}`,
      title: `Lenses only · ${lensFor || "My current frames"}`,
      summary: lensSummary(lensCfg),
      date: toISO(TODAY),
      step: 0,
      total: lensPrice(lensCfg),
    });
    setLensCfg(DEFAULT_LENS);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Catalog"
        title={
          <>
            Find a frame that feels like{" "}
            <span className="font-serif text-[1.1em] font-normal italic">
              you.
            </span>
          </>
        }
        description="Customize frames and lenses to your prescription, then send a request. Our optician reviews every order before it goes to the lab."
      />

      <Segmented<IFrameTab>
        label="Catalog sections"
        value={tab}
        onChange={setTab}
        options={[
          { value: "frames", label: "Frames" },
          { value: "lenses", label: "Lenses only" },
          { value: "requests", label: "My requests", count: requests.length },
        ]}
      />

      {/* ---------- FRAMES ---------- */}
      <CatalogFrameTab
        tab={tab}
        frames={frames}
        query={query}
        setCustomizing={setCustomizing}
        setQuery={setQuery}
        setShape={setShape}
        setSort={setSort}
        shape={shape}
        shapes={shapes}
        sort={sort}
      />

      {/* ---------- LENSES ONLY ---------- */}
      <CatalogLensesOnlyTab
        lensCfg={lensCfg}
        lensFor={lensFor}
        setLensCfg={setLensCfg}
        setLensFor={setLensFor}
        submitLenses={submitLenses}
        tab={tab}
      />

      {/* ---------- REQUESTS ---------- */}
      <CatalogRequestsTab requests={requests} setTab={setTab} tab={tab} />

      {customizing && (
        <FrameCustomizer
          key={customizing.id}
          frame={customizing}
          onClose={() => setCustomizing(null)}
          onRequest={addRequest}
        />
      )}
      <Toast message={toast} onDone={() => setToast(null)} />
    </div>
  );
}
