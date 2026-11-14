import { isLocale, LOCALES, type Locale } from "@/i18n/config";

// URLs of the occasion pages (src/lib/occasions.ts) per language - kept
// apart from the page texts so client code (language switcher, buttons)
// can build these links without loading every occasion's content.
// German URLs are live and indexed: never change a German slug without a
// redirect (next.config.ts).

// The overview page of each language; occasion pages live below it.
export const OCCASION_SECTION: Record<Locale, string> = { de: "/einladung", en: "/invitations", ru: "/priglasheniya" };

// Occasion id -> slug per language.
export const OCCASION_SLUGS: Record<string, Record<Locale, string>> = {
  "kids-birthday": { de: "kindergeburtstag", en: "kids-birthday-party", ru: "detskiy-den-rozhdeniya" },
  "kids-playdate": { de: "spielverabredung", en: "playdate", ru: "detskaya-vstrecha" },
  "school-start": { de: "einschulung", en: "first-day-of-school", ru: "pervyy-den-v-shkole" },
  "school-events": { de: "kita-schulfeste", en: "school-events", ru: "prazdniki-v-sadu-i-shkole" },
  "graduation": { de: "abifeier", en: "graduation-party", ru: "vypusknoy" },
  "birthday": { de: "geburtstag", en: "birthday-party", ru: "den-rozhdeniya" },
  "wedding": { de: "hochzeit", en: "wedding", ru: "svadba" },
  "bachelor-party": { de: "junggesellenabschied", en: "hen-and-stag-party", ru: "devichnik-malchishnik" },
  "baby-shower": { de: "babyparty", en: "baby-shower", ru: "bebi-shauer" },
  "christening": { de: "taufe-kommunion", en: "christening-communion", ru: "krestiny" },
  "funeral": { de: "trauerfeier", en: "funeral", ru: "pominki" },
  "company-party": { de: "firmenfeier", en: "office-party", ru: "korporativ" },
  "barbecue": { de: "grillparty", en: "bbq-party", ru: "shashlyki" },
  "carnival-party": { de: "karneval", en: "carnival", ru: "karnaval" },
  "oktoberfest": { de: "oktoberfest", en: "oktoberfest", ru: "oktoberfest" },
  "halloween-party": { de: "halloweenparty", en: "halloween-party", ru: "khellouin" },
  "advent-party": { de: "advent-weihnachtsmarkt", en: "advent-christmas-market", ru: "rozhdestvenskaya-vstrecha" },
  "family-celebration": { de: "familienfest", en: "family-gathering", ru: "semeynyy-prazdnik" },
  "new-years-eve": { de: "silvester", en: "new-years-eve-party", ru: "novyy-god" },
  "theme-party": { de: "mottoparty", en: "theme-party", ru: "tematicheskaya-vecherinka" },
  "group-travel": { de: "gruppenreise", en: "group-trip", ru: "gruppovaya-poezdka" },
  "culture-outing": { de: "kultur", en: "cultural-outing", ru: "kulturnyy-dosug" },
  "rehearsal": { de: "probe", en: "band-choir-rehearsal", ru: "repetitsiya" },
  "going-out": { de: "ausgehen", en: "night-out", ru: "vecher-s-druzyami" },
  "sports-together": { de: "sport", en: "group-sports", ru: "sport-vmeste" },
  "tabletop-night": { de: "tabletop", en: "board-game-night", ru: "nastolnye-igry" },
  "gaming-night": { de: "gaming", en: "gaming-night", ru: "vecher-videoigr" },
  "date-poll": { de: "terminabstimmung", en: "date-poll", ru: "vybor-daty" },
};

export function occasionSectionPath(locale: Locale): string {
  return OCCASION_SECTION[locale];
}

// The language a [locale]/[section] route serves: only a language's own
// section name counts ("/de/invitations" is a 404, not the English page).
export function sectionLanguage(locale: string, section: string): Locale | undefined {
  return isLocale(locale) && OCCASION_SECTION[locale] === `/${section}` ? locale : undefined;
}

// The same occasion page (or the overview) in another language, for the
// language switcher. Paths are without locale prefix ("/einladung/hochzeit").
// null: not an occasion path - the caller keeps the path as it is. Two
// languages may share a section name (e.g. "/invitations" in English and
// French); the slug is then looked up in both.
export function translateOccasionPath(pathname: string, to: Locale): string | null {
  for (const section of new Set(Object.values(OCCASION_SECTION))) {
    if (pathname === section) return OCCASION_SECTION[to];
    if (!pathname.startsWith(`${section}/`)) continue;
    const slug = pathname.slice(section.length + 1);
    const languages = LOCALES.filter((locale) => OCCASION_SECTION[locale] === section);
    const entry = Object.values(OCCASION_SLUGS).find((slugs) => languages.some((locale) => slugs[locale] === slug));
    return entry ? `${OCCASION_SECTION[to]}/${entry[to]}` : OCCASION_SECTION[to];
  }
  return null;
}
