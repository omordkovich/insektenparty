import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { DEFAULT_LOCALE, LOCALES } from "@/i18n/config";
import { LEGAL_DOCUMENTS, type LegalDocument } from "@/lib/legal-documents";
import { LEGAL_CONTENT } from "./index";

// Legal texts are changed in every language at once (never German first,
// the translation "later"). These checks catch a translation that has
// drifted apart: a paragraph, list item, heading or link added or removed in
// one language only, or a different "last updated" date.

const DOCUMENTS = Object.keys(LEGAL_DOCUMENTS) as LegalDocument[];

function render(document: LegalDocument, locale: (typeof LOCALES)[number]): string {
  return renderToStaticMarkup(createElement(LEGAL_CONTENT[document][locale]));
}

function shape(html: string) {
  const count = (tag: string) => (html.match(new RegExp(`<${tag}[ >]`, "g")) ?? []).length;
  return { headings: count("h3"), paragraphs: count("p"), listItems: count("li"), links: count("a") };
}

function lastUpdated(html: string): string | null {
  return /data-updated="([^"]+)"/.exec(html)?.[1] ?? null;
}

describe.each(DOCUMENTS)("legal text %s", (document) => {
  const original = render(document, DEFAULT_LOCALE);

  it.each(LOCALES.filter((locale) => locale !== DEFAULT_LOCALE))("has the same structure in %s", (locale) => {
    expect(shape(render(document, locale))).toEqual(shape(original));
  });

  it.each(LOCALES.filter((locale) => locale !== DEFAULT_LOCALE))("has the same last-updated date in %s", (locale) => {
    expect(lastUpdated(render(document, locale))).toBe(lastUpdated(original));
  });

  it.each(LOCALES)("has a title and description in %s", (locale) => {
    expect(LEGAL_DOCUMENTS[document].title[locale].trim()).not.toBe("");
    expect(LEGAL_DOCUMENTS[document].description[locale].trim()).not.toBe("");
  });
});
