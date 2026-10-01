import { z } from "zod";
import { THEME_LABELS, type ThemeKey } from "@/lib/theme-presets";

// All input validation, shared by the forms (browser) and the API routes
// (server) so both always apply the same rules and German messages. Each
// validate* function returns { ok, value|data } or { ok: false, error } with
// the first problem found - the forms show exactly one message at a time.

export const NAME_MIN_LENGTH = 2;
export const NAME_MAX_LENGTH = 100;
export const BRINGING_DESCRIPTION_MAX_LENGTH = 1000;
export const MESSAGE_MAX_LENGTH = 1000;
export const MAX_ADDITIONAL_GUESTS = 30;
export const ARRIVAL_TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;
// Deliberately simple: something@something.tld, no spaces.
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EVENT_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const INVALID_EMAIL = "Bitte gib eine gültige E-Mail-Adresse ein.";

export type FieldResult<T> = { ok: true; value: T } | { ok: false; error: string };

function firstError(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Ungültige Eingabe.";
}

function toFieldResult<T>(result: z.ZodSafeParseResult<T>): FieldResult<T> {
  return result.success ? { ok: true, value: result.data } : { ok: false, error: firstError(result.error) };
}

// --- Request bodies and themes ----------------------------------------------

export const requestBodySchema = z.record(z.string(), z.unknown(), { error: "Ungültige Anfragedaten." });

export function validateRequestBody(body: unknown): FieldResult<Record<string, unknown>> {
  return toFieldResult(requestBodySchema.safeParse(body));
}

export const themeSchema = z.enum(Object.keys(THEME_LABELS) as [ThemeKey, ...ThemeKey[]], {
  error: "Ungültiges Theme.",
});

export function validateTheme(value: unknown): FieldResult<ThemeKey> {
  return toFieldResult(themeSchema.safeParse(value));
}

// --- Names and e-mail -------------------------------------------------------

function nameSchema(label: { empty: string; required: string; tooShort: string; tooLong: string }) {
  return z
    .string({ error: label.required })
    .trim()
    .min(1, label.empty)
    .min(NAME_MIN_LENGTH, label.tooShort)
    .max(NAME_MAX_LENGTH, label.tooLong);
}

const guestNameSchema = nameSchema({
  required: "Name ist erforderlich.",
  empty: "Name darf nicht leer sein.",
  tooShort: `Name muss mindestens ${NAME_MIN_LENGTH} Zeichen lang sein.`,
  tooLong: `Name darf höchstens ${NAME_MAX_LENGTH} Zeichen lang sein.`,
});

const additionalGuestNameSchema = nameSchema({
  required: "Namen der zusätzlichen Personen sind ungültig.",
  empty: "Namen der zusätzlichen Personen dürfen nicht leer sein.",
  tooShort: `Namen der zusätzlichen Personen müssen mindestens ${NAME_MIN_LENGTH} Zeichen lang sein.`,
  tooLong: `Namen der zusätzlichen Personen dürfen höchstens ${NAME_MAX_LENGTH} Zeichen lang sein.`,
});

// Registration form: same rules as a guest name, "required" wording.
export const personNameSchema = nameSchema({
  required: "Name ist erforderlich.",
  empty: "Name ist erforderlich.",
  tooShort: `Name muss mindestens ${NAME_MIN_LENGTH} Zeichen lang sein.`,
  tooLong: `Name darf höchstens ${NAME_MAX_LENGTH} Zeichen lang sein.`,
});

export function validatePersonName(value: unknown): FieldResult<string> {
  return toFieldResult(personNameSchema.safeParse(value));
}

export const emailSchema = z
  .string({ error: "E-Mail ist erforderlich." })
  .trim()
  .min(1, "E-Mail ist erforderlich.")
  .regex(EMAIL_PATTERN, INVALID_EMAIL);

export function validateEmail(value: unknown): FieldResult<string> {
  return toFieldResult(emailSchema.safeParse(value));
}

// --- Guest form --------------------------------------------------------------

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

export type ValidationResult = { ok: true; data: GuestInput } | { ok: false; error: string };

const ADDITIONAL_NOT_A_NUMBER = "Zusätzliche Personen müssen eine Zahl sein.";
const ADDITIONAL_NOT_WHOLE = "Zusätzliche Personen müssen eine ganze Zahl ab 0 sein.";

// The form sends the count as a string, API clients may send a number.
const additionalGuestsSchema = z
  .union(
    [z.number(), z.string().trim().min(1).transform(Number)],
    { error: ADDITIONAL_NOT_A_NUMBER },
  )
  .pipe(
    z
      .number({ error: ADDITIONAL_NOT_WHOLE })
      .int(ADDITIONAL_NOT_WHOLE)
      .min(0, ADDITIONAL_NOT_WHOLE)
      .max(MAX_ADDITIONAL_GUESTS, `Zusätzliche Personen dürfen höchstens ${MAX_ADDITIONAL_GUESTS} sein.`),
  );

