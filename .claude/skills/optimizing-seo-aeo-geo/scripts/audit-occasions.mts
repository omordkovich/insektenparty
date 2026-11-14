// Cross-occasion content audit (run from the repo root):
//   npx tsx .claude/skills/optimizing-seo-aeo-geo/scripts/audit-occasions.mts
// Finds what the unit tests can't: wording duplicated across occasions.
// Relative on purpose: this file is not covered by the TypeScript config, so the
// IDE can't resolve the "@/" alias here.
// noinspection ES6PreferShortImport
import { occasionsFor } from "../../../../src/lib/occasions";
// noinspection ES6PreferShortImport
import { OCCASION_ICON_VERSIONS } from "../../../../src/lib/occasion-icons";
// noinspection ES6PreferShortImport
import { LOCALES } from "../../../../src/i18n/config";

const problems: string[] = [];
const duplicates = (label: string, items: [string, string][]) => {
  const seen = new Map<string, string>();
  for (const [text, id] of items) {
    const key = text.trim().toLowerCase();
    if (seen.has(key)) problems.push(`${label} doppelt: "${text}" (${seen.get(key)} + ${id})`);
    else seen.set(key, id);
  }
};

// Each language on its own: the same wording in two languages is fine.
for (const locale of LOCALES) {
  const OCCASIONS = occasionsFor(locale);
  const tag = (id: string) => `${locale}/${id}`;
  duplicates("Titel", OCCASIONS.map((o) => [o.metaTitle, tag(o.id)]));
  duplicates("Beschreibung", OCCASIONS.map((o) => [o.description, tag(o.id)]));
  duplicates("H1", OCCASIONS.map((o) => [o.title, tag(o.id)]));
  duplicates("Vorteil", OCCASIONS.flatMap((o) => o.benefits.map((b) => [b.title, tag(o.id)] as [string, string])));
  duplicates("FAQ", OCCASIONS.flatMap((o) => o.faq.map((f) => [f.question, tag(o.id)] as [string, string])));

  for (const o of OCCASIONS) {
    if (o.description.length > 160) problems.push(`${tag(o.id)}: Beschreibung ${o.description.length} > 160 Zeichen`);
    if (o.metaTitle.length > 65) problems.push(`${tag(o.id)}: metaTitle ${o.metaTitle.length} Zeichen (wird abgeschnitten)`);
    if (!OCCASION_ICON_VERSIONS[o.id]) problems.push(`${tag(o.id)}: keine Icon-Version in occasion-icons.ts`);
  }
}

console.log(problems.length ? problems.join("\n") : `OK – ${occasionsFor("de").length} Anlässe je Sprache (${LOCALES.join(", ")}), keine Doppelungen`);
process.exitCode = problems.length ? 1 : 0;
