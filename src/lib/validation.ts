import { LOCALES, type Locale } from "@/i18n/config";
import { err, type ErrorKey, type ErrorMessage } from "@/i18n/errors";
import { z } from "zod";
import { proposalSchedule, type Proposal } from "@/lib/date-poll";
import { MAX_GUEST_CAPACITY } from "@/lib/guest-capacity";
import { THEME_LABELS, type ThemeKey } from "@/lib/theme-presets";

// All input validation, shared by the forms (browser) and the API routes
// (server) so both always apply the same rules and messages. Each
// validate* function returns { ok, value|data } or { ok: false, error } with
// the first problem found - the forms show exactly one message at a time.

export const NAME_MIN_LENGTH = 2;
export const NAME_MAX_LENGTH = 100;
export const BRINGING_DESCRIPTION_MAX_LENGTH = 1000;
export const MESSAGE_MAX_LENGTH = 1000;
export const REVIEW_TEXT_MIN_LENGTH = 20;
export const REVIEW_TEXT_MAX_LENGTH = 200;
export const MAX_ADDITIONAL_GUESTS = 30;
export const ARRIVAL_TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;
// Deliberately simple: something@something.tld, no spaces.
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EVENT_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const INVALID_EMAIL = msg("invalidEmail");

export type FieldResult<T> = { ok: true; value: T } | { ok: false; error: ErrorMessage };

// Zod messages carry an ErrorMessage as JSON (see msg); firstError turns the
// first one back. Zod's own messages (no custom one set) count as "invalid".
function msg(key: ErrorKey, values?: ErrorMessage["values"]): string {
  return JSON.stringify(err(key, values));
}

function firstError(error: z.ZodError): ErrorMessage {
  const raw = error.issues[0]?.message;
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    if (parsed && typeof parsed === "object" && typeof (parsed as ErrorMessage).key === "string") {
      return parsed as ErrorMessage;
    }
  } catch {
    // not one of ours
  }
  return err("invalidInput");
}

function toFieldResult<T>(result: z.ZodSafeParseResult<T>): FieldResult<T> {
  return result.success ? { ok: true, value: result.data } : { ok: false, error: firstError(result.error) };
}

// --- Request bodies and themes ----------------------------------------------

export const requestBodySchema = z.record(z.string(), z.unknown(), { error: msg("invalidRequest") });

export function validateRequestBody(body: unknown): FieldResult<Record<string, unknown>> {
  return toFieldResult(requestBodySchema.safeParse(body));
}

export const themeSchema = z.enum(Object.keys(THEME_LABELS) as [ThemeKey, ...ThemeKey[]], {
  error: msg("invalidTheme"),
});

export function validateTheme(value: unknown): FieldResult<ThemeKey> {
  return toFieldResult(themeSchema.safeParse(value));
}

export const eventLanguageSchema = z.enum(LOCALES, { error: msg("invalidLanguage") });

export function validateEventLanguage(value: unknown): FieldResult<Locale> {
  return toFieldResult(eventLanguageSchema.safeParse(value));
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
  required: msg("nameRequired"),
  empty: msg("nameEmpty"),
  tooShort: msg("nameTooShort", { min: NAME_MIN_LENGTH }),
  tooLong: msg("nameTooLong", { max: NAME_MAX_LENGTH }),
});

const additionalGuestNameSchema = nameSchema({
  required: msg("companionNamesInvalid"),
  empty: msg("companionNameEmpty"),
  tooShort: msg("companionNameTooShort", { min: NAME_MIN_LENGTH }),
  tooLong: msg("companionNameTooLong", { max: NAME_MAX_LENGTH }),
});

// Display name (registration form, "Mein Konto", ConsentDialog): same length
// rules as a guest name.
export const personNameSchema = nameSchema({
  required: msg("displayNameRequired"),
  empty: msg("displayNameRequired"),
  tooShort: msg("displayNameTooShort", { min: NAME_MIN_LENGTH }),
  tooLong: msg("displayNameTooLong", { max: NAME_MAX_LENGTH }),
});

