// Cross-occasion content audit (run from the repo root):
//   npx tsx .claude/skills/optimizing-seo-aeo-geo/scripts/audit-occasions.mts
// Finds what the unit tests can't: wording duplicated across occasions.
import { OCCASIONS } from "@/lib/occasions";
import { OCCASION_ICON_VERSIONS } from "@/lib/occasion-icons";

const problems: string[] = [];
const duplicates = (label: string, items: [string, string][]) => {
  const seen = new Map<string, string>();
  for (const [text, id] of items) {
    const key = text.trim().toLowerCase();
    if (seen.has(key)) problems.push(`${label} doppelt: "${text}" (${seen.get(key)} + ${id})`);
    else seen.set(key, id);
  }
};

duplicates("Titel", OCCASIONS.map((o) => [o.metaTitle, o.id]));
duplicates("Beschreibung", OCCASIONS.map((o) => [o.description, o.id]));
duplicates("H1", OCCASIONS.map((o) => [o.title, o.id]));
duplicates("Vorteil", OCCASIONS.flatMap((o) => o.benefits.map((b) => [b.title, o.id] as [string, string])));
duplicates("FAQ", OCCASIONS.flatMap((o) => o.faq.map((f) => [f.question, o.id] as [string, string])));

for (const o of OCCASIONS) {
  if (o.description.length > 160) problems.push(`${o.id}: Beschreibung ${o.description.length} > 160 Zeichen`);
  if (o.metaTitle.length > 65) problems.push(`${o.id}: metaTitle ${o.metaTitle.length} Zeichen (wird abgeschnitten)`);
  if (!OCCASION_ICON_VERSIONS[o.id]) problems.push(`${o.id}: keine Icon-Version in occasion-icons.ts`);
}

console.log(problems.length ? problems.join("\n") : `OK – ${OCCASIONS.length} Anlässe, keine Doppelungen`);
process.exitCode = problems.length ? 1 : 0;
