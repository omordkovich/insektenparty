import { describe, expect, it } from "vitest";
import { COMPARISON } from "@/lib/comparison";
import { FAQ } from "@/lib/faq";
import { getOccasionBySlug, OCCASIONS } from "@/lib/occasions";
import {
  aboutStructuredData,
  comparisonStructuredData,
  occasionStructuredData,
  occasionsHubStructuredData,
  siteStructuredData,
} from "@/lib/structured-data";

type Node = Record<string, unknown> & { "@type": string };

function byType(data: { "@graph": object[] }, type: string): Node {
  const node = (data["@graph"] as Node[]).find((n) => n["@type"] === type);
  if (!node) throw new Error(`no ${type} node`);
  return node;
}

describe("siteStructuredData", () => {
  it("describes organization, website, app and FAQ", () => {
    const types = (siteStructuredData()["@graph"] as Node[]).map((n) => n["@type"]);
    expect(types).toEqual(["Organization", "WebSite", "WebApplication", "FAQPage"]);
  });

  it("links the organization to its Instagram profile", () => {
    const organization = byType(siteStructuredData(), "Organization");
    expect(organization.sameAs).toEqual(["https://www.instagram.com/gastzilla/"]);
  });

  it("lists every start page question", () => {
    const faq = byType(siteStructuredData(), "FAQPage");
    expect((faq.mainEntity as unknown[]).length).toBe(FAQ.length);
  });
});

describe("occasionStructuredData", () => {
  const occasion = getOccasionBySlug("kindergeburtstag")!;
  const data = occasionStructuredData(occasion);

  it("describes the page as part of the site", () => {
    const page = byType(data, "WebPage");
    expect(page.url).toBe("https://gastzilla.de/einladung/kindergeburtstag");
    expect(page.name).toBe(occasion.metaTitle);
    expect(page.isPartOf).toEqual({ "@id": "https://gastzilla.de/#website" });
    expect(page.about).toEqual({ "@id": "https://gastzilla.de/#app" });
  });

  it("has a three-step breadcrumb with absolute URLs", () => {
    const breadcrumb = byType(data, "BreadcrumbList");
    expect(breadcrumb.itemListElement).toEqual([
      { "@type": "ListItem", position: 1, name: "Startseite", item: "https://gastzilla.de/" },
      { "@type": "ListItem", position: 2, name: "Anlässe", item: "https://gastzilla.de/einladung" },
      {
        "@type": "ListItem",
        position: 3,
        name: "Kindergeburtstag",
        item: "https://gastzilla.de/einladung/kindergeburtstag",
      },
    ]);
  });

  it("lists every occasion question with its answer", () => {
    const faq = byType(data, "FAQPage");
    expect(faq.mainEntity).toEqual(
      occasion.faq.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
    );
  });
});

describe("occasionsHubStructuredData", () => {
  const data = occasionsHubStructuredData();

  it("lists every occasion page", () => {
    const page = byType(data, "CollectionPage");
    expect(page.url).toBe("https://gastzilla.de/einladung");
    const list = page.mainEntity as { itemListElement: { url: string }[] };
    expect(list.itemListElement.map((item) => item.url)).toEqual(
      OCCASIONS.map((o) => `https://gastzilla.de/einladung/${o.slug}`),
    );
  });

  it("has a two-step breadcrumb", () => {
    const breadcrumb = byType(data, "BreadcrumbList");
    expect((breadcrumb.itemListElement as unknown[]).length).toBe(2);
  });
});

describe("comparisonStructuredData", () => {
  const data = comparisonStructuredData();

  it("describes the page with its date and FAQ", () => {
    const page = byType(data, "WebPage");
    expect(page.url).toBe("https://gastzilla.de/vergleich");
    expect(page.dateModified).toBe(COMPARISON.updated);
    const faq = byType(data, "FAQPage");
    expect((faq.mainEntity as unknown[]).length).toBe(COMPARISON.faq.length);
  });

  it("keeps the snippet texts within search result limits", () => {
    expect(COMPARISON.description.length).toBeLessThanOrEqual(160);
    expect(COMPARISON.metaTitle.endsWith("– GASTZILLA")).toBe(true);
  });
});

describe("aboutStructuredData", () => {
  it("is an AboutPage about the organization", () => {
    const data = aboutStructuredData({ updated: "2026-10-14" });
    const page = byType(data, "AboutPage");
    expect(page.mainEntity).toEqual({ "@id": "https://gastzilla.de/#organization" });
    expect(byType(data, "Organization")["@id"]).toBe("https://gastzilla.de/#organization");
  });
});