export function validatePersonName(value: unknown): FieldResult<string> {
  return toFieldResult(personNameSchema.safeParse(value));
}

export const emailSchema = z
  .string({ error: msg("emailRequired") })
  .trim()
  .min(1, msg("emailRequired"))
  .regex(EMAIL_PATTERN, INVALID_EMAIL);

export function validateEmail(value: unknown): FieldResult<string> {
  return toFieldResult(emailSchema.safeParse(value));
}

// --- Guest form --------------------------------------------------------------

export type GuestInput = {
  name: string;
  additionalGuests: number;
  additionalGuestNames: string[];
  /** Null only for a declined guest. */
  arrivalTime: string | null;
  /** Optional end of the arrival window ("von – bis"); null = only "von". */
  arrivalEndTime: string | null;
  /** Optional "Ich bleibe bis" window; both null when not given. */
  departureTime: string | null;
  departureEndTime: string | null;
  bringingSomething: boolean;
  bringingDescription: string | null;
  hasMessage: boolean;
  message: string | null;
  /** "Ich sage ab": everything about coming is then empty (see declinedGuestSchema). */
  declined: boolean;
};

export type ValidationResult = { ok: true; data: GuestInput } | { ok: false; error: ErrorMessage };

const ADDITIONAL_NOT_A_NUMBER = msg("companionsNotANumber");
const ADDITIONAL_NOT_WHOLE = msg("companionsNotWhole");

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
      .max(MAX_ADDITIONAL_GUESTS, msg("companionsTooMany", { max: MAX_ADDITIONAL_GUESTS })),
  );

// Optional time: missing or empty means "not given". In a "von – bis"
// window an earlier "bis" means it runs past midnight (22:00 – 01:00), so
// only equality is rejected (see guestInputSchema).
function optionalTimeSchema(formatError: string) {
  return z.preprocess(
    (value) => (value === undefined || (typeof value === "string" && value.trim() === "") ? null : value),
    z.string({ error: formatError }).trim().regex(ARRIVAL_TIME_PATTERN, formatError).nullable(),
  );
}

// The arrival is optional: guests who don't know it yet leave it empty.
const arrivalTimeSchema = optionalTimeSchema(msg("arrivalFormat"));
const arrivalEndTimeSchema = optionalTimeSchema(msg("arrivalEndFormat"));
const DEPARTURE_FORMAT_ERROR = msg("departureFormat");
const departureTimeSchema = optionalTimeSchema(DEPARTURE_FORMAT_ERROR);

const bringingDescriptionSchema = z
  .string({ error: msg("bringingRequired") })
  .trim()
  .min(1, msg("bringingRequired"))
  .max(BRINGING_DESCRIPTION_MAX_LENGTH, msg("detailTooLong", { max: BRINGING_DESCRIPTION_MAX_LENGTH }));

const messageSchema = z
  .string({ error: msg("messageRequired") })
  .trim()
  .min(1, msg("messageRequired"))
  .max(MESSAGE_MAX_LENGTH, msg("messageTooLong", { max: MESSAGE_MAX_LENGTH }));

const guestBaseSchema = z.object(
  {
    name: guestNameSchema,
    additionalGuests: additionalGuestsSchema,
    additionalGuestNames: z.array(additionalGuestNameSchema, {
      error: msg("companionNamesInvalid"),
    }),
    // Checked below: "Weiß ich noch nicht" greys them out and saves none.
    arrivalTime: z.unknown().optional(),
    arrivalEndTime: z.unknown().optional(),
    arrivalUnknown: z
      .unknown()
      .optional()
      .transform((value) => value === true),
    departureTime: departureTimeSchema,
    departureEndTime: departureTimeSchema,
    // Only an explicit true counts; the matching text is checked below.
    bringingSomething: z.unknown().transform((value) => value === true),
    bringingDescription: z.unknown(),
    hasMessage: z.unknown().transform((value) => value === true),
    message: z.unknown(),
  },
  { error: msg("invalidRequest") },
);

