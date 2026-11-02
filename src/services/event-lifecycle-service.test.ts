import { beforeEach, describe, expect, it, vi } from "vitest";
import type { LifecycleInput } from "@/lib/event-lifecycle";

vi.mock("@/repositories/event-repository", () => ({ getLifecycleInput: vi.fn() }));
vi.mock("@/lib/date-poll", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/date-poll")>()),
  todayInBerlin: () => "2026-07-10",
}));

const { EVENT_OVER_ERROR, denyIfOver, getEventLifecycle } = await import("@/services/event-lifecycle-service");
const { getLifecycleInput } = await import("@/repositories/event-repository");

const fixed = (eventDate: string | null, eventEndDate: string | null = null): LifecycleInput => ({
  dateMode: "fixed",
  eventDate,
  eventEndDate,
  createdOn: "2026-06-01",
  latestPollDate: null,
});

describe("denyIfOver", () => {
  beforeEach(() => {
    vi.mocked(getLifecycleInput).mockReset();
  });

  it("lets an active event through", async () => {
    vi.mocked(getLifecycleInput).mockResolvedValue(fixed("2026-07-20"));
    expect(await denyIfOver("event-1")).toBeNull();
  });

  it("lets the Stichtag itself through", async () => {
    vi.mocked(getLifecycleInput).mockResolvedValue(fixed("2026-07-10"));
    expect(await denyIfOver("event-1")).toBeNull();
  });

  it("refuses with 409 the day after the Stichtag", async () => {
    vi.mocked(getLifecycleInput).mockResolvedValue(fixed("2026-07-09"));
    expect(await denyIfOver("event-1")).toEqual({ ok: false, status: 409, error: EVENT_OVER_ERROR });
    expect(EVENT_OVER_ERROR).toBe("Dieses Event ist vorbei.");
  });

  it("refuses an expired event too", async () => {
    vi.mocked(getLifecycleInput).mockResolvedValue(fixed("2026-05-01"));
    expect(await denyIfOver("event-1")).toMatchObject({ ok: false, status: 409 });
  });

  it("uses the end date of a multi-day event", async () => {
    vi.mocked(getLifecycleInput).mockResolvedValue(fixed("2026-07-08", "2026-07-12"));
    expect(await denyIfOver("event-1")).toBeNull();
  });

  it("keeps a poll running while its latest proposal lies ahead", async () => {
    vi.mocked(getLifecycleInput).mockResolvedValue({
      dateMode: "poll",
      eventDate: null,
      eventEndDate: null,
      createdOn: "2026-06-01",
      latestPollDate: "2026-07-15",
    });
    expect(await denyIfOver("event-1")).toBeNull();
  });

  it("counts a poll as over once its latest proposal is past", async () => {
    vi.mocked(getLifecycleInput).mockResolvedValue({
      dateMode: "poll",
      eventDate: null,
      eventEndDate: null,
      createdOn: "2026-06-01",
      latestPollDate: "2026-07-09",
    });
    expect(await denyIfOver("event-1")).toMatchObject({ ok: false, status: 409 });
  });

  it("leaves a missing event to the caller's own 404", async () => {
    vi.mocked(getLifecycleInput).mockResolvedValue(undefined);
    expect(await denyIfOver("missing")).toBeNull();
  });

  it("lets an undated event live six months from its creation", async () => {
    vi.mocked(getLifecycleInput).mockResolvedValue({
      dateMode: "unknown",
      eventDate: null,
      eventEndDate: null,
      createdOn: "2026-06-01",
      latestPollDate: null,
    });
    expect(await denyIfOver("event-1")).toBeNull();
  });
});

describe("getEventLifecycle", () => {
  it("reports Stichtag, stage and deletion date", async () => {
    vi.mocked(getLifecycleInput).mockResolvedValue(fixed("2026-07-09"));
    expect(await getEventLifecycle("event-1")).toEqual({
      stichtag: "2026-07-09",
      stage: "over",
      deletionDate: "2026-10-07",
    });
  });

  it("is undefined for a missing event", async () => {
    vi.mocked(getLifecycleInput).mockResolvedValue(undefined);
    expect(await getEventLifecycle("missing")).toBeUndefined();
  });
});
