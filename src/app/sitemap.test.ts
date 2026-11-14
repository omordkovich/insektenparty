import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";
import { COMPARISON } from "@/lib/comparison";
import { PRIVACY_VERSION, WITHDRAWAL_VERSION } from "@/lib/legal-info";
import { latestOccasionUpdate, occasionsFor } from "@/lib/occasions";

describe("sitemap", () => {
  const entries = sitemap();
  const byUrl = new Map(entries.map((entry) => [entry.url, entry]));

  it("lists the occasion overview with the newest occasion date", () => {
    expect(byUrl.get("https://gastzilla.de/einladung")?.lastModified).toBe(latestOccasionUpdate("de"));
    expect(byUrl.get("https://gastzilla.de/en/invitations")?.lastModified).toBe(latestOccasionUpdate("en"));
  });

  it("lists every occasion page with its own date", () => {
    for (const occasion of occasionsFor("de")) {
      const entry = byUrl.get(`https://gastzilla.de/einladung/${occasion.slug}`);
      expect(entry?.lastModified).toBe(occasion.updated);
    }
    for (const occasion of occasionsFor("en")) {
      const entry = byUrl.get(`https://gastzilla.de/en/invitations/${occasion.slug}`);
      expect(entry?.lastModified).toBe(occasion.updated);
    }
  });

  it("links each occasion page with its other language", () => {
    const languages = {
      de: "https://gastzilla.de/einladung/hochzeit",
      en: "https://gastzilla.de/en/invitations/wedding",
      ru: "https://gastzilla.de/ru/priglasheniya/svadba",
      "x-default": "https://gastzilla.de/einladung/hochzeit",
    };
    expect(byUrl.get("https://gastzilla.de/einladung/hochzeit")?.alternates?.languages).toEqual(languages);
    expect(byUrl.get("https://gastzilla.de/en/invitations/wedding")?.alternates?.languages).toEqual(languages);
    expect(byUrl.get("https://gastzilla.de/ru/priglasheniya/svadba")?.alternates?.languages).toEqual(languages);
  });

  it("lists the comparison page with its date", () => {
    expect(byUrl.get("https://gastzilla.de/vergleich")?.lastModified).toBe(COMPARISON.updated);
  });

  it("lists the English start page, linked with the German one", () => {
    const en = byUrl.get("https://gastzilla.de/en");
    expect(en?.alternates?.languages).toMatchObject({ de: "https://gastzilla.de/", en: "https://gastzilla.de/en" });
    expect(byUrl.get("https://gastzilla.de/")?.alternates?.languages).toMatchObject({ en: "https://gastzilla.de/en" });
  });

  it("lists every legal text in every language, linked with each other", () => {
    for (const path of ["/impressum", "/datenschutz", "/agb", "/widerruf"]) {
      const languages = {
        de: `https://gastzilla.de${path}`,
        en: `https://gastzilla.de/en${path}`,
        ru: `https://gastzilla.de/ru${path}`,
        "x-default": `https://gastzilla.de${path}`,
      };
      expect(byUrl.get(`https://gastzilla.de${path}`)?.alternates?.languages).toEqual(languages);
      expect(byUrl.get(`https://gastzilla.de/en${path}`)?.alternates?.languages).toEqual(languages);
      expect(byUrl.get(`https://gastzilla.de/ru${path}`)?.alternates?.languages).toEqual(languages);
    }
    expect(byUrl.get("https://gastzilla.de/en/datenschutz")?.lastModified).toBe(PRIVACY_VERSION);
    expect(byUrl.get("https://gastzilla.de/en/widerruf")?.lastModified).toBe(WITHDRAWAL_VERSION);
  });

  it("leaves out the German-only pages' English frame", () => {
    const english = entries.filter((entry) => entry.url.startsWith("https://gastzilla.de/en/"));
    const translated = ["/en/invitations", "/en/impressum", "/en/datenschutz", "/en/agb", "/en/widerruf"];
    expect(english.every((entry) => translated.some((path) => entry.url.startsWith(`https://gastzilla.de${path}`)))).toBe(true);
    expect(byUrl.has("https://gastzilla.de/en/about")).toBe(false);
    expect(byUrl.has("https://gastzilla.de/ru/about")).toBe(false);
    expect(byUrl.has("https://gastzilla.de/ru/vergleich")).toBe(false);
  });

  it("never lists event pages", () => {
    expect(entries.some((entry) => entry.url.includes("/event/"))).toBe(false);
  });
});