// Text that is only required when its checkbox is ticked; null otherwise.
function optionalText(
  enabled: boolean,
  value: unknown,
  schema: z.ZodType<string>,
  ctx: z.RefinementCtx,
): string | null | typeof z.NEVER {
  if (!enabled) return null;
  const result = schema.safeParse(value);
  if (!result.success) {
    ctx.addIssue({ code: "custom", message: JSON.stringify(firstError(result.error)) });
    return z.NEVER;
  }
  return result.data;
}

export const guestInputSchema = guestBaseSchema.transform((guest, ctx): GuestInput => {
  if (guest.additionalGuestNames.length !== guest.additionalGuests) {
    ctx.addIssue({
      code: "custom",
      message: msg("companionCountMismatch"),
    });
    return z.NEVER;
  }

  let arrivalTime: string | null = null;
  let arrivalEndTime: string | null = null;
  if (!guest.arrivalUnknown) {
    const start = arrivalTimeSchema.safeParse(guest.arrivalTime);
    if (!start.success) {
      ctx.addIssue({ code: "custom", message: JSON.stringify(firstError(start.error)) });
      return z.NEVER;
    }
    const end = arrivalEndTimeSchema.safeParse(guest.arrivalEndTime);
    if (!end.success) {
      ctx.addIssue({ code: "custom", message: JSON.stringify(firstError(end.error)) });
      return z.NEVER;
    }
    arrivalTime = start.data;
    arrivalEndTime = end.data;
    if (arrivalEndTime && !arrivalTime) {
      ctx.addIssue({ code: "custom", message: msg("arrivalStartFirst") });
      return z.NEVER;
    }
    if (arrivalEndTime && arrivalEndTime === arrivalTime) {
      ctx.addIssue({ code: "custom", message: msg("arrivalSameTimes") });
      return z.NEVER;
    }
  }

  if (guest.departureEndTime && !guest.departureTime) {
    ctx.addIssue({ code: "custom", message: msg("departureStartFirst") });
    return z.NEVER;
  }
  if (guest.departureEndTime && guest.departureEndTime === guest.departureTime) {
    ctx.addIssue({ code: "custom", message: msg("departureSameTimes") });
    return z.NEVER;
  }

  const bringingDescription = optionalText(
    guest.bringingSomething,
    guest.bringingDescription,
    bringingDescriptionSchema,
    ctx,
  );
  if (bringingDescription === z.NEVER) return z.NEVER;

  const message = optionalText(guest.hasMessage, guest.message, messageSchema, ctx);
  if (message === z.NEVER) return z.NEVER;

  return {
    name: guest.name,
    additionalGuests: guest.additionalGuests,
    additionalGuestNames: guest.additionalGuestNames,
    arrivalTime,
    arrivalEndTime,
    departureTime: guest.departureTime,
    departureEndTime: guest.departureEndTime,
    bringingSomething: guest.bringingSomething,
    bringingDescription,
    hasMessage: guest.hasMessage,
    message,
    declined: false,
  };
});

// "Ich sage ab": the form greys out times, extra people and "Ich bringe was
// mit", so whatever they still hold is ignored (never blocks the save) and
// stored empty. Only the name and an optional message count.
export const declinedGuestSchema = z
  .object(
    {
      name: guestNameSchema,
      hasMessage: z.unknown().transform((value) => value === true),
      message: z.unknown(),
    },
    { error: msg("invalidRequest") },
  )
  .transform((guest, ctx): GuestInput => {
    const message = optionalText(guest.hasMessage, guest.message, messageSchema, ctx);
    if (message === z.NEVER) return z.NEVER;

    return {
      name: guest.name,
      additionalGuests: 0,
      additionalGuestNames: [],
      arrivalTime: null,
      arrivalEndTime: null,
      departureTime: null,
      departureEndTime: null,
      bringingSomething: false,
      bringingDescription: null,
      hasMessage: guest.hasMessage,
      message,
      declined: true,
    };
  });

