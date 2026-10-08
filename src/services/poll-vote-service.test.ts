import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PollOption } from "@/lib/date-poll";

vi.mock("@/repositories/event-repository", () => ({ getEventOwnerId: vi.fn(async () => "owner-1") }));
vi.mock("@/repositories/date-poll-repository", () => ({
  getEventDateMode: vi.fn(async () => "poll"),
  getPollOptions: vi.fn(),
  getPollVotes: vi.fn(async () => []),
  insertPollVote: vi.fn(async (_eventId: string, input: { name: string; optionIds: string[]; noneFit: boolean }) => ({
    id: "v1",
    updatedAt: "2026-06-02T10:00:00.000Z",
    ...input,
  })),
  updatePollVote: vi.fn(),
  deletePollVote: vi.fn(),
}));
vi.mock("@/lib/recaptcha", () => ({
  getRecaptchaToken: vi.fn(() => "token"),
  verifyRecaptchaToken: vi.fn(async () => ({ ok: true })),
}));
vi.mock("@/services/notification-service", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/services/notification-service")>()),
  notifyOwnerOfPollVote: vi.fn(async () => {}),
}));

const service = await import("@/services/poll-vote-service");
const repo = await import("@/repositories/date-poll-repository");
const { verifyRecaptchaToken } = await import("@/lib/recaptcha");
const notifications = await import("@/services/notification-service");

const option: PollOption = { id: "a", date: "2026-07-11", startTime: "15:00", endTime: null, createdAt: "2026-06-01T10:00:00.000Z" };

describe("poll votes", () => {
  beforeEach(() => {
    vi.mocked(repo.getEventDateMode).mockResolvedValue("poll");
    vi.mocked(repo.getPollOptions).mockResolvedValue([option]);
    vi.mocked(notifications.notifyOwnerOfPollVote).mockClear();
    vi.mocked(verifyRecaptchaToken).mockClear();
  });

  it("saves a guest's vote and tells the owner", async () => {
    const result = await service.createPollVoteForEvent("event-1", { name: "Anna", optionIds: ["a"] });
    expect(result).toMatchObject({ ok: true, data: { name: "Anna", optionIds: ["a"] } });
    expect(verifyRecaptchaToken).toHaveBeenCalled();
    expect(notifications.notifyOwnerOfPollVote).toHaveBeenCalledWith("event-1", "created", "Anna", "Sa. 11.07. · ab 15:00");
  });

  it("skips bot check and e-mail for the owner", async () => {
    await service.createPollVoteForEvent("event-1", { name: "Anna", noneFit: true }, "owner-1");
    expect(verifyRecaptchaToken).not.toHaveBeenCalled();
    expect(notifications.notifyOwnerOfPollVote).not.toHaveBeenCalled();
  });

  it("refuses votes once the poll is over", async () => {
    vi.mocked(repo.getEventDateMode).mockResolvedValue("fixed");
    expect(await service.createPollVoteForEvent("event-1", { name: "Anna", optionIds: ["a"] })).toEqual({
      ok: false,
      status: 409,
      error: "Die Abstimmung ist beendet.",
    });
    expect(await service.getPollForEvent("event-1")).toMatchObject({ ok: false, status: 409 });
  });

  it("adds each vote's answer per option", async () => {
    vi.mocked(repo.getPollVotes).mockResolvedValue([
      { id: "v1", name: "Anna", optionIds: ["a"], noneFit: false, updatedAt: "2026-06-02T10:00:00.000Z" },
    ]);
    expect(await service.getPollForEvent("event-1")).toMatchObject({
      ok: true,
      data: { options: [option], votes: [{ name: "Anna", answers: { a: "yes" } }] },
    });
  });
});

describe("buildPollVoteMessage", () => {
  it("names voter, event and choice", () => {
    expect(notifications.buildPollVoteMessage("created", "Anna", "Nichts davon passt", "Fest")).toEqual({
      subject: "Neue Stimme bei deinem Event „Fest“",
      text: "„Anna“ hat bei der Terminabstimmung für „Fest“ abgestimmt: Nichts davon passt.",
    });
  });
});
