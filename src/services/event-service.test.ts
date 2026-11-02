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
  getEventPlanInfo: vi.fn(async () => ({ ownerId: "owner-id", plan: "free", createdOn: "2026-07-01" })),
  updateEvent: vi.fn(async (_id: string, _owner: string, fields: Record<string, unknown>) => fields),
  createEvent: vi.fn(),
  deleteEvent: vi.fn(),
  getEventAddress: vi.fn(async () => ({ slug: "anna-sommerfest-k7q2xm", slugKey: "k7q2xm", slugName: "anna" })),
}));
vi.mock("@/services/event-lifecycle-service", () => ({
  EVENT_OVER_ERROR: "Dieses Event ist vorbei.",
  denyIfOver: vi.fn(async () => null),
}));
vi.mock("@/services/entitlement-service", () => ({ getUserEntitlements: vi.fn() }));
vi.mock("@/repositories/user-repository", () => ({ getUserDisplayName: vi.fn(async () => "Anna Müller") }));
vi.mock("@/repositories/date-poll-repository", () => ({
  applyDateModeChange: vi.fn(async () => true),
  getEventDateMode: vi.fn(async () => "fixed"),
}));
vi.mock("@/lib/date-poll", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/date-poll")>()),
  todayInBerlin: () => "2026-07-01",
}));

const { createEventForOwner, updateEventForOwner } = await import("@/services/event-service");
const { createEvent, getEventAddress, getEventPlanInfo, getEventTheme, updateEvent } = await import(
  "@/repositories/event-repository"
);
const { getUserEntitlements } = await import("@/services/entitlement-service");
const { denyIfOver } = await import("@/services/event-lifecycle-service");
const { getUserDisplayName } = await import("@/repositories/user-repository");

function update(body: Record<string, unknown>) {
  return updateEventForOwner("event-id", "owner-id", body);
}

describe("updateEventForOwner – event over", () => {
  it("refuses every change with 409 and writes nothing", async () => {
    vi.mocked(denyIfOver).mockResolvedValueOnce({ ok: false, status: 409, error: "Dieses Event ist vorbei." });
    vi.mocked(updateEvent).mockClear();
    expect(await update({ title: "Neu" })).toEqual({ ok: false, status: 409, error: "Dieses Event ist vorbei." });
    expect(updateEvent).not.toHaveBeenCalled();
  });
});

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