// Like the checkboxes, only an explicit true counts.
function isDeclined(body: unknown): boolean {
  return typeof body === "object" && body !== null && (body as { declined?: unknown }).declined === true;
}

export function validateGuestInput(body: unknown): ValidationResult {
  const schema = isDeclined(body) ? declinedGuestSchema : guestInputSchema;
  const result = schema.safeParse(body);
  return result.success ? { ok: true, data: result.data } : { ok: false, error: firstError(result.error) };
}

// --- Event password ("Passwortgeschützt") ------------------------------------------

export const EVENT_PASSWORD_MIN_LENGTH = 4;
export const EVENT_PASSWORD_MAX_LENGTH = 100;

// Deliberately soft: a shared password the owner sends around with the
// invitation link, not an account password (see lib/password.ts).
const eventPasswordSchema = z
  .string({ error: msg("eventPasswordRequired") })
  .trim()
  .min(EVENT_PASSWORD_MIN_LENGTH, msg("eventPasswordTooShort", { min: EVENT_PASSWORD_MIN_LENGTH }))
  .max(EVENT_PASSWORD_MAX_LENGTH, msg("eventPasswordTooLong", { max: EVENT_PASSWORD_MAX_LENGTH }));

// Saving an event: null switches the protection off.
export function validateAccessPassword(value: unknown): FieldResult<string | null> {
  return toFieldResult(eventPasswordSchema.nullable().safeParse(value));
}

// The dialog's "Passwort" + "Passwort wiederholen".
export function validateEventPasswordPair(password: string, repeat: string): FieldResult<string> {
  const result = toFieldResult(eventPasswordSchema.safeParse(password));
  if (!result.ok) return result;
  if (result.value !== repeat.trim()) {
    return { ok: false, error: err("passwordsDontMatch") };
  }
  return result;
}

// --- Password request (locked event page) --------------------------------------------

export const PASSWORD_REQUEST_MESSAGE_MAX_LENGTH = 500;
export const PASSWORD_REQUEST_OTHER_MAX_LENGTH = 100;
export const PHONE_CHANNELS = ["sms", "whatsapp", "telegram", "other"] as const;
export type PhoneChannel = (typeof PHONE_CHANNELS)[number];
export const PHONE_CHANNEL_LABELS: Record<PhoneChannel, string> = {
  sms: "SMS",
  whatsapp: "WhatsApp",
  telegram: "Telegram",
  other: "Sonstiges",
};

export type PasswordRequestContact =
  | { kind: "email"; email: string }
  | { kind: "phone"; phone: string; channel: PhoneChannel; channelOther: string | null };

export type PasswordRequestInput = {
  name: string;
  contact: PasswordRequestContact;
  message: string | null;
};

const INVALID_PHONE = msg("phoneInvalid");

// Loose on purpose: digits plus the usual separators, 6-20 digits.
const phoneSchema = z
  .string({ error: INVALID_PHONE })
  .trim()
  .regex(/^\+?[\d\s\-/()]+$/, INVALID_PHONE)
  .refine((value) => {
    const digits = value.replace(/\D/g, "").length;
    return digits >= 6 && digits <= 20;
  }, INVALID_PHONE);

const channelOtherSchema = z
  .string({ error: msg("passwordWayRequired") })
  .trim()
  .min(1, msg("passwordWayRequired"))
  .max(PASSWORD_REQUEST_OTHER_MAX_LENGTH, msg("detailTooLong", { max: PASSWORD_REQUEST_OTHER_MAX_LENGTH }));

const requestMessageSchema = z.preprocess(
  (value) => (value === undefined || value === null || (typeof value === "string" && value.trim() === "") ? null : value),
  z
    .string({ error: msg("messageInvalid") })
    .trim()
    .max(PASSWORD_REQUEST_MESSAGE_MAX_LENGTH, msg("messageTooLong", { max: PASSWORD_REQUEST_MESSAGE_MAX_LENGTH }))
    .nullable(),
);

