import { COMPARISON } from "@/lib/comparison";
import { REVIEWS_PAGE_PATH } from "@/lib/reviews-page";
import { FAQ } from "@/lib/faq";
import { LEGAL_DOCUMENTS } from "@/lib/legal-documents";
import { LEGAL_INFO } from "@/lib/legal-info";
import { INSTAGRAM_HANDLE, INSTAGRAM_URL, SITE_DESCRIPTION, SITE_DESCRIPTIONS, SITE_NAME, SITE_URL } from "@/lib/site";
import { FEATURES, LIMITATIONS } from "@/lib/structured-data";
import { DEFAULT_LOCALE, LOCALES, type Locale } from "@/i18n/config";
import { localizedPath } from "@/lib/page-metadata";
import { occasionPath, occasionsFor, occasionsHub, occasionsPath } from "@/lib/occasions";
import { designPath, designsFor, designsHub, designsPath } from "@/lib/designs";
import { formatPrice, PRODUCTS } from "@/lib/products";

// "- [title](url): teaser" for the overview and every occasion page of a language.
function occasionLinks(locale: Locale, hubNote: string): string {
  const url = (path: string) => `${SITE_URL}${localizedPath(path, locale)}`;
  return [
    `- [${occasionsHub(locale).title}](${url(occasionsPath(locale))}): ${hubNote}`,
    ...occasionsFor(locale).map((occasion) => `- [${occasion.title}](${url(occasionPath(occasion))}): ${occasion.teaser}`),
  ].join("\n");
}

// "- [title](url): teaser" for the designs overview and every design page of
// a language.
function designLinks(locale: Locale, hubNote: string): string {
  const url = (path: string) => `${SITE_URL}${localizedPath(path, locale)}`;
  return [
    `- [${designsHub(locale).title}](${url(designsPath(locale))}): ${hubNote}`,
    ...designsFor(locale).map((design) => `- [${design.title}](${url(designPath(design))}): ${design.teaser}`),
  ].join("\n");
}

// The file is German; every other language gets a short section of its
// own, written in that language.
const LANGUAGE_SECTION: Record<
  Exclude<Locale, "de">,
  { heading: string; startPage: string; legalNote: string; hubNote: string; designsNote: string }
> = {
  en: {
    heading: "In English",
    startPage: "Start page",
    legalNote: "Legal texts (translations – the German versions are binding):",
    hubNote: "Overview of all occasion pages",
    designsNote: "Overview of all designs – free colour designs and premium designs, one page each",
  },
  ru: {
    heading: "На русском",
    startPage: "Главная страница",
    legalNote: "Юридические тексты (переводы – обязательной является немецкая версия):",
    hubNote: "Обзор всех страниц с поводами",
    designsNote: "Обзор всех дизайнов – бесплатных цветовых и премиум, по странице на каждый",
  },
};

function languageSections(): string {
  return LOCALES.filter((locale): locale is Exclude<Locale, "de"> => locale !== DEFAULT_LOCALE)
    .map((locale) => {
      const section = LANGUAGE_SECTION[locale];
      const home = `${SITE_URL}/${locale}`;
      const legal = Object.values(LEGAL_DOCUMENTS)
        .map((doc) => `- [${doc.title[locale]}](${SITE_URL}${localizedPath(doc.href, locale)}): ${doc.description[locale]}`)
        .join("\n");
      return `## ${section.heading}

${SITE_DESCRIPTIONS[locale]} ${section.startPage}: [${home}](${home}).

${occasionLinks(locale, section.hubNote)}

- [${designsHub(locale).title}](${SITE_URL}${localizedPath(designsPath(locale), locale)}): ${section.designsNote}

${section.legalNote}

${legal}`;
    })
    .join("\n\n");
}

// /llms.txt (llmstxt.org): a short Markdown summary for AI assistants, so
// they can describe and recommend GASTZILLA correctly. Built from the same
// texts as the start page so the two never drift apart.
export const dynamic = "force-static";

