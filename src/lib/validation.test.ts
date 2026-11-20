import { describe, expect, it } from "vitest";
import { err } from "@/i18n/errors";
import {
  validateEmail,
  validateEventDate,
  validateEventField,
  validateEventSchedule,
  formatTimeWindow,
  validateEventTime,
  validateGuestInput,
  validateNewEventTitle,
  validateFeedback,
  validatePersonName,
  validateRequestBody,
  validateTheme,
  validateAccessPassword,
  validateEventPasswordPair,
  validatePasswordRequest,
  validateFixedDate,
  validatePollVote,
  validateProposals,
  validateMaxGuests,
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
        arrivalEndTime: null,
        departureTime: null,
        departureEndTime: null,
        bringingSomething: true,
        bringingDescription: "Kuchen",
        hasMessage: false,
        message: null,
        declined: false,
      },
    });
  });

  it("accepts the number of additional guests as a string (form input)", () => {
    const result = validateGuestInput({ ...validGuest, additionalGuests: "0", additionalGuestNames: [] });
    expect(result.ok && result.data.additionalGuests).toBe(0);
  });

  it("rejects bodies that are not objects", () => {
    expect(validateGuestInput(null)).toEqual({ ok: false, error: err("invalidRequest") });
    expect(validateGuestInput([])).toEqual({ ok: false, error: err("invalidRequest") });
  });

  it("checks the name", () => {
    expect(guestError({ name: undefined })).toEqual(err("nameRequired"));
    expect(guestError({ name: "   " })).toEqual(err("nameEmpty"));
    expect(guestError({ name: "A" })).toEqual(err("nameTooShort", { min: 2 }));
    expect(guestError({ name: "x".repeat(101) })).toEqual(err("nameTooLong", { max: 100 }));
  });

  it("checks the number of additional guests", () => {
    expect(guestError({ additionalGuests: undefined })).toEqual(err("companionsNotANumber"));
    expect(guestError({ additionalGuests: "" })).toEqual(err("companionsNotANumber"));
    expect(guestError({ additionalGuests: "abc" })).toEqual(
      err("companionsNotWhole"),
    );
    expect(guestError({ additionalGuests: -1 })).toEqual(err("companionsNotWhole"));
    expect(guestError({ additionalGuests: 1.5 })).toEqual(err("companionsNotWhole"));
    expect(guestError({ additionalGuests: 31 })).toEqual(err("companionsTooMany", { max: 30 }));
  });

  it("checks the names of additional guests", () => {
    expect(guestError({ additionalGuestNames: "Ben" })).toEqual(err("companionNamesInvalid"));
    expect(guestError({ additionalGuestNames: ["Ben", 3] })).toEqual(
      err("companionNamesInvalid"),
    );
    expect(guestError({ additionalGuestNames: ["Ben"] })).toEqual(
      err("companionCountMismatch"),
    );
    expect(guestError({ additionalGuestNames: ["Ben", " "] })).toEqual(
      err("companionNameEmpty"),
    );
    expect(guestError({ additionalGuestNames: ["Ben", "C"] })).toEqual(
      err("companionNameTooShort", { min: 2 }),
    );
    expect(guestError({ additionalGuestNames: ["Ben", "x".repeat(101)] })).toEqual(
      err("companionNameTooLong", { max: 100 }),
    );
  });

  it("checks the arrival time, which is optional", () => {
    const missing = validateGuestInput({ ...validGuest, arrivalTime: undefined });
    expect(missing.ok && missing.data.arrivalTime).toBeNull();
    const empty = validateGuestInput({ ...validGuest, arrivalTime: " " });
    expect(empty.ok && empty.data.arrivalTime).toBeNull();
    expect(guestError({ arrivalTime: "25:00" })).toEqual(err("arrivalFormat"));
    expect(guestError({ arrivalTime: "", arrivalEndTime: "10:30" })).toEqual(
      err("arrivalStartFirst"),
    );
  });

  it("accepts an unknown arrival time and ignores the greyed-out fields", () => {
    const result = validateGuestInput({
      ...validGuest,
      arrivalUnknown: true,
      arrivalTime: "",
      arrivalEndTime: "kaputt",
    });
    expect(result.ok && [result.data.arrivalTime, result.data.arrivalEndTime, result.data.declined]).toEqual([
      null,
      null,
      false,
    ]);
    // Only an explicit true counts.
    expect(guestError({ arrivalUnknown: "true", arrivalTime: "25:00" })).toEqual(
      err("arrivalFormat"),
    );
  });

  it("accepts an optional end of the arrival window", () => {
    const withEnd = validateGuestInput({ ...validGuest, arrivalEndTime: "10:30" });
    expect(withEnd.ok && withEnd.data.arrivalEndTime).toBe("10:30");
    const empty = validateGuestInput({ ...validGuest, arrivalEndTime: "" });
    expect(empty.ok && empty.data.arrivalEndTime).toBeNull();
  });

  it("allows the arrival window to end after midnight but not at its start", () => {
    const overnight = validateGuestInput({ ...validGuest, arrivalTime: "22:00", arrivalEndTime: "01:00" });
    expect(overnight.ok && overnight.data.arrivalEndTime).toBe("01:00");
    expect(guestError({ arrivalEndTime: "09:30" })).toEqual(
      err("arrivalSameTimes"),
    );
    expect(guestError({ arrivalEndTime: "9:30 Uhr" })).toEqual(
      err("arrivalEndFormat"),
    );
  });

  it("treats \"Ich bleibe bis\" as optional", () => {
    const empty = validateGuestInput({ ...validGuest, departureTime: "", departureEndTime: "" });
    expect(empty.ok && [empty.data.departureTime, empty.data.departureEndTime]).toEqual([null, null]);
    const single = validateGuestInput({ ...validGuest, departureTime: "18:00" });
    expect(single.ok && [single.data.departureTime, single.data.departureEndTime]).toEqual(["18:00", null]);
    const range = validateGuestInput({ ...validGuest, departureTime: "23:00", departureEndTime: "00:30" });
    expect(range.ok && [range.data.departureTime, range.data.departureEndTime]).toEqual(["23:00", "00:30"]);
  });

  it("checks the \"Ich bleibe bis\" window", () => {
    expect(guestError({ departureTime: "", departureEndTime: "19:00" })).toEqual(
      err("departureStartFirst"),
    );
    expect(guestError({ departureTime: "18:00", departureEndTime: "18:00" })).toEqual(
      err("departureSameTimes"),
    );
    expect(guestError({ departureTime: "6 Uhr" })).toEqual(err("departureFormat"));
  });

  it("requires a description only when bringing something", () => {
    expect(guestError({ bringingDescription: " " })).toEqual(err("bringingRequired"));
    expect(guestError({ bringingDescription: "x".repeat(1001) })).toEqual(
      err("detailTooLong", { max: 1000 }),
    );
    const result = validateGuestInput({ ...validGuest, bringingSomething: false });
    expect(result.ok && result.data.bringingDescription).toBeNull();
  });

  it("requires a message only when one is announced", () => {
    expect(guestError({ hasMessage: true, message: "" })).toEqual(err("messageRequired"));
    expect(guestError({ hasMessage: true, message: "x".repeat(1001) })).toEqual(
      err("messageTooLong", { max: 1000 }),
    );
    const result = validateGuestInput({ ...validGuest, hasMessage: true, message: " Hallo " });
    expect(result.ok && result.data.message).toBe("Hallo");
  });

  it("clears everything about coming for a declined guest", () => {
    expect(
      validateGuestInput({
        ...validGuest,
        declined: true,
        departureTime: "18:00",
        hasMessage: true,
        message: " Viel Spaß! ",
      }),
    ).toEqual({
      ok: true,
      data: {
        name: "Anna",
        additionalGuests: 0,
        additionalGuestNames: [],
        arrivalTime: null,
        arrivalEndTime: null,
        departureTime: null,
        departureEndTime: null,
        bringingSomething: false,
        bringingDescription: null,
        hasMessage: true,
        message: "Viel Spaß!",
        declined: true,
      },
    });
  });

  it("ignores invalid greyed-out fields of a declined guest", () => {
    const result = validateGuestInput({
      ...validGuest,
      declined: true,
      additionalGuests: "",
      arrivalTime: "",
      departureEndTime: "kaputt",
      bringingDescription: "",
    });
    expect(result.ok).toBe(true);
  });

  it("still checks name and message of a declined guest", () => {
    expect(guestError({ declined: true, name: "A" })).toEqual(err("nameTooShort", { min: 2 }));
    expect(guestError({ declined: true, hasMessage: true, message: "" })).toEqual(err("messageRequired"));
    expect(guestError({ declined: true, arrivalTime: "" })).toBeNull();
  });

  it("only counts an explicit true as declined", () => {
    const result = validateGuestInput({ ...validGuest, declined: "true" });
    expect(result.ok && result.data.declined).toBe(false);
  });
});

