import { COMPARISON, comparisonBreadcrumbs } from "@/lib/comparison";
import { LOCALES, type Locale } from "@/i18n/config";
import { faqEntries, type FaqItem } from "@/lib/faq";
import { localizedPath } from "@/lib/page-metadata";
import { LEGAL_INFO } from "@/lib/legal-info";
import { INSTAGRAM_URL, SITE_DESCRIPTIONS, SITE_NAME, SITE_URL } from "@/lib/site";
import {
  type Breadcrumb,
  hubBreadcrumbs,
  type Occasion,
  occasionBreadcrumbs,
  occasionPath,
  occasionsFor,
  occasionsHub,
  occasionsPath,
} from "@/lib/occasions";

// What GASTZILLA can do, in one line each - listed as featureList so
// search engines and AI assistants can tell what the app is for.
export const FEATURES = [
  "Digitale Einladungsseite für Geburtstag, Kindergeburtstag, Hochzeit, Grillabend oder Firmenfeier",
  "Gäste sagen über einen Link zu oder ab – ohne Konto und ohne App",
  "Terminabstimmung: 2–4 Terminvorschläge, Gäste stimmen per Link ab, der gewählte Termin wird mit einem Klick zur Gästeliste – mit fertiger Terminbestätigung zum Teilen (kostenpflichtiges Extra)",
  "Begleitpersonen, Kinder, Mitbringsel und Nachrichten direkt bei der Zusage",
  "Gästeliste in Echtzeit mit Benachrichtigung per E-Mail bei jeder Zu- und Absage",
  "Optionaler Passwortschutz für Event-Seite und Gästeliste – Gäste können das Passwort beim Gastgeber anfragen",
  "Teilen per WhatsApp, Signal, Telegram, E-Mail oder Link",
  "Designs für jeden Anlass: Farbdesigns kostenlos, dazu kostenpflichtige Premium-Designs",
  "Fertiger Einladungstext und Terminbestätigung mit Datum, Ort und Link – anpassbar, mit einem Klick kopierbar oder per WhatsApp, E-Mail & Co. teilbar",
  "Termin in den eigenen Kalender übernehmen",
  "Werbefrei, ohne Tracking-Cookies, Server in der EU",
  "Datensparsam: Event, Gästeliste und Abstimmung werden 90 Tage nach dem Event automatisch gelöscht",
];

// The same in English (start page /en). Keep both lists in step.
const FEATURES_EN = [
  "Online invitation page for a birthday, kids' party, wedding, barbecue or office party",
  "Guests reply yes or no via a link – no account and no app",
  "Date poll: 2–4 date options, guests vote via the link, the chosen date becomes the guest list with one click – with a ready-made date confirmation to share (paid extra)",
  "Plus-ones, children, things to bring and messages right in the reply",
  "Live guest list with an email for every yes and no",
  "Optional password protection for the event page and guest list – guests can ask the host for the password",
  "Share via WhatsApp, Signal, Telegram, email or link",
  "Designs for every occasion: colour designs for free, plus paid premium designs",
  "Ready-made invitation text and date confirmation with date, location and link – editable, copied with one click or shared via WhatsApp, email and more",
  "Add the date to your own calendar",
  "No ads, no tracking cookies, servers in the EU",
  "Data-minimal: event, guest list and poll are deleted automatically 90 days after the event",
];

// The same in Russian (start page /ru). Keep all lists in step.
const FEATURES_RU = [
  "Страница-приглашение онлайн на день рождения, детский праздник, свадьбу, шашлыки или корпоратив",
  "Гости отвечают «приду» или «не приду» по ссылке – без регистрации и без приложения",
  "Выбор даты: 2–4 варианта, гости голосуют по ссылке, выбранная дата одним кликом превращается в список гостей – с готовым сообщением о дате (платная опция)",
  "Сопровождающие, дети, что принести и сообщения – прямо в ответе гостя",
  "Список гостей в реальном времени с письмом на e-mail при каждом ответе",
  "Защита паролем для страницы мероприятия и списка гостей по желанию – гости могут запросить пароль у организатора",
  "Отправка через WhatsApp, Signal, Telegram, e-mail или ссылкой",
  "Оформление для любого повода: цветные дизайны бесплатно, а также платные премиум-дизайны",
  "Готовый текст приглашения и сообщение о дате с датой, местом и ссылкой – можно изменить, скопировать одним кликом или отправить через WhatsApp, e-mail и другие сервисы",
  "Добавление даты в свой календарь",
  "Без рекламы, без отслеживающих cookie, серверы в ЕС",
  "Минимум данных: мероприятие, список гостей и голосование удаляются автоматически через 90 дней после мероприятия",
];

const FEATURES_BY_LOCALE: Record<Locale, string[]> = { de: FEATURES, en: FEATURES_EN, ru: FEATURES_RU };

// What GASTZILLA deliberately does not do - stated openly on /vergleich and
// in llms.txt, so AI assistants don't recommend it for the wrong job.
export const LIMITATIONS = [
  "Keine Tickets, kein Bezahlen und keine Kostenteilung – GASTZILLA sammelt nur Zu- und Absagen",
  "Keine Tisch- oder Platzreservierung und kein Sitzplan",
  "Keine automatischen Erinnerungen an Gäste – Neuigkeiten teilst du selbst per Link",
  "Keine wiederkehrenden Termine – jedes Treffen ist ein eigenes Event",
  "Keine Obergrenze für Zusagen – volle Plätze werden nicht automatisch gesperrt",
  "Keine Team-Konten – ein Event verwaltet, wer es angelegt hat",
];

