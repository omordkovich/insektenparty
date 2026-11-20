import { LOCALES, type Locale } from "@/i18n/config";
import { splitLocalePrefix } from "@/i18n/locale-path";
import { DESIGN_SECTION, translateDesignPath } from "@/lib/design-slugs";
import { OCCASION_SECTION, translateOccasionPath } from "@/lib/occasion-slugs";
import { localizedPath } from "@/lib/page-metadata";

// Occasion and design pages have their own URL per language
// (/einladung/hochzeit, /en/invitations/wedding; /designs/..., /ru/dizajny/...).
// A path that puts one language's section under another language's prefix
// goes to the same page in the prefix's language: /en/einladung/... is where
// next-intl sends a visitor who chose English from a German URL (e.g. a
// German search result). Without any prefix, the URL just lacks its own:
// /invitations/... -> /en/invitations/... null: nothing to redirect.

type Section = { paths: Record<Locale, string>; translate: (pathname: string, to: Locale) => string | null };

const SECTIONS: Section[] = [
  { paths: OCCASION_SECTION, translate: translateOccasionPath },
  { paths: DESIGN_SECTION, translate: translateDesignPath },
];

const inSection = (path: string, section: string) => path === section || path.startsWith(`${section}/`);

export function sectionRedirect(pathname: string): string | null {
  const { locale, path, prefixed } = splitLocalePrefix(pathname);
  for (const { paths, translate } of SECTIONS) {
    if (inSection(path, paths[locale])) {
      // Languages can share a section name (/designs in German and
      // English): a slug of the other language is swapped for this one's.
      // An unknown slug translates to the bare section - left to the 404.
      const translated = translate(path, locale);
      if (translated && translated !== path && translated !== paths[locale]) return localizedPath(translated, locale);
      return null;
    }
    const owner = LOCALES.find((candidate) => inSection(path, paths[candidate]));
    if (!owner) continue;
    if (!prefixed) return localizedPath(path, owner);
    return localizedPath(translate(path, locale) ?? path, locale);
  }
  return null;
}
