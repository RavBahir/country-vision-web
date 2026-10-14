/* Demo data for the patient portal. Replace with real API calls. */

import { COMPANY_LOCATION, COMPANY_NAME, COMPANY_PHONE, COMPANY_WORKING_HOURS } from "./constants";

export const PATIENT = {
  name: "Amara Okafor",
  first: "Amara",
  id: "CV-20418",
  email: "amara@example.com",
  phone: "+234 800 000 0000",
};

export const CLINIC = {
  name: COMPANY_NAME,
  address: COMPANY_LOCATION,
  phone: COMPANY_PHONE,
  hours: COMPANY_WORKING_HOURS,
};

export const CLINICIANS = ["Dr. Ngozi Eze", "Dr. Kelechi Adebayo", "Tunde Bello (Optician)"] as const;
export const APPT_TYPES = ["Eye checkup", "Contact lens fitting", "Frame fitting", "Follow-up", "Collection"] as const;
export const TIME_SLOTS = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30"] as const;

export type ApptType = (typeof APPT_TYPES)[number];
export type ApptStatus = "confirmed" | "pending" | "completed" | "cancelled";

export const ACCOUNT: AccountState = {
  hasPassword: true,
  googleLinked: true,
  googleEmail: "amara.okafor@gmail.com",
  passwordChangedDaysAgo: 94,
};

/** ISO date of the patient's first visit. */
export const MEMBER_SINCE = "2023-09-14";

export const PREFERENCES: Preferences = {
  channels: {
    appointments: { whatsapp: true, sms: false, email: true },
    checkups: { whatsapp: true, sms: false, email: false },
    orders: { whatsapp: true, sms: false, email: true },
    payments: { whatsapp: false, sms: false, email: true },
    offers: { whatsapp: false, sms: false, email: false },
  },
  reminderLead: "day_before",
  preferredBranchId: "b1", // "Country Vision, Lekki"
  preferredClinician: "Dr. Ngozi Eze", // or "any"
  fulfilment: "pickup",
  marketingOptIn: false,
};

export const PROFILE: ProfileData = {
  name: "Amara Okafor",
  email: "amara.okafor@gmail.com",
  phone: "+234 803 555 0142",
  emailVerified: true,
  phoneVerified: true,
  dateOfBirth: "1994-03-14",
  gender: "female",
  address: "12 Awolowo Road, Ikoyi",
  city: "Lagos",
  emergencyContactName: "Chidi Okafor",
  emergencyContactPhone: "+234 800 111 2233",
  medicalHistory: "Mild hay fever in the rainy season. No known drug allergies.",
};

export const SESSIONS: AuthSessionInfo[] = [
  { id: "s1", device: "desktop", browser: "Chrome 141", os: "Windows 11", location: "Lagos, Nigeria", ip: "102.89.•••.•••", method: "Google", lastActiveMinutesAgo: 0, current: true },
  { id: "s2", device: "mobile", browser: "Safari", os: "iOS 19", location: "Lagos, Nigeria", ip: "102.89.•••.•••", method: "WhatsApp code", lastActiveMinutesAgo: 95, current: false },
  { id: "s3", device: "desktop", browser: "Firefox 132", os: "macOS 15", location: "Abuja, Nigeria", ip: "41.58.•••.•••", method: "Password", lastActiveMinutesAgo: 60 * 26, current: false },
  { id: "s4", device: "tablet", browser: "Chrome", os: "Android 15", location: "Accra, Ghana", ip: "154.160.•••.•••", method: "Password", lastActiveMinutesAgo: 60 * 24 * 9, current: false },
];

export const BRANCHES = [{id: "1", name: "Awoshie Baahyard"}]

/**
 * All TypeScript types for the patient profile page (/profile):
 * domain data, UI state, static config shapes and component props.
 */
import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import type { LucideIcon } from "lucide-react";

/* ------------------------------------------------------------------ */
/* Domain data                                                         */
/* ------------------------------------------------------------------ */

export type Gender = "female" | "male" | "other" | "undisclosed";

/** Personal details form (maps to Patient + emergency/medical fields). */
export interface ProfileData {
  name: string;
  email: string;
  phone: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  /** ISO date, YYYY-MM-DD */
  dateOfBirth: string;
  gender: Gender;
  address: string;
  city: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  medicalHistory: string;
}