const ORGANIZATION_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;
const APP_ID = `${SITE_URL}/#app`;

function faqPage(items: FaqItem[], id: string, inLanguage: Locale = "de") {
  return {
    "@type": "FAQPage",
    "@id": id,
    inLanguage,
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

// Breadcrumb paths are without locale prefix (as the visible links);
// the schema needs the absolute URL in the page's language.
function breadcrumbList(items: Breadcrumb[], id: string, locale: Locale = "de") {
  return {
    "@type": "BreadcrumbList",
    "@id": id,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${localizedPath(item.path, locale)}`,
    })),
  };
}

// Who runs GASTZILLA - on the start page and "Über uns".
function organization() {
  return {
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: SITE_NAME,
    url: SITE_URL,
    logo: { "@type": "ImageObject", url: `${SITE_URL}/icon.png`, width: 512, height: 512 },
    email: LEGAL_INFO.email,
    founder: { "@type": "Person", name: LEGAL_INFO.name },
    address: { "@type": "PostalAddress", addressLocality: "Köln", addressCountry: "DE" },
    sameAs: [INSTAGRAM_URL],
  };
}

// schema.org description of the site for the start page: who runs it
// (Organization), the site itself (WebSite), the app (WebApplication) and
// the visible FAQ (FAQPage), linked to each other via @id.
export function siteStructuredData(locale: Locale) {
  const url = `${SITE_URL}${localizedPath("/", locale)}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      organization(),
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        name: SITE_NAME,
        url: SITE_URL,
        inLanguage: [...LOCALES],
        publisher: { "@id": ORGANIZATION_ID },
      },
      {
        "@type": "WebApplication",
        "@id": APP_ID,
        name: SITE_NAME,
        url,
        description: SITE_DESCRIPTIONS[locale],
        image: `${SITE_URL}${localizedPath("/opengraph-image", locale)}`,
        applicationCategory: "LifestyleApplication",
        operatingSystem: "Web",
        inLanguage: locale,
        isAccessibleForFree: true,
        featureList: FEATURES_BY_LOCALE[locale],
        offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
        publisher: { "@id": ORGANIZATION_ID },
      },
      faqPage(faqEntries(locale), `${url}#faq`, locale),
    ],
  };
}

// One occasion page (/einladung/<slug>, /en/invitations/<slug>): the page
// itself, its breadcrumb and its FAQ, tied to the site and the app
// described on the start page.
export function occasionStructuredData(occasion: Occasion) {
  const { locale } = occasion;
  const url = `${SITE_URL}${localizedPath(occasionPath(occasion), locale)}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: occasion.metaTitle,
        description: occasion.description,
        inLanguage: locale,
        dateModified: occasion.updated,
        isPartOf: { "@id": WEBSITE_ID },
        about: { "@id": APP_ID },
        breadcrumb: { "@id": `${url}#breadcrumb` },
      },
      breadcrumbList(occasionBreadcrumbs(occasion), `${url}#breadcrumb`, locale),
      faqPage(occasion.faq, `${url}#faq`, locale),
    ],
  };
}

// The overview page (/einladung, /en/invitations): a collection of all
// occasion pages of that language.
export function occasionsHubStructuredData(locale: Locale) {
  const url = `${SITE_URL}${localizedPath(occasionsPath(locale), locale)}`;
  const hub = occasionsHub(locale);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${url}#webpage`,
        url,
        name: hub.metaTitle,
        description: hub.description,
        inLanguage: locale,
        isPartOf: { "@id": WEBSITE_ID },
        breadcrumb: { "@id": `${url}#breadcrumb` },
        mainEntity: {
          "@type": "ItemList",
          itemListElement: occasionsFor(locale).map((occasion, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: occasion.name,
            url: `${SITE_URL}${localizedPath(occasionPath(occasion), locale)}`,
          })),
        },
      },
      breadcrumbList(hubBreadcrumbs(locale), `${url}#breadcrumb`, locale),
    ],
  };
}

// The comparison page (/vergleich): the page, its breadcrumb and its FAQ.
export function comparisonStructuredData() {
  const url = `${SITE_URL}${COMPARISON.path}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: COMPARISON.metaTitle,
        description: COMPARISON.description,
        inLanguage: "de",
        dateModified: COMPARISON.updated,
        isPartOf: { "@id": WEBSITE_ID },
        about: { "@id": APP_ID },
        breadcrumb: { "@id": `${url}#breadcrumb` },
      },
      breadcrumbList(comparisonBreadcrumbs(), `${url}#breadcrumb`),
      faqPage(COMPARISON.faq, `${url}#faq`),
    ],
  };
}

// "Über uns" (/about): an AboutPage whose subject is the organization.
export function aboutStructuredData({ updated }: { updated: string }) {
  const url = `${SITE_URL}/about`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "AboutPage",
        "@id": `${url}#webpage`,
        url,
        name: `Über uns – ${SITE_NAME}`,
        inLanguage: "de",
        dateModified: updated,
        isPartOf: { "@id": WEBSITE_ID },
        mainEntity: { "@id": ORGANIZATION_ID },
      },
      organization(),
    ],
  };
}