const arrivalTimeSchema = z
  .string({ error: "Ankunftszeit ist erforderlich." })
  .trim()
  .min(1, "Ankunftszeit ist erforderlich.")
  .regex(ARRIVAL_TIME_PATTERN, "Ankunftszeit muss im Format HH:mm angegeben werden.");

const bringingDescriptionSchema = z
  .string({ error: "Bitte gib an, was du mitbringst." })
  .trim()
  .min(1, "Bitte gib an, was du mitbringst.")
  .max(BRINGING_DESCRIPTION_MAX_LENGTH, `Die Angabe darf höchstens ${BRINGING_DESCRIPTION_MAX_LENGTH} Zeichen lang sein.`);

const messageSchema = z
  .string({ error: "Bitte gib eine Nachricht ein." })
  .trim()
  .min(1, "Bitte gib eine Nachricht ein.")
  .max(MESSAGE_MAX_LENGTH, `Die Nachricht darf höchstens ${MESSAGE_MAX_LENGTH} Zeichen lang sein.`);

const guestBaseSchema = z.object(
  {
    name: guestNameSchema,
    additionalGuests: additionalGuestsSchema,
    additionalGuestNames: z.array(additionalGuestNameSchema, {
      error: "Namen der zusätzlichen Personen sind ungültig.",
    }),
    arrivalTime: arrivalTimeSchema,
    // Only an explicit true counts; the matching text is checked below.
    bringingSomething: z.unknown().transform((value) => value === true),
    bringingDescription: z.unknown(),
    hasMessage: z.unknown().transform((value) => value === true),
    message: z.unknown(),
  },
  { error: "Ungültige Anfragedaten." },
);

export const guestInputSchema = guestBaseSchema.transform((guest, ctx): GuestInput => {
  if (guest.additionalGuestNames.length !== guest.additionalGuests) {
    ctx.addIssue({
      code: "custom",
      message: "Anzahl der Namen muss der Anzahl zusätzlicher Personen entsprechen.",
    });
    return z.NEVER;
  }

  let bringingDescription: string | null = null;
  if (guest.bringingSomething) {
    const result = bringingDescriptionSchema.safeParse(guest.bringingDescription);
    if (!result.success) {
      ctx.addIssue({ code: "custom", message: firstError(result.error) });
      return z.NEVER;
    }
    bringingDescription = result.data;
  }

  let message: string | null = null;
  if (guest.hasMessage) {
    const result = messageSchema.safeParse(guest.message);
    if (!result.success) {
      ctx.addIssue({ code: "custom", message: firstError(result.error) });
      return z.NEVER;
    }
    message = result.data;
  }

  return {
    name: guest.name,
    additionalGuests: guest.additionalGuests,
    additionalGuestNames: guest.additionalGuestNames,
    arrivalTime: guest.arrivalTime,
    bringingSomething: guest.bringingSomething,
    bringingDescription,
    hasMessage: guest.hasMessage,
    message,
  };
});

export function validateGuestInput(body: unknown): ValidationResult {
  const result = guestInputSchema.safeParse(body);
  return result.success ? { ok: true, data: result.data } : { ok: false, error: firstError(result.error) };
}

// --- Event page fields ---------------------------------------------------------

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
  contactName: { label: "Kontaktname", maxLength: EVENT_TEXT_MAX_LENGTH, kind: "personName" },
  contactPhone: { label: "Telefonnummer", maxLength: EVENT_TEXT_MAX_LENGTH },
  contactEmail: { label: "E-Mail", maxLength: EVENT_TEXT_MAX_LENGTH, kind: "email" },
} as const satisfies Record<string, { label: string; maxLength: number; kind?: "personName" | "email" }>;

export type EventFieldKey = keyof typeof EVENT_FIELDS;

export function isEventFieldKey(key: string): key is EventFieldKey {
  return key in EVENT_FIELDS;
}

export type EventFieldValidationResult = FieldResult<string>;

function eventFieldSchema(key: EventFieldKey) {
  const field: { label: string; maxLength: number; kind?: "personName" | "email" } = EVENT_FIELDS[key];
  const base = z
    .string({ error: `${field.label} ist ungültig.` })
    .trim()
    .max(field.maxLength, `${field.label} darf höchstens ${field.maxLength} Zeichen lang sein.`);

  if (field.kind === "email") {
    return base.refine((value) => value === "" || EMAIL_PATTERN.test(value), INVALID_EMAIL);
  }
  if (field.kind === "personName") {
    return base.refine(
      (value) => value === "" || value.length >= NAME_MIN_LENGTH,
      `${field.label} muss mindestens ${NAME_MIN_LENGTH} Zeichen lang sein.`,
    );
  }
  return base;
}