/** What kinds of message a patient can configure. */
export type NotifTopic = "appointments" | "checkups" | "orders" | "payments" | "offers";
export type Channel = "whatsapp" | "sms" | "email";
/** For every topic, which channels are switched on. */
export type ChannelMatrix = Record<NotifTopic, Record<Channel, boolean>>;

export type ReminderLead = "day_before" | "two_hours_before" | "both";
export type FulfilmentMethod = "pickup" | "delivery";

/** Preferences tab (maps to PatientPreferences + Patient.marketingOptIn). */
export interface Preferences {
  channels: ChannelMatrix;
  reminderLead: ReminderLead;
  preferredBranchId: string;
  /** "any" means first available clinician, otherwise a clinician's name. */
  preferredClinician: string;
  fulfilment: FulfilmentMethod;
  marketingOptIn: boolean;
}

export interface Branch {
  id: string;
  name: string;
}

export type DeviceType = "desktop" | "mobile" | "tablet";
export type SessionLoginMethod = "Password" | "Google" | "WhatsApp code";

/** One row of the "Active sessions" list (maps to AuthSession). */
export interface AuthSessionInfo {
  id: string;
  device: DeviceType;
  browser: string;
  os: string;
  location: string;
  /** Partially masked, e.g. "102.89.•••.•••" */
  ip: string;
  method: SessionLoginMethod;
  lastActiveMinutesAgo: number;
  /** The session making this request. */
  current: boolean;
}

/** Sign-in state that decides what the Security tab offers. */
export interface AccountState {
  hasPassword: boolean;
  googleLinked: boolean;
  googleEmail: string;
  passwordChangedDaysAgo: number | null;
}

/* ------------------------------------------------------------------ */
/* UI state                                                            */
/* ------------------------------------------------------------------ */

export type ProfileTab = "details" | "preferences" | "security" | "sessions";

/** Per-field validation messages for the details form. */
export type ProfileErrors = Partial<Record<keyof ProfileData, string>>;

/* ------------------------------------------------------------------ */
/* Static config shapes                                                */
/* ------------------------------------------------------------------ */

export interface TopicConfig {
  id: NotifTopic;
  label: string;
  text: string;
  /** At least one channel must stay on (appointments, payments). */
  required?: boolean;
}

export interface ChannelConfig {
  id: Channel;
  label: string;
}

export interface ReminderLeadOption {
  id: ReminderLead;
  label: string;
}

export interface PasswordRule {
  id: string;
  label: string;
  test: (password: string) => boolean;
  /** Required rules block submit; the rest only affect the strength meter. */
  required: boolean;
}

/* ------------------------------------------------------------------ */
/* Form field components (components/portal/profile/fields.tsx)         */
/* ------------------------------------------------------------------ */

export interface FieldShellProps {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  children: ReactNode;
}

/** Props every field shares. */
export interface FieldCommonProps {
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
}

