import { describe, expect, it } from "vitest";
import {
  validateEmail,
  validateEventDate,
  validateEventField,
  validateEventSchedule,
  validateEventTime,
  validateGuestInput,
  validateNewEventTitle,
  validatePersonName,
  validateRequestBody,
  validateTheme,
} from "@/lib/validation";

const validGuest = {
  name: "  Anna  ",
  additionalGuests: 2,
  additionalGuestNames: [" Ben ", "Cleo"],
  arrivalTime: "09:30",
  bringingSomething: true,
  bringingDescription: " Kuchen ",
  hasMessage: false,
  message: "ignoriert",
};

function guestError(overrides: Record<string, unknown>) {
  const result = validateGuestInput({ ...validGuest, ...overrides });
  return result.ok ? null : result.error;
}

describe("validateGuestInput", () => {
  it("returns trimmed data for a valid guest", () => {
    expect(validateGuestInput(validGuest)).toEqual({
      ok: true,
      data: {
        name: "Anna",
        additionalGuests: 2,
        additionalGuestNames: ["Ben", "Cleo"],
        arrivalTime: "09:30",
        bringingSomething: true,
        bringingDescription: "Kuchen",
        hasMessage: false,
        message: null,
      },
    });
  });

  it("accepts the number of additional guests as a string (form input)", () => {
    const result = validateGuestInput({ ...validGuest, additionalGuests: "0", additionalGuestNames: [] });
    expect(result.ok && result.data.additionalGuests).toBe(0);
  });

  it("rejects bodies that are not objects", () => {
    expect(validateGuestInput(null)).toEqual({ ok: false, error: "Ungültige Anfragedaten." });
    expect(validateGuestInput([])).toEqual({ ok: false, error: "Ungültige Anfragedaten." });
  });

  it("checks the name", () => {
    expect(guestError({ name: undefined })).toBe("Name ist erforderlich.");
    expect(guestError({ name: "   " })).toBe("Name darf nicht leer sein.");
    expect(guestError({ name: "A" })).toBe("Name muss mindestens 2 Zeichen lang sein.");
    expect(guestError({ name: "x".repeat(101) })).toBe("Name darf höchstens 100 Zeichen lang sein.");
  });

  it("checks the number of additional guests", () => {
    expect(guestError({ additionalGuests: undefined })).toBe("Zusätzliche Personen müssen eine Zahl sein.");
    expect(guestError({ additionalGuests: "" })).toBe("Zusätzliche Personen müssen eine Zahl sein.");
    expect(guestError({ additionalGuests: "abc" })).toBe(
      "Zusätzliche Personen müssen eine ganze Zahl ab 0 sein.",
    );
    expect(guestError({ additionalGuests: -1 })).toBe("Zusätzliche Personen müssen eine ganze Zahl ab 0 sein.");
    expect(guestError({ additionalGuests: 1.5 })).toBe("Zusätzliche Personen müssen eine ganze Zahl ab 0 sein.");
    expect(guestError({ additionalGuests: 31 })).toBe("Zusätzliche Personen dürfen höchstens 30 sein.");
  });

  it("checks the names of additional guests", () => {
    expect(guestError({ additionalGuestNames: "Ben" })).toBe("Namen der zusätzlichen Personen sind ungültig.");
    expect(guestError({ additionalGuestNames: ["Ben", 3] })).toBe(
      "Namen der zusätzlichen Personen sind ungültig.",
    );
    expect(guestError({ additionalGuestNames: ["Ben"] })).toBe(
      "Anzahl der Namen muss der Anzahl zusätzlicher Personen entsprechen.",
    );
    expect(guestError({ additionalGuestNames: ["Ben", " "] })).toBe(
      "Namen der zusätzlichen Personen dürfen nicht leer sein.",
    );
    expect(guestError({ additionalGuestNames: ["Ben", "C"] })).toBe(
      "Namen der zusätzlichen Personen müssen mindestens 2 Zeichen lang sein.",
    );
    expect(guestError({ additionalGuestNames: ["Ben", "x".repeat(101)] })).toBe(
      "Namen der zusätzlichen Personen dürfen höchstens 100 Zeichen lang sein.",
    );
  });

  it("checks the arrival time", () => {
    expect(guestError({ arrivalTime: undefined })).toBe("Ankunftszeit ist erforderlich.");
    expect(guestError({ arrivalTime: " " })).toBe("Ankunftszeit ist erforderlich.");
    expect(guestError({ arrivalTime: "25:00" })).toBe("Ankunftszeit muss im Format HH:mm angegeben werden.");
  });

  it("requires a description only when bringing something", () => {
    expect(guestError({ bringingDescription: " " })).toBe("Bitte gib an, was du mitbringst.");
    expect(guestError({ bringingDescription: "x".repeat(1001) })).toBe(
      "Die Angabe darf höchstens 1000 Zeichen lang sein.",
    );
    const result = validateGuestInput({ ...validGuest, bringingSomething: false });
    expect(result.ok && result.data.bringingDescription).toBeNull();
  });

  it("requires a message only when one is announced", () => {
    expect(guestError({ hasMessage: true, message: "" })).toBe("Bitte gib eine Nachricht ein.");
    expect(guestError({ hasMessage: true, message: "x".repeat(1001) })).toBe(
      "Die Nachricht darf höchstens 1000 Zeichen lang sein.",
    );
    const result = validateGuestInput({ ...validGuest, hasMessage: true, message: " Hallo " });
    expect(result.ok && result.data.message).toBe("Hallo");
  });
});

