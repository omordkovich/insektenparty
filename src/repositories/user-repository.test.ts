import { describe, expect, it, vi } from "vitest";

const execute = vi.fn();
vi.mock("@/db", () => ({ getDb: () => ({ execute }) }));

const { getUserContact } = await import("@/repositories/user-repository");

describe("getUserContact", () => {
  it("returns the account language", async () => {
    execute.mockResolvedValueOnce([{ name: "Max", email: "max@example.de", locale: "en" }]);
    expect(await getUserContact("u1")).toEqual({ name: "Max", email: "max@example.de", locale: "en" });
  });

  it("falls back to German without or with an unknown language", async () => {
    execute.mockResolvedValueOnce([{ name: "Max", email: "max@example.de", locale: null }]);
    expect((await getUserContact("u1"))?.locale).toBe("de");
    execute.mockResolvedValueOnce([{ name: "Max", email: "max@example.de", locale: "fr" }]);
    expect((await getUserContact("u1"))?.locale).toBe("de");
  });
});
