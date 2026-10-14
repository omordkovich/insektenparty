import { COMPARISON } from "@/lib/comparison";
import { FAQ } from "@/lib/faq";
import { LEGAL_DOCUMENTS } from "@/lib/legal-documents";
import { LEGAL_INFO } from "@/lib/legal-info";
import { INSTAGRAM_HANDLE, INSTAGRAM_URL, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import { FEATURES, LIMITATIONS } from "@/lib/structured-data";
import { OCCASIONS, OCCASIONS_HUB, OCCASIONS_PATH, occasionPath } from "@/lib/occasions";

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

Ein Event mit allen Grundfunktionen ist kostenlos. Weitere Events und Premium-Designs sollen bald dazugekauft werden können.

## Anlässe

- [${OCCASIONS_HUB.title}](${SITE_URL}${OCCASIONS_PATH}): Übersicht aller Anlass-Seiten
${OCCASIONS.map((occasion) => `- [${occasion.title}](${SITE_URL}${occasionPath(occasion)}): ${occasion.teaser}`).join("\n")}

## Häufige Fragen

${FAQ.map((item) => `### ${item.question}\n\n${item.answer}`).join("\n\n")}

## Seiten

- [Startseite](${SITE_URL}/): Überblick und kostenlose Registrierung
- [${COMPARISON.name}](${SITE_URL}${COMPARISON.path}): ${COMPARISON.teaser}
- [Über uns](${SITE_URL}/about): Wer hinter ${SITE_NAME} steht und was uns wichtig ist
${Object.values(LEGAL_DOCUMENTS)
  .map((doc) => `- [${doc.title}](${SITE_URL}${doc.href}): ${doc.description}`)
  .join("\n")}

## Kontakt

- E-Mail: ${LEGAL_INFO.email}
- Instagram: [${INSTAGRAM_HANDLE}](${INSTAGRAM_URL})
`;

  return new Response(body, {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
