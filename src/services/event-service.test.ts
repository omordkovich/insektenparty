import { beforeEach, describe, expect, it, vi } from "vitest";

// The repository talks to the database; replaced by an in-memory stand-in.
const stored = {
  eventDate: "2026-09-04" as string | null,
  eventEndDate: null as string | null,
  eventStartTime: "17:00:00" as string | null,
  eventEndTime: "20:00:00" as string | null,
};

vi.mock("@/repositories/event-repository", () => ({
  getEventSchedule: vi.fn(async () => ({ ...stored })),
  getEventTheme: vi.fn(async () => "natur"),
  updateEvent: vi.fn(async (_id: string, _owner: string, fields: Record<string, unknown>) => fields),
  createEvent: vi.fn(),
  deleteEvent: vi.fn(),
}));
vi.mock("@/services/entitlement-service", () => ({ getUserEntitlements: vi.fn() }));

const { updateEventForOwner } = await import("@/services/event-service");
const { updateEvent } = await import("@/repositories/event-repository");

function update(body: Record<string, unknown>) {
  return updateEventForOwner("event-id", "owner-id", body);
}

describe("updateEventForOwner – date and time", () => {
  beforeEach(() => {
    vi.mocked(updateEvent).mockClear();
    Object.assign(stored, {
      eventDate: "2026-09-04",
      eventEndDate: null,
      eventStartTime: "17:00:00",
      eventEndTime: "20:00:00",
    });
  });

  it("saves a date range and derives the label", async () => {
    const result = await update({ eventDate: "2026-09-04", eventEndDate: "2026-09-06" });
    expect(result).toMatchObject({
      ok: true,
      data: { eventEndDate: "2026-09-06", dateLabel: "Fr. 4. – So. 6. September 2026", timeLabel: "17:00 - 20:00 Uhr" },
    });
  });

  it("stores an end date equal to the start date as no end date", async () => {
    const result = await update({ eventDate: "2026-09-04", eventEndDate: "2026-09-04" });
    expect(result).toMatchObject({ ok: true, data: { eventEndDate: null, dateLabel: "Freitag, 4. September 2026" } });
  });

  it("rejects an end date before the start date", async () => {
    expect(await update({ eventDate: "2026-09-04", eventEndDate: "2026-09-01" })).toEqual({
      ok: false,
      status: 400,
      error: "Das Enddatum darf nicht vor dem Startdatum liegen.",
    });
    expect(updateEvent).not.toHaveBeenCalled();
  });

  it("checks a time change against the stored dates", async () => {
    expect(await update({ eventStartTime: "20:00", eventEndTime: "02:00" })).toEqual({
      ok: false,
      status: 400,
      error: "Die Endzeit muss nach der Startzeit liegen.",
    });

    stored.eventEndDate = "2026-09-05";
    expect(await update({ eventStartTime: "20:00", eventEndTime: "02:00" })).toMatchObject({
      ok: true,
      data: { timeLabel: "20:00 - 02:00 Uhr" },
    });
  });

  it("does not let a date change break the stored overnight times", async () => {
    Object.assign(stored, { eventEndDate: "2026-09-05", eventStartTime: "20:00:00", eventEndTime: "02:00:00" });
    expect(await update({ eventDate: "2026-09-04", eventEndDate: null })).toEqual({
      ok: false,
      status: 400,
      error: "Die Endzeit muss nach der Startzeit liegen.",
    });
  });

  it("shows only the start time when no end time is given", async () => {
    expect(await update({ eventStartTime: "17:00", eventEndTime: null })).toMatchObject({
      ok: true,
      data: { timeLabel: "ab 17:00 Uhr" },
    });
  });

  it("validates other fields with the shared rules", async () => {
    expect(await update({ contactEmail: "kein-at.de" })).toEqual({
      ok: false,
      status: 400,
      error: "Bitte gib eine gültige E-Mail-Adresse ein.",
    });
    expect(await update({ theme: "neon" })).toEqual({ ok: false, status: 400, error: "Ungültiges Theme." });
  });
});
