import { LOCALES, type Locale } from "@/i18n/config";
import { DESIGN_SECTION, DESIGN_SLUGS, designSlugPath } from "@/lib/design-slugs";
import { DESIGNS_DE } from "@/lib/designs-de";
import { DESIGNS_EN, DESIGNS_HUB_EN } from "@/lib/designs-en";
import { DESIGNS_HUB_RU, DESIGNS_RU } from "@/lib/designs-ru";
import type { Breadcrumb } from "@/lib/occasions";
import { formatPrice, PRODUCTS } from "@/lib/products";
import { isPremiumTheme, THEME_LABELS, themeLabel, type ThemeKey } from "@/lib/theme-presets";

// Public page per design (/designs/<slug>, /en/designs/<slug>,
// /ru/dizajny/<slug>): shown in the design's own theme, with a short
// description, fitting occasions and how to get it: premium designs are
// bought, the colour designs are free in every event. Texts per language in designs-de/-en/-ru.ts.

export type DesignContent = {
  theme: ThemeKey;
  /** <title>, ends with "– GASTZILLA", <= 60 characters. */
  metaTitle: string;
  /** Meta description, 70-160 characters. */
  metaDescription: string;
  /** The page's H1: the design's name plus what people search for. */
  title: string;
  /** One sentence for the overview card and llms.txt. */
  teaser: string;
  /** 1-2 paragraphs: what the design looks like, what it suits. */
  description: string[];
  /** YYYY-MM-DD of the last content change. */
  updated: string;
};

export type Design = DesignContent & {
  locale: Locale;
  slug: string;
  /** The design's name as the theme picker shows it. */
  name: string;
  occasionIds: string[];
  /** A colour design: in every event, nothing to unlock. */
  free: boolean;
};

export type DesignsHub = { title: string; metaTitle: string; description: string; intro: string };

// Occasions (ids from OCCASION_SLUGS) a design suits, the same in every
// language. Shown as links on the design page.
export const DESIGN_OCCASIONS: Partial<Record<ThemeKey, string[]>> = {
  weiss: ["wedding", "christening", "funeral", "family-celebration"],
  schwarz: ["funeral", "new-years-eve", "halloween-party", "company-party"],
  gruen: ["barbecue", "sports-together", "group-travel", "family-celebration"],
  blau: ["oktoberfest", "group-travel", "culture-outing", "rehearsal"],
  rot: ["advent-party", "carnival-party", "going-out", "birthday"],
  pink: ["baby-shower", "bachelor-party", "kids-birthday", "birthday"],
  orange: ["halloween-party", "barbecue", "school-events", "kids-playdate"],
  gelb: ["kids-birthday", "kids-playdate", "school-start", "barbecue"],
  ballons: ["birthday", "new-years-eve", "company-party", "family-celebration"],
  foam: ["kids-birthday", "theme-party", "birthday"],
  halloweenclay: ["halloween-party", "kids-birthday", "theme-party"],
  halloweengraveyard: ["halloween-party", "theme-party"],
  halloweenkids: ["halloween-party", "kids-birthday", "kids-playdate"],
  christmaskids: ["advent-party", "school-events", "family-celebration"],
  christmassnow: ["advent-party", "company-party", "family-celebration"],
  artdeco: ["theme-party", "new-years-eve", "wedding", "birthday"],
  disco: ["theme-party", "birthday", "going-out", "graduation"],
  hippie: ["theme-party", "birthday", "barbecue"],
  newyear: ["new-years-eve", "company-party", "going-out"],
  birthdaypresents: ["birthday", "kids-birthday", "family-celebration"],
  birthdayprincess: ["kids-birthday", "kids-playdate", "theme-party"],
  penandpaper: ["tabletop-night", "gaming-night"],
  magic: ["kids-birthday", "theme-party", "tabletop-night"],
  pirates: ["theme-party", "birthday", "bachelor-party"],
  pirateskids: ["kids-birthday", "kids-playdate"],
  teddy: ["baby-shower", "kids-birthday", "christening", "kids-playdate"],
  cinema: ["culture-outing", "going-out", "birthday", "theme-party"],
  tarot: ["theme-party", "halloween-party", "bachelor-party"],
  karnaval: ["carnival-party", "theme-party", "school-events"],
  pride: ["theme-party", "going-out", "birthday"],
  dinosaurier: ["kids-birthday", "kids-playdate"],
  weltall: ["kids-birthday", "theme-party", "school-events"],
  einschulung: ["school-start", "school-events", "family-celebration"],
  ninja: ["kids-birthday", "kids-playdate", "sports-together"],
  fussball: ["sports-together", "kids-birthday", "barbecue"],
  toycars: ["kids-birthday", "kids-playdate"],
  hochzeit: ["wedding", "bachelor-party", "family-celebration"],
  brettspiele: ["tabletop-night", "family-celebration"],
  bowling: ["sports-together", "going-out", "company-party", "kids-birthday"],
  hawaii: ["barbecue", "theme-party", "birthday"],
  gaming: ["gaming-night", "birthday", "kids-birthday", "theme-party"],
  kerzenweiss: ["funeral", "family-celebration"],
  kerzenschwarz: ["funeral", "family-celebration"],
  natur: ["barbecue", "family-celebration", "wedding", "birthday"],
};

