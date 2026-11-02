import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PollOption, PollVote } from "@/lib/date-poll";

vi.mock("@/repositories/event-repository", () => ({
  getEventPlanInfo: vi.fn(async () => ({ ownerId: "owner-1", plan: "paid", createdOn: "2026-06-01" })),
}));
vi.mock("@/repositories/date-poll-repository", () => ({
  getEventDateMode: vi.fn(),
  getPollOptions: vi.fn(async () => []),
  getPollVotes: vi.fn(async () => []),
  countGuests: vi.fn(async () => 0),
  applyDateModeChange: vi.fn(async () => true),
}));
vi.mock("@/services/event-lifecycle-service", () => ({
  EVENT_OVER_ERROR: "Dieses Event ist vorbei.",
  denyIfOver: vi.fn(async () => null),
}));
vi.mock("@/lib/date-poll", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/date-poll")>()),
  todayInBerlin: () => "2026-07-01",
}));

const { changeDateMode } = await import("@/services/date-mode-service");
const repo = await import("@/repositories/date-poll-repository");
const { getEventPlanInfo } = await import("@/repositories/event-repository");
const { denyIfOver } = await import("@/services/event-lifecycle-service");

const option: PollOption = { id: "a", date: "2026-07-11", startTime: "15:00", endTime: "18:00", createdAt: "2026-06-01T10:00:00.000Z" };
const votes: PollVote[] = [
  { id: "v1", name: "Anna", optionIds: ["a"], noneFit: false, updatedAt: "2026-06-02T10:00:00.000Z" },
  { id: "v2", name: "Ben", optionIds: [], noneFit: true, updatedAt: "2026-06-02T10:00:00.000Z" },
];

