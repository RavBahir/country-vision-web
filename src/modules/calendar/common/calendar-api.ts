// pages/calendar/common/calendar-api.ts
import { apiClient } from "@/lib/api-client";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { calendarKeys, type ICalEvent } from "./calendar";

export const useCalendar = (from: string, to: string, mine = false) =>
  useQuery({
    queryKey: calendarKeys.range(from, to, mine),
    queryFn: async () => {
      const qs = new URLSearchParams({ from, to, ...(mine ? { mine: "true" } : {}) });
      return (await apiClient<{ data: ICalEvent[] }>(`/calendar?${qs}`)).data;
    },
    placeholderData: keepPreviousData, // no blank grid while changing month
    staleTime: 30_000,
  });