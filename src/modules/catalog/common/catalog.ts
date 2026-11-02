// pages/catalog/common/catalog.ts
import type { IPrescription } from "@/modules/appointments/common/staff";

export type OptionKind = "lens_type" | "lens_index" | "coating" | "frame_size";
export type RxSource = "file" | "upload" | "later";
export type OrderStatus = "requested" | "reviewing" | "confirmed" | "in_lab" | "ready" | "collected" | "cancelled";
export type PayMethod = "cash" | "mobile_money" | "card" | "bank_transfer";

export interface IFrameColor { id: string; name: string; hex: string }
export interface IFrame {
  id: string; code: string; name: string; shape: string; material: string; blurb: string | null;
  price: number; status: "active" | "inactive" | "archived"; sortOrder: number; colors: IFrameColor[];
}
export interface IOption {
  id: string; kind: OptionKind; name: string; note: string | null; price: number; mm: number | null;
  isDefault: boolean; status: "active" | "inactive" | "archived"; sortOrder: number;
}
export interface ICatalog { frames: IFrame[]; options: IOption[] }

export interface ILensChoice { typeId: string; indexId: string; coatingIds: string[]; rxSource: RxSource }
export interface IOrderInput {
  kind: "frame" | "lenses_only";
  frameId?: string; colorId?: string; sizeId?: string;
  lensFor?: string | null;
  lens: ILensChoice;
  notes?: string | null;
  customerId?: string; // staff only
}

export interface IOrderLine { id: string; kind: string; label: string; amount: number }
export interface IPayment {
  id: string; code: string; amount: number; method: PayMethod; reference: string | null; note: string | null;
  paidAt: string; voidedAt: string | null; voidReason: string | null; receivedBy?: string | null;
}
export interface ICatalogOrder {
  id: string; code: string; kind: "frame" | "lenses_only"; status: OrderStatus;
  title: string; summary: string; lensFor: string | null; rxSource: RxSource;
  customerNotes: string | null; staffNotes?: string | null;
  total: number; paid: number; balance: number; paymentStatus: "unpaid" | "partial" | "paid";
  lines: IOrderLine[]; payments: IPayment[]; prescription: IPrescription | null;
  customer?: { id: string; name: string; code: string; email: string; phone1: string | null };
  createdAt: string; confirmedAt: string | null; readyAt: string | null; collectedAt: string | null;
  cancelledAt: string | null; cancelReason: string | null; cancelledBy: "customer" | "staff" | null;
}

export const ORDER_STEPS = ["Requested", "Under review", "Confirmed", "At the lab", "Ready", "Collected"];
export const stepOf = (s: OrderStatus) =>
  ({ requested: 0, reviewing: 1, confirmed: 2, in_lab: 3, ready: 4, collected: 5, cancelled: 0 })[s];

export const STATUS_LABEL: Record<OrderStatus, string> = {
  requested: "New request", reviewing: "Under review", confirmed: "Confirmed", in_lab: "At the lab",
  ready: "Ready", collected: "Collected", cancelled: "Cancelled",
};
export const STATUS_TONE: Record<OrderStatus, "success" | "warn" | "neutral" | "danger"> = {
  requested: "warn", reviewing: "neutral", confirmed: "neutral", in_lab: "neutral",
  ready: "success", collected: "success", cancelled: "danger",
};
export const NEXT: Record<OrderStatus, OrderStatus[]> = {
  requested: ["reviewing", "confirmed", "cancelled"], reviewing: ["confirmed", "cancelled"],
  confirmed: ["in_lab", "cancelled"], in_lab: ["ready"], ready: ["collected"], collected: [], cancelled: [],
};
export const PAY_LABEL: Record<PayMethod, string> = {
  cash: "Cash", mobile_money: "Mobile money", card: "Card", bank_transfer: "Bank transfer",
};

export const OPTION_GROUPS: { kind: OptionKind; title: string; hint: string; defaultable: boolean }[] = [
  { kind: "lens_type", title: "Lens types", hint: "Single vision, bifocal, progressive…", defaultable: true },
  { kind: "lens_index", title: "Lens thickness (index)", hint: "Thinner lenses for stronger prescriptions.", defaultable: true },
  { kind: "coating", title: "Coatings & treatments", hint: "Optional extras. Customers can pick several.", defaultable: false },
  { kind: "frame_size", title: "Frame fits", hint: "Sizes offered on every frame.", defaultable: true },
];

export const byKind = (options: IOption[]) =>
  Object.fromEntries(OPTION_GROUPS.map((g) => [g.kind, options.filter((o) => o.kind === g.kind)])) as Record<OptionKind, IOption[]>;

export function defaultLens(options: IOption[], hasRx: boolean): ILensChoice {
  const pick = (k: OptionKind) => options.find((o) => o.kind === k && o.isDefault) ?? options.find((o) => o.kind === k);
  return { typeId: pick("lens_type")?.id ?? "", indexId: pick("lens_index")?.id ?? "", coatingIds: [], rxSource: hasRx ? "file" : "later" };
}

/** Estimate only. The server recalculates the real price. */
export function quote(options: IOption[], ids: string[], frame?: IFrame | null) {
  const picked = ids.map((id) => options.find((o) => o.id === id)).filter(Boolean) as IOption[];
  return { total: (frame?.price ?? 0) + picked.reduce((s, o) => s + o.price, 0), summary: picked.map((o) => o.name).join(" · ") };
}

export const catalogKeys = {
  all: ["catalog"] as const,
  active: ["catalog", "active"] as const,
  admin: ["catalog", "admin"] as const,
};
export const orderKeys = {
  all: ["catalog-orders"] as const,
  mine: ["catalog-orders", "mine"] as const,
  list: (f: object) => ["catalog-orders", "list", f] as const,
  detail: (id: string) => ["catalog-orders", "detail", id] as const,
};