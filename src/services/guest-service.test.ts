import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/repositories/event-repository", () => ({ getEventOwnerId: vi.fn(async () => "owner-1") }));
vi.mock("@/repositories/date-poll-repository", () => ({ getEventDateMode: vi.fn(async () => "poll") }));
vi.mock("@/lib/recaptcha", () => ({
  getRecaptchaToken: vi.fn(() => "token"),
  verifyRecaptchaToken: vi.fn(async () => ({ ok: true })),
}));
vi.mock("@/repositories/guest-repository", () => ({
  createGuest: vi.fn(),
  updateGuest: vi.fn(),
  deleteGuest: vi.fn(),
  getGuestsByEventId: vi.fn(),
}));
vi.mock("@/services/notification-service", () => ({ notifyOwnerOfGuestChange: vi.fn() }));

const { createGuestForEvent, updateGuestForEvent } = await import("@/services/guest-service");
const { createGuest } = await import("@/repositories/guest-repository");
const { getEventDateMode } = await import("@/repositories/date-poll-repository");

describe("guest list while the date is open", () => {
  it("refuses new and changed entries", async () => {
    expect(await createGuestForEvent("event-1", {}, "owner-1")).toEqual({
      ok: false,
      status: 409,
      error: "Der Termin steht noch nicht fest.",
    });
    expect(await updateGuestForEvent("event-1", "guest-1", {}, "owner-1")).toMatchObject({ ok: false, status: 409 });
    expect(createGuest).not.toHaveBeenCalled();
  });
});

describe("seat limit", () => {
  const guest = {
    name: "Anna",
    additionalGuests: 2,
    additionalGuestNames: ["Ben", "Cleo"],
    arrivalTime: "15:00",
    bringingSomething: false,
    bringingDescription: null,
    hasMessage: false,
    message: null,
  };
  // The repository asks the guard with the locked state; this stand-in
  // answers like a full event with 10 seats, 9 taken.
  const snapshot = { maxGuests: 10, entryCount: 5, occupied: 9, previous: null };

  beforeEach(() => {
    vi.mocked(getEventDateMode).mockResolvedValue("fixed");
    vi.mocked(createGuest).mockReset();
    vi.mocked(createGuest).mockImplementation(async (_eventId, input, guard) => {
      const refused = guard(snapshot);
      return refused
        ? { ok: false, reason: "refused", error: refused }
        : { ok: true, row: { id: "g1", ...input, createdAt: new Date(), updatedAt: new Date() } as never };
    });
  });

  it("refuses guests when not enough seats are left", async () => {
    expect(await createGuestForEvent("event-1", guest)).toEqual({
      ok: false,
      status: 409,
      error: "Es ist nur noch 1 Platz frei.",
    });
  });

  it("applies to the owner too", async () => {
    expect(await createGuestForEvent("event-1", guest, "owner-1")).toEqual({
      ok: false,
      status: 409,
      error: "Es ist nur noch 1 Platz frei.",
    });
  });
});
