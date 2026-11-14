import { describe, expect, it } from "vitest";
import { LOCALES } from "@/i18n/config";
import {
  OCCASION_SECTION,
  OCCASION_SLUGS,
  occasionSectionPath,
  sectionLanguage,
  translateOccasionPath,
} from "./occasion-slugs";

const URL_SAFE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

describe("OCCASION_SLUGS", () => {
  it("gives every occasion a URL-safe slug in every language", () => {
    for (const [id, slugs] of Object.entries(OCCASION_SLUGS)) {
      for (const locale of LOCALES) expect(slugs[locale], `${id}/${locale}`).toMatch(URL_SAFE);
    }
  });

  it("never uses a slug twice within a language", () => {
    for (const locale of LOCALES) {
      const slugs = Object.values(OCCASION_SLUGS).map((s) => s[locale]);
      expect(new Set(slugs).size).toBe(slugs.length);
    }
  });
});

describe("occasionSectionPath", () => {
  it("is /einladung in German, /invitations in English and /priglasheniya in Russian", () => {
    expect(OCCASION_SECTION).toEqual({ de: "/einladung", en: "/invitations", ru: "/priglasheniya" });
    expect(occasionSectionPath("en")).toBe("/invitations");
  });
});

describe("translateOccasionPath", () => {
  it("maps the overview to the other language's overview", () => {
    expect(translateOccasionPath("/einladung", "en")).toBe("/invitations");
    expect(translateOccasionPath("/invitations", "de")).toBe("/einladung");
  });

  it("maps an occasion page to the same occasion in the other language", () => {
    expect(translateOccasionPath("/einladung/kindergeburtstag", "en")).toBe("/invitations/kids-birthday-party");
    expect(translateOccasionPath("/invitations/kids-birthday-party", "de")).toBe("/einladung/kindergeburtstag");
  });

  it("keeps the language when it already matches", () => {
    expect(translateOccasionPath("/einladung/hochzeit", "de")).toBe("/einladung/hochzeit");
  });

  it("falls back to the overview for an unknown slug", () => {
    expect(translateOccasionPath("/einladung/gibtsnicht", "en")).toBe("/invitations");
  });

  it("leaves every other path alone", () => {
    expect(translateOccasionPath("/about", "en")).toBeNull();
    expect(translateOccasionPath("/", "en")).toBeNull();
    expect(translateOccasionPath("/einladungen", "en")).toBeNull();
  });
});

describe("sectionLanguage", () => {
  it("accepts only a language's own section name", () => {
    expect(sectionLanguage("de", "einladung")).toBe("de");
    expect(sectionLanguage("en", "invitations")).toBe("en");
    expect(sectionLanguage("de", "invitations")).toBeUndefined();
    expect(sectionLanguage("en", "einladung")).toBeUndefined();
    expect(sectionLanguage("xx", "einladung")).toBeUndefined();
  });
});
