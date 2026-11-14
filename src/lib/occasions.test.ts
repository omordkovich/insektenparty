import { describe, expect, it } from "vitest";
import { LOCALES } from "@/i18n/config";
import {
  getOccasion,
  getOccasionBySlug,
  hubBreadcrumbs,
  latestOccasionUpdate,
  occasionAlternates,
  occasionBreadcrumbs,
  occasionIconPath,
  occasionPath,
  occasionRouteParams,
  occasionsFor,
  occasionsHub,
} from "@/lib/occasions";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

describe("occasionsFor", () => {
  it("has the same occasions, in the same order, in every language", () => {
    const ids = occasionsFor("de").map((o) => o.id);
    expect(ids.length).toBeGreaterThan(0);
    expect(new Set(ids).size).toBe(ids.length);
    for (const locale of LOCALES) expect(occasionsFor(locale).map((o) => o.id)).toEqual(ids);
  });

  for (const locale of LOCALES) {
    for (const occasion of occasionsFor(locale)) {
      describe(`${locale}/${occasion.id}`, () => {
        it("knows its language and slug", () => {
          expect(occasion.locale).toBe(locale);
          expect(occasion.slug).not.toBe("");
        });

        it("has no empty texts", () => {
          const texts = [
            occasion.name,
            occasion.title,
            occasion.metaTitle,
            occasion.description,
            occasion.teaser,
            occasion.benefitsTitle,
            ...occasion.intro,
            ...occasion.benefits.flatMap((b) => [b.title, b.text]),
            ...occasion.faq.flatMap((f) => [f.question, f.answer]),
          ];
          for (const text of texts) expect(text.trim()).not.toBe("");
          expect(occasion.intro.length).toBeGreaterThan(0);
        });

        it("fits search result limits", () => {
          expect(occasion.description.length).toBeLessThanOrEqual(160);
          expect(occasion.metaTitle.endsWith("– GASTZILLA")).toBe(true);
        });

        it("has an invitation template with placeholders and the invitation link", () => {
          expect(occasion.invitationText.length).toBeGreaterThanOrEqual(4);
          for (const line of occasion.invitationText) expect(line.trim()).not.toBe("");
          expect(occasion.invitationText.join("\n")).toContain("[Link]");
        });

        it("has 3-4 benefits and 3-4 FAQ entries", () => {
          expect(occasion.benefits.length).toBeGreaterThanOrEqual(3);
          expect(occasion.benefits.length).toBeLessThanOrEqual(4);
          expect(occasion.faq.length).toBeGreaterThanOrEqual(3);
          expect(occasion.faq.length).toBeLessThanOrEqual(4);
        });

        it("has a valid updated date", () => {
          expect(occasion.updated).toMatch(ISO_DATE);
          expect(Number.isNaN(Date.parse(occasion.updated))).toBe(false);
        });
      });
    }
  }

  it("writes the English pages in English", () => {
    for (const occasion of occasionsFor("en")) {
      const text = [occasion.title, occasion.description, ...occasion.intro, ...occasion.faq.map((f) => f.answer)].join(" ");
      expect(text, occasion.id).not.toMatch(/\b(und|oder|ohne|Gäste|kostenlos|Einladung)\b/);
    }
  });

  it("writes the Russian pages in Russian", () => {
    for (const occasion of occasionsFor("ru")) {
      const text = [occasion.name, occasion.title, occasion.description, ...occasion.intro, ...occasion.faq.map((f) => f.answer)].join(" ");
      const letters = text.match(/\p{L}/gu) ?? [];
      const cyrillic = text.match(/\p{Script=Cyrillic}/gu) ?? [];
      // Mostly Cyrillic - brand and service names (GASTZILLA, WhatsApp) are fine.
      expect(cyrillic.length / letters.length, occasion.id).toBeGreaterThan(0.85);
      expect(text, occasion.id).not.toMatch(/\b(und|oder|ohne|Gäste|kostenlos|Einladung|the|and|with)\b/);
    }
  });
});

