import { addDays, type DateMode } from "@/lib/date-poll";
import { addMonths } from "@/lib/event-plan";

// An event ends with its Stichtag (cut-off day): "over" the day after,
// "expired" after 30 days, deleted after 90. Pure helpers - dates are
// YYYY-MM-DD strings in Berlin time.

export const OVER_AFTER_DAYS = 1;
export const EXPIRED_AFTER_DAYS = 30;
export const DELETE_AFTER_DAYS = 90;

// An event without any date lives this long after its creation.
const UNDATED_MONTHS = 6;

export type LifecycleInput = {
  dateMode: DateMode;
  eventDate: string | null;
  eventEndDate: string | null;
  createdOn: string;
  latestPollDate: string | null;
};

// The last day the event can still take place: its (end) date, the latest
// poll proposal, else six months after creation.
export function stichtag(input: LifecycleInput): string {
  const fallback = addMonths(input.createdOn, UNDATED_MONTHS);
  if (input.dateMode === "fixed") return input.eventEndDate ?? input.eventDate ?? fallback;
  if (input.dateMode === "poll") return input.latestPollDate ?? fallback;
  return fallback;
}

export type LifecycleStage = "active" | "over" | "expired";

export function lifecycleStage(stichtag: string, today: string): LifecycleStage {
  if (today >= addDays(stichtag, EXPIRED_AFTER_DAYS)) return "expired";
  if (today >= addDays(stichtag, OVER_AFTER_DAYS)) return "over";
  return "active";
}

export function deletionDate(stichtag: string): string {
  return addDays(stichtag, DELETE_AFTER_DAYS);
}

export function isDueForDeletion(stichtag: string, today: string): boolean {
  return today >= deletionDate(stichtag);
}

// Everything the pages need to know about where an event stands today.
export function lifecycleOf(
  input: LifecycleInput,
  today: string,
): { stichtag: string; stage: LifecycleStage; deletionDate: string } {
  const day = stichtag(input);
  return { stichtag: day, stage: lifecycleStage(day, today), deletionDate: deletionDate(day) };
}
