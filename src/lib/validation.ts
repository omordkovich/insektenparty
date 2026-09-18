export const NAME_MAX_LENGTH = 100;
export const BRINGING_DESCRIPTION_MAX_LENGTH = 1000;
export const MESSAGE_MAX_LENGTH = 1000;
export const MAX_ADDITIONAL_GUESTS = 30;
export const ARRIVAL_TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

export type GuestInput = {
  name: string;
  additionalGuests: number;
  additionalGuestNames: string[];
  arrivalTime: string;
  bringingSomething: boolean;
  bringingDescription: string | null;
  hasMessage: boolean;
  message: string | null;
};

export type ValidationResult =
  | { ok: true; data: GuestInput }
  | { ok: false; error: string };

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function validateGuestInput(body: unknown): ValidationResult {
  if (!isPlainObject(body)) {
    return { ok: false, error: "Ungültige Anfragedaten." };
  }

  if (typeof body.name !== "string") {
    return { ok: false, error: "Name ist erforderlich." };
  }

  const name = body.name.trim();
  if (!name) {
    return { ok: false, error: "Name darf nicht leer sein." };
  }
  if (name.length > NAME_MAX_LENGTH) {
    return {
      ok: false,
      error: `Name darf höchstens ${NAME_MAX_LENGTH} Zeichen lang sein.`,
    };
  }

  const rawAdditional = body.additionalGuests;
  let additionalGuests: number;

  if (typeof rawAdditional === "number") {
    additionalGuests = rawAdditional;
  } else if (typeof rawAdditional === "string" && rawAdditional.trim() !== "") {
    additionalGuests = Number(rawAdditional);
  } else {
    return {
      ok: false,
      error: "Zusätzliche Personen müssen eine Zahl sein.",
    };
  }

  if (
    !Number.isInteger(additionalGuests) ||
    additionalGuests < 0 ||
    !Number.isFinite(additionalGuests)
  ) {
    return {
      ok: false,
      error: "Zusätzliche Personen müssen eine ganze Zahl ab 0 sein.",
    };
  }

  if (additionalGuests > MAX_ADDITIONAL_GUESTS) {
    return {
      ok: false,
      error: `Zusätzliche Personen dürfen höchstens ${MAX_ADDITIONAL_GUESTS} sein.`,
    };
  }

  const rawNames = body.additionalGuestNames;
  if (!Array.isArray(rawNames)) {
    return {
      ok: false,
      error: "Namen der zusätzlichen Personen sind ungültig.",
    };
  }
  if (rawNames.length !== additionalGuests) {
    return {
      ok: false,
      error:
        "Anzahl der Namen muss der Anzahl zusätzlicher Personen entsprechen.",
    };
  }
  const additionalGuestNames: string[] = [];
  for (const rawName of rawNames) {
    if (typeof rawName !== "string") {
      return {
        ok: false,
        error: "Namen der zusätzlichen Personen sind ungültig.",
      };
    }
    const trimmedName = rawName.trim();
    if (!trimmedName) {
      return {
        ok: false,
        error: "Namen der zusätzlichen Personen dürfen nicht leer sein.",
      };
    }
    if (trimmedName.length > NAME_MAX_LENGTH) {
      return {
        ok: false,
        error: `Namen der zusätzlichen Personen dürfen höchstens ${NAME_MAX_LENGTH} Zeichen lang sein.`,
      };
    }
    additionalGuestNames.push(trimmedName);
  }

  if (typeof body.arrivalTime !== "string") {
    return { ok: false, error: "Ankunftszeit ist erforderlich." };
  }

  const arrivalTime = body.arrivalTime.trim();
  if (!arrivalTime) {
    return { ok: false, error: "Ankunftszeit ist erforderlich." };
  }
  if (!ARRIVAL_TIME_PATTERN.test(arrivalTime)) {
    return {
      ok: false,
      error: "Ankunftszeit muss im Format HH:mm angegeben werden.",
    };
  }

  const bringingSomething = body.bringingSomething === true;

  let bringingDescription: string | null = null;
  if (bringingSomething) {
    if (typeof body.bringingDescription !== "string") {
      return { ok: false, error: "Bitte gib an, was du mitbringst." };
    }
    const trimmedDescription = body.bringingDescription.trim();
    if (!trimmedDescription) {
      return { ok: false, error: "Bitte gib an, was du mitbringst." };
    }
    if (trimmedDescription.length > BRINGING_DESCRIPTION_MAX_LENGTH) {
      return {
        ok: false,
        error: `Die Angabe darf höchstens ${BRINGING_DESCRIPTION_MAX_LENGTH} Zeichen lang sein.`,
      };
    }
    bringingDescription = trimmedDescription;
  }

  const hasMessage = body.hasMessage === true;

  let message: string | null = null;
  if (hasMessage) {
    if (typeof body.message !== "string") {
      return { ok: false, error: "Bitte gib eine Nachricht ein." };
    }
    const trimmedMessage = body.message.trim();
    if (!trimmedMessage) {
      return { ok: false, error: "Bitte gib eine Nachricht ein." };
    }
    if (trimmedMessage.length > MESSAGE_MAX_LENGTH) {
      return {
        ok: false,
        error: `Die Nachricht darf höchstens ${MESSAGE_MAX_LENGTH} Zeichen lang sein.`,
      };
    }
    message = trimmedMessage;
  }

  return {
    ok: true,
    data: {
      name,
      additionalGuests,
      additionalGuestNames,
      arrivalTime,
      bringingSomething,
      bringingDescription,
      hasMessage,
      message,
    },
  };
}

