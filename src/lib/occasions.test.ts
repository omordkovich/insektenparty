import { describe, expect, it } from "vitest";
import {
  getOccasionBySlug,
  hubBreadcrumbs,
  latestOccasionUpdate,
  OCCASIONS,
  OCCASIONS_HUB,
  occasionBreadcrumbs,
  occasionPath,
} from "@/lib/occasions";

const URL_SAFE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

describe("OCCASIONS", () => {
  it("is not empty", () => {
    expect(OCCASIONS.length).toBeGreaterThan(0);
  });

  it("has unique ids and slugs", () => {
    expect(new Set(OCCASIONS.map((o) => o.id)).size).toBe(OCCASIONS.length);
    expect(new Set(OCCASIONS.map((o) => o.slug)).size).toBe(OCCASIONS.length);
  });

  for (const occasion of OCCASIONS) {
    describe(occasion.id, () => {
      it("uses URL-safe id and slug", () => {
        expect(occasion.id).toMatch(URL_SAFE);
        expect(occasion.slug).toMatch(URL_SAFE);
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
});

describe("OCCASIONS_HUB", () => {
  it("fits search result limits", () => {
    expect(OCCASIONS_HUB.description.length).toBeLessThanOrEqual(160);
    expect(OCCASIONS_HUB.metaTitle.endsWith("– GASTZILLA")).toBe(true);
  });
});

describe("occasionPath / getOccasionBySlug", () => {
  it("builds the page path from the slug", () => {
    const occasion = getOccasionBySlug("kindergeburtstag");
    expect(occasion?.id).toBe("kids-birthday");
    expect(occasionPath(occasion!)).toBe("/einladung/kindergeburtstag");
  });

  it("returns undefined for unknown slugs", () => {
    expect(getOccasionBySlug("gibtsnicht")).toBeUndefined();
  });
});

describe("breadcrumbs", () => {
  it("leads from the start page to the hub", () => {
    expect(hubBreadcrumbs()).toEqual([
      { name: "Startseite", path: "/" },
      { name: "Anlässe", path: "/einladung" },
    ]);
  });

  it("ends with the occasion itself", () => {
    const occasion = getOccasionBySlug("kindergeburtstag")!;
    expect(occasionBreadcrumbs(occasion)).toEqual([
      { name: "Startseite", path: "/" },
      { name: "Anlässe", path: "/einladung" },
      { name: "Kindergeburtstag", path: "/einladung/kindergeburtstag" },
    ]);
  });
});

describe("latestOccasionUpdate", () => {
  it("is the newest updated date of all occasions", () => {
    const newest = OCCASIONS.map((o) => o.updated).sort().at(-1);
    expect(latestOccasionUpdate()).toBe(newest);
  });
});
