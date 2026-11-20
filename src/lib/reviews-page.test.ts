import { describe, expect, it } from "vitest";
import { LOCALES } from "@/i18n/config";
import { MESSAGES } from "@/i18n/messages";
import { REVIEWS_PAGE_LIMIT, REVIEWS_PAGE_PATH, reviewsSitemapEntries } from "@/lib/reviews-page";

describe("reviews page", () => {
  it("lives at /bewertungen in every language", () => {
    expect(REVIEWS_PAGE_PATH).toBe("/bewertungen");
  });

  it("lists up to 200 reviews", () => {
    expect(REVIEWS_PAGE_LIMIT).toBe(200);
  });

  it.each(LOCALES)("has search snippet texts within the limits in %s", (locale) => {
    const page = MESSAGES[locale].reviewsPage;
    expect(page.metaTitle.endsWith("– GASTZILLA")).toBe(true);
    expect(page.metaTitle.length).toBeLessThanOrEqual(60);
    expect(page.description.length).toBeLessThanOrEqual(160);
    expect(page.title.trim()).not.toBe("");
  });
});

describe("reviewsSitemapEntries", () => {
  it("lists the page in every language once a review is approved, dated by the newest", () => {
    expect(reviewsSitemapEntries(new Date("2026-11-21T08:00:00Z"))).toEqual([
      { locale: "de", lastModified: "2026-11-21" },
      { locale: "en", lastModified: "2026-11-21" },
      { locale: "ru", lastModified: "2026-11-21" },
    ]);
  });

  it("is empty while there is no approved review", () => {
    expect(reviewsSitemapEntries(null)).toEqual([]);
  });
});
