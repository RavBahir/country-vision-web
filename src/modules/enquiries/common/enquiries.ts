// pages/enquiries/common/enquiries.ts
export type EnquiryStatus = "open" | "in_progress" | "resolved" | "closed" | "spam";
export type EnquiryService = "eye_checkup" | "prescription_eyewear" | "lenses" | "frame_styling" | "other";

export interface IEnquiry {
  id: string;
  code: string;
  name: string;
  email: string;
  phone: string | null;
  service: EnquiryService;
  message: string;
  status: EnquiryStatus;
  notes: string | null;
  handledAt: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  assignedTo: { id: string; name: string } | null;
}

export type IEnquiryCounts = Record<EnquiryStatus | "all", number>;
export interface IEnquiryFilters { status?: EnquiryStatus; mine?: boolean; search?: string }
export interface IEnquiryPatch { status?: EnquiryStatus; assignedToId?: string | null; notes?: string | null }

export const SERVICE_OPTIONS: { value: EnquiryService; label: string }[] = [
  { value: "eye_checkup", label: "Eye checkup" },
  { value: "prescription_eyewear", label: "Prescription eyewear" },
  { value: "lenses", label: "Lenses" },
  { value: "frame_styling", label: "Frame styling" },
  { value: "other", label: "Something else" },
];
export const SERVICE_LABEL = Object.fromEntries(SERVICE_OPTIONS.map((o) => [o.value, o.label])) as Record<EnquiryService, string>;

export const enquiryKeys = {
  all: ["enquiries"] as const,
  list: (f: IEnquiryFilters) => [...enquiryKeys.all, "list", f] as const,
};