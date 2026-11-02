import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/repositories/purchase-repository", () => ({
  DUMMY_SOURCE: "dummy",
  insertEntitlement: vi.fn(async () => undefined),
  getEventBadgeHidden: vi.fn(async () => false),
  upgradeEventToPaid: vi.fn(async () => "purchased"),
  hideEventBadge: vi.fn(async () => "hidden" as const),
}));
vi.mock("@/repositories/event-repository", () => ({
  getEventPlanInfo: vi.fn(async () => ({ ownerId: "user-1", plan: "free", createdOn: "2026-10-01" })),
}));
vi.mock("@/services/event-lifecycle-service", () => ({ denyIfOver: vi.fn(async () => null) }));
vi.mock("@/services/entitlement-service", () => ({
  getUserEntitlements: vi.fn(async () => ({
    unlockedThemes: ["weiss"],
    freeEventAvailable: true,
    eventCredits: 0,
  })),
}));

const { purchase } = await import("@/services/purchase-service");
const repo = await import("@/repositories/purchase-repository");
const { getEventPlanInfo } = await import("@/repositories/event-repository");
const { denyIfOver } = await import("@/services/event-lifecycle-service");
const { getUserEntitlements } = await import("@/services/entitlement-service");

const EVENT_ID = "0b5c1f0e-6a43-4a35-9d3b-2f8f6f1d3c11";
const UNAVAILABLE = { ok: false, status: 403, error: "Käufe sind bald verfügbar." };
const NOT_FOUND = { ok: false, status: 404, error: "Event wurde nicht gefunden." };
const OVER = { ok: false, status: 409, error: "Dieses Event ist vorbei." } as const;
const ALREADY_UNLOCKED = { ok: false, status: 409, error: "Dieses Event ist schon freigeschaltet." };
const OK = { ok: true, data: { usedCredit: false } };

beforeEach(() => {
  vi.stubEnv("PAYMENTS_DUMMY", "true");
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
  vi.mocked(getEventPlanInfo).mockResolvedValue({ ownerId: "user-1", plan: "free", createdOn: "2026-10-01" });
  vi.mocked(denyIfOver).mockResolvedValue(null);
  vi.mocked(repo.getEventBadgeHidden).mockResolvedValue(false);
  vi.mocked(repo.upgradeEventToPaid).mockResolvedValue("purchased");
  vi.mocked(repo.hideEventBadge).mockResolvedValue("hidden");
  vi.mocked(getUserEntitlements).mockResolvedValue({
    unlockedThemes: ["weiss"],
    freeEventAvailable: true,
    eventCredits: 0,
  } as never);
});

describe("purchase - request", () => {
  it("rejects a body that is not an object", async () => {
    expect(await purchase("user-1", "paid_event")).toEqual({
      ok: false,
      status: 400,
      error: "Ungültige Anfragedaten.",
    });
  });

  it.each([{}, { product: "nope" }, { product: 5 }])("rejects an unknown product %j", async (body) => {
    expect(await purchase("user-1", body)).toEqual({ ok: false, status: 400, error: "Unbekanntes Produkt." });
  });
});

describe("purchase - paid_event", () => {
  it("writes a dummy credit", async () => {
    expect(await purchase("user-1", { product: "paid_event" })).toEqual(OK);
    expect(repo.insertEntitlement).toHaveBeenCalledWith({
      userId: "user-1",
      feature: "paid_event",
      source: "dummy",
    });
  });

  it("is 403 without the dummy switch", async () => {
    vi.stubEnv("PAYMENTS_DUMMY", "false");
    expect(await purchase("user-1", { product: "paid_event" })).toEqual(UNAVAILABLE);
    expect(repo.insertEntitlement).not.toHaveBeenCalled();
  });
});

describe("purchase - theme", () => {
  it("writes a theme row for a locked premium theme", async () => {
    expect(await purchase("user-1", { product: "theme", theme: "natur" })).toEqual(OK);
    expect(repo.insertEntitlement).toHaveBeenCalledWith({
      userId: "user-1",
      feature: "theme:natur",
      source: "dummy",
    });
  });

  it("is ok without a new row when the theme is already unlocked", async () => {
    vi.mocked(getUserEntitlements).mockResolvedValue({
      unlockedThemes: ["weiss", "natur"],
      freeEventAvailable: true,
      eventCredits: 0,
    } as never);
    expect(await purchase("user-1", { product: "theme", theme: "natur" })).toEqual(OK);
    expect(repo.insertEntitlement).not.toHaveBeenCalled();
  });

  it("treats a free (non-premium) theme as already unlocked", async () => {
    expect(await purchase("user-1", { product: "theme", theme: "weiss" })).toEqual(OK);
    expect(repo.insertEntitlement).not.toHaveBeenCalled();
  });

  it("rejects an invalid theme", async () => {
    expect(await purchase("user-1", { product: "theme", theme: "gibts-nicht" })).toEqual({
      ok: false,
      status: 400,
      error: "Ungültiges Theme.",
    });
  });

  it("is 403 without the dummy switch", async () => {
    vi.stubEnv("PAYMENTS_DUMMY", "");
    expect(await purchase("user-1", { product: "theme", theme: "natur" })).toEqual(UNAVAILABLE);
    expect(repo.insertEntitlement).not.toHaveBeenCalled();
  });
});

