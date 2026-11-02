import { describe, expect, it } from "vitest";
import {
  DELETE_AFTER_DAYS,
  EXPIRED_AFTER_DAYS,
  OVER_AFTER_DAYS,
  deletionDate,
  isDueForDeletion,
  lifecycleOf,
  lifecycleStage,
  stichtag,
} from "@/lib/event-lifecycle";

const base = { createdOn: "2026-10-07", latestPollDate: null, eventEndDate: null };

describe("stichtag", () => {
  it("is the event date, or the last day of a multi-day event", () => {
    expect(stichtag({ ...base, dateMode: "fixed", eventDate: "2026-12-05" })).toBe("2026-12-05");
    expect(stichtag({ ...base, dateMode: "fixed", eventDate: "2026-12-05", eventEndDate: "2026-12-07" })).toBe(
      "2026-12-07",
    );
  });

  it("falls back to six months after creation without a date", () => {
    expect(stichtag({ ...base, dateMode: "fixed", eventDate: null })).toBe("2027-04-07"); // legacy rows
    expect(stichtag({ ...base, dateMode: "unknown", eventDate: null })).toBe("2027-04-07");
  });

  it("is the latest proposal while a poll runs", () => {
    expect(stichtag({ ...base, dateMode: "poll", eventDate: null, latestPollDate: "2026-12-20" })).toBe("2026-12-20");
  });

  it("falls back to six months after creation for a poll without proposals", () => {
    expect(stichtag({ ...base, dateMode: "poll", eventDate: null })).toBe("2027-04-07");
  });
});

describe("lifecycleStage", () => {
  it("is active up to and including the Stichtag", () => {
    expect(lifecycleStage("2026-12-05", "2026-11-01")).toBe("active");
    expect(lifecycleStage("2026-12-05", "2026-12-05")).toBe("active");
  });

  it("is over from the day after until 29 days later", () => {
    expect(lifecycleStage("2026-12-05", "2026-12-06")).toBe("over");
    expect(lifecycleStage("2026-12-05", "2027-01-03")).toBe("over"); // +29
  });

  it("is expired from 30 days after", () => {
    expect(lifecycleStage("2026-12-05", "2027-01-04")).toBe("expired"); // +30
    expect(lifecycleStage("2026-12-05", "2027-06-01")).toBe("expired");
  });

  it("exposes the thresholds", () => {
    expect([OVER_AFTER_DAYS, EXPIRED_AFTER_DAYS, DELETE_AFTER_DAYS]).toEqual([1, 30, 90]);
  });
});

describe("deletion", () => {
  it("deletes 90 days after the Stichtag", () => {
    expect(deletionDate("2026-12-05")).toBe("2027-03-05");
  });

  it("is due on that day and stays due afterwards", () => {
    expect(isDueForDeletion("2026-12-05", "2027-03-04")).toBe(false);
    expect(isDueForDeletion("2026-12-05", "2027-03-05")).toBe(true);
    expect(isDueForDeletion("2026-12-05", "2027-04-01")).toBe(true); // catch up
  });
});

describe("lifecycleOf", () => {
  const input = { ...base, dateMode: "fixed" as const, eventDate: "2026-12-05" };

  it("bundles Stichtag, stage and deletion date", () => {
    expect(lifecycleOf(input, "2026-12-05")).toEqual({
      stichtag: "2026-12-05",
      stage: "active",
      deletionDate: "2027-03-05",
    });
    expect(lifecycleOf(input, "2026-12-06").stage).toBe("over");
    expect(lifecycleOf(input, "2027-01-04").stage).toBe("expired");
  });
});
