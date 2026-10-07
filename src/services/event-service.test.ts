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
  getEventAddress: vi.fn(async () => ({ slug: "anna-sommerfest-k7q2xm", slugKey: "k7q2xm", slugName: "anna" })),
}));
vi.mock("@/services/entitlement-service", () => ({ getUserEntitlements: vi.fn() }));
vi.mock("@/repositories/user-repository", () => ({ getUserDisplayName: vi.fn(async () => "Anna Müller") }));

const { createEventForOwner, updateEventForOwner } = await import("@/services/event-service");
const { createEvent, getEventAddress, updateEvent } = await import("@/repositories/event-repository");
const { getUserEntitlements } = await import("@/services/entitlement-service");
const { getUserDisplayName } = await import("@/repositories/user-repository");

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

// What postgres-js throws (wrapped by drizzle) when the slug is taken.
function uniqueViolation() {
  return Object.assign(new Error("Failed query"), {
    cause: Object.assign(new Error("duplicate key value violates unique constraint"), { code: "23505" }),
  });
}

describe("createEventForOwner – event address", () => {
  beforeEach(() => {
    vi.mocked(createEvent).mockReset();
    vi.mocked(getUserEntitlements).mockResolvedValue({
      unlockedThemes: ["weiss"],
      eventLimit: 1,
      eventCount: 0,
    });
  });

  it("builds the address from the owner's first name and the title", async () => {
    vi.mocked(createEvent).mockImplementation(async (input) => ({ slug: input.slug }));
    const result = await createEventForOwner("owner-id", { theme: "weiss", title: "Sommerfest" });
    expect(result.ok && result.data.slug).toMatch(/^anna-sommerfest-[a-z2-9]{6}$/);
    const [input] = vi.mocked(createEvent).mock.calls[0];
    expect(input.slug.endsWith(`-${input.slugKey}`)).toBe(true);
    expect(input.slugName).toBe("anna");
  });

  it("rolls a new suffix when the address is already taken", async () => {
    vi.mocked(createEvent)
      .mockRejectedValueOnce(uniqueViolation())
      .mockImplementation(async (input) => ({ slug: input.slug }));
    const result = await createEventForOwner("owner-id", { theme: "weiss", title: "Sommerfest" });

    expect(result.ok).toBe(true);
    const [first, second] = vi.mocked(createEvent).mock.calls.map(([input]) => input.slug);
    expect(second).not.toBe(first);
    expect(result.ok && result.data.slug).toBe(second);
  });

  it("gives up after a few taken addresses instead of looping forever", async () => {
    vi.mocked(createEvent).mockRejectedValue(uniqueViolation());
    await expect(createEventForOwner("owner-id", { theme: "weiss", title: "Sommerfest" })).rejects.toThrow();
    expect(vi.mocked(createEvent).mock.calls.length).toBe(5);
  });

  it("does not retry on other database errors", async () => {
    vi.mocked(createEvent).mockRejectedValue(new Error("connection lost"));
    await expect(createEventForOwner("owner-id", { theme: "weiss", title: "Sommerfest" })).rejects.toThrow(
      "connection lost",
    );
    expect(vi.mocked(createEvent).mock.calls.length).toBe(1);
  });
});

describe("updateEventForOwner – renaming", () => {
  beforeEach(() => {
    vi.mocked(updateEvent).mockClear();
    vi.mocked(getEventAddress).mockClear();
    vi.mocked(getEventAddress).mockResolvedValue({
      slug: "anna-sommerfest-k7q2xm",
      slugKey: "k7q2xm",
      slugName: "anna",
    });
    vi.mocked(getUserDisplayName).mockReset().mockResolvedValue("Anna Müller");
  });

  it("moves the address to the new title and keeps name part and key", async () => {
    await update({ title: "Gartenparty" });
    expect(vi.mocked(updateEvent).mock.calls[0][2]).toMatchObject({
      title: "Gartenparty",
      slug: "anna-gartenparty-k7q2xm",
      slugKey: "k7q2xm",
    });
  });

  it("keeps the name from creation even if the account name changed since", async () => {
    vi.mocked(getEventAddress).mockResolvedValue({
      slug: "anna-sommerfest-k7q2xm",
      slugKey: "k7q2xm",
      slugName: "anna",
    });
    vi.mocked(getUserDisplayName).mockResolvedValueOnce("Bernd Schulz");
    await update({ title: "Gartenparty" });
    expect(vi.mocked(updateEvent).mock.calls[0][2]).toMatchObject({ slug: "anna-gartenparty-k7q2xm" });
    expect(getUserDisplayName).not.toHaveBeenCalled();
  });

  it("gives old events key and current name once, then keeps them", async () => {
    vi.mocked(getEventAddress).mockResolvedValue({ slug: "milans7BD", slugKey: null, slugName: null });
    await update({ title: "Gartenparty" });
    expect(vi.mocked(updateEvent).mock.calls[0][2]).toMatchObject({
      slug: "anna-gartenparty-milans7BD",
      slugKey: "milans7BD",
      slugName: "anna",
    });
  });

  it("leaves the address alone when the title doesn't change", async () => {
    await update({ locationLabel: "Köln" });
    const fields = vi.mocked(updateEvent).mock.calls[0][2];
    expect(fields).not.toHaveProperty("slug");
    expect(getEventAddress).not.toHaveBeenCalled();
  });
});