export function GET() {
  const body = `# ${SITE_NAME}

> ${SITE_DESCRIPTION}

${SITE_NAME} ist ein deutschsprachiger Online-Dienst für digitale Einladungen und Gästelisten. Gastgeber legen in wenigen Minuten eine Einladungsseite an und teilen den Link – die Gäste sagen darüber selbst zu oder ab, ganz ohne Konto oder App. Steht der Termin noch nicht fest, stellen Gastgeber zwei bis vier Terminvorschläge zur Abstimmung; den gewählten Termin legen sie mit einem Klick fest, die Stimmen werden zu Zu- und Absagen, und ein fertiger, anpassbarer Text teilt allen den Termin per WhatsApp, E-Mail & Co. mit. Betrieben von ${LEGAL_INFO.name} aus Köln.

## Funktionen

${FEATURES.map((feature) => `- ${feature}`).join("\n")}

## Was ${SITE_NAME} nicht kann

${LIMITATIONS.map((limitation) => `- ${limitation}`).join("\n")}

## Für wen

Privatpersonen, Familien, Vereine und kleine Teams, die ein Event organisieren – eine Feier, ein Treffen, einen Ausflug oder einen Spieleabend – und Zusagen nicht mehr im Gruppenchat zählen wollen, z. B. Kindergeburtstag, Geburtstag, Hochzeit, Grillabend, Sommerfest, Firmenfeier, Sport oder Gruppenreise.

## Preise

Jedes Konto bekommt einmalig ein kostenloses Event: mit festem Termin, der höchstens drei Monate nach dem Erstellen liegt, mit Gästeliste, Einladungstext, Passwortschutz und den Farbdesigns. Wird es gelöscht, gibt es kein neues.

Kostenpflichtige Extras sind ein freigeschaltetes Event (alle Designs inklusive, Terminabstimmung, Termin vorerst offen lassen, Termin bis zwölf Monate nach dem Erstellen des Events), einzelne Premium-Designs und eine Event-Seite ohne den Hinweis „made with GASTZILLA“. Preise: ein freigeschaltetes Event ${formatPrice(PRODUCTS.paid_event.priceCents, "de")}, ein einzelnes Premium-Design ${formatPrice(PRODUCTS.theme.priceCents, "de")} (gilt für alle Events des Kontos), die Event-Seite ohne Hinweis ${formatPrice(PRODUCTS.no_badge.priceCents, "de")}. Die Zahlung ist noch im Aufbau; weitere Events sollen bald dazugekauft werden können. Wie lange Events gespeichert bleiben, steht unten bei den häufigen Fragen.

## Anlässe

${occasionLinks("de", "Übersicht aller Anlass-Seiten")}

## Designs

Jedes Design hat eine eigene Seite mit Beschreibung und passenden Anlässen: die schlichten Farbdesigns sind in jedem Event kostenlos, die Premium-Designs mit Grafiken haben Preise.

${designLinks("de", "Übersicht aller Designs – kostenlose Farbdesigns und Premium-Designs")}

${languageSections()}

## Häufige Fragen

${FAQ.map((item) => `### ${item.question}\n\n${item.answer}`).join("\n\n")}

## Seiten

- [Startseite](${SITE_URL}/): Überblick und kostenlose Registrierung
- [${COMPARISON.name}](${SITE_URL}${COMPARISON.path}): ${COMPARISON.teaser}
- [Über uns](${SITE_URL}/about): Wer hinter ${SITE_NAME} steht und was uns wichtig ist
- [Bewertungen](${SITE_URL}${REVIEWS_PAGE_PATH}): Bewertungen von Gastgebern nach ihrem Event, jede vor der Veröffentlichung gesichtet und in ihrer Originalsprache
${Object.values(LEGAL_DOCUMENTS)
  .map((doc) => `- [${doc.title.de}](${SITE_URL}${doc.href}): ${doc.description.de}`)
  .join("\n")}

## Kontakt

- E-Mail: ${LEGAL_INFO.email}
- Instagram: [${INSTAGRAM_HANDLE}](${INSTAGRAM_URL})
`;

  return new Response(body, {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