function isPhoneChannel(value: unknown): value is PhoneChannel {
  return (PHONE_CHANNELS as readonly unknown[]).includes(value);
}

// The form sends flat fields; only the chosen contact way is checked.
export const passwordRequestSchema = z
  .object(
    {
      name: guestNameSchema,
      // Only the fields of the chosen contact way are sent.
      contactKind: z.unknown().optional(),
      email: z.unknown().optional(),
      phone: z.unknown().optional(),
      channel: z.unknown().optional(),
      channelOther: z.unknown().optional(),
      message: requestMessageSchema,
    },
    { error: msg("invalidRequest") },
  )
  .transform((request, ctx): PasswordRequestInput => {
    const fail = (message: string) => {
      ctx.addIssue({ code: "custom", message });
      return z.NEVER;
    };

    let contact: PasswordRequestContact;
    if (request.contactKind === "email") {
      const email = emailSchema.safeParse(request.email);
      if (!email.success) return fail(JSON.stringify(firstError(email.error)));
      contact = { kind: "email", email: email.data };
    } else if (request.contactKind === "phone") {
      const phone = phoneSchema.safeParse(request.phone);
      if (!phone.success) return fail(JSON.stringify(firstError(phone.error)));
      const channel = request.channel;
      if (!isPhoneChannel(channel)) {
        return fail(msg("phoneChannelRequired"));
      }
      let channelOther: string | null = null;
      if (channel === "other") {
        const other = channelOtherSchema.safeParse(request.channelOther);
        if (!other.success) return fail(JSON.stringify(firstError(other.error)));
        channelOther = other.data;
      }
      contact = { kind: "phone", phone: phone.data, channel, channelOther };
    } else {
      return fail(msg("contactKindRequired"));
    }

    return { name: request.name, contact, message: request.message };
  });

export function validatePasswordRequest(body: unknown): FieldResult<PasswordRequestInput> {
  return toFieldResult(passwordRequestSchema.safeParse(body));
}

// --- Event page fields ---------------------------------------------------------

export const EVENT_TEXT_MAX_LENGTH = 200;
export const EVENT_GREETING_MAX_LENGTH = 1000;

// One entry per inline-editable field on an event's public page. Each field
// is saved independently (see EditableField.tsx), so validation is per-field
// rather than for a whole-event object - an empty value is always valid
// (that's the "not filled in yet" placeholder state).
export const EVENT_FIELDS = {
  kicker: { maxLength: EVENT_TEXT_MAX_LENGTH },
  title: { maxLength: EVENT_TEXT_MAX_LENGTH },
  greeting: { maxLength: EVENT_GREETING_MAX_LENGTH },
  dateLabel: { maxLength: EVENT_TEXT_MAX_LENGTH },
  timeLabel: { maxLength: EVENT_TEXT_MAX_LENGTH },
  locationLabel: { maxLength: EVENT_TEXT_MAX_LENGTH },
  contactName: { maxLength: EVENT_TEXT_MAX_LENGTH, kind: "personName" },
  contactPhone: { maxLength: EVENT_TEXT_MAX_LENGTH },
  contactEmail: { maxLength: EVENT_TEXT_MAX_LENGTH, kind: "email" },
} as const satisfies Record<string, { maxLength: number; kind?: "personName" | "email" }>;

export type EventFieldKey = keyof typeof EVENT_FIELDS;

export function isEventFieldKey(key: string): key is EventFieldKey {
  return key in EVENT_FIELDS;
}

export type EventFieldValidationResult = FieldResult<string>;

