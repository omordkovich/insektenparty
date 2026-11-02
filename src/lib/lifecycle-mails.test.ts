import { describe, expect, it } from "vitest";
import { buildLifecycleMessage, dueMail, type LifecycleMailRow } from "@/lib/lifecycle-mails";

const base: LifecycleMailRow = {
  dateMode: "fixed",
  eventDate: "2026-06-01",
  eventEndDate: null,
  createdOn: "2026-01-01",
  latestPollDate: null,
  pollStartedOn: null,
  deletionNoticeSentAt: null,
  dateReminderSentAt: null,
};
const sent = new Date("2026-01-02T05:00:00Z");

describe("dueMail - deletion_notice", () => {
  // Stichtag 2026-06-01, deletion 2026-08-30, notice from 2026-08-23.
  it("is not due the day before the notice window", () => {
    expect(dueMail(base, "2026-08-22")).toBeNull();
  });
  it("is due on the first day of the window", () => {
    expect(dueMail(base, "2026-08-23")).toBe("deletion_notice");
  });
  it("stays due afterwards (a missed run is caught up)", () => {
    expect(dueMail(base, "2026-08-29")).toBe("deletion_notice");
  });
  it("is not due when already sent", () => {
    expect(dueMail({ ...base, deletionNoticeSentAt: sent }, "2026-08-25")).toBeNull();
  });
  it("is not confused by a sent date reminder", () => {
    expect(dueMail({ ...base, dateReminderSentAt: sent }, "2026-08-25")).toBe("deletion_notice");
  });
});

describe("dueMail - date_reminder", () => {
  // unknown: Stichtag = created + 6 months = 2026-07-01, reminder from 2026-06-01.
  const unknown: LifecycleMailRow = { ...base, dateMode: "unknown", eventDate: null };

  it("is not due the day before the 30-day window", () => {
    expect(dueMail(unknown, "2026-05-31")).toBeNull();
  });
  it("is due 30 days before the Stichtag", () => {
    expect(dueMail(unknown, "2026-06-01")).toBe("date_reminder");
  });
  it("is due on the Stichtag itself (still active)", () => {
    expect(dueMail(unknown, "2026-07-01")).toBe("date_reminder");
  });
  it("is not due once the event is over", () => {
    expect(dueMail(unknown, "2026-07-02")).toBeNull();
  });
  it("is not due when already sent", () => {
    expect(dueMail({ ...unknown, dateReminderSentAt: sent }, "2026-06-10")).toBeNull();
  });
  it("applies to fixed mode without any date", () => {
    expect(dueMail({ ...base, eventDate: null, eventEndDate: null }, "2026-06-01")).toBe("date_reminder");
  });
  it("does not apply to fixed mode with a date", () => {
    expect(dueMail({ ...base, eventDate: "2026-12-01" }, "2026-11-15")).toBeNull();
  });
  it("does not apply to fixed mode with only an end date", () => {
    expect(dueMail({ ...base, eventDate: null, eventEndDate: "2026-12-01" }, "2026-11-15")).toBeNull();
  });
});

describe("dueMail - poll_reminder", () => {
  // Poll with latest proposal 2026-03-10, reminder from 2026-03-07.
  const poll: LifecycleMailRow = {
    ...base,
    dateMode: "poll",
    eventDate: null,
    latestPollDate: "2026-03-10",
    createdOn: "2026-02-01",
    pollStartedOn: "2026-02-01",
  };

  it("is not due the day before the 3-day window", () => {
    expect(dueMail(poll, "2026-03-06")).toBeNull();
  });
  it("is due 3 days before the latest proposal", () => {
    expect(dueMail(poll, "2026-03-07")).toBe("poll_reminder");
  });
  it("is due on the latest proposal's day (still active)", () => {
    expect(dueMail(poll, "2026-03-10")).toBe("poll_reminder");
  });
  it("is not due once the event is over", () => {
    expect(dueMail(poll, "2026-03-11")).toBeNull();
  });
  it("is not due when already sent (shared flag with the date reminder)", () => {
    expect(dueMail({ ...poll, dateReminderSentAt: sent }, "2026-03-08")).toBeNull();
  });
  it("is not due when the poll is only 2 days old", () => {
    expect(dueMail({ ...poll, pollStartedOn: "2026-03-06" }, "2026-03-08")).toBeNull();
  });
  it("is due when the poll is exactly 3 days old", () => {
    expect(dueMail({ ...poll, pollStartedOn: "2026-03-05" }, "2026-03-08")).toBe("poll_reminder");
  });
  it("is not due for an old event whose poll started today", () => {
    expect(dueMail({ ...poll, createdOn: "2025-06-01", pollStartedOn: "2026-03-08" }, "2026-03-08")).toBeNull();
  });
  it("is not due without a known poll start", () => {
    expect(dueMail({ ...poll, pollStartedOn: null }, "2026-03-08")).toBeNull();
  });
  it("is not due for a poll without proposals", () => {
    expect(dueMail({ ...poll, latestPollDate: null }, "2026-07-31")).toBeNull();
  });
});

describe("dueMail - precedence", () => {
  it("prefers the deletion notice over a reminder", () => {
    const row: LifecycleMailRow = { ...base, dateMode: "unknown", eventDate: null, createdOn: "2026-01-01" };
    // Stichtag 2026-07-01, deletion 2026-09-29, notice from 2026-09-22.
    expect(dueMail(row, "2026-09-22")).toBe("deletion_notice");
  });
});

describe("buildLifecycleMessage", () => {
  const event = { title: "Mias Party", slug: "mias-party-ab12" };

  it("builds the deletion notice", () => {
    const { subject, text } = buildLifecycleMessage("deletion_notice", event, "2026-08-30");
    expect(subject).toBe("Dein Event „Mias Party“ wird am 30.08.2026 gelöscht");
    expect(text).toContain("30.08.2026");
    expect(text).toContain("Mias Party");
    expect(text).toContain("https://gastzilla.de/");
    expect(text).toContain("Nächste Party? Weiteres Event freischalten");
  });

  it("builds the date reminder", () => {
    const { subject, text } = buildLifecycleMessage("date_reminder", event, "2026-07-01");
    expect(subject).toBe("Setz einen Termin für „Mias Party“");
    expect(text).toContain("Ohne Termin läuft dein Event am 01.07.2026 ab.");
    expect(text).toContain("https://gastzilla.de/event/mias-party-ab12");
  });

  it("builds the poll reminder", () => {
    const { subject, text } = buildLifecycleMessage("poll_reminder", event, "2026-03-10");
    expect(subject).toBe("Leg den Termin für „Mias Party“ fest");
    expect(text).toContain("Deine Abstimmung endet am 10.03.2026. Danach kannst du keinen Termin mehr festlegen.");
    expect(text).toContain("https://gastzilla.de/event/mias-party-ab12");
  });
});
