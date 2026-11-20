import { describe, expect, it } from "vitest";
import { LOCALES } from "@/i18n/config";
import { DESIGN_SLUGS, designSectionLanguage, translateDesignPath } from "@/lib/design-slugs";
import {
  DESIGN_OCCASIONS,
  designAlternates,
  designBreadcrumbs,
  designPath,
  designPathFor,
  designRouteParams,
  designsFor,
  designsForOccasion,
  designsHub,
  designsPath,
  getDesign,
  getDesignBySlug,
  latestDesignUpdate,
} from "@/lib/designs";
import { OCCASION_SLUGS } from "@/lib/occasion-slugs";
import { FREE_THEMES, PREMIUM_THEMES, THEME_LABELS, type ThemeKey } from "@/lib/theme-presets";

// Every design has a page - premium ones and the free colour designs.
const ALL_THEMES = Object.keys(THEME_LABELS) as ThemeKey[];

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

describe("design slugs", () => {
  it("has slugs for every design", () => {
    expect(Object.keys(DESIGN_SLUGS).sort()).toEqual([...ALL_THEMES].sort());
  });

  it("uses unique, URL-safe slugs per language", () => {
    for (const locale of LOCALES) {
      const slugs = ALL_THEMES.map((theme) => DESIGN_SLUGS[theme]?.[locale] ?? "");
      for (const slug of slugs) expect(slug, locale).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      expect(new Set(slugs).size, locale).toBe(slugs.length);
    }
  });

  it("serves a section only in its own language", () => {
    expect(designSectionLanguage("de", "designs")).toBe("de");
    expect(designSectionLanguage("en", "designs")).toBe("en");
    expect(designSectionLanguage("ru", "dizajny")).toBe("ru");
    expect(designSectionLanguage("ru", "designs")).toBeUndefined();
    expect(designSectionLanguage("de", "einladung")).toBeUndefined();
  });

  it("translates design paths for the language switcher", () => {
    expect(translateDesignPath("/designs/halloween-friedhof", "en")).toBe("/designs/halloween-graveyard");
    expect(translateDesignPath("/designs/halloween-graveyard", "de")).toBe("/designs/halloween-friedhof");
    expect(translateDesignPath("/designs/halloween-friedhof", "ru")).toBe("/dizajny/khellouin-kladbishche");
    expect(translateDesignPath("/designs", "ru")).toBe("/dizajny");
    expect(translateDesignPath("/dizajny/unbekannt", "de")).toBe("/designs");
    expect(translateDesignPath("/einladung", "en")).toBeNull();
  });
});

describe("design occasions", () => {
  it("links every design to 2-5 existing occasions", () => {
    expect(Object.keys(DESIGN_OCCASIONS).sort()).toEqual([...ALL_THEMES].sort());
    for (const theme of ALL_THEMES) {
      const ids = DESIGN_OCCASIONS[theme] ?? [];
      expect(ids.length, theme).toBeGreaterThanOrEqual(2);
      expect(ids.length, theme).toBeLessThanOrEqual(5);
      for (const id of ids) expect(OCCASION_SLUGS, `${theme} -> ${id}`).toHaveProperty(id);
    }
  });
});

describe("design paths", () => {
  it("builds paths from the language's section and slug", () => {
    expect(designPathFor("halloweengraveyard", "de")).toBe("/designs/halloween-friedhof");
    expect(designPathFor("halloweengraveyard", "en")).toBe("/designs/halloween-graveyard");
    expect(designPathFor("halloweengraveyard", "ru")).toBe("/dizajny/khellouin-kladbishche");
  });

  it("lists the same design in every language", () => {
    expect(designAlternates("foam")).toEqual({
      de: "/designs/schaumparty",
      en: "/designs/foam-party",
      ru: "/dizajny/pennaya-vecherinka",
    });
  });

  it("builds static params for the overview and every page", () => {
    const { hubs, pages } = designRouteParams();
    expect(hubs).toEqual([
      { locale: "de", section: "designs" },
      { locale: "en", section: "designs" },
      { locale: "ru", section: "dizajny" },
    ]);
    expect(pages).toHaveLength(ALL_THEMES.length * LOCALES.length);
  });
});

describe("designsHub", () => {
  for (const locale of LOCALES) {
    it(`fits search result limits (${locale})`, () => {
      const hub = designsHub(locale);
      expect(hub.metaTitle.endsWith("– GASTZILLA")).toBe(true);
      expect(hub.metaTitle.length).toBeLessThanOrEqual(60);
      expect(hub.description.length).toBeLessThanOrEqual(160);
      expect(hub.title.length).toBeGreaterThan(0);
      expect(hub.intro.length).toBeGreaterThan(0);
    });
  }
});