describe("validateEventField", () => {
  it("trims and accepts empty values (field not filled in yet)", () => {
    expect(validateEventField("title", "  Party  ")).toEqual({ ok: true, value: "Party" });
    expect(validateEventField("title", "")).toEqual({ ok: true, value: "" });
  });

  it("rejects non-strings and too long values", () => {
    expect(validateEventField("title", 3)).toEqual({ ok: false, error: "Titel ist ungültig." });
    expect(validateEventField("title", "x".repeat(201))).toEqual({
      ok: false,
      error: "Titel darf höchstens 200 Zeichen lang sein.",
    });
  });

  it("checks the contact e-mail format but allows leaving it empty", () => {
    expect(validateEventField("contactEmail", "")).toEqual({ ok: true, value: "" });
    expect(validateEventField("contactEmail", " anna@example.de ")).toEqual({ ok: true, value: "anna@example.de" });
    expect(validateEventField("contactEmail", "anna@example")).toEqual({
      ok: false,
      error: "Bitte gib eine gültige E-Mail-Adresse ein.",
    });
  });

  it("requires at least 2 characters for the contact name but allows leaving it empty", () => {
    expect(validateEventField("contactName", "")).toEqual({ ok: true, value: "" });
    expect(validateEventField("contactName", "A")).toEqual({
      ok: false,
      error: "Kontaktname muss mindestens 2 Zeichen lang sein.",
    });
  });
});

describe("validateEmail", () => {
  it("requires an @ and a dot in the domain", () => {
    expect(validateEmail(" anna@example.de ")).toEqual({ ok: true, value: "anna@example.de" });
    expect(validateEmail("")).toEqual({ ok: false, error: "E-Mail ist erforderlich." });
    expect(validateEmail("anna.example.de")).toEqual({ ok: false, error: "Bitte gib eine gültige E-Mail-Adresse ein." });
    expect(validateEmail("anna@example")).toEqual({ ok: false, error: "Bitte gib eine gültige E-Mail-Adresse ein." });
    expect(validateEmail("an na@example.de")).toEqual({ ok: false, error: "Bitte gib eine gültige E-Mail-Adresse ein." });
  });
});

describe("validatePersonName", () => {
  it("requires 2 to 100 characters", () => {
    expect(validatePersonName(" Al ")).toEqual({ ok: true, value: "Al" });
    expect(validatePersonName(" ")).toEqual({ ok: false, error: "Name ist erforderlich." });
    expect(validatePersonName("A")).toEqual({ ok: false, error: "Name muss mindestens 2 Zeichen lang sein." });
    expect(validatePersonName("x".repeat(101))).toEqual({
      ok: false,
      error: "Name darf höchstens 100 Zeichen lang sein.",
    });
  });
});

