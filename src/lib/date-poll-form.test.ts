import { describe, expect, it } from "vitest";
import { buildDateModeRequest, initialDateDraft, type DateSettings } from "@/lib/date-poll-form";

const today = "2026-07-01";
const poll: DateSettings = {
  mode: "poll",
  date: null,
  endDate: null,
  startTime: null,
  endTime: null,
  options: [{ id: "a", date: "2026-07-11", startTime: "15:00", endTime: "18:00", createdAt: "2026-06-01T10:00:00.000Z", yesCount: 4 }],
  voteCount: 6,
};
const fixed: DateSettings = {
  mode: "fixed",
  date: "2026-07-11",
  endDate: null,
  startTime: "15:00",
  endTime: null,
  options: [],
  voteCount: 0,
};

describe("buildDateModeRequest", () => {
  it("requires a choice when creating", () => {
    expect(buildDateModeRequest(null, initialDateDraft(null), today)).toEqual({
      ok: false,
      error: "Bitte wähle, wie der Termin festgelegt wird.",
    });
  });

  it("starts a new poll from the rows", () => {
    const draft = initialDateDraft(null);
    draft.mode = "poll";
    draft.rows[0] = { ...draft.rows[0], date: "2026-07-11", startTime: "15:00" };
    draft.rows[1] = { ...draft.rows[1], date: "2026-07-12", startTime: "16:00", endTime: "18:00" };
    expect(buildDateModeRequest(null, draft, today)).toEqual({
      ok: true,
      request: {
        mode: "poll",
        proposals: [
          { date: "2026-07-11", startTime: "15:00", endTime: null },
          { date: "2026-07-12", startTime: "16:00", endTime: "18:00" },
        ],
      },
    });
  });

  it("adds proposals to a running poll, nothing when no row is filled", () => {
    const draft = initialDateDraft(poll);
    expect(buildDateModeRequest(poll, draft, today)).toEqual({ ok: true, request: null });
    draft.rows = [{ key: 9, date: "2026-07-18", startTime: "15:00", endTime: "" }];
    expect(buildDateModeRequest(poll, draft, today)).toEqual({
      ok: true,
      request: { mode: "poll", addProposals: [{ date: "2026-07-18", startTime: "15:00", endTime: null }] },
    });
  });

  it("fixes a proposal with its id, another date without", () => {
    const draft = initialDateDraft(poll);
    draft.mode = "fixed";
    draft.fixed = { date: "2026-07-11", endDate: "", startTime: "15:00", endTime: "18:00" };
    expect(buildDateModeRequest(poll, draft, today)).toMatchObject({ ok: true, request: { mode: "fixed", fromOptionId: "a" } });
    draft.fixed = { date: "2026-07-20", endDate: "", startTime: "15:00", endTime: "" };
    expect(buildDateModeRequest(poll, draft, today)).toMatchObject({ ok: true, request: { mode: "fixed", fromOptionId: null } });
  });

  it("keeps a multi-day fixed date and detects changes to the end date", () => {
    const multi: DateSettings = { ...fixed, endDate: "2026-07-13" };
    expect(buildDateModeRequest(multi, initialDateDraft(multi), today)).toEqual({ ok: true, request: null });
    const draft = initialDateDraft(multi);
    draft.fixed = { ...draft.fixed, endDate: "2026-07-14" };
    expect(buildDateModeRequest(multi, draft, today)).toMatchObject({
      ok: true,
      request: { mode: "fixed", date: "2026-07-11", endDate: "2026-07-14", fromOptionId: null },
    });
  });

  it("sends nothing when nothing changed", () => {
    expect(buildDateModeRequest(fixed, initialDateDraft(fixed), today)).toEqual({ ok: true, request: null });
    const unknown: DateSettings = { ...fixed, mode: "unknown", date: null, startTime: null };
    expect(buildDateModeRequest(unknown, initialDateDraft(unknown), today)).toEqual({ ok: true, request: null });
  });

  it("leaves old fixed events without a date alone", () => {
    const legacy: DateSettings = { ...fixed, date: null, startTime: null };
    expect(buildDateModeRequest(legacy, initialDateDraft(legacy), today)).toEqual({ ok: true, request: null });
  });
});
