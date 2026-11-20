import { isLocale, LOCALES, type Locale } from "@/i18n/config";
import type { ThemeKey } from "@/lib/theme-presets";

// URLs of the design pages (src/lib/designs.ts) per language - kept apart
// from the page texts so client code (language switcher, unlock dialog) can
// build these links without loading every design's content. Never change a
// live slug without a redirect (next.config.ts).

// The overview page of each language; design pages live below it.
export const DESIGN_SECTION: Record<Locale, string> = { de: "/designs", en: "/designs", ru: "/dizajny" };

// Premium design -> slug per language (from the design's name there).
export const DESIGN_SLUGS: Partial<Record<ThemeKey, Record<Locale, string>>> = {
  ballons: { de: "ballons", en: "balloons", ru: "vozdushnye-shary" },
  foam: { de: "schaumparty", en: "foam-party", ru: "pennaya-vecherinka" },
  halloweenclay: { de: "halloween-knete", en: "halloween-clay", ru: "khellouin-plastilin" },
  halloweengraveyard: { de: "halloween-friedhof", en: "halloween-graveyard", ru: "khellouin-kladbishche" },
  halloweenkids: { de: "halloween-fuer-kinder", en: "halloween-kids", ru: "khellouin-dlya-detey" },
  christmaskids: { de: "weihnachten-fuer-kinder", en: "christmas-kids", ru: "rozhdestvo-dlya-detey" },
  christmassnow: { de: "weihnachtsschnee", en: "christmas-snow", ru: "rozhdestvenskiy-sneg" },
  artdeco: { de: "art-deco", en: "art-deco", ru: "ar-deko" },
  disco: { de: "disco", en: "disco", ru: "disko" },
  hippie: { de: "hippie", en: "hippie", ru: "khippi" },
  newyear: { de: "silvester", en: "new-year", ru: "novyy-god" },
  birthdaypresents: { de: "geburtstagsgeschenke", en: "birthday-presents", ru: "podarki" },
  birthdayprincess: { de: "prinzessin", en: "birthday-princess", ru: "printsessa" },
  penandpaper: { de: "rollenspiel", en: "pen-and-paper", ru: "rolevye-igry" },
  magic: { de: "zauberei", en: "magic", ru: "magiya" },
  pirates: { de: "piraten", en: "pirates", ru: "piraty" },
  pirateskids: { de: "piraten-fuer-kinder", en: "pirates-kids", ru: "piraty-dlya-detey" },
  teddy: { de: "teddybaer", en: "teddy-bear", ru: "mishka" },
  cinema: { de: "kino", en: "cinema", ru: "kino" },
  tarot: { de: "tarot", en: "tarot", ru: "taro" },
  karnaval: { de: "karneval", en: "carnival", ru: "karnaval" },
  pride: { de: "pride", en: "pride", ru: "prayd" },
  dinosaurier: { de: "dinosaurier", en: "dinosaurs", ru: "dinozavry" },
  weltall: { de: "weltall", en: "space", ru: "kosmos" },
  einschulung: { de: "einschulung", en: "first-day-of-school", ru: "pervyy-den-v-shkole" },
  ninja: { de: "ninja", en: "ninja", ru: "nindzya" },
  fussball: { de: "fussball", en: "football", ru: "futbol" },
  toycars: { de: "spielzeugautos", en: "toy-cars", ru: "mashinki" },
  hochzeit: { de: "hochzeit", en: "wedding", ru: "svadba" },
  brettspiele: { de: "brettspiele", en: "board-games", ru: "nastolnye-igry" },
  bowling: { de: "bowling", en: "bowling", ru: "bouling" },
  hawaii: { de: "hawaii", en: "hawaii", ru: "gavayi" },
  natur: { de: "natur", en: "nature", ru: "priroda" },
};

export function designSectionPath(locale: Locale): string {
  return DESIGN_SECTION[locale];
}

// The design page of a theme in a language, without locale prefix.
// undefined: a free colour design (it has no page).
export function designSlugPath(theme: ThemeKey, locale: Locale): string | undefined {
  const slug = DESIGN_SLUGS[theme]?.[locale];
  return slug ? `${DESIGN_SECTION[locale]}/${slug}` : undefined;
}

// The language a [locale]/[section] route serves as design section: only a
// language's own section name counts ("/ru/designs" is a 404).
export function designSectionLanguage(locale: string, section: string): Locale | undefined {
  return isLocale(locale) && DESIGN_SECTION[locale] === `/${section}` ? locale : undefined;
}

// The same design page (or the overview) in another language, for the
// language switcher. Paths are without locale prefix. null: not a design
// path. German and English share "/designs"; the slug is looked up in both.
export function translateDesignPath(pathname: string, to: Locale): string | null {
  for (const section of new Set(Object.values(DESIGN_SECTION))) {
    if (pathname === section) return DESIGN_SECTION[to];
    if (!pathname.startsWith(`${section}/`)) continue;
    const slug = pathname.slice(section.length + 1);
    const languages = LOCALES.filter((locale) => DESIGN_SECTION[locale] === section);
    const entry = Object.values(DESIGN_SLUGS).find((slugs) => languages.some((locale) => slugs[locale] === slug));
    return entry ? `${DESIGN_SECTION[to]}/${entry[to]}` : DESIGN_SECTION[to];
  }
  return null;
}
