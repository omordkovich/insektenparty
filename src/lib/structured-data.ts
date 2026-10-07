import { FAQ, type FaqItem } from "@/lib/faq";
import { LEGAL_INFO } from "@/lib/legal-info";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import {
  type Breadcrumb,
  hubBreadcrumbs,
  type Occasion,
  occasionBreadcrumbs,
  occasionPath,
  OCCASIONS,
  OCCASIONS_HUB,
  OCCASIONS_PATH,
} from "@/lib/occasions";

// What GASTZILLA can do, in one line each - listed as featureList so
// search engines and AI assistants can tell what the app is for.
export const FEATURES = [
  "Digitale Einladungsseite für Geburtstag, Kindergeburtstag, Hochzeit, Grillabend oder Firmenfeier",
  "Gäste sagen über einen Link zu oder ab – ohne Konto und ohne App",
  "Begleitpersonen, Kinder, Mitbringsel und Nachrichten direkt bei der Zusage",
  "Gästeliste in Echtzeit mit Benachrichtigung per E-Mail",
  "Teilen per WhatsApp, Signal, Telegram, E-Mail oder Link",
  "Designs für verschiedene Anlässe",
  "Fertiger Einladungstext mit Datum, Ort und Link – anpassbar und mit einem Klick kopierbar",
  "Termin in den eigenen Kalender übernehmen",
  "Werbefrei, ohne Tracking-Cookies, Server in der EU",
];

const ORGANIZATION_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;
const APP_ID = `${SITE_URL}/#app`;

function faqPage(items: FaqItem[], id: string) {
  return {
    "@type": "FAQPage",
    "@id": id,
    inLanguage: "de",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

function breadcrumbList(items: Breadcrumb[], id: string) {
  return {
    "@type": "BreadcrumbList",
    "@id": id,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

// schema.org description of the site for the start page: who runs it
// (Organization), the site itself (WebSite), the app (WebApplication) and
// the visible FAQ (FAQPage), linked to each other via @id.
export function siteStructuredData() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": ORGANIZATION_ID,
        name: SITE_NAME,
        url: SITE_URL,
        logo: { "@type": "ImageObject", url: `${SITE_URL}/icon.png`, width: 512, height: 512 },
        email: LEGAL_INFO.email,
        founder: { "@type": "Person", name: LEGAL_INFO.name },
        address: { "@type": "PostalAddress", addressLocality: "Köln", addressCountry: "DE" },
      },
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        name: SITE_NAME,
        url: SITE_URL,
        inLanguage: "de",
        publisher: { "@id": ORGANIZATION_ID },
      },
      {
        "@type": "WebApplication",
        "@id": APP_ID,
        name: SITE_NAME,
        url: SITE_URL,
        description: SITE_DESCRIPTION,
        image: `${SITE_URL}/opengraph-image`,
        applicationCategory: "LifestyleApplication",
        operatingSystem: "Web",
        inLanguage: "de",
        isAccessibleForFree: true,
        featureList: FEATURES,
        offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
        publisher: { "@id": ORGANIZATION_ID },
      },
      faqPage(FAQ, `${SITE_URL}/#faq`),
    ],
  };
}

// One occasion page (/einladung/<slug>): the page itself, its breadcrumb
// and its FAQ, tied to the site and the app described on the start page.
export function occasionStructuredData(occasion: Occasion) {
  const url = `${SITE_URL}${occasionPath(occasion)}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: occasion.metaTitle,
        description: occasion.description,
        inLanguage: "de",
        dateModified: occasion.updated,
        isPartOf: { "@id": WEBSITE_ID },
        about: { "@id": APP_ID },
        breadcrumb: { "@id": `${url}#breadcrumb` },
      },
      breadcrumbList(occasionBreadcrumbs(occasion), `${url}#breadcrumb`),
      faqPage(occasion.faq, `${url}#faq`),
    ],
  };
}

// The overview page (/einladung): a collection of all occasion pages.
export function occasionsHubStructuredData() {
  const url = `${SITE_URL}${OCCASIONS_PATH}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${url}#webpage`,
        url,
        name: OCCASIONS_HUB.metaTitle,
        description: OCCASIONS_HUB.description,
        inLanguage: "de",
        isPartOf: { "@id": WEBSITE_ID },
        breadcrumb: { "@id": `${url}#breadcrumb` },
        mainEntity: {
          "@type": "ItemList",
          itemListElement: OCCASIONS.map((occasion, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: occasion.name,
            url: `${SITE_URL}${occasionPath(occasion)}`,
          })),
        },
      },
      breadcrumbList(hubBreadcrumbs(), `${url}#breadcrumb`),
    ],
  };
}