describe("validateEventDate / validateEventTime", () => {
  it("treats empty as cleared", () => {
    expect(validateEventDate("")).toEqual({ ok: true, value: null });
    expect(validateEventDate(null)).toEqual({ ok: true, value: null });
    expect(validateEventTime("")).toEqual({ ok: true, value: null });
  });

  it("accepts real dates and times only", () => {
    expect(validateEventDate("2026-09-04")).toEqual({ ok: true, value: "2026-09-04" });
    expect(validateEventDate("2026-02-30")).toEqual({ ok: false, error: "Datum ist ungültig." });
    expect(validateEventDate("04.09.2026")).toEqual({ ok: false, error: "Datum ist ungültig." });
    expect(validateEventDate(20260904)).toEqual({ ok: false, error: "Datum ist ungültig." });
    expect(validateEventTime("17:00")).toEqual({ ok: true, value: "17:00" });
    expect(validateEventTime("24:00")).toEqual({ ok: false, error: "Uhrzeit ist ungültig." });
  });
});

describe("validateEventSchedule", () => {
  const base = { eventDate: "2026-09-04", eventEndDate: null, eventStartTime: "17:00", eventEndTime: "20:00" };
  const schedule = (overrides: Record<string, string | null>) => validateEventSchedule({ ...base, ...overrides });

  it("accepts a single-day event with an end time after the start time", () => {
    expect(schedule({})).toEqual({ ok: true, value: base });
  });

  it("allows leaving the end date and end time empty", () => {
    expect(schedule({ eventEndTime: null })).toEqual({ ok: true, value: { ...base, eventEndTime: null } });
  });

  it("treats an end date equal to the start date as no end date", () => {
    expect(schedule({ eventEndDate: "2026-09-04" })).toEqual({ ok: true, value: base });
  });

  it("rejects an end date before the start date", () => {
    expect(schedule({ eventEndDate: "2026-09-03" })).toEqual({
      ok: false,
      error: "Das Enddatum darf nicht vor dem Startdatum liegen.",
    });
  });

  it("rejects an end date without a start date", () => {
    expect(schedule({ eventDate: null, eventEndDate: "2026-09-05" })).toEqual({
      ok: false,
      error: "Bitte zuerst ein Startdatum wählen.",
    });
  });

  it("rejects an end time without a start time", () => {
    expect(schedule({ eventStartTime: null })).toEqual({ ok: false, error: "Bitte zuerst eine Startzeit wählen." });
  });

  it("requires the end time to be later on a single day", () => {
    expect(schedule({ eventEndTime: "17:00" })).toEqual({
      ok: false,
      error: "Die Endzeit muss nach der Startzeit liegen.",
    });
    expect(schedule({ eventEndTime: "02:00" })).toEqual({
      ok: false,
      error: "Die Endzeit muss nach der Startzeit liegen.",
    });
  });

  it("allows an earlier end time when the event ends on a later day (overnight)", () => {
    expect(schedule({ eventEndDate: "2026-09-05", eventStartTime: "20:00", eventEndTime: "02:00" })).toEqual({
      ok: true,
      value: { eventDate: "2026-09-04", eventEndDate: "2026-09-05", eventStartTime: "20:00", eventEndTime: "02:00" },
    });
  });
});

describe("validateTheme", () => {
  it("accepts known themes only", () => {
    expect(validateTheme("ballons")).toEqual({ ok: true, value: "ballons" });
    expect(validateTheme("neon")).toEqual({ ok: false, error: "Ungültiges Theme." });
    expect(validateTheme(undefined)).toEqual({ ok: false, error: "Ungültiges Theme." });
  });
});

describe("validateNewEventTitle", () => {
  it("requires a name of at most 200 characters", () => {
    expect(validateNewEventTitle("  Sommerfest  ")).toEqual({ ok: true, value: "Sommerfest" });
    expect(validateNewEventTitle(" ")).toEqual({ ok: false, error: "Bitte gib einen Namen für dein Event ein." });
    expect(validateNewEventTitle(undefined)).toEqual({
      ok: false,
      error: "Bitte gib einen Namen für dein Event ein.",
    });
    expect(validateNewEventTitle("x".repeat(201))).toEqual({
      ok: false,
      error: "Name darf höchstens 200 Zeichen lang sein.",
    });
  });
});

describe("validateRequestBody", () => {
  it("accepts JSON objects only", () => {
    expect(validateRequestBody({ title: "x" })).toEqual({ ok: true, value: { title: "x" } });
    expect(validateRequestBody([])).toEqual({ ok: false, error: "Ungültige Anfragedaten." });
    expect(validateRequestBody(null)).toEqual({ ok: false, error: "Ungültige Anfragedaten." });
    expect(validateRequestBody("x")).toEqual({ ok: false, error: "Ungültige Anfragedaten." });
  });
});
