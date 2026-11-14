import type { Locale } from "@/i18n/config";
import { err, type ErrorMessage } from "@/i18n/errors";
import type { EventSchedule, GuestInput } from "@/lib/validation";

// Terminabstimmung: an event's date is still open ("unknown"), being voted
// on ("poll") or fixed. Pure helpers shared by the event dialog, the poll
// section and the services - free of React and the database.

export const DATE_MODES = ["unknown", "poll", "fixed"] as const;
export type DateMode = (typeof DATE_MODES)[number];

export function isDateMode(value: unknown): value is DateMode {
  return (DATE_MODES as readonly unknown[]).includes(value);
}

export const POLL_MIN_OPTIONS = 2;
export const POLL_MAX_OPTIONS = 4;

/** startTime is optional: a proposal may be just a day. */
export type Proposal = { date: string; startTime: string | null; endTime: string | null };
export type PollOption = Proposal & { id: string; createdAt: string };
export type PollVote = {
  id: string;
  name: string;
  optionIds: string[];
  noneFit: boolean;
  updatedAt: string;
};
export type VoteAnswer = "yes" | "no" | "unseen";
// What GET .../poll-votes returns: each vote with its answer per option.
export type PollVoteDto = PollVote & { answers: Record<string, VoteAnswer> };
export type PollDto = { options: PollOption[]; votes: PollVoteDto[] };

const WEEKDAYS: Record<Locale, string[]> = {
  de: ["So.", "Mo.", "Di.", "Mi.", "Do.", "Fr.", "Sa."],
  en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  ru: ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
};

