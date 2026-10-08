import { describe, expect, it } from "vitest";
import {
  addDays,
  describeChoice,
  formatPollOptionLabel,
  leadingOptionIds,
  needsConfirm,
  planDateModeChange,
  proposalSchedule,
  transferredGuests,
  voteAnswer,
  type DateModeState,
  type PollOption,
  type PollVote,
} from "@/lib/date-poll";

const optionA: PollOption = { id: "a", date: "2026-07-11", startTime: "15:00", endTime: "18:00", createdAt: "2026-06-01T10:00:00.000Z" };
const optionB: PollOption = { id: "b", date: "2026-07-12", startTime: "20:00", endTime: "01:00", createdAt: "2026-06-05T10:00:00.000Z" };

function vote(overrides: Partial<PollVote>): PollVote {
  return { id: "v", name: "Anna", optionIds: [], noneFit: false, updatedAt: "2026-06-02T10:00:00.000Z", ...overrides };
}

describe("labels and dates", () => {
  it("formats a proposal compactly", () => {
    expect(formatPollOptionLabel(optionA)).toBe("Sa. 11.07. · 15:00–18:00");
    expect(formatPollOptionLabel({ ...optionA, endTime: null })).toBe("Sa. 11.07. · ab 15:00");
    expect(formatPollOptionLabel({ ...optionA, startTime: null, endTime: null })).toBe("Sa. 11.07.");
  });

  it("adds days across month ends", () => {
    expect(addDays("2026-07-31", 1)).toBe("2026-08-01");
  });

  it("ends an overnight proposal on the next day", () => {
    expect(proposalSchedule(optionB)).toEqual({
      eventDate: "2026-07-12",
      eventEndDate: "2026-07-13",
      eventStartTime: "20:00",
      eventEndTime: "01:00",
    });
    expect(proposalSchedule(optionA).eventEndDate).toBeNull();
  });

  it("describes a choice for the owner's e-mail", () => {
    expect(describeChoice(vote({ optionIds: ["a", "b"] }), [optionA, optionB])).toBe(
      "Sa. 11.07. · 15:00–18:00, So. 12.07. · 20:00–01:00",
    );
    expect(describeChoice(vote({ noneFit: true }), [optionA])).toBe("Nichts davon passt");
  });
});

describe("answers", () => {
  it("treats votes older than an option as unseen", () => {
    const early = vote({ optionIds: ["a"], updatedAt: "2026-06-02T10:00:00.000Z" });
    expect(voteAnswer(early, optionA)).toBe("yes");
    expect(voteAnswer(early, optionB)).toBe("unseen");
    expect(voteAnswer(vote({ updatedAt: "2026-06-06T10:00:00.000Z" }), optionB)).toBe("no");
  });

  it("finds the leading option(s), none without any yes", () => {
    const votes = [vote({ optionIds: ["a"] }), vote({ optionIds: ["a", "b"] })];
    expect(leadingOptionIds([optionA, optionB], votes)).toEqual(["a"]);
    expect(leadingOptionIds([optionA, optionB], [vote({ optionIds: ["a"] }), vote({ optionIds: ["b"] })])).toEqual(["a", "b"]);
    expect(leadingOptionIds([optionA], [vote({ noneFit: true })])).toEqual([]);
  });

  it("turns votes into acceptances and declines, skipping unseen", () => {
    const votes = [
      vote({ name: "Ja", optionIds: ["b"], updatedAt: "2026-06-06T10:00:00.000Z" }),
      vote({ name: "Nein", noneFit: true, updatedAt: "2026-06-06T10:00:00.000Z" }),
      vote({ name: "Alt", optionIds: ["a"], updatedAt: "2026-06-02T10:00:00.000Z" }),
    ];
    const guests = transferredGuests(optionB, votes);
    expect(guests.map((g) => [g.name, g.declined, g.arrivalTime])).toEqual([
      ["Ja", false, "20:00"],
      ["Nein", true, null],
    ]);
    expect(guests[0]).toMatchObject({ additionalGuests: 0, bringingSomething: false, hasMessage: false });
    const untimed = transferredGuests({ ...optionB, startTime: null, endTime: null }, votes);
    expect(untimed[0]).toMatchObject({ name: "Ja", declined: false, arrivalTime: null });
  });
});

