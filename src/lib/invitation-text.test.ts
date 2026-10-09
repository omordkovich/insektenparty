import { describe, expect, it } from "vitest";
import {
  buildInvitationText,
  DATE_FIXED_WORDING,
  DEFAULT_WORDING,
  fixedDateFacts,
  type InvitationFacts,
  parseStoredWording,
  WORDING_MAX_LENGTH,
  wordingStorageKey,
} from "@/lib/invitation-text";

const facts: InvitationFacts = {
  title: "Sommerfest bei Familie Müller",
  dateLabel: "Samstag, 12. Juli 2026",
  timeLabel: "15:00 - 20:00 Uhr",
  location: "Gartenstraße 5, Köln",
  contactName: "Anna Müller",
  url: "https://gastzilla.de/event/abc123",
  password: null,
  dateMode: "fixed",
};

describe("buildInvitationText", () => {
  it("composes the default wording around the event facts", () => {
    expect(buildInvitationText(facts, DEFAULT_WORDING)).toBe(
      [
        "Hallo zusammen,",
        "ich lade euch herzlich ein:",
        "Sommerfest bei Familie Müller",
        "Wann: Samstag, 12. Juli 2026, 15:00 - 20:00 Uhr",
        "Wo: Gartenstraße 5, Köln",
        "Bitte sagt über diesen Link zu und tragt euch ein:",
        "https://gastzilla.de/event/abc123",
        "Ich freue mich auf euch!",
        "Anna Müller",
      ].join("\n"),
    );
  });

  it("leaves out event facts that are not filled in", () => {
    const text = buildInvitationText(
      { ...facts, title: " ", timeLabel: "", location: "", contactName: "" },
      DEFAULT_WORDING,
    );
    expect(text).toBe(
      [
        "Hallo zusammen,",
        "ich lade euch herzlich ein:",
        "Wann: Samstag, 12. Juli 2026",
        "Bitte sagt über diesen Link zu und tragt euch ein:",
        "https://gastzilla.de/event/abc123",
        "Ich freue mich auf euch!",
      ].join("\n"),
    );
  });

  it("shows only the time when there is no date", () => {
    const text = buildInvitationText({ ...facts, dateLabel: "" }, DEFAULT_WORDING);
    expect(text).toContain("Wann: 15:00 - 20:00 Uhr");
  });

  it("uses the owner's wording and drops emptied lines", () => {
    const text = buildInvitationText(facts, {
      greeting: "  Liebe Nachbarn,  ",
      intro: "",
      callToAction: "Hier eintragen:",
      closing: "Bis bald!\nEure Annas",
    });
    expect(text.split("\n")).toEqual([
      "Liebe Nachbarn,",
      "Sommerfest bei Familie Müller",
      "Wann: Samstag, 12. Juli 2026, 15:00 - 20:00 Uhr",
      "Wo: Gartenstraße 5, Köln",
      "Hier eintragen:",
      "https://gastzilla.de/event/abc123",
      "Bis bald!",
      "Eure Annas",
      "Anna Müller",
    ]);
  });

  it("always contains the invitation link", () => {
    const empty = { greeting: "", intro: "", callToAction: "", closing: "" };
    expect(buildInvitationText(facts, empty)).toContain(facts.url);
  });
});

describe("parseStoredWording", () => {
  it("falls back to the defaults for missing or broken data", () => {
    expect(parseStoredWording(null)).toEqual(DEFAULT_WORDING);
    expect(parseStoredWording("not json")).toEqual(DEFAULT_WORDING);
    expect(parseStoredWording("[1,2]")).toEqual(DEFAULT_WORDING);
  });

  it("keeps stored strings and fills the rest from the defaults", () => {
    expect(parseStoredWording(JSON.stringify({ greeting: "Moin,", intro: 42 }))).toEqual({
      ...DEFAULT_WORDING,
      greeting: "Moin,",
    });
  });
});