describe("validateEventField", () => {
  it("trims and accepts empty values (field not filled in yet)", () => {
    expect(validateEventField("title", "  Party  ")).toEqual({ ok: true, value: "Party" });
    expect(validateEventField("title", "")).toEqual({ ok: true, value: "" });
  });

  it("rejects non-strings and too long values", () => {
    expect(validateEventField("title", 3)).toEqual({ ok: false, error: err("fieldInvalid", { field: "title" }) });
    expect(validateEventField("title", "x".repeat(201))).toEqual({
      ok: false,
      error: err("fieldTooLong", { field: "title", max: 200 }),
    });
  });

  it("checks the contact e-mail format but allows leaving it empty", () => {
    expect(validateEventField("contactEmail", "")).toEqual({ ok: true, value: "" });
    expect(validateEventField("contactEmail", " anna@example.de ")).toEqual({ ok: true, value: "anna@example.de" });
    expect(validateEventField("contactEmail", "anna@example")).toEqual({
      ok: false,
      error: err("invalidEmail"),
    });
  });

  it("requires at least 2 characters for the contact name but allows leaving it empty", () => {
    expect(validateEventField("contactName", "")).toEqual({ ok: true, value: "" });
    expect(validateEventField("contactName", "A")).toEqual({
      ok: false,
      error: err("fieldTooShort", { field: "contactName", min: 2 }),
    });
  });
});

