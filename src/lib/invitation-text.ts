// Invitation text the owner copies into WhatsApp, e-mail & co. (shown under
// the contact box on their event page). Event facts and the link come from
// the event and stay fixed; the wording around them is the owner's to edit
// and only lives in their browser. Kept free of React so it can be tested.

import type { Locale } from "@/i18n/config";
import { formatDateRangeLabel, formatTimeLabel } from "@/lib/calendar";
import { proposalSchedule, type DateMode, type Proposal } from "@/lib/date-poll";

export type InvitationFacts = {
  title: string;
  dateLabel: string;
  timeLabel: string;
  location: string;
  contactName: string;
  url: string;
  /** Password-protected event: shown right after the link; null = open. */
  password: string | null;
  /** Termin-Status: "unknown"/"poll" replace the date with a hint. */
  dateMode: DateMode;
};

export type InvitationWording = {
  greeting: string;
  intro: string;
  callToAction: string;
  closing: string;
};

export type WordingKey = keyof InvitationWording;

// Upper limit per editable line: room for a personal sentence, still short
// enough for a chat message.
export const WORDING_MAX_LENGTH: Record<WordingKey, number> = {
  greeting: 80,
  intro: 300,
  callToAction: 300,
  closing: 150,
};

// Two kinds of text with the same structure: the invitation itself, and the
// message after a date poll ("the date is fixed, complete your entries").
export type WordingKind = "invitation" | "dateFixed";

// Deliberately neutral - it has to fit a wedding as well as a football
// match. One set per language; the event's language picks it.
const WORDING: Record<Locale, Record<WordingKind, InvitationWording>> = {
  de: {
    invitation: {
      greeting: "Hallo zusammen,",
      intro: "ich lade euch herzlich ein:",
      callToAction: "Bitte sagt über diesen Link zu und tragt euch ein:",
      closing: "Ich freue mich auf euch!",
    },
    dateFixed: {
      greeting: "Hallo zusammen,",
      intro: "nach der Abstimmung haben wir uns gemeinsam für diesen Termin entschieden:",
      callToAction:
        "Bitte vervollständigt eure Angaben in der Gästeliste – z. B. Ankunftszeit, Begleitung oder Mitbringsel:",
      closing: "Ich freue mich auf euch!",
    },
  },
  en: {
    invitation: {
      greeting: "Hi everyone,",
      intro: "you're warmly invited:",
      callToAction: "Please reply and add yourself via this link:",
      closing: "Looking forward to seeing you!",
    },
    dateFixed: {
      greeting: "Hi everyone,",
      intro: "after the vote, we've picked this date together:",
      callToAction:
        "Please complete your details on the guest list – e.g. arrival time, plus-ones or things to bring:",
      closing: "Looking forward to seeing you!",
    },
  },
  ru: {
    invitation: {
      greeting: "Всем привет!",
      intro: "Приглашаю вас:",
      callToAction: "Пожалуйста, ответьте и запишитесь по этой ссылке:",
      closing: "Жду вас!",
    },
    dateFixed: {
      greeting: "Всем привет!",
      intro: "По итогам голосования мы вместе выбрали дату:",
      callToAction:
        "Пожалуйста, дополните свои данные в списке гостей – например, время прихода, сопровождающих или что вы принесёте:",
      closing: "Жду вас!",
    },
  },
};

export function wordingDefaults(locale: Locale): Record<WordingKind, InvitationWording> {
  return WORDING[locale];
}

// The fixed labels around the event facts.
const LABELS: Record<Locale, { when: string; where: string; password: string; dateFollows: string; voting: string }> = {
  de: {
    when: "Wann",
    where: "Wo",
    password: "Passwort für die Event-Seite",
    dateFollows: "Termin folgt",
    voting: "wird abgestimmt – bitte stimmt über den Link ab",
  },
  en: {
    when: "When",
    where: "Where",
    password: "Password for the event page",
    dateFollows: "date to follow",
    voting: "being voted on – please vote via the link",
  },
  ru: {
    when: "Когда",
    where: "Где",
    password: "Пароль для страницы мероприятия",
    dateFollows: "дата будет позже",
    voting: "идёт голосование – проголосуйте по ссылке",
  },
};

// Everything about the event except its date - what the owner's page passes
// down so the message after a poll can be built in the browser.
export type InvitationBase = Omit<InvitationFacts, "dateLabel" | "timeLabel" | "dateMode">;

// The event facts right after fixing a poll proposal - the page still shows
// the poll then, so date and time are taken from the proposal itself.
export function fixedDateFacts(base: InvitationBase, proposal: Proposal, locale: Locale): InvitationFacts {
  const schedule = proposalSchedule(proposal);
  return {
    ...base,
    dateMode: "fixed",
    dateLabel: formatDateRangeLabel(schedule.eventDate, schedule.eventEndDate, locale),
    timeLabel: formatTimeLabel(schedule.eventStartTime, schedule.eventEndTime, locale),
  };
}

export type InvitationLine =
  | { kind: "editable"; key: WordingKey }
  | { kind: "fixed"; text: string };

// The text's structure: editable wording around the fixed event facts.
// Facts that are not filled in are left out entirely; the link never is.
export function invitationLines(facts: InvitationFacts, locale: Locale): InvitationLine[] {
  const labels = LABELS[locale];
  const when =
    facts.dateMode === "unknown"
      ? labels.dateFollows
      : facts.dateMode === "poll"
        ? labels.voting
        : [facts.dateLabel, facts.timeLabel]
            .map((part) => part.trim())
            .filter(Boolean)
            .join(", ");

  const fixed = (text: string): InvitationLine[] =>
    text.trim() ? [{ kind: "fixed", text: text.trim() }] : [];

  return [
    { kind: "editable", key: "greeting" },
    { kind: "editable", key: "intro" },
    ...fixed(facts.title),
    ...(when ? fixed(`${labels.when}: ${when}`) : []),
    ...(facts.location.trim() ? fixed(`${labels.where}: ${facts.location.trim()}`) : []),
    { kind: "editable", key: "callToAction" },
    { kind: "fixed", text: facts.url },
    ...(facts.password ? fixed(`${labels.password}: ${facts.password}`) : []),
    { kind: "editable", key: "closing" },
    ...fixed(facts.contactName),
  ];
}

export function buildInvitationText(facts: InvitationFacts, wording: InvitationWording, locale: Locale): string {
  return invitationLines(facts, locale)
    .map((line) => (line.kind === "fixed" ? line.text : wording[line.key].trim()))
    .filter(Boolean)
    .join("\n");
}

// Reads the wording saved in localStorage; anything missing or broken falls
// back to the defaults, so a stale or hand-edited entry can't break the page.
export function parseStoredWording(
  raw: string | null,
  defaults: InvitationWording = WORDING.de.invitation,
): InvitationWording {
  if (!raw) return defaults;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return defaults;
    const stored = parsed as Record<string, unknown>;
    // Cut to the limit: older or hand-edited entries may be longer.
    const pick = (key: WordingKey) =>
      typeof stored[key] === "string" ? (stored[key] as string).slice(0, WORDING_MAX_LENGTH[key]) : defaults[key];
    return {
      greeting: pick("greeting"),
      intro: pick("intro"),
      callToAction: pick("callToAction"),
      closing: pick("closing"),
    };
  } catch {
    return defaults;
  }
}

export function wordingStorageKey(eventId: string, kind: WordingKind = "invitation"): string {
  return kind === "invitation"
    ? `gastzilla:invitation-wording:${eventId}`
    : `gastzilla:date-fixed-wording:${eventId}`;
}
