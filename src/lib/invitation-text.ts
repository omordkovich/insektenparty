// Invitation text the owner copies into WhatsApp, e-mail & co. (shown under
// the contact box on their event page). Event facts and the link come from
// the event and stay fixed; the wording around them is the owner's to edit
// and only lives in their browser. Kept free of React so it can be tested.

export type InvitationFacts = {
  title: string;
  dateLabel: string;
  timeLabel: string;
  location: string;
  contactName: string;
  url: string;
  /** Password-protected event: shown right after the link; null = open. */
  password: string | null;
};

export type InvitationWording = {
  greeting: string;
  intro: string;
  callToAction: string;
  closing: string;
};

export type WordingKey = keyof InvitationWording;

// Deliberately neutral - it has to fit a wedding as well as a football match.
export const DEFAULT_WORDING: InvitationWording = {
  greeting: "Hallo zusammen,",
  intro: "ich lade euch herzlich ein:",
  callToAction: "Bitte sagt über diesen Link zu und tragt euch ein:",
  closing: "Ich freue mich auf euch!",
};

export type InvitationLine =
  | { kind: "editable"; key: WordingKey }
  | { kind: "fixed"; text: string };

// The text's structure: editable wording around the fixed event facts.
// Facts that are not filled in are left out entirely; the link never is.
export function invitationLines(facts: InvitationFacts): InvitationLine[] {
  const when = [facts.dateLabel, facts.timeLabel]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(", ");

  const fixed = (text: string): InvitationLine[] =>
    text.trim() ? [{ kind: "fixed", text: text.trim() }] : [];

  return [
    { kind: "editable", key: "greeting" },
    { kind: "editable", key: "intro" },
    ...fixed(facts.title),
    ...(when ? fixed(`Wann: ${when}`) : []),
    ...(facts.location.trim() ? fixed(`Wo: ${facts.location.trim()}`) : []),
    { kind: "editable", key: "callToAction" },
    { kind: "fixed", text: facts.url },
    ...(facts.password ? fixed(`Passwort für die Event-Seite: ${facts.password}`) : []),
    { kind: "editable", key: "closing" },
    ...fixed(facts.contactName),
  ];
}

export function buildInvitationText(facts: InvitationFacts, wording: InvitationWording): string {
  return invitationLines(facts)
    .map((line) => (line.kind === "fixed" ? line.text : wording[line.key].trim()))
    .filter(Boolean)
    .join("\n");
}

// Reads the wording saved in localStorage; anything missing or broken falls
// back to the defaults, so a stale or hand-edited entry can't break the page.
export function parseStoredWording(raw: string | null): InvitationWording {
  if (!raw) return DEFAULT_WORDING;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return DEFAULT_WORDING;
    const stored = parsed as Record<string, unknown>;
    const pick = (key: WordingKey) =>
      typeof stored[key] === "string" ? (stored[key] as string) : DEFAULT_WORDING[key];
    return {
      greeting: pick("greeting"),
      intro: pick("intro"),
      callToAction: pick("callToAction"),
      closing: pick("closing"),
    };
  } catch {
    return DEFAULT_WORDING;
  }
}

export function wordingStorageKey(eventId: string): string {
  return `gastzilla:invitation-wording:${eventId}`;
}
