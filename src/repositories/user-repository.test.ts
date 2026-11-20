import { describe, expect, it, vi } from "vitest";

const execute = vi.fn();
vi.mock("@/db", () => ({ getDb: () => ({ execute }) }));

const { disableFeedbackMails, getUserContact } = await import("@/repositories/user-repository");

describe("getUserContact", () => {
  it("returns the account language", async () => {
    execute.mockResolvedValueOnce([{ name: "Max", email: "max@example.de", locale: "en" }]);
    expect(await getUserContact("u1")).toEqual({ name: "Max", email: "max@example.de", locale: "en", feedbackMails: true });
  });

  it("falls back to German without or with an unknown language", async () => {
    execute.mockResolvedValueOnce([{ name: "Max", email: "max@example.de", locale: null }]);
    expect((await getUserContact("u1"))?.locale).toBe("de");
    execute.mockResolvedValueOnce([{ name: "Max", email: "max@example.de", locale: "fr" }]);
    expect((await getUserContact("u1"))?.locale).toBe("de");
  });
});

describe("getUserContact feedbackMails", () => {
  it("is false only when the account turned feedback mails off", async () => {
    execute.mockResolvedValueOnce([{ name: null, email: "a@b.de", locale: "de", feedback_mails: "false" }]);
    expect((await getUserContact("u1"))?.feedbackMails).toBe(false);
    execute.mockResolvedValueOnce([{ name: null, email: "a@b.de", locale: "de", feedback_mails: null }]);
    expect((await getUserContact("u1"))?.feedbackMails).toBe(true);
  });
});

describe("disableFeedbackMails", () => {
  it("writes feedback_mails=false into the user metadata", async () => {
    execute.mockResolvedValueOnce([]);
    await disableFeedbackMails("u1");
    const query = execute.mock.calls.at(-1)?.[0];
    expect(JSON.stringify(query)).toContain("feedback_mails");
  });
});
