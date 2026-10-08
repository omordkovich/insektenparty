import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/repositories/event-repository", () => ({ getEventAccessInfo: vi.fn() }));
vi.mock("@/repositories/user-repository", () => ({ getUserContact: vi.fn() }));
vi.mock("@/lib/recaptcha", () => ({
  getRecaptchaToken: vi.fn(() => "token"),
  verifyRecaptchaToken: vi.fn(async () => ({ ok: true })),
}));
vi.mock("@/lib/email", () => ({ sendEmail: vi.fn(async () => {}) }));

const { buildPasswordRequestEmail, requestEventPassword } = await import("@/services/password-request-service");
const { getEventAccessInfo } = await import("@/repositories/event-repository");
const { getUserContact } = await import("@/repositories/user-repository");
const { sendEmail } = await import("@/lib/email");

const LINK = "https://gastzilla.de/event/fest-abc123";

describe("buildPasswordRequestEmail", () => {
  it("asks for an e-mail answer with Reply-To", () => {
    expect(
      buildPasswordRequestEmail(
        { name: "Max", contact: { kind: "email", email: "max@example.de" }, message: "Bis bald!" },
        "Sommerfest",
        LINK,
      ),
    ).toEqual({
      subject: "Passwort-Anfrage für „Sommerfest“",
      replyTo: "max@example.de",
      text: [
        "„Max“ möchte das Passwort für dein Event „Sommerfest“ per E-Mail an max@example.de.",
        "",
        "Nachricht: Bis bald!",
        "",
        "Antworte einfach auf diese E-Mail, um Max das Passwort zu schicken.",
        "",
        `Event ansehen: ${LINK}`,
      ].join("\n"),
    });
  });

  it("names the phone channel, or the free text for \"Sonstiges\"", () => {
    const whatsapp = buildPasswordRequestEmail(
      { name: "Max", contact: { kind: "phone", phone: "0152 123456", channel: "whatsapp", channelOther: null }, message: null },
      "Sommerfest",
      LINK,
    );
    expect(whatsapp.replyTo).toBeUndefined();
    expect(whatsapp.text).toBe(
      [
        "„Max“ möchte das Passwort für dein Event „Sommerfest“ per WhatsApp an 0152 123456.",
        "",
        `Event ansehen: ${LINK}`,
      ].join("\n"),
    );

    const other = buildPasswordRequestEmail(
      { name: "Max", contact: { kind: "phone", phone: "0152 123456", channel: "other", channelOther: "Signal" }, message: null },
      "Sommerfest",
      LINK,
    );
    expect(other.text.split("\n")[0]).toBe(
      "„Max“ möchte das Passwort für dein Event „Sommerfest“ per Signal an 0152 123456.",
    );
  });
});

describe("requestEventPassword", () => {
  const body = { name: "Max", contactKind: "email", email: "max@example.de", recaptchaToken: "token" };

  beforeEach(() => {
    vi.mocked(sendEmail).mockClear();
    vi.mocked(getEventAccessInfo).mockResolvedValue({
      id: "event-1",
      ownerId: "owner-1",
      accessPassword: "Sommer",
      title: "Sommerfest",
      slug: "fest-abc123",
    });
    vi.mocked(getUserContact).mockResolvedValue({ name: "Anna", email: "anna@example.de" });
  });

  it("mails the owner", async () => {
    expect(await requestEventPassword("event-1", body)).toEqual({ ok: true, data: { ok: true } });
    expect(vi.mocked(sendEmail).mock.calls[0][0]).toMatchObject({
      to: "anna@example.de",
      replyTo: "max@example.de",
      subject: "Passwort-Anfrage für „Sommerfest“",
    });
  });

  it("rejects invalid requests without mailing", async () => {
    expect(await requestEventPassword("event-1", { ...body, contactKind: undefined })).toEqual({
      ok: false,
      status: 400,
      error: "Bitte wähle, wie du das Passwort bekommen möchtest.",
    });
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("handles open events and owners without e-mail", async () => {
    vi.mocked(getEventAccessInfo).mockResolvedValueOnce({
      id: "event-1",
      ownerId: "owner-1",
      accessPassword: null,
      title: "Sommerfest",
      slug: "fest-abc123",
    });
    expect(await requestEventPassword("event-1", body)).toMatchObject({ ok: false, status: 409 });

    vi.mocked(getUserContact).mockResolvedValueOnce(null);
    expect(await requestEventPassword("event-1", body)).toEqual({
      ok: false,
      status: 503,
      error: "Die Anfrage konnte nicht zugestellt werden.",
    });
  });
});
