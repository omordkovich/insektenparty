import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/repositories/event-repository", () => ({ getEventAccessInfo: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));
vi.mock("next/headers", () => ({ cookies: vi.fn() }));

const { unlockEvent } = await import("@/services/event-access-service");
const { getEventAccessInfo } = await import("@/repositories/event-repository");
const { signEventAccess } = await import("@/lib/event-access");

const protectedEvent = { id: "event-1", ownerId: "owner-1", accessPassword: "Sommer", title: "Fest", slug: "fest-abc123" };

describe("unlockEvent", () => {
  beforeEach(() => {
    process.env.EVENT_UNLOCK_SECRET = "test-secret";
    vi.mocked(getEventAccessInfo).mockResolvedValue(protectedEvent);
  });

  it("returns the signed cookie for the right password", async () => {
    expect(await unlockEvent("event-1", { password: " Sommer " })).toEqual({
      ok: true,
      data: {
        cookie: {
          name: "gz_event_event-1",
          value: signEventAccess("event-1", "Sommer", "test-secret"),
          maxAge: 180 * 24 * 60 * 60,
        },
      },
    });
  });

  it("rejects a wrong password", async () => {
    expect(await unlockEvent("event-1", { password: "Winter" })).toEqual({
      ok: false,
      status: 401,
      error: "Das Passwort ist leider falsch.",
    });
    expect(await unlockEvent("event-1", {})).toMatchObject({ ok: false, status: 401 });
  });

  it("needs no cookie for an open event", async () => {
    vi.mocked(getEventAccessInfo).mockResolvedValue({ ...protectedEvent, accessPassword: null });
    expect(await unlockEvent("event-1", { password: "egal" })).toEqual({ ok: true, data: { cookie: null } });
  });

  it("reports unknown events and a missing secret", async () => {
    vi.mocked(getEventAccessInfo).mockResolvedValueOnce(undefined);
    expect(await unlockEvent("nope", { password: "Sommer" })).toMatchObject({ ok: false, status: 404 });

    delete process.env.EVENT_UNLOCK_SECRET;
    vi.spyOn(console, "error").mockImplementationOnce(() => {});
    expect(await unlockEvent("event-1", { password: "Sommer" })).toMatchObject({ ok: false, status: 500 });
  });
});
