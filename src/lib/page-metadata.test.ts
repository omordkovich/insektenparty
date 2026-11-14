import { describe, expect, it } from "vitest";
import { LOCALES } from "@/i18n/config";
import { localizedPath, pageMetadata } from "./page-metadata";

describe("localizedPath", () => {
  it("adds /en for English only", () => {
    expect(localizedPath("/", "de")).toBe("/");
    expect(localizedPath("/about", "de")).toBe("/about");
    expect(localizedPath("/", "en")).toBe("/en");
    expect(localizedPath("/about", "en")).toBe("/en/about");
  });
});

describe("pageMetadata", () => {
  const base = { title: "T", description: "D", path: "/impressum" };

  it("German page: canonical is the German path", () => {
    const meta = pageMetadata({ ...base, locale: "de" });
    expect(meta.alternates?.canonical).toBe("/impressum");
    expect(meta.robots).toBeUndefined();
    expect(meta.openGraph).toMatchObject({ locale: "de_DE", url: "/impressum" });
  });

  it("English page: canonical and URL under /en", () => {
    const meta = pageMetadata({ ...base, path: "/", locale: "en" });
    expect(meta.alternates?.canonical).toBe("/en");
    expect(meta.openGraph).toMatchObject({ locale: "en_GB", url: "/en" });
  });

  it("German-only content in English: noindex, canonical to German", () => {
    const meta = pageMetadata({ ...base, locale: "en", germanOnly: true });
    expect(meta.alternates?.canonical).toBe("/impressum");
    expect(meta.robots).toEqual({ index: false, follow: true });
  });
});

describe("pageMetadata – language alternates", () => {
  it("links every language and x-default", () => {
    for (const locale of LOCALES) {
      const meta = pageMetadata({ title: "T", description: "D", path: "/", locale, alternates: true });
      expect(meta.alternates?.languages).toEqual({ de: "/", en: "/en", ru: "/ru", "x-default": "/" });
    }
  });

  it("has none without the option", () => {
    expect(pageMetadata({ title: "T", description: "D", path: "/", locale: "de" }).alternates?.languages).toBeUndefined();
  });

  it("links pages whose path differs per language", () => {
    const paths = { de: "/einladung/hochzeit", en: "/invitations/wedding", ru: "/priglasheniya/svadba" };
    const meta = pageMetadata({ title: "T", description: "D", path: paths.en, locale: "en", alternates: paths });
    expect(meta.alternates?.canonical).toBe("/en/invitations/wedding");
    expect(meta.alternates?.languages).toEqual({
      de: "/einladung/hochzeit",
      en: "/en/invitations/wedding",
      ru: "/ru/priglasheniya/svadba",
      "x-default": "/einladung/hochzeit",
    });
  });
});
