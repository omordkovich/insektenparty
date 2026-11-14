import { describe, expect, it } from "vitest";
import {
  buildCalendarLink,
  buildGoogleCalendarLink,
  formatCreatedDate,
  formatDateLabel,
  formatTimeLabel,
  formatDateRangeLabel,
  formatDottedDate,
} from "@/lib/calendar";

describe("formatDateRangeLabel", () => {
  it("shows a single day with the full weekday, as before", () => {
    expect(formatDateRangeLabel("2026-09-04", null, "de")).toBe("Freitag, 4. September 2026");
  });

  it("is empty without a start date", () => {
    expect(formatDateRangeLabel(null, null, "de")).toBe("");
  });

  it("shows a range within one month compactly", () => {
    expect(formatDateRangeLabel("2026-09-04", "2026-09-06", "de")).toBe("Fr. 4. – So. 6. September 2026");
  });

  it("names both months across a month boundary", () => {
    expect(formatDateRangeLabel("2026-10-30", "2026-11-01", "de")).toBe("Fr. 30. Oktober – So. 1. November 2026");
  });

  it("names both years across a year boundary", () => {
    expect(formatDateRangeLabel("2026-12-31", "2027-01-01", "de")).toBe(
      "Do. 31. Dezember 2026 – Fr. 1. Januar 2027",
    );
  });
});

describe("calendar links with an end date", () => {
  const params = {
    title: "Party",
    description: "",
    location: "",
    date: "2026-09-04",
    endDate: "2026-09-05",
    startTime: "20:00",
    endTime: "02:00",
  };

  it("ends the .ics event on the end date", () => {
    const ics = decodeURIComponent(buildCalendarLink(params));
    expect(ics).toContain("DTSTART:20260904T200000");
    expect(ics).toContain("DTEND:20260905T020000");
  });

  it("ends the Google Calendar event on the end date", () => {
    expect(buildGoogleCalendarLink(params)).toContain(
      `dates=${encodeURIComponent("20260904T200000/20260905T020000")}`,
    );
  });

  it("uses the start date when there is no end date", () => {
    const ics = decodeURIComponent(buildCalendarLink({ ...params, endDate: null, startTime: "17:00", endTime: "20:00" }));
    expect(ics).toContain("DTEND:20260904T200000");
  });
});

describe("formatCreatedDate", () => {
  it("formats a timestamp as a German date without weekday", () => {
    expect(formatCreatedDate(new Date("2026-09-04T10:00:00Z"), "de")).toBe("4. September 2026");
  });

  it("uses German local time, not UTC", () => {
    // 23:30 UTC on 3 Sept is already 01:30 on 4 Sept in Berlin (CEST).
    expect(formatCreatedDate(new Date("2026-09-03T23:30:00Z"), "de")).toBe("4. September 2026");
  });
});

describe("formatDottedDate", () => {
  it("writes an ISO date as TT.MM.JJJJ", () => {
    expect(formatDottedDate("2026-12-05", "de")).toBe("05.12.2026");
    expect(formatDottedDate("2027-01-31", "de")).toBe("31.01.2027");
  });
});

describe("formatters in English", () => {
  it("formats a single day and a range", () => {
    expect(formatDateLabel("2026-12-24", "en")).toBe("Thursday, 24 December 2026");
    expect(formatDateRangeLabel("2026-09-04", "2026-09-06", "en")).toBe("Fri 4 – Sun 6 September 2026");
    expect(formatDateRangeLabel("2026-10-30", "2026-11-01", "en")).toBe("Fri 30 October – Sun 1 November 2026");
  });

  it("formats times without Uhr", () => {
    expect(formatTimeLabel("18:00", "22:00", "en")).toBe("18:00 – 22:00");
    expect(formatTimeLabel("18:00", null, "en")).toBe("from 18:00");
    expect(formatTimeLabel("18:00", "22:00", "de")).toBe("18:00 - 22:00 Uhr");
    expect(formatTimeLabel("18:00", null, "de")).toBe("ab 18:00 Uhr");
  });

  it("formats short and created dates", () => {
    expect(formatDottedDate("2026-12-05", "en")).toBe("05/12/2026");
    expect(formatCreatedDate(new Date("2026-09-04T10:00:00Z"), "en")).toBe("4 September 2026");
  });
});