describe("occasionsHub", () => {
  for (const locale of LOCALES) {
    it(`fits search result limits (${locale})`, () => {
      expect(occasionsHub(locale).description.length).toBeLessThanOrEqual(160);
      expect(occasionsHub(locale).metaTitle.endsWith("– GASTZILLA")).toBe(true);
    });
  }
});

describe("occasionPath / getOccasionBySlug", () => {
  it("builds the page path from the language's section and slug", () => {
    const de = getOccasionBySlug("kindergeburtstag", "de");
    expect(de?.id).toBe("kids-birthday");
    expect(occasionPath(de!)).toBe("/einladung/kindergeburtstag");

    const en = getOccasionBySlug("kids-birthday-party", "en");
    expect(en?.id).toBe("kids-birthday");
    expect(occasionPath(en!)).toBe("/invitations/kids-birthday-party");
  });

  it("only finds a slug in its own language", () => {
    expect(getOccasionBySlug("kindergeburtstag", "en")).toBeUndefined();
    expect(getOccasionBySlug("kids-birthday-party", "de")).toBeUndefined();
    expect(getOccasionBySlug("gibtsnicht", "de")).toBeUndefined();
  });

  it("finds an occasion by id", () => {
    expect(getOccasion("date-poll", "en")?.slug).toBe("date-poll");
    expect(getOccasion("date-poll", "de")?.slug).toBe("terminabstimmung");
  });
});

describe("occasionAlternates", () => {
  it("lists the occasion's path in every language", () => {
    expect(occasionAlternates("wedding")).toEqual({
      de: "/einladung/hochzeit",
      en: "/invitations/wedding",
      ru: "/priglasheniya/svadba",
    });
  });
});

describe("breadcrumbs", () => {
  it("leads from the start page to the hub", () => {
    expect(hubBreadcrumbs("de")).toEqual([
      { name: "Startseite", path: "/" },
      { name: "Anlässe", path: "/einladung" },
    ]);
    expect(hubBreadcrumbs("en")).toEqual([
      { name: "Home", path: "/" },
      { name: "Occasions", path: "/invitations" },
    ]);
  });

  it("ends with the occasion itself", () => {
    const occasion = getOccasionBySlug("kindergeburtstag", "de")!;
    expect(occasionBreadcrumbs(occasion)).toEqual([
      { name: "Startseite", path: "/" },
      { name: "Anlässe", path: "/einladung" },
      { name: "Kindergeburtstag", path: "/einladung/kindergeburtstag" },
    ]);
  });
});

describe("latestOccasionUpdate", () => {
  it("is the newest updated date of the language's occasions", () => {
    for (const locale of LOCALES) {
      const newest = occasionsFor(locale).map((o) => o.updated).sort().at(-1);
      expect(latestOccasionUpdate(locale)).toBe(newest);
    }
  });
});

describe("occasionIconPath", () => {
  it("points every occasion at its versioned icon on Cloudinary", () => {
    for (const occasion of occasionsFor("de")) {
      const url = occasionIconPath(occasion);
      const [version, file] = url.replace("https://res.cloudinary.com/d6sufegz/image/upload/", "").split("/");
      expect(version, `Icon-Version für ${occasion.id} fehlt`).toMatch(/^v\d+$/);
      expect(file).toBe(`${occasion.id}.webp`);
    }
  });
});

describe("occasionRouteParams", () => {
  it("names each language's overview under its own section", () => {
    expect(occasionRouteParams().hubs).toEqual([
      { locale: "de", section: "einladung" },
      { locale: "en", section: "invitations" },
      { locale: "ru", section: "priglasheniya" },
    ]);
  });

  it("names every occasion page of every language", () => {
    const { pages } = occasionRouteParams();
    for (const locale of LOCALES) {
      expect(pages.filter((page) => page.locale === locale)).toHaveLength(occasionsFor(locale).length);
    }
    expect(pages).toContainEqual({ locale: "de", section: "einladung", slug: "kindergeburtstag" });
    expect(pages).toContainEqual({ locale: "en", section: "invitations", slug: "kids-birthday-party" });
  });
});
