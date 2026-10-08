import {
  POLL_MAX_OPTIONS,
  POLL_MIN_OPTIONS,
  sameProposal,
  type DateMode,
  type DateModeRequest,
  type PollOption,
} from "@/lib/date-poll";
import { validateFixedDate, validateProposals } from "@/lib/validation";

// The "Termin" block of the event dialog as editable state, and how it
// turns into a PUT .../date-mode request (null = nothing to change).

export type PollOptionSummary = PollOption & { yesCount: number };

export type DateSettings = {
  mode: DateMode;
  date: string | null;
  /** Last day of a fixed event over several days. */
  endDate: string | null;
  startTime: string | null;
  endTime: string | null;
  options: PollOptionSummary[];
  voteCount: number;
};

export type ProposalRow = { key: number; date: string; startTime: string; endTime: string };

export type DateDraft = {
  mode: DateMode | null;
  rows: ProposalRow[];
  /** "Abstimmung neu machen": the running poll is replaced by the rows. */
  restart: boolean;
  fixed: { date: string; endDate: string; startTime: string; endTime: string };
};

let nextRowKey = 0;

export function emptyRow(): ProposalRow {
  nextRowKey += 1;
  return { key: nextRowKey, date: "", startTime: "", endTime: "" };
}

export function initialDateDraft(original: DateSettings | null): DateDraft {
  return {
    mode: original?.mode ?? null,
    rows: original?.mode === "poll" ? [] : [emptyRow(), emptyRow()],
    restart: false,
    fixed: {
      date: original?.date ?? "",
      endDate: original?.endDate ?? "",
      startTime: original?.startTime ?? "",
      endTime: original?.endTime ?? "",
    },
  };
}

type BuildResult = { ok: true; request: DateModeRequest | null } | { ok: false; error: string };

export function buildDateModeRequest(original: DateSettings | null, draft: DateDraft, today: string): BuildResult {
  if (!draft.mode) return { ok: false, error: "Bitte wähle, wie der Termin festgelegt wird." };

  if (draft.mode === "unknown") {
    return { ok: true, request: original?.mode === "unknown" ? null : { mode: "unknown" } };
  }

  if (draft.mode === "poll") {
    const rows = draft.rows
      .filter((row) => row.date || row.startTime || row.endTime)
      .map((row) => ({ date: row.date, startTime: row.startTime, endTime: row.endTime }));
    if (original?.mode === "poll" && !draft.restart) {
      if (rows.length === 0) return { ok: true, request: null };
      const added = validateProposals(rows, {
        today,
        min: 1,
        max: POLL_MAX_OPTIONS - original.options.length,
        existing: original.options,
      });
      return added.ok ? { ok: true, request: { mode: "poll", addProposals: added.value } } : added;
    }
    const proposals = validateProposals(rows, { today, min: POLL_MIN_OPTIONS, max: POLL_MAX_OPTIONS });
    return proposals.ok ? { ok: true, request: { mode: "poll", proposals: proposals.value } } : proposals;
  }

  // Older events may be "fixed" without any date - saving only the design
  // or password must not demand one.
  const { fixed } = draft;
  if (
    original?.mode === "fixed" &&
    !original.date &&
    !fixed.date &&
    !fixed.endDate &&
    !fixed.startTime &&
    !fixed.endTime
  ) {
    return { ok: true, request: null };
  }
  const result = validateFixedDate(fixed);
  if (!result.ok) return result;
  const { proposal, endDate } = result.value;
  if (
    original?.mode === "fixed" &&
    original.date &&
    (original.endDate ?? null) === endDate &&
    sameProposal(proposal, { date: original.date, startTime: original.startTime, endTime: original.endTime })
  ) {
    return { ok: true, request: null };
  }
  const fromOption =
    original?.mode === "poll" && endDate === null
      ? original.options.find((option) => sameProposal(option, proposal))
      : undefined;
  return { ok: true, request: { mode: "fixed", ...proposal, endDate, fromOptionId: fromOption?.id ?? null } };
}