function eventFieldSchema(key: EventFieldKey) {
  const field: { maxLength: number; kind?: "personName" | "email" } = EVENT_FIELDS[key];
  const base = z
    .string({ error: msg("fieldInvalid", { field: key }) })
    .trim()
    .max(field.maxLength, msg("fieldTooLong", { field: key, max: field.maxLength }));

  if (field.kind === "email") {
    return base.refine((value) => value === "" || EMAIL_PATTERN.test(value), INVALID_EMAIL);
  }
  if (field.kind === "personName") {
    return base.refine(
      (value) => value === "" || value.length >= NAME_MIN_LENGTH,
      msg("fieldTooShort", { field: key, min: NAME_MIN_LENGTH }),
    );
  }
  return base;
}

export function validateEventField(key: EventFieldKey, rawValue: unknown): EventFieldValidationResult {
  return toFieldResult(eventFieldSchema(key).safeParse(rawValue));
}

// Creating an event: unlike the inline title field, a name is required.
export const newEventTitleSchema = z
  .string({ error: msg("eventNameRequired") })
  .trim()
  .min(1, msg("eventNameRequired"))
  .max(EVENT_TEXT_MAX_LENGTH, msg("nameTooLong", { max: EVENT_TEXT_MAX_LENGTH }));

export function validateNewEventTitle(value: unknown): FieldResult<string> {
  return toFieldResult(newEventTitleSchema.safeParse(value));
}

// Guest list display of a "von – bis" window (arrival, departure):
// "zw. 09:30 und 10:30" with an end, "09:30" without.
const TIME_WINDOW: Record<Locale, (start: string, end: string) => string> = {
  de: (start, end) => `zw. ${start} und ${end}`,
  en: (start, end) => `between ${start} and ${end}`,
  ru: (start, end) => `с ${start} до ${end}`,
};

export function formatTimeWindow(start: string, end: string | null, locale: Locale): string {
  if (!end) return start;
  return TIME_WINDOW[locale](start, end);
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
    .string({ error: msg("fieldInvalid", { field: "dateLabel" }) })
    .regex(EVENT_DATE_PATTERN, msg("fieldInvalid", { field: "dateLabel" }))
    .refine(isRealDate, msg("fieldInvalid", { field: "dateLabel" })),
);

export const eventTimeSchema = nullableInput(
  z.string({ error: msg("fieldInvalid", { field: "timeLabel" }) }).regex(ARRIVAL_TIME_PATTERN, msg("fieldInvalid", { field: "timeLabel" })),
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
      ctx.addIssue({ code: "custom", message: msg("startDateFirst") });
      return z.NEVER;
    }
    if (eventEndDate && eventDate && eventEndDate < eventDate) {
      ctx.addIssue({ code: "custom", message: msg("endDateBeforeStart") });
      return z.NEVER;
    }
    if (eventEndTime && !eventStartTime) {
      ctx.addIssue({ code: "custom", message: msg("startTimeFirst") });
      return z.NEVER;
    }
    if (eventEndTime && eventStartTime && !eventEndDate && eventEndTime <= eventStartTime) {
      ctx.addIssue({ code: "custom", message: msg("endTimeBeforeStart") });
      return z.NEVER;
    }

    return { eventDate, eventEndDate, eventStartTime, eventEndTime };
  });

export function validateEventSchedule(schedule: EventSchedule): FieldResult<EventSchedule> {
  return toFieldResult(eventScheduleSchema.safeParse(schedule));
}

// --- Date poll (Terminabstimmung) ------------------------------------------------------

const PROPOSAL_DATE_ERROR = msg("proposalDateInvalid");
const END_WITHOUT_START_ERROR = err("proposalEndWithoutStart");

const proposalSchema = z.object(
  {
    date: z
      .string({ error: PROPOSAL_DATE_ERROR })
      .regex(EVENT_DATE_PATTERN, PROPOSAL_DATE_ERROR)
      .refine(isRealDate, PROPOSAL_DATE_ERROR),
    // The time is optional - a proposal may be just a day.
    startTime: optionalTimeSchema(msg("proposalStartFormat")).optional(),
    endTime: optionalTimeSchema(msg("proposalEndFormat")).optional(),
  },
  { error: msg("proposalInvalid") },
);

