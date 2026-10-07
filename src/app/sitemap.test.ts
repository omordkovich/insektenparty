import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";
import { latestOccasionUpdate, OCCASIONS } from "@/lib/occasions";

describe("sitemap", () => {
  const entries = sitemap();
  const byUrl = new Map(entries.map((entry) => [entry.url, entry]));

  it("lists the occasion overview with the newest occasion date", () => {
    expect(byUrl.get("https://gastzilla.de/einladung")?.lastModified).toBe(latestOccasionUpdate());
  });

  it("lists every occasion page with its own date", () => {
    for (const occasion of OCCASIONS) {
      const entry = byUrl.get(`https://gastzilla.de/einladung/${occasion.slug}`);
      expect(entry?.lastModified).toBe(occasion.updated);
    }
  });

  it("never lists event pages", () => {
    expect(entries.some((entry) => entry.url.includes("/event/"))).toBe(false);
  });
});
