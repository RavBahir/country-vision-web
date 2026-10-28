// app/portal/schedule/common.ts
import type { ApptStatus } from "@/pages/appointments/common/appointments";
import { allRoutes } from "@/routes/routes";

export { STATUS_TONE, TYPE_LABEL, TYPE_OPTIONS } from "@/app/portal/appointments/common";

/** Staff-facing wording. Customers see friendlier labels. */
export const STAFF_STATUS_LABEL: Record<ApptStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  in_progress: "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No-show",
};

export const SCHEDULE_ROUTE = allRoutes.PORTAL + allRoutes.SCHEDULES;

export const useDebounced = <T,>(value: T, ms = 300): T => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { useEffect, useState } = require("react") as typeof import("react");
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
};