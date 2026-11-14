import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/email", () => ({ sendEmail: vi.fn() }));
vi.mock("@/repositories/event-repository", () => ({ getEventForNotification: vi.fn() }));
vi.mock("@/repositories/user-repository", () => ({ getUserContact: vi.fn() }));

const { buildGuestChangeMessage, buildPollVoteMessage } = await import("@/services/notification-service");

describe("owner notifications", () => {
  it("keeps the German texts", () => {
    expect(buildGuestChangeMessage("created", "Max", "Sommerfest", "de").subject).toBe(
      "Neuer Gast bei deinem Event „Sommerfest“",
    );
  });

  it("writes them in English for an English account", () => {
    expect(buildGuestChangeMessage("created", "Max", "Summer party", "en")).toEqual({
      subject: "New guest at your event “Summer party”",
      text: "“Max” signed up as a guest for your event “Summer party”.",
    });
    expect(buildGuestChangeMessage("declined", "Max", "Summer party", "en").subject).toBe(
      "A guest can't make it to your event “Summer party”",
    );
    expect(buildPollVoteMessage("created", "Anna", "Sat 11/07", "Summer party", "en").text).toBe(
      "“Anna” voted in the date poll for “Summer party”: Sat 11/07.",
    );
  });
});