function parseProposal(raw: unknown): FieldResult<Proposal> {
  const result = proposalSchema.safeParse(raw);
  if (!result.success) return { ok: false, error: firstError(result.error) };
  const proposal = {
    date: result.data.date,
    startTime: result.data.startTime ?? null,
    endTime: result.data.endTime ?? null,
  };
  if (proposal.endTime && !proposal.startTime) return { ok: false, error: END_WITHOUT_START_ERROR };
  return { ok: true, value: proposal };
}

// A new poll needs 2-4 proposals, added ones are checked against the
// existing proposals too. An end before the start means "until after
// midnight" (see proposalSchedule), so only equality is rejected.
export function validateProposals(
  raw: unknown,
  options: { today: string; min: number; max: number; existing?: Proposal[] },
): FieldResult<Proposal[]> {
  if (!Array.isArray(raw)) return { ok: false, error: err("proposalsInvalid") };
  if (raw.length < options.min) {
    return {
      ok: false,
      error: err("proposalsTooFew", { min: options.min }),
    };
  }
  if (raw.length > options.max) {
    return { ok: false, error: err("proposalsTooMany", { max: options.max }) };
  }

  const proposals: Proposal[] = [];
  for (const item of raw) {
    const result = parseProposal(item);
    if (!result.ok) return result;
    const proposal = result.value;
    if (proposal.date < options.today) {
      return { ok: false, error: err("proposalInPast") };
    }
    if (proposal.startTime && proposal.endTime === proposal.startTime) {
      return { ok: false, error: err("proposalSameTimes") };
    }
    const taken = [...(options.existing ?? []), ...proposals];
    if (taken.some((other) => other.date === proposal.date && other.startTime === proposal.startTime)) {
      return { ok: false, error: err("proposalDuplicate") };
    }
    proposals.push(proposal);
  }
  return { ok: true, value: proposals };
}

// "Fester Termin" in the date dialog: a date is required, the time is
// optional; an optional end date makes it an event over several days (an
// end date equal to the start date means a single day). Neither day may lie
// before `today`; with `latest` (the plan's window) neither may lie after it -
// the service checks the window itself, the form may pass it too.
export const DATE_IN_PAST_ERROR = err("dateInPast");

export function validateFixedDate(
  raw: unknown,
  options: { today: string; latest?: string; latestError?: ErrorMessage },
): FieldResult<{ proposal: Proposal; endDate: string | null; schedule: EventSchedule }> {
  const value = (raw ?? {}) as { date?: unknown; endDate?: unknown; startTime?: unknown; endTime?: unknown };
  if (typeof value.date !== "string" || value.date.trim() === "") {
    return { ok: false, error: err("dateRequired") };
  }
  const result = parseProposal({ date: value.date, startTime: value.startTime, endTime: value.endTime });
  if (!result.ok) return result;
  const proposal = result.value;

  let endDate: string | null = null;
  if (typeof value.endDate === "string" && value.endDate.trim() !== "" && value.endDate !== proposal.date) {
    if (!EVENT_DATE_PATTERN.test(value.endDate) || !isRealDate(value.endDate)) {
      return { ok: false, error: err("endDateInvalid") };
    }
    endDate = value.endDate;
  }

  const days = endDate ? [proposal.date, endDate] : [proposal.date];
  if (days.some((day) => day < options.today)) return { ok: false, error: DATE_IN_PAST_ERROR };
  if (options.latest !== undefined && days.some((day) => day > options.latest!)) {
    return { ok: false, error: options.latestError ?? err("dateTooFar") };
  }

  if (!endDate && proposal.startTime && proposal.endTime === proposal.startTime) {
    return { ok: false, error: err("endTimeBeforeStart") };
  }
  const schedule = validateEventSchedule(
    endDate
      ? { eventDate: proposal.date, eventEndDate: endDate, eventStartTime: proposal.startTime, eventEndTime: proposal.endTime }
      : proposalSchedule(proposal),
  );
  return schedule.ok ? { ok: true, value: { proposal, endDate, schedule: schedule.value } } : schedule;
}