describe("invitation text for a password-protected event", () => {
  it("adds the password right after the link", () => {
    const lines = buildInvitationText({ ...facts, password: "Sommer" }, DEFAULT_WORDING).split("\n");
    const linkIndex = lines.indexOf("https://gastzilla.de/event/abc123");
    expect(lines[linkIndex + 1]).toBe("Passwort für die Event-Seite: Sommer");
  });

  it("has no password line for an open event", () => {
    expect(buildInvitationText(facts, DEFAULT_WORDING)).not.toContain("Passwort");
  });
});

describe("invitation text while the date is open", () => {
  it("says the date follows", () => {
    expect(buildInvitationText({ ...facts, dateMode: "unknown" }, DEFAULT_WORDING)).toContain("Wann: Termin folgt");
  });

  it("asks to vote during a poll", () => {
    const text = buildInvitationText({ ...facts, dateMode: "poll" }, DEFAULT_WORDING);
    expect(text).toContain("Wann: wird abgestimmt – bitte stimmt über den Link ab");
    expect(text).not.toContain("Samstag");
  });
});

describe("message after fixing the date", () => {
  const base = {
    title: "Sommerfest",
    location: "Garten",
    contactName: "Anna",
    url: "https://gastzilla.de/event/abc123",
    password: null,
  };

  it("takes date and time from the chosen proposal", () => {
    expect(fixedDateFacts(base, { date: "2026-07-11", startTime: "15:00", endTime: "18:00" })).toEqual({
      ...base,
      dateMode: "fixed",
      dateLabel: "Samstag, 11. Juli 2026",
      timeLabel: "15:00 - 18:00 Uhr",
    });
    expect(fixedDateFacts(base, { date: "2026-07-11", startTime: null, endTime: null }).timeLabel).toBe("");
  });

  it("tells the guests about the date and asks them to complete their entries", () => {
    const text = buildInvitationText(
      fixedDateFacts(base, { date: "2026-07-11", startTime: "15:00", endTime: null }),
      DATE_FIXED_WORDING,
    );
    expect(text).toBe(
      [
        "Hallo zusammen,",
        "nach der Abstimmung haben wir uns gemeinsam für diesen Termin entschieden:",
        "Sommerfest",
        "Wann: Samstag, 11. Juli 2026, ab 15:00 Uhr",
        "Wo: Garten",
        "Bitte vervollständigt eure Angaben in der Gästeliste – z. B. Ankunftszeit, Begleitung oder Mitbringsel:",
        "https://gastzilla.de/event/abc123",
        "Ich freue mich auf euch!",
        "Anna",
      ].join("\n"),
    );
  });

  it("stores its wording separately and falls back to its own defaults", () => {
    expect(wordingStorageKey("e1", "dateFixed")).not.toBe(wordingStorageKey("e1"));
    expect(parseStoredWording(null, DATE_FIXED_WORDING)).toEqual(DATE_FIXED_WORDING);
    expect(parseStoredWording(JSON.stringify({ greeting: "Moin," }), DATE_FIXED_WORDING)).toEqual({
      ...DATE_FIXED_WORDING,
      greeting: "Moin,",
    });
  });
});

describe("wording length", () => {
  it("cuts stored texts to the allowed length", () => {
    const long = "x".repeat(1000);
    const wording = parseStoredWording(JSON.stringify({ greeting: long, intro: long, callToAction: long, closing: long }));
    expect(wording.greeting).toHaveLength(WORDING_MAX_LENGTH.greeting);
    expect(wording.intro).toHaveLength(WORDING_MAX_LENGTH.intro);
    expect(wording.callToAction).toHaveLength(WORDING_MAX_LENGTH.callToAction);
    expect(wording.closing).toHaveLength(WORDING_MAX_LENGTH.closing);
  });

  it("leaves room for every default text", () => {
    for (const defaults of [DEFAULT_WORDING, DATE_FIXED_WORDING]) {
      for (const key of Object.keys(WORDING_MAX_LENGTH) as (keyof typeof WORDING_MAX_LENGTH)[]) {
        expect(defaults[key].length).toBeLessThanOrEqual(WORDING_MAX_LENGTH[key]);
      }
    }
  });
});