export const EVENT_TEXT_MAX_LENGTH = 200;
export const EVENT_GREETING_MAX_LENGTH = 1000;

// One entry per inline-editable field on an event's public page. Each field
// is saved independently (see EditableField.tsx), so validation is per-field
// rather than for a whole-event object - an empty value is always valid
// (that's the "not filled in yet" placeholder state).
export const EVENT_FIELDS = {
  kicker: { label: "Kicker", maxLength: EVENT_TEXT_MAX_LENGTH },
  title: { label: "Titel", maxLength: EVENT_TEXT_MAX_LENGTH },
  greeting: { label: "Begrüßungstext", maxLength: EVENT_GREETING_MAX_LENGTH },
  dateLabel: { label: "Datum", maxLength: EVENT_TEXT_MAX_LENGTH },
  timeLabel: { label: "Uhrzeit", maxLength: EVENT_TEXT_MAX_LENGTH },
  locationLabel: { label: "Ort", maxLength: EVENT_TEXT_MAX_LENGTH },
  contactName: { label: "Kontaktname", maxLength: EVENT_TEXT_MAX_LENGTH },
  contactPhone: { label: "Telefonnummer", maxLength: EVENT_TEXT_MAX_LENGTH },
  contactEmail: { label: "E-Mail", maxLength: EVENT_TEXT_MAX_LENGTH },
} as const;

export type EventFieldKey = keyof typeof EVENT_FIELDS;

export function isEventFieldKey(key: string): key is EventFieldKey {
  return key in EVENT_FIELDS;
}

export type EventFieldValidationResult =
  | { ok: true; value: string }
  | { ok: false; error: string };

export function validateEventField(
  key: EventFieldKey,
  rawValue: unknown,
): EventFieldValidationResult {
  const { label, maxLength } = EVENT_FIELDS[key];

  if (typeof rawValue !== "string") {
    return { ok: false, error: `${label} ist ungültig.` };
  }
  const trimmed = rawValue.trim();
  if (trimmed.length > maxLength) {
    return {
      ok: false,
      error: `${label} darf höchstens ${maxLength} Zeichen lang sein.`,
    };
  }
  return { ok: true, value: trimmed };
}

export function normalizeArrivalTime(value: string): string {
  // Postgres TIME may come back as HH:mm:ss
  return value.slice(0, 5);
}

export function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

const EVENT_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export type NullableFieldValidationResult =
  | { ok: true; value: string | null }
  | { ok: false; error: string };

// Event date/time fields are nullable (the owner may clear a date/time they
// already set) and use native <input type="date"/"time"> values, so an
// empty string is treated the same as null rather than rejected.
export function validateEventDate(rawValue: unknown): NullableFieldValidationResult {
  if (rawValue === null || rawValue === "") {
    return { ok: true, value: null };
  }
  if (typeof rawValue !== "string" || !EVENT_DATE_PATTERN.test(rawValue)) {
    return { ok: false, error: "Datum ist ungültig." };
  }
  const [year, month, day] = rawValue.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  const isRealDate =
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day;
  if (!isRealDate) {
    return { ok: false, error: "Datum ist ungültig." };
  }
  return { ok: true, value: rawValue };
}

export function validateEventTime(rawValue: unknown): NullableFieldValidationResult {
  if (rawValue === null || rawValue === "") {
    return { ok: true, value: null };
  }
  if (typeof rawValue !== "string" || !ARRIVAL_TIME_PATTERN.test(rawValue)) {
    return { ok: false, error: "Uhrzeit ist ungültig." };
  }
  return { ok: true, value: rawValue };
}
