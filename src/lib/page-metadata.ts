import type { Metadata } from "next";
import { DEFAULT_LOCALE, LOCALES, OG_LOCALE, type Locale } from "@/i18n/config";
import { OG_SIZE, SITE_NAME } from "@/lib/site";

// The public URL of a path in a language: German without prefix, every
// other language under /<locale>.
export function localizedPath(path: string, locale: Locale): string {
  if (locale === DEFAULT_LOCALE) return path;
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
}

// hreflang map of a page that exists in every language; x-default is the
// German original. `path`: the same path everywhere ("/about"), or one per
// language when the URL itself is translated (occasion pages).
export function languageAlternates(path: string | Record<Locale, string>): Record<string, string> {
  const pathIn = (locale: Locale) => (typeof path === "string" ? path : path[locale]);
  return {
    ...Object.fromEntries(LOCALES.map((locale) => [locale, localizedPath(pathIn(locale), locale)])),
    "x-default": pathIn(DEFAULT_LOCALE),
  };
}

// Metadata for an indexable page: canonical URL plus matching Open Graph
// tags. Next.js replaces (not merges) a parent's openGraph object, so every
// page sets its own - otherwise /about would be shared with the start
// page's title and URL. That replacement also drops the image inherited
// from app/[locale]/opengraph-image, hence the explicit reference to it.
//
// `germanOnly`: the content exists in German only (About, the comparison).
// Its /en copy only carries an English frame, so it points search engines at the German page and stays out of the index.
export function pageMetadata({
  title,
  description,
  path,
  locale,
  germanOnly = false,
  alternates = false,
  image,
  imageAlt = SITE_NAME,
}: {
  title: string;
  description: string;
  /** Path in the page's language without locale prefix, e.g. "/about". */
  path: string;
  locale: Locale;
  germanOnly?: boolean;
  /** The page exists in every language: links them for search engines
   *  (hreflang). true: same path in every language; a map: path per language. */
  alternates?: boolean | Record<Locale, string>;
  // Link preview image; pages with their own opengraph-image pass its path.
  image?: string;
  imageAlt?: string;
}): Metadata {
  const url = germanOnly ? path : localizedPath(path, locale);
  const imageUrl = image ?? localizedPath("/opengraph-image", germanOnly ? DEFAULT_LOCALE : locale);
  return {
    title,
    description,
    alternates: {
      canonical: url,
      ...(alternates ? { languages: languageAlternates(alternates === true ? path : alternates) } : {}),
    },
    ...(germanOnly && locale !== DEFAULT_LOCALE ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: OG_LOCALE[germanOnly ? DEFAULT_LOCALE : locale],
      title,
      description,
      url,
      images: [{ url: imageUrl, ...OG_SIZE, alt: imageAlt }],
    },
    twitter: { card: "summary_large_image", title, description, images: [imageUrl] },
  };
}
