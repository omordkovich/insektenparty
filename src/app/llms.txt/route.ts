import { FAQ } from "@/lib/faq";
import { LEGAL_DOCUMENTS } from "@/lib/legal-documents";
import { LEGAL_INFO } from "@/lib/legal-info";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import { FEATURES } from "@/lib/structured-data";
import { OCCASIONS, OCCASIONS_HUB, OCCASIONS_PATH, occasionPath } from "@/lib/occasions";

// /llms.txt (llmstxt.org): a short Markdown summary for AI assistants, so
// they can describe and recommend GASTZILLA correctly. Built from the same
// texts as the start page so the two never drift apart.
export const dynamic = "force-static";

export function GET() {
  const body = `# ${SITE_NAME}

> ${SITE_DESCRIPTION}

${SITE_NAME} ist ein deutschsprachiger Online-Dienst für digitale Einladungen und Gästelisten. Gastgeber legen in wenigen Minuten eine Einladungsseite an und teilen den Link – die Gäste sagen darüber selbst zu oder ab, ganz ohne Konto oder App. Betrieben von ${LEGAL_INFO.name} aus Köln.

## Funktionen

${FEATURES.map((feature) => `- ${feature}`).join("\n")}

## Für wen

Privatpersonen, Familien, Vereine und kleine Teams, die eine Feier organisieren und Zusagen nicht mehr im Gruppenchat zählen wollen – z. B. Kindergeburtstag, Geburtstag, Hochzeit, Grillabend, Sommerfest oder Firmenfeier.

## Preise

Ein Event mit allen Grundfunktionen ist kostenlos. Weitere Events und Premium-Designs sollen bald dazugekauft werden können.

## Anlässe

- [${OCCASIONS_HUB.title}](${SITE_URL}${OCCASIONS_PATH}): Übersicht aller Anlass-Seiten
${OCCASIONS.map((occasion) => `- [${occasion.title}](${SITE_URL}${occasionPath(occasion)}): ${occasion.teaser}`).join("\n")}

## Häufige Fragen

${FAQ.map((item) => `### ${item.question}\n\n${item.answer}`).join("\n\n")}

## Seiten

- [Startseite](${SITE_URL}/): Überblick und kostenlose Registrierung
- [Über uns](${SITE_URL}/about): Wer hinter ${SITE_NAME} steht und was uns wichtig ist
${Object.values(LEGAL_DOCUMENTS)
  .map((doc) => `- [${doc.title}](${SITE_URL}${doc.href}): ${doc.description}`)
  .join("\n")}

## Kontakt

${LEGAL_INFO.email}
`;

  return new Response(body, {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