describe("purchase - event_upgrade", () => {
  const body = { product: "event_upgrade", eventId: EVENT_ID };

  it.each([
    { product: "event_upgrade" },
    { product: "event_upgrade", eventId: 7 },
    { product: "event_upgrade", eventId: "x" },
  ])("is 404 for a missing or malformed eventId %j", async (bad) => {
    expect(await purchase("user-1", bad)).toEqual(NOT_FOUND);
    expect(repo.upgradeEventToPaid).not.toHaveBeenCalled();
  });

  it("is 404 for an unknown event", async () => {
    vi.mocked(getEventPlanInfo).mockResolvedValueOnce(undefined);
    expect(await purchase("user-1", body)).toEqual(NOT_FOUND);
  });

  it("is 404 for somebody else's event", async () => {
    vi.mocked(getEventPlanInfo).mockResolvedValueOnce({ ownerId: "other", plan: "free", createdOn: "2026-10-01" });
    expect(await purchase("user-1", body)).toEqual(NOT_FOUND);
    expect(repo.upgradeEventToPaid).not.toHaveBeenCalled();
  });

  it("is 409 when the event is over", async () => {
    vi.mocked(denyIfOver).mockResolvedValueOnce(OVER);
    expect(await purchase("user-1", body)).toEqual(OVER);
    expect(repo.upgradeEventToPaid).not.toHaveBeenCalled();
  });

  it("is 409 when the event is already paid", async () => {
    vi.mocked(getEventPlanInfo).mockResolvedValueOnce({ ownerId: "user-1", plan: "paid", createdOn: "2026-10-01" });
    expect(await purchase("user-1", body)).toEqual(ALREADY_UNLOCKED);
    expect(repo.upgradeEventToPaid).not.toHaveBeenCalled();
  });

  it("uses an existing credit - also without the dummy switch", async () => {
    vi.stubEnv("PAYMENTS_DUMMY", "false");
    vi.mocked(repo.upgradeEventToPaid).mockResolvedValueOnce("used_credit");
    expect(await purchase("user-1", body)).toEqual({ ok: true, data: { usedCredit: true } });
    expect(repo.upgradeEventToPaid).toHaveBeenCalledWith(EVENT_ID, "user-1", false);
  });

  it("buys and spends a credit in dummy mode", async () => {
    expect(await purchase("user-1", body)).toEqual(OK);
    expect(repo.upgradeEventToPaid).toHaveBeenCalledWith(EVENT_ID, "user-1", true);
  });

  it("is 403 without credit and without the dummy switch", async () => {
    vi.stubEnv("PAYMENTS_DUMMY", "false");
    vi.mocked(repo.upgradeEventToPaid).mockResolvedValueOnce("no_credit");
    expect(await purchase("user-1", body)).toEqual(UNAVAILABLE);
  });

  it("is 409 when a concurrent request upgraded the event first", async () => {
    vi.mocked(repo.upgradeEventToPaid).mockResolvedValueOnce("already_paid");
    expect(await purchase("user-1", body)).toEqual(ALREADY_UNLOCKED);
  });
});

describe("purchase - no_badge", () => {
  const body = { product: "no_badge", eventId: EVENT_ID };

  it("is 404 for a missing, malformed or foreign event", async () => {
    expect(await purchase("user-1", { product: "no_badge" })).toEqual(NOT_FOUND);
    expect(await purchase("user-1", { product: "no_badge", eventId: "x" })).toEqual(NOT_FOUND);
    vi.mocked(getEventPlanInfo).mockResolvedValueOnce({ ownerId: "other", plan: "free", createdOn: "2026-10-01" });
    expect(await purchase("user-1", body)).toEqual(NOT_FOUND);
    expect(repo.hideEventBadge).not.toHaveBeenCalled();
  });

  it("is 409 when the event is over", async () => {
    vi.mocked(denyIfOver).mockResolvedValueOnce(OVER);
    expect(await purchase("user-1", body)).toEqual(OVER);
    expect(repo.hideEventBadge).not.toHaveBeenCalled();
  });

  it("is ok without a new row when the badge is already hidden", async () => {
    vi.mocked(repo.getEventBadgeHidden).mockResolvedValueOnce(true);
    expect(await purchase("user-1", body)).toEqual(OK);
    expect(repo.hideEventBadge).not.toHaveBeenCalled();
  });

  it("hides the badge for a dummy purchase, whatever the plan", async () => {
    vi.mocked(getEventPlanInfo).mockResolvedValueOnce({ ownerId: "user-1", plan: "paid", createdOn: "2026-10-01" });
    expect(await purchase("user-1", body)).toEqual(OK);
    expect(repo.hideEventBadge).toHaveBeenCalledWith(EVENT_ID, "user-1", "dummy");
  });

  it("is 403 without the dummy switch", async () => {
    vi.stubEnv("PAYMENTS_DUMMY", "false");
    expect(await purchase("user-1", body)).toEqual(UNAVAILABLE);
    expect(repo.hideEventBadge).not.toHaveBeenCalled();
  });

  it("is 404 when the event vanished during the purchase", async () => {
    vi.mocked(repo.hideEventBadge).mockResolvedValueOnce("not_found");
    expect(await purchase("user-1", body)).toEqual(NOT_FOUND);
  });

  it("is ok when a concurrent request hid the badge first (no second row)", async () => {
    vi.mocked(repo.hideEventBadge).mockResolvedValueOnce("already_hidden");
    expect(await purchase("user-1", body)).toEqual(OK);
  });
});
