import { describe, expect, it, vi } from "vitest";

vi.mock("@/repositories/event-repository", () => ({ getEventOwnerId: vi.fn(async () => "owner-1") }));
vi.mock("@/repositories/date-poll-repository", () => ({ getEventDateMode: vi.fn(async () => "poll") }));
vi.mock("@/repositories/guest-repository", () => ({
  createGuest: vi.fn(),
  updateGuest: vi.fn(),
  deleteGuest: vi.fn(),
  getGuestsByEventId: vi.fn(),
}));
vi.mock("@/lib/recaptcha", () => ({ getRecaptchaToken: vi.fn(), verifyRecaptchaToken: vi.fn() }));
vi.mock("@/services/notification-service", () => ({ notifyOwnerOfGuestChange: vi.fn() }));

const { createGuestForEvent, updateGuestForEvent } = await import("@/services/guest-service");
const { createGuest } = await import("@/repositories/guest-repository");

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
