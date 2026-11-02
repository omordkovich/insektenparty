import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/repositories/event-repository", () => ({ getEventAccessInfo: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));
vi.mock("next/headers", () => ({ cookies: vi.fn() }));
vi.mock("@/services/event-lifecycle-service", () => ({ getEventLifecycle: vi.fn() }));

const { EVENT_EXPIRED_ERROR, denyExpiredEvent, unlockEvent } = await import("@/services/event-access-service");
const { getEventLifecycle } = await import("@/services/event-lifecycle-service");
const { createClient } = await import("@/lib/supabase/server");
const { cookies } = await import("next/headers");
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

describe("denyExpiredEvent", () => {
  const lifecycle = (stage: "active" | "over" | "expired") => ({
    stichtag: "2026-01-01",
    stage,
    deletionDate: "2026-04-01",
  });
  const signInAs = (userId: string | undefined) => {
    vi.mocked(createClient).mockResolvedValue({
      auth: { getClaims: async () => ({ data: userId ? { claims: { sub: userId } } : null }) },
    } as never);
    vi.mocked(cookies).mockResolvedValue({ get: () => undefined } as never);
  };

  beforeEach(() => {
    vi.mocked(getEventAccessInfo).mockResolvedValue({ ...protectedEvent, accessPassword: null });
    vi.mocked(getEventLifecycle).mockReset();
  });

  it("answers 410 to a non-owner of an expired event", async () => {
    vi.mocked(getEventLifecycle).mockResolvedValue(lifecycle("expired"));
    signInAs(undefined);
    const response = await denyExpiredEvent("event-1");
    expect(response?.status).toBe(410);
    expect(await response?.json()).toEqual({ error: "Diese Einladung ist abgelaufen." });
    expect(EVENT_EXPIRED_ERROR).toBe("Diese Einladung ist abgelaufen.");

    signInAs("someone-else");
    expect((await denyExpiredEvent("event-1"))?.status).toBe(410);
  });

  it("lets the owner through", async () => {
    vi.mocked(getEventLifecycle).mockResolvedValue(lifecycle("expired"));
    signInAs("owner-1");
    expect(await denyExpiredEvent("event-1")).toBeNull();
  });

  it("lets everyone through while the event is active or over", async () => {
    signInAs(undefined);
    vi.mocked(getEventLifecycle).mockResolvedValue(lifecycle("active"));
    expect(await denyExpiredEvent("event-1")).toBeNull();
    vi.mocked(getEventLifecycle).mockResolvedValue(lifecycle("over"));
    expect(await denyExpiredEvent("event-1")).toBeNull();
  });

  it("passes unknown events through (the service answers 404)", async () => {
    vi.mocked(getEventLifecycle).mockResolvedValue(undefined);
    signInAs(undefined);
    expect(await denyExpiredEvent("nope")).toBeNull();
  });
});