describe("changeDateMode", () => {
  beforeEach(() => {
    vi.mocked(getEventPlanInfo).mockResolvedValue({ ownerId: "owner-1", plan: "paid", createdOn: "2026-06-01" });
    vi.mocked(repo.applyDateModeChange).mockClear();
    vi.mocked(repo.getEventDateMode).mockResolvedValue("fixed");
    vi.mocked(repo.getPollOptions).mockResolvedValue([]);
    vi.mocked(repo.getPollVotes).mockResolvedValue([]);
    vi.mocked(repo.countGuests).mockResolvedValue(0);
  });

  it("refuses once the event is over, without writing", async () => {
    vi.mocked(denyIfOver).mockResolvedValueOnce({ ok: false, status: 409, error: "Dieses Event ist vorbei." });
    expect(await changeDateMode("event-1", "owner-1", { mode: "unknown", confirm: true })).toEqual({
      ok: false,
      status: 409,
      error: "Dieses Event ist vorbei.",
    });
    expect(repo.applyDateModeChange).not.toHaveBeenCalled();
  });

  it("only lets the owner change it", async () => {
    expect(await changeDateMode("event-1", "someone", { mode: "unknown" })).toMatchObject({ ok: false, status: 404 });
  });

  it("asks for confirmation before emptying the guest list", async () => {
    vi.mocked(repo.countGuests).mockResolvedValue(7);
    expect(await changeDateMode("event-1", "owner-1", { mode: "unknown" })).toEqual({
      ok: false,
      status: 409,
      error: "Bitte bestätige, dass dabei Daten gelöscht werden.",
      confirm: { guests: 7, votes: 0 },
    });
    expect(repo.applyDateModeChange).not.toHaveBeenCalled();

    expect(await changeDateMode("event-1", "owner-1", { mode: "unknown", confirm: true })).toEqual({ ok: true });
    expect(vi.mocked(repo.applyDateModeChange).mock.calls[0][2]).toMatchObject({
      mode: "unknown",
      schedule: null,
      plan: { clearGuests: true },
    });
  });

  it("starts a poll with validated proposals", async () => {
    vi.mocked(repo.getEventDateMode).mockResolvedValue("unknown");
    const proposals = [
      { date: "2026-07-11", startTime: "15:00", endTime: "18:00" },
      { date: "2026-07-12", startTime: "15:00", endTime: null },
    ];
    expect(await changeDateMode("event-1", "owner-1", { mode: "poll", proposals })).toEqual({ ok: true });
    expect(vi.mocked(repo.applyDateModeChange).mock.calls[0][2].plan.newOptions).toEqual(proposals);
    expect(await changeDateMode("event-1", "owner-1", { mode: "poll", proposals: [proposals[0]] })).toEqual({
      ok: false,
      status: 400,
      error: "Bitte gib mindestens 2 Termine an.",
    });
  });

  it("transfers the votes when fixing a proposal", async () => {
    vi.mocked(repo.getEventDateMode).mockResolvedValue("poll");
    vi.mocked(repo.getPollOptions).mockResolvedValue([option]);
    vi.mocked(repo.getPollVotes).mockResolvedValue(votes);
    const result = await changeDateMode("event-1", "owner-1", {
      mode: "fixed",
      date: "2026-07-11",
      startTime: "15:00",
      endTime: "18:00",
      fromOptionId: "a",
    });
    expect(result).toEqual({ ok: true });
    const change = vi.mocked(repo.applyDateModeChange).mock.calls[0][2];
    expect(change.schedule).toEqual({ eventDate: "2026-07-11", eventEndDate: null, eventStartTime: "15:00", eventEndTime: "18:00" });
    expect(change.transferGuests.map((g) => [g.name, g.declined])).toEqual([
      ["Anna", false],
      ["Ben", true],
    ]);
  });

  it("asks before dropping votes for another date", async () => {
    vi.mocked(repo.getEventDateMode).mockResolvedValue("poll");
    vi.mocked(repo.getPollOptions).mockResolvedValue([option]);
    vi.mocked(repo.getPollVotes).mockResolvedValue(votes);
    expect(
      await changeDateMode("event-1", "owner-1", { mode: "fixed", date: "2026-07-20", startTime: "15:00" }),
    ).toMatchObject({ ok: false, status: 409, confirm: { guests: 0, votes: 2 } });
  });
  it("treats a missing event as not found", async () => {
    vi.mocked(getEventPlanInfo).mockResolvedValue(undefined);
    expect(await changeDateMode("event-1", "owner-1", { mode: "unknown" })).toMatchObject({ ok: false, status: 404 });
  });

  describe("plan rules", () => {
    const freeEvent = () =>
      vi.mocked(getEventPlanInfo).mockResolvedValue({ ownerId: "owner-1", plan: "free", createdOn: "2026-06-01" });
    const pollOn = (date: string) => ({
      mode: "poll",
      proposals: [
        { date: "2026-07-11", startTime: "15:00", endTime: null },
        { date, startTime: "15:00", endTime: null },
      ],
    });

    it("keeps a free event to a fixed date", async () => {
      freeEvent();
      for (const body of [{ mode: "poll", proposals: pollOn("2026-07-12").proposals }, { mode: "unknown" }]) {
        expect(await changeDateMode("event-1", "owner-1", body)).toEqual({
          ok: false,
          status: 403,
          error: "Abstimmung und offener Termin gibt es nur mit einem freigeschalteten Event.",
        });
      }
      expect(repo.applyDateModeChange).not.toHaveBeenCalled();
    });

    it("keeps a free event's fixed date within 3 months of its creation", async () => {
      freeEvent();
      const outside = { mode: "fixed", date: "2026-09-02", startTime: null, endTime: null };
      expect(await changeDateMode("event-1", "owner-1", outside)).toEqual({
        ok: false,
        status: 400,
        error: "Das Datum darf höchstens 3 Monate nach dem Erstellen des Events liegen.",
      });
      const multiDay = { mode: "fixed", date: "2026-08-30", endDate: "2026-09-02", startTime: null, endTime: null };
      expect(await changeDateMode("event-1", "owner-1", multiDay)).toMatchObject({ ok: false, status: 400 });
      expect(repo.applyDateModeChange).not.toHaveBeenCalled();

      expect(await changeDateMode("event-1", "owner-1", { ...outside, date: "2026-09-01" })).toEqual({ ok: true });
    });

    it("rejects a fixed date in the past before anything else", async () => {
      expect(await changeDateMode("event-1", "owner-1", { mode: "fixed", date: "2026-06-30" })).toEqual({
        ok: false,
        status: 400,
        error: "Das Datum liegt in der Vergangenheit.",
      });
    });

    it("keeps a paid event's poll within 12 months of its creation", async () => {
      vi.mocked(repo.getEventDateMode).mockResolvedValue("unknown");
      expect(await changeDateMode("event-1", "owner-1", pollOn("2027-06-02"))).toEqual({
        ok: false,
        status: 400,
        error: "Das Datum darf höchstens 12 Monate nach dem Erstellen des Events liegen.",
      });
      expect(await changeDateMode("event-1", "owner-1", pollOn("2027-06-01"))).toEqual({ ok: true });
    });

    it("applies the window to proposals added to a running poll", async () => {
      vi.mocked(repo.getEventDateMode).mockResolvedValue("poll");
      vi.mocked(repo.getPollOptions).mockResolvedValue([option]);
      const added = (date: string) => ({ mode: "poll", addProposals: [{ date, startTime: null, endTime: null }] });
      expect(await changeDateMode("event-1", "owner-1", added("2027-07-01"))).toMatchObject({ ok: false, status: 400 });
      expect(await changeDateMode("event-1", "owner-1", added("2026-12-01"))).toEqual({ ok: true });
    });
  });
});
