import { describe, expect, it } from "vitest";
import { formatCreatedDate } from "@/lib/calendar";

describe("formatCreatedDate", () => {
  it("formats a timestamp as a German date without weekday", () => {
    expect(formatCreatedDate(new Date("2026-09-04T10:00:00Z"))).toBe("4. September 2026");
  });

  it("uses German local time, not UTC", () => {
    // 23:30 UTC on 3 Sept is already 01:30 on 4 Sept in Berlin (CEST).
    expect(formatCreatedDate(new Date("2026-09-03T23:30:00Z"))).toBe("4. September 2026");
  });
});
