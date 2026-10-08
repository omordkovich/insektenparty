import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PollOption, PollVote } from "@/lib/date-poll";

vi.mock("@/repositories/event-repository", () => ({ getEventOwnerId: vi.fn(async () => "owner-1") }));
vi.mock("@/repositories/date-poll-repository", () => ({
  getEventDateMode: vi.fn(),
  getPollOptions: vi.fn(async () => []),
  getPollVotes: vi.fn(async () => []),
  countGuests: vi.fn(async () => 0),
  applyDateModeChange: vi.fn(async () => true),
}));
vi.mock("@/lib/date-poll", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/date-poll")>()),
  todayInBerlin: () => "2026-07-01",
}));

const { changeDateMode } = await import("@/services/date-mode-service");
const repo = await import("@/repositories/date-poll-repository");

const option: PollOption = { id: "a", date: "2026-07-11", startTime: "15:00", endTime: "18:00", createdAt: "2026-06-01T10:00:00.000Z" };
const votes: PollVote[] = [
  { id: "v1", name: "Anna", optionIds: ["a"], noneFit: false, updatedAt: "2026-06-02T10:00:00.000Z" },
  { id: "v2", name: "Ben", optionIds: [], noneFit: true, updatedAt: "2026-06-02T10:00:00.000Z" },
];

describe("changeDateMode", () => {
  beforeEach(() => {
    vi.mocked(repo.applyDateModeChange).mockClear();
    vi.mocked(repo.getEventDateMode).mockResolvedValue("fixed");
    vi.mocked(repo.getPollOptions).mockResolvedValue([]);
    vi.mocked(repo.getPollVotes).mockResolvedValue([]);
    vi.mocked(repo.countGuests).mockResolvedValue(0);
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
});