const themePrice = formatPrice(PRODUCTS.theme.priceCents, "de");
const eventPrice = formatPrice(PRODUCTS.paid_event.priceCents, "de");

const DESIGNS_HUB_DE: DesignsHub = {
  title: "Designs für deine Online-Einladung",
  metaTitle: "Einladungs-Designs für jeden Anlass – GASTZILLA",
  description: `Kostenlose Farbdesigns und Premium-Designs für deine Online-Einladung: Halloween, Kindergeburtstag, Hochzeit und mehr – einzeln ${themePrice}.`,
  intro: `Farbdesigns sind in jedem Event kostenlos. Ein Premium-Design schaltest du einzeln für ${themePrice} frei – oder du schaltest für ${eventPrice} ein ganzes Event frei, dann sind alle Designs dabei.`,
};

const BREADCRUMB_NAMES: Record<Locale, { home: string; hub: string }> = {
  de: { home: "Startseite", hub: "Designs" },
  en: { home: "Home", hub: "Designs" },
  ru: { home: "Главная", hub: "Дизайны" },
};

function withLanguage(list: DesignContent[], locale: Locale): Design[] {
  const byTheme = new Map(list.map((content) => [content.theme, content]));
  return (Object.keys(THEME_LABELS) as ThemeKey[]).flatMap((theme) => {
    const content = byTheme.get(theme);
    const slug = DESIGN_SLUGS[theme]?.[locale];
    if (!content || !slug) return [];
    return [
      {
        ...content,
        locale,
        slug,
        name: themeLabel(theme, locale),
        occasionIds: DESIGN_OCCASIONS[theme] ?? [],
        free: !isPremiumTheme(theme),
      },
    ];
  });
}

const DESIGNS_BY_LOCALE: Record<Locale, Design[]> = {
  de: withLanguage(DESIGNS_DE, "de"),
  en: withLanguage(DESIGNS_EN, "en"),
  ru: withLanguage(DESIGNS_RU, "ru"),
};

const HUB_BY_LOCALE: Record<Locale, DesignsHub> = { de: DESIGNS_HUB_DE, en: DESIGNS_HUB_EN, ru: DESIGNS_HUB_RU };

// In picker order (THEME_LABELS): the colour designs first.
export function designsFor(locale: Locale): Design[] {
  return DESIGNS_BY_LOCALE[locale];
}

export function designsHub(locale: Locale): DesignsHub {
  return HUB_BY_LOCALE[locale];
}

// Overview page of a language, without locale prefix.
export function designsPath(locale: Locale): string {
  return DESIGN_SECTION[locale];
}

export function designPath(design: Design): string {
  return `${DESIGN_SECTION[design.locale]}/${design.slug}`;
}

// undefined for a free colour design (it has no page).
export const designPathFor = designSlugPath;

export function getDesign(theme: ThemeKey, locale: Locale): Design | undefined {
  return designsFor(locale).find((design) => design.theme === theme);
}

// Designs made for an occasion (DESIGN_OCCASIONS read backwards) - the
// occasion pages link to them. In picker order.
export function designsForOccasion(occasionId: string, locale: Locale): Design[] {
  return designsFor(locale).filter((design) => design.occasionIds.includes(occasionId));
}

export function getDesignBySlug(slug: string, locale: Locale): Design | undefined {
  return designsFor(locale).find((design) => design.slug === slug);
}

// The same design in every language (hreflang, sitemap).
export function designAlternates(theme: ThemeKey): Record<Locale, string> {
  return Object.fromEntries(LOCALES.map((locale) => [locale, designPathFor(theme, locale) ?? DESIGN_SECTION[locale]])) as Record<
    Locale,
    string
  >;
}

// Static params of the design routes (src/app/[locale]/[section]).
export function designRouteParams() {
  const hubs = LOCALES.map((locale) => ({ locale, section: DESIGN_SECTION[locale].slice(1) }));
  const pages = hubs.flatMap((hub) => designsFor(hub.locale).map((design) => ({ ...hub, slug: design.slug })));
  return { hubs, pages };
}

// Shared by the visible breadcrumb navigation and the BreadcrumbList schema.
export function designsHubBreadcrumbs(locale: Locale): Breadcrumb[] {
  const names = BREADCRUMB_NAMES[locale];
  return [
    { name: names.home, path: "/" },
    { name: names.hub, path: DESIGN_SECTION[locale] },
  ];
}

export function designBreadcrumbs(design: Design): Breadcrumb[] {
  return [...designsHubBreadcrumbs(design.locale), { name: design.name, path: designPath(design) }];
}

// The overview page changes whenever one of its designs does.
export function latestDesignUpdate(locale: Locale): string {
  return designsFor(locale).map((design) => design.updated).sort().at(-1) ?? "";
}
