import {
  POLL_MAX_OPTIONS,
  POLL_MIN_OPTIONS,
  isDateMode,
  needsConfirm,
  planDateModeChange,
  todayInBerlin,
  transferredGuests,
  type DateModeRequest,
  type PollOption,
} from "@/lib/date-poll";
import { checkPlanRules } from "@/lib/event-plan";
import {
  validateFixedDate,
  validateProposals,
  type EventSchedule,
  type FieldResult,
} from "@/lib/validation";
import {
  applyDateModeChange,
  countGuests,
  getEventDateMode,
  getPollOptions,
  getPollVotes,
} from "@/repositories/date-poll-repository";
import { getEventPlanInfo } from "@/repositories/event-repository";
import { denyIfOver } from "@/services/event-lifecycle-service";

export type DateModeResult =
  | { ok: true }
  | { ok: false; status: number; error: string; confirm?: { guests: number; votes: number } };

type ParsedDateMode = { request: DateModeRequest; schedule: EventSchedule | null };

// The body of PUT .../date-mode (and "date" when creating an event).
export function parseDateModeRequest(
  body: unknown,
  existing: PollOption[],
  today: string,
): FieldResult<ParsedDateMode> {
  const value = (body ?? {}) as Record<string, unknown>;
  if (!isDateMode(value.mode)) {
    return { ok: false, error: "Bitte wähle, wie der Termin festgelegt wird." };
  }
  if (value.mode === "unknown") {
    return { ok: true, value: { request: { mode: "unknown" }, schedule: null } };
  }
  if (value.mode === "poll") {
    if (value.addProposals !== undefined) {
      const added = validateProposals(value.addProposals, {
        today,
        min: 1,
        max: POLL_MAX_OPTIONS - existing.length,
        existing,
      });
      if (!added.ok) return added;
      return { ok: true, value: { request: { mode: "poll", addProposals: added.value }, schedule: null } };
    }
    const proposals = validateProposals(value.proposals, { today, min: POLL_MIN_OPTIONS, max: POLL_MAX_OPTIONS });
    if (!proposals.ok) return proposals;
    return { ok: true, value: { request: { mode: "poll", proposals: proposals.value }, schedule: null } };
  }

  const fixed = validateFixedDate(value, { today });
  if (!fixed.ok) return fixed;
  const fromOptionId = typeof value.fromOptionId === "string" ? value.fromOptionId : null;
  return {
    ok: true,
    value: {
      request: { mode: "fixed", ...fixed.value.proposal, endDate: fixed.value.endDate, fromOptionId },
      schedule: fixed.value.schedule,
    },
  };
}

// Owner switches between "Noch kein Termin", "Abstimmen" and "Fester
// Termin". Anything that deletes guests or votes needs confirm: true -
// without it the counts come back so the dialog can ask first.
export async function changeDateMode(eventId: string, ownerId: string, body: unknown): Promise<DateModeResult> {
  const info = await getEventPlanInfo(eventId);
  const mode = await getEventDateMode(eventId);
  if (!info || info.ownerId !== ownerId || !mode) {
    return { ok: false, status: 404, error: "Event wurde nicht gefunden." };
  }
  const over = await denyIfOver(eventId);
  if (over) return over;

  const [options, votes, guestCount] = await Promise.all([
    getPollOptions(eventId),
    getPollVotes(eventId),
    countGuests(eventId),
  ]);

  const parsed = parseDateModeRequest(body, mode === "poll" ? options : [], todayInBerlin());
  if (!parsed.ok) return { ok: false, status: 400, error: parsed.error };

  // What the event's plan allows: the mode (free = fixed only) and how far
  // ahead the date may lie.
  const violation = checkPlanRules(info.plan, info.createdOn, parsed.value.request);
  if (violation) return { ok: false, status: violation.status, error: violation.error };

  const planned = planDateModeChange({ mode, options, voteCount: votes.length, guestCount }, parsed.value.request);
  if (!planned.ok) return { ok: false, status: 400, error: planned.error };
  const { plan } = planned;

  if (needsConfirm(plan) && (body as { confirm?: unknown } | null)?.confirm !== true) {
    return {
      ok: false,
      status: 409,
      error: "Bitte bestätige, dass dabei Daten gelöscht werden.",
      confirm: { guests: plan.lostGuests, votes: plan.lostVotes },
    };
  }

  const option = options.find((candidate) => candidate.id === plan.transferOptionId);
  const saved = await applyDateModeChange(eventId, ownerId, {
    mode: parsed.value.request.mode,
    schedule: parsed.value.schedule,
    plan,
    transferGuests: option ? transferredGuests(option, votes) : [],
  });
  return saved ? { ok: true } : { ok: false, status: 404, error: "Event wurde nicht gefunden." };
}