export type PollVoteInput = { name: string; optionIds: string[]; noneFit: boolean };

const pollVoteSchema = z.object(
  {
    name: guestNameSchema,
    optionIds: z.array(z.string(), { error: msg("voteSelectionInvalid") }).optional(),
    noneFit: z
      .unknown()
      .optional()
      .transform((value) => value === true),
  },
  { error: msg("invalidRequest") },
);

export function validatePollVote(body: unknown, allowedOptionIds: string[]): FieldResult<PollVoteInput> {
  const result = pollVoteSchema.safeParse(body);
  if (!result.success) return { ok: false, error: firstError(result.error) };
  const optionIds = [...new Set(result.data.optionIds ?? [])];
  if (optionIds.some((id) => !allowedOptionIds.includes(id))) {
    return { ok: false, error: err("voteSelectionInvalid") };
  }
  if (result.data.noneFit && optionIds.length > 0) {
    return { ok: false, error: err("voteNoneWithDate") };
  }
  if (!result.data.noneFit && optionIds.length === 0) {
    return { ok: false, error: err("voteEmpty") };
  }
  return { ok: true, value: { name: result.data.name, optionIds, noneFit: result.data.noneFit } };
}

// --- Seat limit ("Teilnehmerzahl begrenzen") ---------------------------------------

const MAX_GUESTS_ERROR = err("maxGuestsInvalid", { max: MAX_GUEST_CAPACITY });

// null = no limit. The settings form sends the number as a string.
export function validateMaxGuests(value: unknown): FieldResult<number | null> {
  if (value === null) return { ok: true, value: null };
  const parsed = typeof value === "string" && value.trim() !== "" ? Number(value) : value;
  if (typeof parsed !== "number" || !Number.isInteger(parsed) || parsed < 1 || parsed > MAX_GUEST_CAPACITY) {
    return { ok: false, error: MAX_GUESTS_ERROR };
  }
  return { ok: true, value: parsed };
}

// --- Feedback (host review) --------------------------------------------------

export type FeedbackInput = { rating: number; text: string; displayName: string | null };

const feedbackSchema = z
  .object({
    rating: z.int({ error: msg("ratingRequired") }).min(1, msg("ratingRequired")).max(5, msg("ratingRequired")),
    text: z
      .string({ error: msg("reviewTextTooShort", { min: REVIEW_TEXT_MIN_LENGTH }) })
      .trim()
      .min(REVIEW_TEXT_MIN_LENGTH, msg("reviewTextTooShort", { min: REVIEW_TEXT_MIN_LENGTH }))
      .max(REVIEW_TEXT_MAX_LENGTH, msg("reviewTextTooLong", { max: REVIEW_TEXT_MAX_LENGTH })),
    showName: z.boolean().optional(),
    name: z.unknown().optional(),
    consent: z.unknown(),
  })
  .transform((input, ctx): FeedbackInput => {
    const fail = (message: string) => {
      ctx.addIssue({ code: "custom", message });
      return z.NEVER;
    };
    let displayName: string | null = null;
    if (input.showName === true) {
      // Same rules as the account name ("Mein Konto").
      const name = personNameSchema.safeParse(input.name);
      if (!name.success) return fail(JSON.stringify(firstError(name.error)));
      displayName = name.data;
    }
    if (input.consent !== true) return fail(msg("publishConsentRequired"));
    return { rating: input.rating, text: input.text, displayName };
  });

// Feedback form: 1-5 stars, 20-200 characters, the name only with the
// "Mein Vorname darf erscheinen" tick, and the publication consent.
export function validateFeedback(value: unknown): FieldResult<FeedbackInput> {
  return toFieldResult(feedbackSchema.safeParse(value));
}
