// app/portal/catalog/page.tsx
"use client";

import { Button, EmptyState, PageHeader, Segmented, Toast } from "@/components/portal/UI";
import { useCatalog, useMyLatestRx, useMyOrders, usePlaceMyOrder } from "@/modules/catalog/common/catalog-api";
import type { IFrame, IOrderInput } from "@/modules/catalog/common/catalog";
import { AlertTriangle } from "lucide-react";
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
  const [customizing, setCustomizing] = useState<IFrame | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const catalog = useCatalog();
  const { data: rx } = useMyLatestRx();
  const orders = useMyOrders();
  const place = usePlaceMyOrder();

  const all = useMemo(() => catalog.data?.frames ?? [], [catalog.data]);
  const shapes = useMemo(() => ["All", ...Array.from(new Set(all.map((f) => f.shape)))], [all]);
  const frames = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = all.filter((f) => (shape === "All" || f.shape === shape) && (!q || `${f.name} ${f.shape} ${f.material}`.toLowerCase().includes(q)));
    if (sort === "low") list.sort((a, b) => a.price - b.price);
    if (sort === "high") list.sort((a, b) => b.price - a.price);
    return list;
  }, [all, query, shape, sort]);

  const submit = (input: IOrderInput) =>
    place.mutate(input, {
      onSuccess: () => { setCustomizing(null); setTab("requests"); setToast("Request sent. Our optician will review it shortly."); },
    });

  const requests = orders.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Catalog"
        title={<>Find a frame that feels like <span className="font-serif text-[1.1em] font-normal italic">you.</span></>}
        description="Customize frames and lenses to your prescription, then send a request. Our optician reviews every order before it goes to the lab."
      />

      <Segmented<IFrameTab>
        label="Catalog sections" value={tab} onChange={(t) => { place.reset(); setTab(t); }}
        options={[
          { value: "frames", label: "Frames" },
          { value: "lenses", label: "Lenses only" },
          { value: "requests", label: "My requests", count: requests.length },
        ]}
      />

      {tab === "requests" ? (
        orders.isPending ? <div className="h-40 animate-pulse rounded-3xl bg-[#F1E7D8]" aria-busy="true" />
        : orders.isError ? <EmptyState icon={AlertTriangle} title="Couldn't load your requests" text={orders.error.message} action={<Button variant="secondary" onClick={() => orders.refetch()}>Try again</Button>} />
        : <CatalogRequestsTab requests={requests} setTab={setTab} onMessage={setToast} />
      ) : catalog.isPending ? (
        <div aria-busy="true" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => <div key={i} className="h-72 animate-pulse rounded-3xl bg-[#F1E7D8]" />)}
        </div>
      ) : catalog.isError ? (
        <EmptyState icon={AlertTriangle} title="Couldn't load the catalog" text={catalog.error.message} action={<Button variant="secondary" onClick={() => catalog.refetch()}>Try again</Button>} />
      ) : tab === "frames" ? (
        <CatalogFrameTab tab={tab} frames={frames} query={query} setCustomizing={setCustomizing} setQuery={setQuery}
          setShape={setShape} setSort={setSort} shape={shape} shapes={shapes} sort={sort} />
      ) : (
        <CatalogLensesOnlyTab options={catalog.data.options} rx={rx} pending={place.isPending} error={place.error?.message} onSubmit={submit} />
      )}

      {customizing && catalog.data && (
        <FrameCustomizer key={customizing.id} frame={customizing} options={catalog.data.options} rx={rx}
          pending={place.isPending} error={place.error?.message} onClose={() => { place.reset(); setCustomizing(null); }} onSubmit={submit} />
      )}
      <Toast message={toast} onDone={() => setToast(null)} />
    </div>
  );
}