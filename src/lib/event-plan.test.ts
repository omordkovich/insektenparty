import { describe, expect, it } from "vitest";
import type { DateModeRequest } from "@/lib/date-poll";
import {
  addMonths,
  canUseDateMode,
  checkPlanRules,
  dateWindowError,
  isEventPlan,
  latestAllowedDate,
} from "@/lib/event-plan";

function fixed(date: string, endDate: string | null): DateModeRequest {
  return { mode: "fixed", date, startTime: null, endTime: null, endDate, fromOptionId: null };
}

function pollWith(...dates: string[]): DateModeRequest {
  return { mode: "poll", proposals: dates.map((date) => ({ date, startTime: null, endTime: null })) };
}

describe("addMonths", () => {
  it("caps the day at the end of a shorter month", () => {
    expect(addMonths("2026-01-31", 1)).toBe("2026-02-28");
    expect(addMonths("2028-01-31", 1)).toBe("2028-02-29");
    expect(addMonths("2026-01-31", 3)).toBe("2026-04-30");
  });

  it("rolls over the year", () => {
    expect(addMonths("2026-11-15", 3)).toBe("2027-02-15");
  });
});

describe("plans", () => {
  it("recognises the two plans", () => {
    expect(isEventPlan("free")).toBe(true);
    expect(isEventPlan("paid")).toBe(true);
    expect(isEventPlan("premium")).toBe(false);
    expect(isEventPlan(null)).toBe(false);
  });

  it("limits the date window per plan", () => {
    expect(latestAllowedDate("free", "2026-01-15")).toBe("2026-04-15");
    expect(latestAllowedDate("paid", "2026-01-15")).toBe("2027-01-15");
  });

  it("allows only a fixed date on a free event", () => {
    expect(canUseDateMode("free", "fixed")).toBe(true);
    expect(canUseDateMode("free", "poll")).toBe(false);
    expect(canUseDateMode("free", "unknown")).toBe(false);
    expect(canUseDateMode("paid", "poll")).toBe(true);
    expect(canUseDateMode("paid", "unknown")).toBe(true);
  });

  it("words the window error per plan", () => {
    expect(dateWindowError("free")).toBe("Das Datum darf höchstens 3 Monate nach dem Erstellen des Events liegen.");
    expect(dateWindowError("paid")).toBe("Das Datum darf höchstens 12 Monate nach dem Erstellen des Events liegen.");
  });
});

describe("checkPlanRules", () => {
  it("rejects a mode the plan does not include with 403", () => {
    const result = checkPlanRules("free", "2026-07-01", { mode: "poll", proposals: [] });
    expect(result?.status).toBe(403);
    expect(result?.error).toBe("Abstimmung und offener Termin gibt es nur mit einem freigeschalteten Event.");
    expect(checkPlanRules("free", "2026-07-01", { mode: "unknown" })?.status).toBe(403);
  });

  it("checks the end date of a fixed event as well as the start", () => {
    expect(checkPlanRules("free", "2026-07-01", fixed("2026-09-30", "2026-10-02"))?.status).toBe(400);
    expect(checkPlanRules("free", "2026-07-01", fixed("2026-10-02", null))?.status).toBe(400);
    expect(checkPlanRules("free", "2026-07-01", fixed("2026-10-01", null))).toBeNull();
    expect(checkPlanRules("free", "2026-07-01", fixed("2026-09-30", "2026-10-01"))).toBeNull();
  });

  it("checks every poll proposal on a paid event", () => {
    const tooLate = checkPlanRules("paid", "2026-07-01", pollWith("2027-07-02"));
    expect(tooLate?.status).toBe(400);
    expect(tooLate?.error).toContain("12 Monate");
    expect(checkPlanRules("paid", "2026-07-01", pollWith("2026-08-01", "2027-07-01"))).toBeNull();
    expect(checkPlanRules("paid", "2026-07-01", pollWith("2026-08-01", "2027-07-02"))?.status).toBe(400);
  });

  it("checks proposals added to a running poll", () => {
    const request: DateModeRequest = {
      mode: "poll",
      addProposals: [{ date: "2027-07-02", startTime: null, endTime: null }],
    };
    expect(checkPlanRules("paid", "2026-07-01", request)?.status).toBe(400);
  });

  it("lets an open date through on a paid event", () => {
    expect(checkPlanRules("paid", "2026-07-01", { mode: "unknown" })).toBeNull();
  });
});