function utcDate(iso: string): Date {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export function addDays(iso: string, days: number): string {
  const date = utcDate(iso);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

const POLL_DAY: Record<Locale, (weekday: string, day: string, month: string) => string> = {
  de: (weekday, day, month) => `${weekday} ${day}.${month}.`,
  en: (weekday, day, month) => `${weekday} ${day}/${month}`,
  ru: (weekday, day, month) => `${weekday} ${day}.${month}`,
};
const POLL_FROM: Record<Locale, string> = { de: "ab", en: "from", ru: "с" };
const NONE_FIT: Record<Locale, string> = {
  de: "Nichts davon passt",
  en: "None of these work",
  ru: "Ничего не подходит",
};

// "Sa. 11.07. · 15:00–18:00", without an end "Sa. 11.07. · ab 15:00",
// without any time just "Sa. 11.07.".
export function formatPollOptionLabel(proposal: Proposal, locale: Locale): string {
  const date = utcDate(proposal.date);
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const weekday = WEEKDAYS[locale][date.getUTCDay()];
  const label = POLL_DAY[locale](weekday, day, month);
  if (!proposal.startTime) return label;
  const time = proposal.endTime
    ? `${proposal.startTime}–${proposal.endTime}`
    : `${POLL_FROM[locale]} ${proposal.startTime}`;
  return `${label} · ${time}`;
}

// Today where the events take place - proposals must not lie before it.
export function todayInBerlin(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Berlin" }).format(now);
}

// A proposal as event date/time. An end before the start means "until
// after midnight": the event then ends on the next day.
export function proposalSchedule(proposal: Proposal): EventSchedule {
  const overnight =
    proposal.startTime !== null && proposal.endTime !== null && proposal.endTime < proposal.startTime;
  return {
    eventDate: proposal.date,
    eventEndDate: overnight ? addDays(proposal.date, 1) : null,
    eventStartTime: proposal.startTime,
    eventEndTime: proposal.endTime,
  };
}

export function sameProposal(a: Proposal, b: Proposal): boolean {
  return a.date === b.date && a.startTime === b.startTime && (a.endTime ?? null) === (b.endTime ?? null);
}

// A vote older than the option was cast before the option existed: that
// guest never saw it ("?") - neither a yes nor a no.
export function voteAnswer(vote: PollVote, option: PollOption): VoteAnswer {
  if (vote.optionIds.includes(option.id)) return "yes";
  return Date.parse(vote.updatedAt) < Date.parse(option.createdAt) ? "unseen" : "no";
}

export function countYes(option: PollOption, votes: PollVote[]): number {
  return votes.filter((vote) => vote.optionIds.includes(option.id)).length;
}

// The option(s) with the most yes votes - none while nobody said yes.
export function leadingOptionIds(options: PollOption[], votes: PollVote[]): string[] {
  const counts = options.map((option) => countYes(option, votes));
  const max = Math.max(0, ...counts);
  if (max === 0) return [];
  return options.filter((_, index) => counts[index] === max).map((option) => option.id);
}

// "Sa. 11.07. · 15:00–18:00, So. 12.07. · ab 20:00" or "Nichts davon passt".
export function describeChoice(
  vote: { optionIds: string[]; noneFit: boolean },
  options: PollOption[],
  locale: Locale,
): string {
  if (vote.noneFit) return NONE_FIT[locale];
  return options
    .filter((option) => vote.optionIds.includes(option.id))
    .map((option) => formatPollOptionLabel(option, locale))
    .join(", ");
}

// Fixing a proposal: yes becomes an acceptance (arriving at the start, if
// the proposal has a time), no a decline; guests who never saw the
// proposal are left out.
export function transferredGuests(option: PollOption, votes: PollVote[]): GuestInput[] {
  const guests: GuestInput[] = [];
  for (const vote of votes) {
    const answer = voteAnswer(vote, option);
    if (answer === "unseen") continue;
    const coming = answer === "yes";
    guests.push({
      name: vote.name,
      additionalGuests: 0,
      additionalGuestNames: [],
      arrivalTime: coming ? option.startTime : null,
      arrivalEndTime: null,
      departureTime: null,
      departureEndTime: null,
      bringingSomething: false,
      bringingDescription: null,
      hasMessage: false,
      message: null,
      declined: !coming,
    });
  }
  return guests;
}

// --- Changing the date mode ---------------------------------------------------------

export type DateModeRequest =
  | { mode: "unknown" }
  | { mode: "poll"; proposals: Proposal[] }
  | { mode: "poll"; addProposals: Proposal[] }
  | {
      mode: "fixed";
      date: string;
      startTime: string | null;
      endTime: string | null;
      /** Last day of an event over several days; null = one day. */
      endDate: string | null;
      fromOptionId: string | null;
    };

export type DateModeState = {
  mode: DateMode;
  options: PollOption[];
  voteCount: number;
  guestCount: number;
};

export type DateModePlan = {
  clearGuests: boolean;
  clearPoll: boolean;
  newOptions: Proposal[];
  transferOptionId: string | null;
  lostGuests: number;
  lostVotes: number;
};

type PlanResult = { ok: true; plan: DateModePlan } | { ok: false; error: ErrorMessage };

// What a change does: leaving "fixed" empties the guest list, leaving or
// restarting a poll drops its votes, fixing a proposal transfers them.
export function planDateModeChange(state: DateModeState, request: DateModeRequest): PlanResult {
  const fromFixed = state.mode === "fixed";
  const fromPoll = state.mode === "poll";
  let clearGuests = false;
  let clearPoll = false;
  let newOptions: Proposal[] = [];
  let transferOptionId: string | null = null;
  let votesLost = false;

  if (request.mode === "unknown") {
    clearGuests = fromFixed;
    clearPoll = fromPoll;
    votesLost = fromPoll;
  } else if (request.mode === "poll" && "addProposals" in request) {
    if (!fromPoll) return { ok: false, error: err("noPollRunning") };
    newOptions = request.addProposals;
  } else if (request.mode === "poll") {
    clearGuests = fromFixed;
    clearPoll = fromPoll;
    votesLost = fromPoll;
    newOptions = request.proposals;
  } else if (request.fromOptionId) {
    const option = state.options.find((candidate) => candidate.id === request.fromOptionId);
    // Proposals are single-day: one with an end date is a different date.
    if (!fromPoll || !option || request.endDate !== null || !sameProposal(option, request)) {
      return { ok: false, error: err("proposalMismatch") };
    }
    clearPoll = true;
    transferOptionId = option.id;
  } else {
    clearPoll = fromPoll;
    votesLost = fromPoll;
  }

  return {
    ok: true,
    plan: {
      clearGuests,
      clearPoll,
      newOptions,
      transferOptionId,
      lostGuests: clearGuests ? state.guestCount : 0,
      lostVotes: votesLost ? state.voteCount : 0,
    },
  };
}

export function needsConfirm(plan: DateModePlan): boolean {
  return plan.lostGuests > 0 || plan.lostVotes > 0;
}
