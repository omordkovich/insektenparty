import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/email", () => ({ sendEmail: vi.fn() }));
vi.mock("@/repositories/event-repository", () => ({ getEventForNotification: vi.fn() }));
vi.mock("@/repositories/user-repository", () => ({ getUserContact: vi.fn() }));

const { buildGuestChangeMessage, buildPollVoteMessage, sendFeedbackRequestMail } = await import(
  "@/services/notification-service"
);
const { sendEmail } = await import("@/lib/email");
const { getUserContact } = await import("@/repositories/user-repository");

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

describe("sendFeedbackRequestMail", () => {
  const event = { id: "11111111-1111-4111-8111-111111111111", ownerId: "owner-1", title: "Sommerfest" };
  const owner = { name: "Anna", email: "anna@example.de", locale: "en" as const, feedbackMails: true };

  beforeEach(() => {
    vi.stubEnv("FEEDBACK_SECRET", "secret");
    vi.mocked(sendEmail).mockReset();
    vi.mocked(getUserContact).mockReset();
    vi.mocked(getUserContact).mockResolvedValue(owner);
  });

  it("mails the owner in the account language with feedback and unsubscribe links", async () => {
    expect(await sendFeedbackRequestMail(event, "2026-11-19")).toBe(true);
    const mail = vi.mocked(sendEmail).mock.calls[0][0];
    expect(mail.to).toBe("anna@example.de");
    expect(mail.subject).toBe("How was “Sommerfest”?");
    expect(mail.text).toMatch(/\/en\/feedback\?t=/);
    expect(mail.text).toMatch(/\/en\/feedback\/abmelden\?t=/);
    expect(mail.html).toBeDefined();
  });

  it("sends nothing to an owner who unsubscribed", async () => {
    vi.mocked(getUserContact).mockResolvedValue({ ...owner, feedbackMails: false });
    expect(await sendFeedbackRequestMail(event, "2026-11-19")).toBe(false);
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("sends nothing without FEEDBACK_SECRET", async () => {
    vi.stubEnv("FEEDBACK_SECRET", "");
    expect(await sendFeedbackRequestMail(event, "2026-11-19")).toBe(false);
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("sends nothing without an owner e-mail", async () => {
    vi.mocked(getUserContact).mockResolvedValue({ ...owner, email: null });
    expect(await sendFeedbackRequestMail(event, "2026-11-19")).toBe(false);
  });
});