export type TextFieldProps = FieldCommonProps & {
  value: string;
  onChange: (value: string) => void;
  /** Rendered inside the input's right edge (badges, show/hide buttons). */
  trailing?: ReactNode;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "className">;

export type PasswordInputProps = FieldCommonProps & {
  value: string;
  onChange: (value: string) => void;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "className" | "type">;

export type SelectFieldProps = FieldCommonProps & {
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
} & Omit<SelectHTMLAttributes<HTMLSelectElement>, "value" | "onChange" | "className">;

export type TextAreaFieldProps = FieldCommonProps & {
  value: string;
  onChange: (value: string) => void;
} & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "value" | "onChange" | "className">;

/* ------------------------------------------------------------------ */
/* Tab panels                                                          */
/* ------------------------------------------------------------------ */

export interface DetailsFormProps {
  /** Last saved profile; the form is "dirty" when it differs. */
  saved: ProfileData;
  /** Object URL / remote URL of the profile photo, or null for initials. */
  avatarUrl: string | null;
  onAvatarChange: (url: string | null) => void;
  onSave: (profile: ProfileData) => void;
}

export interface PreferencesFormProps {
  saved: Preferences;
  onSave: (preferences: Preferences) => void;
}

export interface SecurityPanelProps {
  hasPassword: boolean;
  passwordChangedDaysAgo: number | null;
  googleLinked: boolean;
  googleEmail: string;
  /** Called after a valid password change; `signOutOthers` mirrors the checkbox. */
  onPasswordSaved: (signOutOthers: boolean) => void;
  onGoogleChange: (linked: boolean) => void;
}

export interface SessionsPanelProps {
  sessions: AuthSessionInfo[];
  onRevoke: (sessionId: string) => void;
  onRevokeOthers: () => void;
}

/** Icon lookup used by the sessions list. */
export type DeviceIconMap = Record<DeviceType, LucideIcon>;


export interface Appointment {
  id: string;
  type: ApptType;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  clinician: string;
  location: string;
  status: ApptStatus;
  notes?: string;
}

export const APPOINTMENTS: Appointment[] = [
  { id: "a1", type: "Eye checkup", date: "2026-10-16", time: "09:30", clinician: "Dr. Ngozi Eze", location: CLINIC.name, status: "confirmed", notes: "6-month review after prescription change." },
  { id: "a2", type: "Frame fitting", date: "2026-10-22", time: "14:00", clinician: "Tunde Bello (Optician)", location: CLINIC.name, status: "pending" },
  { id: "a3", type: "Follow-up", date: "2026-11-05", time: "11:30", clinician: "Dr. Kelechi Adebayo", location: CLINIC.name, status: "confirmed" },
  { id: "a4", type: "Eye checkup", date: "2026-04-18", time: "10:00", clinician: "Dr. Ngozi Eze", location: CLINIC.name, status: "completed" },
  { id: "a5", type: "Collection", date: "2026-05-02", time: "13:30", clinician: "Tunde Bello (Optician)", location: CLINIC.name, status: "completed" },
  { id: "a6", type: "Eye checkup", date: "2025-10-06", time: "10:30", clinician: "Dr. Ngozi Eze", location: CLINIC.name, status: "completed" },
  { id: "a7", type: "Contact lens fitting", date: "2026-03-09", time: "15:00", clinician: "Dr. Kelechi Adebayo", location: CLINIC.name, status: "cancelled" },
];

/* ---------- Checkups ---------- */

export interface EyeRx { sph: number; cyl: number; axis: number }
export interface Checkup {
  id: string;
  date: string;
  clinician: string;
  headline: string;
  od: EyeRx;
  os: EyeRx;
  pd: number;
  acuity: { od: string; os: string };
  iop: { od: number; os: number };
  notes: string;
  nextDue: string;
}

export const CHECKUPS: Checkup[] = [
  { id: "c4", date: "2026-04-18", clinician: "Dr. Ngozi Eze", headline: "Slight change in both eyes", od: { sph: -1.5, cyl: -0.5, axis: 175 }, os: { sph: -1.25, cyl: -0.25, axis: 10 }, pd: 62, acuity: { od: "20/20", os: "20/20" }, iop: { od: 15, os: 14 }, notes: "Mild increase in short-sightedness. Recommended blue-light filtering lenses for long screen days and a review in 6 months.", nextDue: "2026-10-18" },
  { id: "c3", date: "2025-10-06", clinician: "Dr. Ngozi Eze", headline: "Stable, healthy eyes", od: { sph: -1.25, cyl: -0.5, axis: 170 }, os: { sph: -1.0, cyl: -0.25, axis: 15 }, pd: 62, acuity: { od: "20/25", os: "20/20" }, iop: { od: 14, os: 15 }, notes: "No signs of strain. Updated prescription for daily wear.", nextDue: "2026-04-06" },
  { id: "c2", date: "2024-09-21", clinician: "Dr. Kelechi Adebayo", headline: "Routine annual exam", od: { sph: -1.0, cyl: -0.25, axis: 165 }, os: { sph: -0.75, cyl: 0, axis: 0 }, pd: 62, acuity: { od: "20/25", os: "20/25" }, iop: { od: 14, os: 14 }, notes: "First prescription for distance. Advised to wear glasses for driving and screens.", nextDue: "2025-09-21" },
  { id: "c1", date: "2023-09-14", clinician: "Dr. Kelechi Adebayo", headline: "First comprehensive exam", od: { sph: -0.75, cyl: 0, axis: 0 }, os: { sph: -0.5, cyl: 0, axis: 0 }, pd: 61, acuity: { od: "20/20", os: "20/25" }, iop: { od: 13, os: 14 }, notes: "Very mild myopia detected. No prescription required yet; monitor annually.", nextDue: "2024-09-14" },
];

/* ---------- Orders & transactions ---------- */

export const ORDER_STEPS = ["Ordered", "In lab", "Quality check", "Ready"] as const;

export interface Order { id: string; title: string; step: number; eta: string; total: number }
export const ORDERS: Order[] = [
  { id: "ORD-1042", title: "Timeless round acetate · Blue-light lenses", step: 1, eta: "2026-10-19", total: 98000 },
];

export type TxCategory = "Frames" | "Lenses" | "Eye checkup" | "Accessories";
export type TxStatus = "paid" | "pending" | "refunded" | "failed";
export interface Transaction {
  id: string; date: string; description: string; category: TxCategory;
  method: "Card" | "Transfer" | "Cash" | "Mobile money"; amount: number; status: TxStatus;
}

export const TRANSACTIONS: Transaction[] = [
  { id: "TX-8821", date: "2026-10-09", description: "Timeless round acetate · deposit", category: "Frames", method: "Card", amount: 49000, status: "paid" },
  { id: "TX-8822", date: "2026-10-09", description: "Blue-light lenses · deposit", category: "Lenses", method: "Card", amount: 49000, status: "pending" },
  { id: "TX-8640", date: "2026-05-02", description: "Lens cleaning kit", category: "Accessories", method: "Cash", amount: 6500, status: "paid" },
  { id: "TX-8611", date: "2026-04-18", description: "Comprehensive eye checkup", category: "Eye checkup", method: "Transfer", amount: 25000, status: "paid" },
  { id: "TX-8472", date: "2026-03-09", description: "Contact lens fitting (cancelled)", category: "Eye checkup", method: "Card", amount: 15000, status: "refunded" },
  { id: "TX-8390", date: "2026-02-14", description: "Daily lenses, 3-month supply", category: "Lenses", method: "Mobile money", amount: 42000, status: "paid" },
  { id: "TX-8212", date: "2025-12-03", description: "Sharp rectangular metal frame", category: "Frames", method: "Card", amount: 72000, status: "paid" },
  { id: "TX-8190", date: "2025-12-03", description: "Anti-reflective coating", category: "Lenses", method: "Card", amount: 12000, status: "failed" },
  { id: "TX-8002", date: "2025-10-06", description: "Comprehensive eye checkup", category: "Eye checkup", method: "Card", amount: 25000, status: "paid" },
];

/* ---------- Calendar extras ---------- */

export interface CalendarExtra { id: string; date: string; title: string; kind: "reminder" | "delivery" }
export const CALENDAR_EXTRAS: CalendarExtra[] = [
  { id: "r1", date: "2026-10-18", title: "Checkup due", kind: "reminder" },
  { id: "d1", date: "2026-10-19", title: "Order ORD-1042 ready for collection", kind: "delivery" },
  { id: "r2", date: "2026-11-12", title: "Replace contact lens case", kind: "reminder" },
];

/* ---------- Catalog ---------- */

export interface Frame {
  id: string; name: string; shape: string; material: string; price: number; blurb: string;
  colors: { name: string; hex: string }[];
}

export const FRAMES: Frame[] = [
  { id: "f1", name: "Timeless round", shape: "Round", material: "Acetate", price: 65000, blurb: "A classic round silhouette in hand-polished acetate.", colors: [{ name: "Tortoise", hex: "#7A4B26" }, { name: "Black", hex: "#1F1A15" }, { name: "Olive", hex: "#5F6B3E" }] },
  { id: "f2", name: "Sharp rectangular", shape: "Rectangle", material: "Metal", price: 72000, blurb: "Slim metal frame with crisp, modern lines.", colors: [{ name: "Gold", hex: "#B58B3E" }, { name: "Gunmetal", hex: "#51565C" }] },
  { id: "f3", name: "Featherlight rimless", shape: "Rimless", material: "Titanium", price: 118000, blurb: "Barely there. Under 8 grams of titanium.", colors: [{ name: "Silver", hex: "#A8AEB5" }, { name: "Rose", hex: "#C99A8B" }] },
  { id: "f4", name: "Statement square", shape: "Square", material: "Acetate", price: 78000, blurb: "Bold, chunky and unapologetically stylish.", colors: [{ name: "Black", hex: "#1F1A15" }, { name: "Amber", hex: "#B9742B" }, { name: "Navy", hex: "#27385A" }] },
  { id: "f5", name: "Soft cat-eye", shape: "Cat-eye", material: "Acetate", price: 69000, blurb: "Lifted corners with a gentle, flattering curve.", colors: [{ name: "Burgundy", hex: "#6E2A35" }, { name: "Black", hex: "#1F1A15" }] },
  { id: "f6", name: "Pilot aviator", shape: "Aviator", material: "Titanium", price: 135000, blurb: "Lightweight titanium take on the icon.", colors: [{ name: "Gold", hex: "#B58B3E" }, { name: "Silver", hex: "#A8AEB5" }] },
  { id: "f7", name: "Studio browline", shape: "Browline", material: "Mixed", price: 84000, blurb: "Acetate brow with fine metal lower rims.", colors: [{ name: "Black / gold", hex: "#3B2F1F" }, { name: "Tortoise / silver", hex: "#7A4B26" }] },
  { id: "f8", name: "Hex wire", shape: "Geometric", material: "Metal", price: 76000, blurb: "Six-sided wire frame with an architectural feel.", colors: [{ name: "Champagne", hex: "#C9A57B" }, { name: "Black", hex: "#1F1A15" }] },
];

export const FRAME_SIZES = [
  { id: "S", label: "Narrow", mm: 48 },
  { id: "M", label: "Medium", mm: 51 },
  { id: "L", label: "Wide", mm: 54 },
] as const;

export const LENS_TYPES = [
  { id: "single", label: "Single vision", note: "One field of focus, distance or reading", price: 0 },
  { id: "office", label: "Office / computer", note: "Optimised for screens at arm's length", price: 30000 },
  { id: "bifocal", label: "Bifocal", note: "Two clear zones with a visible line", price: 25000 },
  { id: "progressive", label: "Progressive", note: "Seamless near, mid and distance", price: 45000 },
] as const;

export const LENS_INDEX = [
  { id: "1.50", label: "1.50 Standard", note: "Best for low prescriptions", price: 0 },
  { id: "1.60", label: "1.60 Thin", note: "Thinner and lighter", price: 15000 },
  { id: "1.67", label: "1.67 Ultra-thin", note: "For medium prescriptions", price: 30000 },
  { id: "1.74", label: "1.74 Thinnest", note: "For high prescriptions", price: 50000 },
] as const;

export const COATINGS = [
  { id: "ar", label: "Anti-reflective", note: "Zero glare, pure clarity", price: 12000 },
  { id: "blue", label: "Blue-light filtering", note: "Easier on screen days", price: 10000 },
  { id: "uv", label: "UV protection", note: "Full-spectrum defence", price: 5000 },
  { id: "photo", label: "Photochromic", note: "Adapts to sunlight", price: 35000 },
  { id: "scratch", label: "Scratch-resistant", note: "Tougher everyday surface", price: 8000 },
] as const;

export interface LensConfig {
  type: string;
  index: string;
  coatings: string[];
  rxSource: "file" | "upload" | "later";
}

export const DEFAULT_LENS: LensConfig = { type: "single", index: "1.50", coatings: ["ar", "uv"], rxSource: "file" };

export function lensPrice(c: LensConfig): number {
  const t = LENS_TYPES.find((x) => x.id === c.type)?.price ?? 0;
  const i = LENS_INDEX.find((x) => x.id === c.index)?.price ?? 0;
  const co = COATINGS.filter((x) => c.coatings.includes(x.id)).reduce((s, x) => s + x.price, 0);
  // base price of a pair of single-vision 1.50 lenses
  return 20000 + t + i + co;
}

export function lensSummary(c: LensConfig): string {
  const t = LENS_TYPES.find((x) => x.id === c.type)?.label ?? "";
  const co = COATINGS.filter((x) => c.coatings.includes(x.id)).map((x) => x.label);
  return [t, `${c.index} index`, ...co].join(" · ");
}

export const REQUEST_STEPS = ["Submitted", "Optician review", "In lab", "Ready"] as const;
export interface CatalogRequest { id: string; title: string; summary: string; date: string; step: number; total: number }

export const INITIAL_REQUESTS: CatalogRequest[] = [
  { id: "REQ-311", title: "Timeless round · Tortoise", summary: "Single vision · 1.60 index · Anti-reflective · Blue-light filtering", date: "2026-10-09", step: 1, total: 98000 },
];