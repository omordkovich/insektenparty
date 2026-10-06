import { describe, expect, it } from "vitest";
import { FAQ } from "@/lib/faq";
import { getOccasionBySlug, OCCASIONS } from "@/lib/occasions";
import {
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
