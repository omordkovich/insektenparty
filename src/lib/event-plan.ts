import type { DateMode, DateModeRequest } from "@/lib/date-poll";

// A free event keeps to a short date window and a fixed date; a paid event
// may also run a poll or stay open. Pure rules shared by the services and
// the event dialog - free of React and the database.

export type EventPlan = "free" | "paid";

export function isEventPlan(value: unknown): value is EventPlan {
  return value === "free" || value === "paid";
}

// How far after its creation an event's date may lie.
export const DATE_WINDOW_MONTHS: Record<EventPlan, number> = { free: 3, paid: 12 };

// Calendar months later, the day capped at the month's end (31.01. + 1 = 28.02.).
export function addMonths(iso: string, months: number): string {
  const [year, month, day] = iso.split("-").map(Number);
  const target = new Date(Date.UTC(year, month - 1 + months, 1));
  const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  target.setUTCDate(Math.min(day, lastDay));
  return target.toISOString().slice(0, 10);
}

export function latestAllowedDate(plan: EventPlan, createdOn: string): string {
  return addMonths(createdOn, DATE_WINDOW_MONTHS[plan]);
}

export function canUseDateMode(plan: EventPlan, mode: DateMode): boolean {
  return plan === "paid" || mode === "fixed";
}

export function dateWindowError(plan: EventPlan): string {
  return `Das Datum darf höchstens ${DATE_WINDOW_MONTHS[plan]} Monate nach dem Erstellen des Events liegen.`;
}

// What a plan forbids in a date change: a mode it does not include (403)
// or a date beyond its window (400). null = allowed.
export function checkPlanRules(
  plan: EventPlan,
  createdOn: string,
  request: DateModeRequest,
): { status: 400 | 403; error: string } | null {
  if (!canUseDateMode(plan, request.mode)) {
    return { status: 403, error: "Abstimmung und offener Termin gibt es nur mit einem freigeschalteten Event." };
  }
  let dates: string[] = [];
  if (request.mode === "fixed") {
    dates = request.endDate ? [request.date, request.endDate] : [request.date];
  } else if (request.mode === "poll") {
    const proposals = "proposals" in request ? request.proposals : request.addProposals;
    dates = proposals.map((proposal) => proposal.date);
  }
  const latest = latestAllowedDate(plan, createdOn);
  if (dates.some((date) => date > latest)) return { status: 400, error: dateWindowError(plan) };
  return null;
}