describe("validateEmail", () => {
  it("requires an @ and a dot in the domain", () => {
    expect(validateEmail(" anna@example.de ")).toEqual({ ok: true, value: "anna@example.de" });
    expect(validateEmail("")).toEqual({ ok: false, error: err("emailRequired") });
    expect(validateEmail("anna.example.de")).toEqual({ ok: false, error: err("invalidEmail") });
    expect(validateEmail("anna@example")).toEqual({ ok: false, error: err("invalidEmail") });
    expect(validateEmail("an na@example.de")).toEqual({ ok: false, error: err("invalidEmail") });
  });
});

describe("validatePersonName", () => {
  it("requires 2 to 100 characters", () => {
    expect(validatePersonName(" Al ")).toEqual({ ok: true, value: "Al" });
    expect(validatePersonName(" ")).toEqual({ ok: false, error: err("displayNameRequired") });
    expect(validatePersonName(undefined)).toEqual({ ok: false, error: err("displayNameRequired") });
    expect(validatePersonName("A")).toEqual({
      ok: false,
      error: err("displayNameTooShort", { min: 2 }),
    });
    expect(validatePersonName("x".repeat(101))).toEqual({
      ok: false,
      error: err("displayNameTooLong", { max: 100 }),
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
    expect(validateEventDate("2026-02-30")).toEqual({ ok: false, error: err("fieldInvalid", { field: "dateLabel" }) });
    expect(validateEventDate("04.09.2026")).toEqual({ ok: false, error: err("fieldInvalid", { field: "dateLabel" }) });
    expect(validateEventDate(20260904)).toEqual({ ok: false, error: err("fieldInvalid", { field: "dateLabel" }) });
    expect(validateEventTime("17:00")).toEqual({ ok: true, value: "17:00" });
    expect(validateEventTime("24:00")).toEqual({ ok: false, error: err("fieldInvalid", { field: "timeLabel" }) });
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
      error: err("endDateBeforeStart"),
    });
  });

  it("rejects an end date without a start date", () => {
    expect(schedule({ eventDate: null, eventEndDate: "2026-09-05" })).toEqual({
      ok: false,
      error: err("startDateFirst"),
    });
  });

  it("rejects an end time without a start time", () => {
    expect(schedule({ eventStartTime: null })).toEqual({ ok: false, error: err("startTimeFirst") });
  });

  it("requires the end time to be later on a single day", () => {
    expect(schedule({ eventEndTime: "17:00" })).toEqual({
      ok: false,
      error: err("endTimeBeforeStart"),
    });
    expect(schedule({ eventEndTime: "02:00" })).toEqual({
      ok: false,
      error: err("endTimeBeforeStart"),
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
    expect(validateTheme("neon")).toEqual({ ok: false, error: err("invalidTheme") });
    expect(validateTheme(undefined)).toEqual({ ok: false, error: err("invalidTheme") });
  });
});

describe("validateNewEventTitle", () => {
  it("requires a name of at most 200 characters", () => {
    expect(validateNewEventTitle("  Sommerfest  ")).toEqual({ ok: true, value: "Sommerfest" });
    expect(validateNewEventTitle(" ")).toEqual({ ok: false, error: err("eventNameRequired") });
    expect(validateNewEventTitle(undefined)).toEqual({
      ok: false,
      error: err("eventNameRequired"),
    });
    expect(validateNewEventTitle("x".repeat(201))).toEqual({
      ok: false,
      error: err("nameTooLong", { max: 200 }),
    });
  });
});

describe("validateRequestBody", () => {
  it("accepts JSON objects only", () => {
    expect(validateRequestBody({ title: "x" })).toEqual({ ok: true, value: { title: "x" } });
    expect(validateRequestBody([])).toEqual({ ok: false, error: err("invalidRequest") });
    expect(validateRequestBody(null)).toEqual({ ok: false, error: err("invalidRequest") });
    expect(validateRequestBody("x")).toEqual({ ok: false, error: err("invalidRequest") });
  });
});

describe("formatTimeWindow", () => {
  it("shows \"zw. HH:MM und HH:MM\" with an end time, otherwise only the start", () => {
    expect(formatTimeWindow("09:30", "10:30", "de")).toBe("zw. 09:30 und 10:30");
    expect(formatTimeWindow("22:00", "01:00", "de")).toBe("zw. 22:00 und 01:00");
    expect(formatTimeWindow("09:30", null, "de")).toBe("09:30");
    expect(formatTimeWindow("09:30", "10:30", "en")).toBe("between 09:30 and 10:30");
  });
});

describe("event password", () => {
  it("accepts 4 to 100 characters after trimming, null switches it off", () => {
    expect(validateAccessPassword(" abcd ")).toEqual({ ok: true, value: "abcd" });
    expect(validateAccessPassword(null)).toEqual({ ok: true, value: null });
    expect(validateAccessPassword("abc")).toEqual({
      ok: false,
      error: err("eventPasswordTooShort", { min: 4 }),
    });
    expect(validateAccessPassword("  ab  ")).toEqual({
      ok: false,
      error: err("eventPasswordTooShort", { min: 4 }),
    });
    expect(validateAccessPassword("x".repeat(101))).toEqual({
      ok: false,
      error: err("eventPasswordTooLong", { max: 100 }),
    });
    expect(validateAccessPassword(1234).ok).toBe(false);
  });

  it("checks that both dialog fields match", () => {
    expect(validateEventPasswordPair("Sommer", " Sommer ")).toEqual({ ok: true, value: "Sommer" });
    expect(validateEventPasswordPair("Sommer", "Winter")).toEqual({
      ok: false,
      error: err("passwordsDontMatch"),
    });
    expect(validateEventPasswordPair("abc", "abc")).toEqual({
      ok: false,
      error: err("eventPasswordTooShort", { min: 4 }),
    });
  });
});

describe("validatePasswordRequest", () => {
  const byEmail = { name: " Max ", contactKind: "email", email: " max@example.de ", message: "" };
  const byPhone = { name: "Max", contactKind: "phone", phone: "+49 (152) 123-456", channel: "whatsapp" };

  function requestError(body: Record<string, unknown>) {
    const result = validatePasswordRequest(body);
    return result.ok ? null : result.error;
  }

  it("accepts an e-mail request", () => {
    expect(validatePasswordRequest(byEmail)).toEqual({
      ok: true,
      value: { name: "Max", contact: { kind: "email", email: "max@example.de" }, message: null },
    });
  });

  it("accepts a phone request with channel and optional message", () => {
    expect(validatePasswordRequest({ ...byPhone, message: " Hallo! " })).toEqual({
      ok: true,
      value: {
        name: "Max",
        contact: { kind: "phone", phone: "+49 (152) 123-456", channel: "whatsapp", channelOther: null },
        message: "Hallo!",
      },
    });
  });

  it("requires a free text for the channel \"Sonstiges\"", () => {
    expect(requestError({ ...byPhone, channel: "other", channelOther: " " })).toEqual(
      err("passwordWayRequired"),
    );
    const result = validatePasswordRequest({ ...byPhone, channel: "other", channelOther: " Signal " });
    expect(result.ok && result.value.contact).toEqual({
      kind: "phone",
      phone: "+49 (152) 123-456",
      channel: "other",
      channelOther: "Signal",
    });
  });

  it("requires a contact choice and its fields", () => {
    expect(requestError({ name: "Max" })).toEqual(err("contactKindRequired"));
    expect(requestError({ ...byEmail, email: "" })).toEqual(err("emailRequired"));
    expect(requestError({ ...byPhone, channel: undefined })).toEqual(
      err("phoneChannelRequired"),
    );
  });

  it("checks the phone number loosely", () => {
    expect(requestError({ ...byPhone, phone: "12345" })).toEqual(err("phoneInvalid"));
    expect(requestError({ ...byPhone, phone: "0152 abc" })).toEqual(err("phoneInvalid"));
    expect(requestError({ ...byPhone, phone: "1".repeat(21) })).toEqual(err("phoneInvalid"));
    expect(requestError({ ...byPhone, phone: "0152/123456" })).toBeNull();
  });

  it("checks name and message length", () => {
    expect(requestError({ ...byEmail, name: "M" })).toEqual(err("nameTooShort", { min: 2 }));
    expect(requestError({ ...byEmail, message: "x".repeat(501) })).toEqual(
      err("messageTooLong", { max: 500 }),
    );
  });
});

describe("validateProposals", () => {
  const today = "2026-07-01";
  const options = { today, min: 2, max: 4 };
  const p = (date: string, startTime: string | null, endTime: string | null = null) => ({ date, startTime, endTime });

  it("accepts 2 to 4 proposals and treats an empty end as none", () => {
    expect(validateProposals([p("2026-07-11", "15:00", ""), p("2026-07-12", "20:00", "01:00")], options)).toEqual({
      ok: true,
      value: [p("2026-07-11", "15:00"), p("2026-07-12", "20:00", "01:00")],
    });
  });

  it("checks count, fields, past dates and duplicates", () => {
    expect(validateProposals([p("2026-07-11", "15:00")], options)).toEqual({
      ok: false,
      error: err("proposalsTooFew", { min: 2 }),
    });
    expect(validateProposals(Array.from({ length: 5 }, (_, i) => p(`2026-07-1${i}`, "15:00")), options)).toEqual({
      ok: false,
      error: err("proposalsTooMany", { max: 4 }),
    });
    expect(validateProposals([p("", "15:00"), p("2026-07-12", "15:00")], options)).toEqual({
      ok: false,
      error: err("proposalDateInvalid"),
    });
    expect(validateProposals([p("2026-07-11", "", "18:00"), p("2026-07-12", "15:00")], options)).toEqual({
      ok: false,
      error: err("proposalEndWithoutStart"),
    });
    expect(validateProposals([p("2026-06-30", "15:00"), p("2026-07-12", "15:00")], options)).toEqual({
      ok: false,
      error: err("proposalInPast"),
    });
    expect(validateProposals([p("2026-07-11", "15:00", "15:00"), p("2026-07-12", "15:00")], options)).toEqual({
      ok: false,
      error: err("proposalSameTimes"),
    });
    expect(validateProposals([p("2026-07-11", "15:00"), p("2026-07-11", "15:00", "18:00")], options)).toEqual({
      ok: false,
      error: err("proposalDuplicate"),
    });
  });

  it("makes the time optional", () => {
    expect(validateProposals([p("2026-07-11", ""), p("2026-07-12", "")], options)).toEqual({
      ok: true,
      value: [p("2026-07-11", null), p("2026-07-12", null)],
    });
    expect(validateProposals([p("2026-07-11", ""), p("2026-07-11", "")], options)).toEqual({
      ok: false,
      error: err("proposalDuplicate"),
    });
    expect(validateProposals([p("2026-07-11", ""), p("2026-07-11", "15:00")], options).ok).toBe(true);
  });

  it("checks added proposals against the existing ones", () => {
    const existing = [p("2026-07-11", "15:00")];
    expect(validateProposals([p("2026-07-11", "15:00")], { today, min: 1, max: 3, existing })).toEqual({
      ok: false,
      error: err("proposalDuplicate"),
    });
    expect(validateProposals([], { today, min: 1, max: 3, existing })).toEqual({
      ok: false,
      error: err("proposalsTooFew", { min: 1 }),
    });
  });
});

describe("validateFixedDate", () => {
  const today = "2026-07-01";

  it("returns the proposal and the event schedule", () => {
    expect(validateFixedDate({ date: "2026-07-11", startTime: "20:00", endTime: "01:00" }, { today })).toEqual({
      ok: true,
      value: {
        proposal: { date: "2026-07-11", startTime: "20:00", endTime: "01:00" },
        endDate: null,
        schedule: { eventDate: "2026-07-11", eventEndDate: "2026-07-12", eventStartTime: "20:00", eventEndTime: "01:00" },
      },
    });
  });

  it("supports events over several days", () => {
    expect(validateFixedDate({ date: "2026-07-11", endDate: "2026-07-13", startTime: "18:00", endTime: "12:00" }, { today })).toEqual({
      ok: true,
      value: {
        proposal: { date: "2026-07-11", startTime: "18:00", endTime: "12:00" },
        endDate: "2026-07-13",
        schedule: { eventDate: "2026-07-11", eventEndDate: "2026-07-13", eventStartTime: "18:00", eventEndTime: "12:00" },
      },
    });
    const sameDay = validateFixedDate({ date: "2026-07-11", endDate: "2026-07-11", startTime: "18:00", endTime: "20:00" }, { today });
    expect(sameDay.ok && sameDay.value.endDate).toBeNull();
    expect(validateFixedDate({ date: "2026-07-11", endDate: "2026-07-10", startTime: "18:00" }, { today })).toEqual({
      ok: false,
      error: err("endDateBeforeStart"),
    });
  });

  it("requires a date, the time is optional", () => {
    expect(validateFixedDate({ date: "", startTime: "20:00" }, { today })).toEqual({ ok: false, error: err("dateRequired") });
    expect(validateFixedDate({ date: "2026-07-11", startTime: "" }, { today })).toEqual({
      ok: true,
      value: {
        proposal: { date: "2026-07-11", startTime: null, endTime: null },
        endDate: null,
        schedule: { eventDate: "2026-07-11", eventEndDate: null, eventStartTime: null, eventEndTime: null },
      },
    });
    expect(validateFixedDate({ date: "2026-07-11", startTime: "", endTime: "20:00" }, { today })).toEqual({
      ok: false,
      error: err("proposalEndWithoutStart"),
    });
    expect(validateFixedDate({ date: "2026-07-11", startTime: "20:00", endTime: "20:00" }, { today })).toEqual({
      ok: false,
      error: err("endTimeBeforeStart"),
    });
  });

  it("rejects a start or end date in the past", () => {
    expect(validateFixedDate({ date: "2026-06-30" }, { today })).toEqual({
      ok: false,
      error: err("dateInPast"),
    });
    expect(validateFixedDate({ date: "2026-07-01" }, { today })).toMatchObject({ ok: true });
    expect(validateFixedDate({ date: "2026-06-30", endDate: "2026-07-02" }, { today })).toEqual({
      ok: false,
      error: err("dateInPast"),
    });
    expect(validateFixedDate({ date: "2026-07-05", endDate: "2026-06-20" }, { today })).toEqual({
      ok: false,
      error: err("dateInPast"),
    });
  });

  it("checks the start and the end date against the latest allowed date", () => {
    const options = { today, latest: "2026-10-01", latestError: err("dateWindow", { months: 3 }) };
    expect(validateFixedDate({ date: "2026-10-01" }, options)).toMatchObject({ ok: true });
    expect(validateFixedDate({ date: "2026-10-02" }, options)).toEqual({ ok: false, error: err("dateWindow", { months: 3 }) });
    expect(validateFixedDate({ date: "2026-09-30", endDate: "2026-10-02" }, options)).toEqual({
      ok: false,
      error: err("dateWindow", { months: 3 }),
    });
    expect(validateFixedDate({ date: "2026-09-30", endDate: "2026-10-01" }, options)).toMatchObject({ ok: true });
  });
});

describe("validatePollVote", () => {
  const allowed = ["a", "b"];

  it("accepts ticked proposals or none fit", () => {
    expect(validatePollVote({ name: " Anna ", optionIds: ["a", "a", "b"] }, allowed)).toEqual({
      ok: true,
      value: { name: "Anna", optionIds: ["a", "b"], noneFit: false },
    });
    expect(validatePollVote({ name: "Anna", optionIds: [], noneFit: true }, allowed)).toEqual({
      ok: true,
      value: { name: "Anna", optionIds: [], noneFit: true },
    });
  });

  it("requires exactly one of both and known proposals", () => {
    expect(validatePollVote({ name: "Anna", optionIds: [] }, allowed)).toEqual({
      ok: false,
      error: err("voteEmpty"),
    });
    expect(validatePollVote({ name: "Anna", optionIds: ["a"], noneFit: true }, allowed)).toEqual({
      ok: false,
      error: err("voteNoneWithDate"),
    });
    expect(validatePollVote({ name: "Anna", optionIds: ["x"] }, allowed)).toEqual({
      ok: false,
      error: err("voteSelectionInvalid"),
    });
    expect(validatePollVote({ name: "A", optionIds: ["a"] }, allowed)).toEqual({
      ok: false,
      error: err("nameTooShort", { min: 2 }),
    });
  });
});

describe("validateMaxGuests", () => {
  it("accepts 1 to 300 people, null removes the limit", () => {
    expect(validateMaxGuests(12)).toEqual({ ok: true, value: 12 });
    expect(validateMaxGuests("12")).toEqual({ ok: true, value: 12 });
    expect(validateMaxGuests(null)).toEqual({ ok: true, value: null });
  });

  it("rejects everything else", () => {
    const error = err("maxGuestsInvalid", { max: 300 });
    for (const value of [0, 301, 2.5, "", "zwölf", -3]) {
      expect(validateMaxGuests(value)).toEqual({ ok: false, error });
    }
  });
});

describe("validateFeedback", () => {
  const text = "Super einfach, alle haben zugesagt!";
  const valid = { rating: 5, text: `  ${text}  `, showName: true, name: "Anna", consent: true };

  it("accepts a valid review and trims the text", () => {
    expect(validateFeedback(valid)).toEqual({ ok: true, value: { rating: 5, text, displayName: "Anna" } });
  });

  it.each([0, 6, 2.5, "5", undefined])("rejects rating %s", (rating) => {
    expect(validateFeedback({ ...valid, rating })).toEqual({ ok: false, error: err("ratingRequired") });
  });

  it("needs at least 20 characters after trimming", () => {
    expect(validateFeedback({ ...valid, text: `  ${"a".repeat(19)}  ` })).toEqual({
      ok: false,
      error: err("reviewTextTooShort", { min: 20 }),
    });
  });

  it("allows 200 but not 201 characters", () => {
    expect(validateFeedback({ ...valid, text: "a".repeat(200) }).ok).toBe(true);
    expect(validateFeedback({ ...valid, text: "a".repeat(201) })).toEqual({
      ok: false,
      error: err("reviewTextTooLong", { max: 200 }),
    });
  });

  it("stores no name without the name tick", () => {
    expect(validateFeedback({ ...valid, showName: false, name: "X" })).toEqual({
      ok: true,
      value: { rating: 5, text, displayName: null },
    });
  });

  it("checks the name like an account name", () => {
    const account = validatePersonName("A");
    expect(account.ok).toBe(false);
    expect(validateFeedback({ ...valid, name: "A" })).toEqual(account);
    expect(validateFeedback({ ...valid, name: "a".repeat(101) })).toEqual(validatePersonName("a".repeat(101)));
  });

  it("needs the publication consent", () => {
    expect(validateFeedback({ ...valid, consent: false })).toEqual({ ok: false, error: err("publishConsentRequired") });
  });
});
