import { describe, expect, it } from "vitest";
import { COMPARISON } from "@/lib/comparison";
import { FAQ, faqEntries } from "@/lib/faq";
import { getOccasionBySlug, occasionsFor } from "@/lib/occasions";
import {
  aboutStructuredData,
  comparisonStructuredData,
  designsHubStructuredData,
  designStructuredData,
  occasionStructuredData,
  occasionsHubStructuredData,
  siteStructuredData,
} from "@/lib/structured-data";
import { getDesign } from "@/lib/designs";
import { PREMIUM_THEMES } from "@/lib/theme-presets";

type Node = Record<string, unknown> & { "@type": string };

function byType(data: { "@graph": object[] }, type: string): Node {
  const node = (data["@graph"] as Node[]).find((n) => n["@type"] === type);
  if (!node) throw new Error(`no ${type} node`);
  return node;
}

describe("siteStructuredData", () => {
  it("describes organization, website, app and FAQ", () => {
    const types = (siteStructuredData("de")["@graph"] as Node[]).map((n) => n["@type"]);
    expect(types).toEqual(["Organization", "WebSite", "WebApplication", "FAQPage"]);
  });

  it("links the organization to its Instagram profile", () => {
    const organization = byType(siteStructuredData("de"), "Organization");
    expect(organization.sameAs).toEqual(["https://www.instagram.com/gastzilla/"]);
  });

  it("lists every start page question", () => {
    const faq = byType(siteStructuredData("de"), "FAQPage");
    expect((faq.mainEntity as unknown[]).length).toBe(FAQ.length);
  });
});

describe("siteStructuredData – English", () => {
  const data = siteStructuredData("en");

  it("marks the start page as English and points at /en", () => {
    expect(byType(data, "WebApplication")).toMatchObject({ inLanguage: "en", url: "https://gastzilla.de/en" });
    expect(byType(data, "FAQPage")).toMatchObject({ inLanguage: "en", "@id": "https://gastzilla.de/en#faq" });
  });

  it("uses the English questions and features", () => {
    const faq = byType(data, "FAQPage");
    const questions = (faq.mainEntity as { name: string }[]).map((q) => q.name);
    expect(questions).toEqual(faqEntries("en").map((item) => item.question));
    expect(questions).not.toEqual(FAQ.map((item) => item.question));
    expect(faqEntries("en").length).toBe(FAQ.length);
  });
});

describe("occasionStructuredData", () => {
  const occasion = getOccasionBySlug("kindergeburtstag", "de")!;
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

describe("occasionStructuredData – English", () => {
  const occasion = getOccasionBySlug("kids-birthday-party", "en")!;
  const data = occasionStructuredData(occasion);

  it("marks the page and its FAQ as English under /en/invitations", () => {
    expect(byType(data, "WebPage")).toMatchObject({
      url: "https://gastzilla.de/en/invitations/kids-birthday-party",
      inLanguage: "en",
    });
    expect(byType(data, "FAQPage")).toMatchObject({ inLanguage: "en" });
  });

  it("has an English breadcrumb with /en URLs", () => {
    expect(byType(data, "BreadcrumbList").itemListElement).toEqual([
      { "@type": "ListItem", position: 1, name: "Home", item: "https://gastzilla.de/en" },
      { "@type": "ListItem", position: 2, name: "Occasions", item: "https://gastzilla.de/en/invitations" },
      {
        "@type": "ListItem",
        position: 3,
        name: occasion.name,
        item: "https://gastzilla.de/en/invitations/kids-birthday-party",
      },
    ]);
  });
});

describe("occasionsHubStructuredData", () => {
  const data = occasionsHubStructuredData("de");

  it("lists every occasion page", () => {
    const page = byType(data, "CollectionPage");
    expect(page.url).toBe("https://gastzilla.de/einladung");
    const list = page.mainEntity as { itemListElement: { url: string }[] };
    expect(list.itemListElement.map((item) => item.url)).toEqual(
      occasionsFor("de").map((o) => `https://gastzilla.de/einladung/${o.slug}`),
    );
  });

  it("lists the English pages under /en/invitations", () => {
    const page = byType(occasionsHubStructuredData("en"), "CollectionPage");
    expect(page).toMatchObject({ url: "https://gastzilla.de/en/invitations", inLanguage: "en" });
    const list = page.mainEntity as { itemListElement: { url: string }[] };
    expect(list.itemListElement[0].url).toBe("https://gastzilla.de/en/invitations/kids-birthday-party");
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

describe("designStructuredData", () => {
  const design = getDesign("foam", "de")!;
  const data = designStructuredData(design);

  it("describes the design page as part of the site", () => {
    const page = byType(data, "WebPage");
    expect(page.url).toBe("https://gastzilla.de/designs/schaumparty");
    expect(page.name).toBe(design.metaTitle);
    expect(page.description).toBe(design.metaDescription);
    expect(page.inLanguage).toBe("de");
    expect(page.dateModified).toBe(design.updated);
    expect(page.isPartOf).toEqual({ "@id": "https://gastzilla.de/#website" });
  });

  it("has a breadcrumb home > designs > name", () => {
    const list = byType(data, "BreadcrumbList");
    const items = list.itemListElement as { name: string }[];
    expect(items.map((item) => item.name)).toEqual(["Startseite", "Designs", design.name]);
  });

  it("offers nothing for sale yet", () => {
    expect((data["@graph"] as Node[]).some((node) => node["@type"] === "Product" || node["@type"] === "Offer")).toBe(false);
  });

  it("uses the Russian URL for a Russian page", () => {
    const ru = designStructuredData(getDesign("foam", "ru")!);
    expect(byType(ru, "WebPage")).toMatchObject({ url: "https://gastzilla.de/ru/dizajny/pennaya-vecherinka", inLanguage: "ru" });
  });
});

describe("designsHubStructuredData", () => {
  it("lists every design page", () => {
    const page = byType(designsHubStructuredData("en"), "CollectionPage");
    const list = page.mainEntity as { itemListElement: { url: string }[] };
    expect(list.itemListElement).toHaveLength(PREMIUM_THEMES.length);
    expect(list.itemListElement[0].url).toMatch(/^https:\/\/gastzilla\.de\/en\/designs\//);
  });
});