for (const locale of LOCALES) {
  describe(`design pages (${locale})`, () => {
    const designs = designsFor(locale);

    it("has a page for every design, in picker order, the colour designs marked free", () => {
      expect(designs.map((design) => design.theme)).toEqual(ALL_THEMES);
      for (const theme of FREE_THEMES) expect(getDesign(theme, locale)?.free, theme).toBe(true);
      for (const theme of PREMIUM_THEMES) expect(getDesign(theme, locale)?.free, theme).toBe(false);
    });

    it("knows its language, slug, name and occasions", () => {
      for (const design of designs) {
        expect(design.locale).toBe(locale);
        expect(design.slug).toBe(DESIGN_SLUGS[design.theme]?.[locale]);
        expect(design.name.length, design.theme).toBeGreaterThan(0);
        expect(design.occasionIds).toEqual(DESIGN_OCCASIONS[design.theme]);
        expect(getDesignBySlug(design.slug, locale)).toBe(design);
        expect(designPath(design)).toBe(designPathFor(design.theme, locale));
      }
    });

    it("fits search result limits", () => {
      for (const design of designs) {
        expect(design.metaTitle.endsWith("– GASTZILLA"), design.theme).toBe(true);
        expect(design.metaTitle.length, design.theme).toBeLessThanOrEqual(60);
        expect(design.metaDescription.length, design.theme).toBeLessThanOrEqual(160);
        expect(design.metaDescription.length, design.theme).toBeGreaterThanOrEqual(70);
      }
    });

    it("has no empty texts and a valid updated date", () => {
      for (const design of designs) {
        for (const text of [design.title, design.teaser, ...design.description]) {
          expect(text.trim().length, design.theme).toBeGreaterThan(0);
        }
        expect(design.description.length, design.theme).toBeGreaterThanOrEqual(1);
        expect(design.description.length, design.theme).toBeLessThanOrEqual(2);
        expect(design.updated, design.theme).toMatch(ISO_DATE);
        expect(Number.isNaN(Date.parse(design.updated)), design.theme).toBe(false);
      }
    });

    it("uses unique texts", () => {
      for (const field of ["metaTitle", "metaDescription", "title", "teaser"] as const) {
        const values = designs.map((design) => design[field]);
        expect(new Set(values).size, field).toBe(values.length);
      }
      const descriptions = designs.map((design) => design.description.join(" "));
      expect(new Set(descriptions).size).toBe(descriptions.length);
    });

    it("builds breadcrumbs home > designs > name", () => {
      for (const design of designs) {
        const crumbs = designBreadcrumbs(design);
        expect(crumbs.map((crumb) => crumb.path)).toEqual(["/", designsPath(locale), designPath(design)]);
        expect(crumbs[2].name).toBe(design.name);
      }
    });
  });
}

describe("design page languages", () => {
  it("only finds a slug in its own language", () => {
    expect(getDesignBySlug("halloween-friedhof", "en")).toBeUndefined();
    expect(getDesignBySlug("halloween-graveyard", "de")).toBeUndefined();
  });

  it("writes the English pages in English", () => {
    for (const design of designsFor("en")) {
      const text = [design.title, design.metaDescription, design.teaser, ...design.description].join(" ");
      expect(text, design.theme).not.toMatch(/[äöüß]/);
      expect(text, design.theme).not.toMatch(/\b(und|oder|ohne|Gäste|kostenlos|Einladung|dein|deine)\b/);
    }
  });

  it("writes the Russian pages in Russian", () => {
    for (const design of designsFor("ru")) {
      const text = [design.title, design.metaDescription, design.teaser, ...design.description].join(" ");
      const letters = text.match(/\p{L}/gu) ?? [];
      const cyrillic = text.match(/\p{Script=Cyrillic}/gu) ?? [];
      expect(cyrillic.length / letters.length, design.theme).toBeGreaterThan(0.85);
    }
  });

  it("dates the overview by its newest page", () => {
    for (const locale of LOCALES) {
      const newest = designsFor(locale).map((design) => design.updated).sort().at(-1) ?? "";
      expect(latestDesignUpdate(locale)).toBe(newest);
    }
  });
});

describe("designsForOccasion", () => {
  it("lists the designs that name the occasion, in picker order", () => {
    const themes = designsForOccasion("halloween-party", "de").map((design) => design.theme);
    expect(themes).toEqual(["schwarz", "orange", "halloweenclay", "halloweengraveyard", "halloweenkids", "tarot"]);
  });

  it("uses the page language", () => {
    expect(designsForOccasion("wedding", "en").every((design) => design.locale === "en")).toBe(true);
  });

  it("suggests only calm designs for a funeral", () => {
    expect(designsForOccasion("funeral", "de").map((design) => design.theme)).toEqual([
      "weiss",
      "schwarz",
      "kerzenweiss",
      "kerzenschwarz",
    ]);
  });
});