// A free event needs a fixed date within its window.
const FIXED = { mode: "fixed", date: "2026-07-11", startTime: null, endTime: null };

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
      freeEventAvailable: true,
      eventCredits: 0,
    });
  });

  it("builds the address from the owner's first name and the title", async () => {
    vi.mocked(createEvent).mockImplementation(async (input) => ({ id: "event-id", slug: input.slug }));
    const result = await createEventForOwner("owner-id", { theme: "weiss", title: "Sommerfest", date: FIXED });
    expect(result.ok && result.data.slug).toMatch(/^anna-sommerfest-[a-z2-9]{6}$/);
    const [input] = vi.mocked(createEvent).mock.calls[0];
    expect(input.slug.endsWith(`-${input.slugKey}`)).toBe(true);
    expect(input.slugName).toBe("anna");
  });

  it("rolls a new suffix when the address is already taken", async () => {
    vi.mocked(createEvent)
      .mockRejectedValueOnce(uniqueViolation())
      .mockImplementation(async (input) => ({ id: "event-id", slug: input.slug }));
    const result = await createEventForOwner("owner-id", { theme: "weiss", title: "Sommerfest", date: FIXED });

    expect(result.ok).toBe(true);
    const [first, second] = vi.mocked(createEvent).mock.calls.map(([input]) => input.slug);
    expect(second).not.toBe(first);
    expect(result.ok && result.data.slug).toBe(second);
  });

  it("gives up after a few taken addresses instead of looping forever", async () => {
    vi.mocked(createEvent).mockRejectedValue(uniqueViolation());
    await expect(createEventForOwner("owner-id", { theme: "weiss", title: "Sommerfest", date: FIXED })).rejects.toThrow();
    expect(vi.mocked(createEvent).mock.calls.length).toBe(5);
  });

  it("answers \"no free event\" instead of retrying when the one-free-event index is hit", async () => {
    const racedFree = Object.assign(new Error("Failed query"), {
      cause: Object.assign(new Error("duplicate key value violates unique constraint"), {
        code: "23505",
        constraint_name: "user_entitlements_one_free_event",
      }),
    });
    vi.mocked(createEvent).mockRejectedValue(racedFree);
    expect(await createEventForOwner("owner-id", { theme: "weiss", title: "Sommerfest", date: FIXED })).toEqual({
      ok: false,
      status: 403,
      error: "Du hast kein freies Event mehr.",
    });
    expect(vi.mocked(createEvent).mock.calls.length).toBe(1);
  });

  it("does not retry on other database errors", async () => {
    vi.mocked(createEvent).mockRejectedValue(new Error("connection lost"));
    await expect(createEventForOwner("owner-id", { theme: "weiss", title: "Sommerfest", date: FIXED })).rejects.toThrow(
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

describe("event password", () => {
  beforeEach(() => {
    vi.mocked(createEvent).mockReset();
    vi.mocked(createEvent).mockImplementation(async (input) => ({ id: "event-id", slug: input.slug }));
    vi.mocked(updateEvent).mockClear();
    vi.mocked(getUserEntitlements).mockResolvedValue({
      unlockedThemes: ["weiss"],
      freeEventAvailable: true,
      eventCredits: 0,
    });
  });

  it("stores the trimmed password when creating", async () => {
    await createEventForOwner("owner-id", { theme: "weiss", title: "Sommerfest", date: FIXED, accessPassword: " Sommer " });
    expect(vi.mocked(createEvent).mock.calls[0][0].accessPassword).toBe("Sommer");
  });

  it("creates an open event without a password", async () => {
    await createEventForOwner("owner-id", { theme: "weiss", title: "Sommerfest", date: FIXED });
    expect(vi.mocked(createEvent).mock.calls[0][0].accessPassword).toBeNull();
  });

  it("rejects a too short password when creating", async () => {
    expect(
      await createEventForOwner("owner-id", { theme: "weiss", title: "Sommerfest", date: FIXED, accessPassword: "abc" }),
    ).toEqual({ ok: false, status: 400, error: "Das Passwort muss mindestens 4 Zeichen lang sein." });
    expect(createEvent).not.toHaveBeenCalled();
  });

  it("sets and removes the password on update", async () => {
    expect(await update({ accessPassword: "Winter" })).toMatchObject({ ok: true, data: { accessPassword: "Winter" } });
    expect(await update({ accessPassword: null })).toMatchObject({ ok: true, data: { accessPassword: null } });
    expect(await update({ accessPassword: "ab" })).toEqual({
      ok: false,
      status: 400,
      error: "Das Passwort muss mindestens 4 Zeichen lang sein.",
    });
  });
});

describe("createEventForOwner – date mode", () => {
  beforeEach(async () => {
    vi.mocked(createEvent).mockReset();
    vi.mocked(createEvent).mockImplementation(async (input) => ({ id: "event-id", slug: input.slug }));
    vi.mocked(getUserEntitlements).mockResolvedValue({ unlockedThemes: ["weiss"], freeEventAvailable: true, eventCredits: 0 });
    const { applyDateModeChange } = await import("@/repositories/date-poll-repository");
    vi.mocked(applyDateModeChange).mockClear();
  });

  it("requires a date mode", async () => {
    expect(await createEventForOwner("owner-id", { theme: "weiss", title: "Fest" })).toEqual({
      ok: false,
      status: 400,
      error: "Bitte wähle, wie der Termin festgelegt wird.",
    });
  });

  it("creates the event open and then applies the chosen date", async () => {
    const { applyDateModeChange } = await import("@/repositories/date-poll-repository");
    await createEventForOwner("owner-id", {
      theme: "weiss",
      title: "Fest",
      date: { mode: "fixed", date: "2026-07-11", startTime: "15:00", endTime: null },
    });
    expect(vi.mocked(createEvent).mock.calls[0][0].dateMode).toBe("unknown");
    expect(vi.mocked(applyDateModeChange).mock.calls[0][2]).toMatchObject({
      mode: "fixed",
      schedule: { eventDate: "2026-07-11", eventStartTime: "15:00" },
    });
  });

  it("does not touch the date for \"Noch kein Termin\"", async () => {
    const { applyDateModeChange } = await import("@/repositories/date-poll-repository");
    vi.mocked(getUserEntitlements).mockResolvedValue({ unlockedThemes: ["weiss"], freeEventAvailable: false, eventCredits: 1 });
    await createEventForOwner("owner-id", { theme: "weiss", title: "Fest", date: { mode: "unknown" } });
    expect(applyDateModeChange).not.toHaveBeenCalled();
  });
});

describe("updateEventForOwner – date only when fixed", () => {
  it("rejects inline date changes while the date is open", async () => {
    const { getEventDateMode } = await import("@/repositories/date-poll-repository");
    vi.mocked(getEventDateMode).mockResolvedValueOnce("poll");
    expect(await update({ eventDate: "2026-09-04" })).toEqual({
      ok: false,
      status: 409,
      error: "Datum und Uhrzeit legst du in den Event-Einstellungen fest.",
    });
  });

  it("does not let a fixed event's date be cleared", async () => {
    vi.mocked(updateEvent).mockClear();
    for (const body of [{ eventDate: null, eventEndDate: null }, { eventDate: null }, { eventDate: "" }]) {
      expect(await update(body)).toEqual({ ok: false, status: 400, error: "Bitte gib ein Datum ein." });
    }
    expect(updateEvent).not.toHaveBeenCalled();
  });
});

describe("updateEventForOwner – plan rules", () => {
  const planInfo = (plan: "free" | "paid") =>
    vi.mocked(getEventPlanInfo).mockResolvedValue({ ownerId: "owner-id", plan, createdOn: "2026-07-01" });
  const entitlements = () =>
    vi.mocked(getUserEntitlements).mockResolvedValue({ unlockedThemes: ["weiss"], freeEventAvailable: false, eventCredits: 0 });

  beforeEach(() => {
    vi.mocked(updateEvent).mockClear();
    Object.assign(stored, { eventDate: "2026-09-04", eventEndDate: null, eventStartTime: "17:00:00", eventEndTime: "20:00:00" });
    planInfo("free");
    entitlements();
  });

  it("keeps a free event's date within 3 months of its creation", async () => {
    expect(await update({ eventDate: "2026-10-02" })).toEqual({
      ok: false,
      status: 400,
      error: "Das Datum darf höchstens 3 Monate nach dem Erstellen des Events liegen.",
    });
    expect(await update({ eventEndDate: "2026-10-02" })).toMatchObject({ ok: false, status: 400 });
    expect(updateEvent).not.toHaveBeenCalled();
    expect(await update({ eventDate: "2026-10-01" })).toMatchObject({ ok: true });
  });

  it("allows a paid event 12 months", async () => {
    planInfo("paid");
    expect(await update({ eventDate: "2027-07-01" })).toMatchObject({ ok: true });
    expect(await update({ eventDate: "2027-07-02" })).toEqual({
      ok: false,
      status: 400,
      error: "Das Datum darf höchstens 12 Monate nach dem Erstellen des Events liegen.",
    });
  });

  it("rejects a date in the past", async () => {
    expect(await update({ eventDate: "2026-06-30" })).toEqual({
      ok: false,
      status: 400,
      error: "Das Datum liegt in der Vergangenheit.",
    });
    expect(updateEvent).not.toHaveBeenCalled();
  });

  it("lets a time change through on an event whose date is already past", async () => {
    stored.eventDate = "2026-06-20";
    expect(await update({ eventStartTime: "18:00" })).toMatchObject({ ok: true });
  });

  it("does not recheck a day that stays the same", async () => {
    stored.eventDate = "2026-06-20";
    expect(await update({ eventDate: "2026-06-20", eventEndDate: "2026-07-05", eventEndTime: "12:00" })).toMatchObject({ ok: true });
  });

  it("only touches an event of its owner", async () => {
    vi.mocked(getEventPlanInfo).mockResolvedValue({ ownerId: "someone-else", plan: "free", createdOn: "2026-07-01" });
    expect(await update({ eventDate: "2026-09-05" })).toEqual({
      ok: false,
      status: 404,
      error: "Event wurde nicht gefunden.",
    });
    vi.mocked(getEventPlanInfo).mockResolvedValue(undefined);
    expect(await update({ theme: "ballons" })).toMatchObject({ ok: false, status: 404 });
  });

  it("unlocks every theme on a paid event, only owned ones on a free event", async () => {
    planInfo("paid");
    expect(await update({ theme: "ballons" })).toMatchObject({ ok: true, data: { theme: "ballons" } });

    planInfo("free");
    expect(await update({ theme: "ballons" })).toEqual({
      ok: false,
      status: 403,
      error: "Dieses Design ist noch nicht freigeschaltet.",
    });
  });

  it("does not check a theme that stays the same", async () => {
    vi.mocked(getEventTheme).mockResolvedValueOnce("ballons");
    expect(await update({ theme: "ballons" })).toMatchObject({ ok: true });
  });
});

describe("seat limit in the settings", () => {
  it("sets and removes the limit, rejects invalid numbers", async () => {
    expect(await update({ maxGuests: "12" })).toMatchObject({ ok: true, data: { maxGuests: 12 } });
    expect(await update({ maxGuests: null })).toMatchObject({ ok: true, data: { maxGuests: null } });
    expect(await update({ maxGuests: 0 })).toEqual({
      ok: false,
      status: 400,
      error: "Die Teilnehmerzahl muss eine ganze Zahl zwischen 1 und 300 sein.",
    });
  });
});

describe("createEventForOwner – plan and quota", () => {
  const POLL = {
    mode: "poll",
    proposals: [
      { date: "2026-07-11", startTime: "15:00", endTime: null },
      { date: "2026-07-12", startTime: "15:00", endTime: null },
    ],
  };
  const fixedOn = (date: string) => ({ mode: "fixed", date, startTime: null, endTime: null });
  const create = (input: { theme?: unknown; date: unknown; paid?: unknown }) =>
    createEventForOwner("owner-id", { theme: "weiss", title: "Fest", ...input });
  const entitlements = (freeEventAvailable: boolean, eventCredits: number) =>
    vi.mocked(getUserEntitlements).mockResolvedValue({ unlockedThemes: ["weiss"], freeEventAvailable, eventCredits });
  const planOfCreated = () => vi.mocked(createEvent).mock.calls[0][0].plan;

  beforeEach(async () => {
    vi.mocked(createEvent).mockReset();
    vi.mocked(createEvent).mockImplementation(async (input) => ({ id: "event-id", slug: input.slug }));
    const { applyDateModeChange } = await import("@/repositories/date-poll-repository");
    vi.mocked(applyDateModeChange).mockClear();
  });

  it("allows only a fixed date on the free event", async () => {
    entitlements(true, 0);
    expect(await create({ date: { mode: "unknown" } })).toEqual({
      ok: false,
      status: 403,
      error: "Abstimmung und offener Termin gibt es nur mit einem freigeschalteten Event.",
    });
    expect(createEvent).not.toHaveBeenCalled();
  });

  it("keeps the free event's date within 3 months of today", async () => {
    entitlements(true, 0);
    expect(await create({ date: fixedOn("2026-10-02") })).toEqual({
      ok: false,
      status: 400,
      error: "Das Datum darf höchstens 3 Monate nach dem Erstellen des Events liegen.",
    });
    expect(createEvent).not.toHaveBeenCalled();

    expect(await create({ date: fixedOn("2026-10-01") })).toMatchObject({ ok: true });
    expect(planOfCreated()).toBe("free");
  });

  it("uses a credit once the free event is used up", async () => {
    entitlements(false, 1);
    expect(await create({ date: POLL })).toMatchObject({ ok: true });
    expect(planOfCreated()).toBe("paid");
  });

  it("uses a credit when a paid event is requested, even with the free event left", async () => {
    entitlements(true, 1);
    expect(await create({ date: FIXED, paid: true })).toMatchObject({ ok: true });
    expect(planOfCreated()).toBe("paid");
  });

  it("refuses without free event or credit", async () => {
    entitlements(false, 0);
    expect(await create({ date: FIXED })).toEqual({ ok: false, status: 403, error: "Du hast kein freies Event mehr." });
    expect(createEvent).not.toHaveBeenCalled();
  });

  it("refuses when the quota was used up in the meantime", async () => {
    entitlements(true, 0);
    vi.mocked(createEvent).mockResolvedValue("no_quota");
    expect(await create({ date: FIXED })).toEqual({ ok: false, status: 403, error: "Du hast kein freies Event mehr." });
    const { applyDateModeChange } = await import("@/repositories/date-poll-repository");
    expect(applyDateModeChange).not.toHaveBeenCalled();
  });

  it("allows every theme on a paid event, only owned ones on the free event", async () => {
    entitlements(false, 1);
    expect(await create({ theme: "natur", date: FIXED })).toMatchObject({ ok: true });
    expect(planOfCreated()).toBe("paid");

    vi.mocked(createEvent).mockClear();
    entitlements(true, 0);
    expect(await create({ theme: "natur", date: FIXED })).toEqual({
      ok: false,
      status: 403,
      error: "Dieses Design ist noch nicht freigeschaltet.",
    });
    expect(createEvent).not.toHaveBeenCalled();
  });
});