export function validateEventField(key: EventFieldKey, rawValue: unknown): EventFieldValidationResult {
  return toFieldResult(eventFieldSchema(key).safeParse(rawValue));
}

// Creating an event: unlike the inline title field, a name is required.
export const newEventTitleSchema = z
  .string({ error: "Bitte gib einen Namen für dein Event ein." })
  .trim()
  .min(1, "Bitte gib einen Namen für dein Event ein.")
  .max(EVENT_TEXT_MAX_LENGTH, `Name darf höchstens ${EVENT_TEXT_MAX_LENGTH} Zeichen lang sein.`);

export function validateNewEventTitle(value: unknown): FieldResult<string> {
  return toFieldResult(newEventTitleSchema.safeParse(value));
}

export function normalizeArrivalTime(value: string): string {
  // Postgres TIME may come back as HH:mm:ss
  return value.slice(0, 5);
}

export function isUuid(value: string): boolean {
  return z.uuid().safeParse(value).success;
}

// --- Event date and time ---------------------------------------------------------

export type NullableFieldValidationResult = FieldResult<string | null>;

function isRealDate(value: string): boolean {
  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return parsed.getUTCFullYear() === year && parsed.getUTCMonth() === month - 1 && parsed.getUTCDate() === day;
}

// Event date/time fields are nullable (the owner may clear a date/time they
// already set) and use native <input type="date"/"time"> values, so an
// empty string is treated the same as null rather than rejected.
function nullableInput<T extends z.ZodType>(schema: T) {
  return z.preprocess((value) => (value === "" ? null : value), schema.nullable());
}

export const eventDateSchema = nullableInput(
  z
    .string({ error: "Datum ist ungültig." })
    .regex(EVENT_DATE_PATTERN, "Datum ist ungültig.")
    .refine(isRealDate, "Datum ist ungültig."),
);

export const eventTimeSchema = nullableInput(
  z.string({ error: "Uhrzeit ist ungültig." }).regex(ARRIVAL_TIME_PATTERN, "Uhrzeit ist ungültig."),
);

export function validateEventDate(rawValue: unknown): NullableFieldValidationResult {
  return toFieldResult(eventDateSchema.safeParse(rawValue));
}

export function validateEventTime(rawValue: unknown): NullableFieldValidationResult {
  return toFieldResult(eventTimeSchema.safeParse(rawValue));
}

export type EventSchedule = {
  eventDate: string | null;
  eventEndDate: string | null;
  eventStartTime: string | null;
  eventEndTime: string | null;
};

// The rules between the four fields: "bis" never before "von". An end date
// equal to the start date means a single-day event (stored as no end date).
// On a single day the end time must be later than the start time; when the
// event ends on a later day an earlier end time is fine (20:00 → 02:00).
// ISO dates and HH:mm times compare correctly as strings.
export const eventScheduleSchema = z
  .object({
    eventDate: z.string().nullable(),
    eventEndDate: z.string().nullable(),
    eventStartTime: z.string().nullable(),
    eventEndTime: z.string().nullable(),
  })
  .transform((schedule, ctx): EventSchedule => {
    const { eventDate, eventStartTime, eventEndTime } = schedule;
    const eventEndDate = schedule.eventEndDate === eventDate ? null : schedule.eventEndDate;

    if (eventEndDate && !eventDate) {
      ctx.addIssue({ code: "custom", message: "Bitte zuerst ein Startdatum wählen." });
      return z.NEVER;
    }
    if (eventEndDate && eventDate && eventEndDate < eventDate) {
      ctx.addIssue({ code: "custom", message: "Das Enddatum darf nicht vor dem Startdatum liegen." });
      return z.NEVER;
    }
    if (eventEndTime && !eventStartTime) {
      ctx.addIssue({ code: "custom", message: "Bitte zuerst eine Startzeit wählen." });
      return z.NEVER;
    }
    if (eventEndTime && eventStartTime && !eventEndDate && eventEndTime <= eventStartTime) {
      ctx.addIssue({ code: "custom", message: "Die Endzeit muss nach der Startzeit liegen." });
      return z.NEVER;
    }

    return { eventDate, eventEndDate, eventStartTime, eventEndTime };
  });

export function validateEventSchedule(schedule: EventSchedule): FieldResult<EventSchedule> {
  return toFieldResult(eventScheduleSchema.safeParse(schedule));
}