describe("planDateModeChange", () => {
  const fixed: DateModeState = { mode: "fixed", options: [], voteCount: 0, guestCount: 7 };
  const poll: DateModeState = { mode: "poll", options: [optionA, optionB], voteCount: 6, guestCount: 0 };
  const unknown: DateModeState = { mode: "unknown", options: [], voteCount: 0, guestCount: 0 };
  const proposals = [{ date: "2026-08-01", startTime: "10:00", endTime: null }];

  it("clears the guest list when leaving a fixed date", () => {
    const result = planDateModeChange(fixed, { mode: "unknown" });
    expect(result).toMatchObject({ ok: true, plan: { clearGuests: true, lostGuests: 7, lostVotes: 0 } });
    expect(result.ok && needsConfirm(result.plan)).toBe(true);
    expect(planDateModeChange(fixed, { mode: "poll", proposals })).toMatchObject({
      ok: true,
      plan: { clearGuests: true, newOptions: proposals, lostGuests: 7 },
    });
  });

  it("drops votes when leaving or restarting a poll", () => {
    expect(planDateModeChange(poll, { mode: "unknown" })).toMatchObject({ ok: true, plan: { clearPoll: true, lostVotes: 6 } });
    expect(planDateModeChange(poll, { mode: "poll", proposals })).toMatchObject({
      ok: true,
      plan: { clearPoll: true, newOptions: proposals, lostVotes: 6 },
    });
  });

  it("keeps votes when adding proposals, only to a running poll", () => {
    const result = planDateModeChange(poll, { mode: "poll", addProposals: proposals });
    expect(result).toMatchObject({ ok: true, plan: { clearPoll: false, newOptions: proposals, lostVotes: 0 } });
    expect(result.ok && needsConfirm(result.plan)).toBe(false);
    expect(planDateModeChange(unknown, { mode: "poll", addProposals: proposals })).toEqual({
      ok: false,
      error: "Es läuft keine Abstimmung.",
    });
  });

  it("transfers votes when fixing a proposal, otherwise they are lost", () => {
    expect(
      planDateModeChange(poll, { mode: "fixed", date: "2026-07-11", startTime: "15:00", endTime: "18:00", endDate: null, fromOptionId: "a" }),
    ).toMatchObject({ ok: true, plan: { clearPoll: true, transferOptionId: "a", lostVotes: 0 } });
    expect(
      planDateModeChange(poll, { mode: "fixed", date: "2026-07-20", startTime: "15:00", endTime: null, endDate: null, fromOptionId: null }),
    ).toMatchObject({ ok: true, plan: { clearPoll: true, transferOptionId: null, lostVotes: 6 } });
    expect(
      planDateModeChange(poll, { mode: "fixed", date: "2026-07-20", startTime: "15:00", endTime: null, endDate: null, fromOptionId: "a" }),
    ).toEqual({ ok: false, error: "Der gewählte Vorschlag passt nicht zum Termin." });
    expect(
      planDateModeChange(poll, { mode: "fixed", date: "2026-07-11", startTime: "15:00", endTime: "18:00", endDate: "2026-07-12", fromOptionId: "a" }),
    ).toEqual({ ok: false, error: "Der gewählte Vorschlag passt nicht zum Termin." });
  });

  it("loses nothing when moving forward from unknown or changing a fixed date", () => {
    for (const result of [
      planDateModeChange(unknown, { mode: "poll", proposals }),
      planDateModeChange(unknown, { mode: "fixed", date: "2026-07-20", startTime: "15:00", endTime: null, endDate: null, fromOptionId: null }),
      planDateModeChange(fixed, { mode: "fixed", date: "2026-07-20", startTime: "15:00", endTime: null, endDate: null, fromOptionId: null }),
    ]) {
      expect(result.ok && needsConfirm(result.plan)).toBe(false);
      expect(result).toMatchObject({ ok: true, plan: { clearGuests: false } });
    }
  });
});
