import { INTL_FORMAT_LOCALE, type Locale } from "@/i18n/config";

function toIcsDateTime(date: string, time: string): string {
  const [year, month, day] = date.split("-");
  const [hour, minute] = time.split(":");
  return `${year}${month}${day}T${hour}${minute}00`;
}

// ICS requires commas, semicolons and backslashes to be escaped in text
// fields; newlines become the literal two-character sequence "\n".
function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;")
    .replace(/\n/g, "\\n");
}

type CalendarEventParams = {
  title: string;
  description: string;
  location: string;
  date: string;
  /** Last day of a multi-day event; null/omitted for a single day. */
  endDate?: string | null;
  startTime: string;
  endTime: string;
};

export function buildCalendarLink(params: CalendarEventParams): string {
  const dtStart = toIcsDateTime(params.date, params.startTime);
  const dtEnd = toIcsDateTime(params.endDate ?? params.date, params.endTime);
  const stamp = dtStart;

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//GASTZILLA//Einladung//DE",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${stamp}-${params.title.replace(/\s+/g, "-")}@gastzilla`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${escapeIcsText(params.title)}`,
    `DESCRIPTION:${escapeIcsText(params.description)}`,
    `LOCATION:${escapeIcsText(params.location)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return `data:text/calendar;charset=utf8,${encodeURIComponent(ics)}`;
}

// Data-URI .ics links get treated as a download by most desktop/Android
// browsers instead of prompting to add the event directly, so we route
// through Google Calendar's prefill page instead - it opens the "add event"
// screen with no file involved. Only real downside: iOS/Apple Calendar users
// land on this web page rather than their native app.
export function buildGoogleCalendarLink(params: CalendarEventParams): string {
  const dates = `${toIcsDateTime(params.date, params.startTime)}/${toIcsDateTime(params.endDate ?? params.date, params.endTime)}`;
  const qs = new URLSearchParams({
    action: "TEMPLATE",
    text: params.title,
    dates,
    details: params.description,
    location: params.location,
  });
  return `https://calendar.google.com/calendar/render?${qs.toString()}`;
}

export function buildMapsLink(location: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
}

// Formatters per language, built once.
function formatterCache(options: Intl.DateTimeFormatOptions) {
  const cache = new Map<Locale, Intl.DateTimeFormat>();
  return (locale: Locale) => {
    let formatter = cache.get(locale);
    if (!formatter) {
      formatter = new Intl.DateTimeFormat(INTL_FORMAT_LOCALE[locale], options);
      cache.set(locale, formatter);
    }
    return formatter;
  };
}

const dateLabelFormatter = formatterCache({
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

// Formats an ISO date (YYYY-MM-DD) into the human-readable label shown on
// the event page, e.g. "Sonntag, 13. September 2026" / "Sunday, 13
// September 2026". Parsed and formatted in UTC throughout so the result
// never shifts by a day depending on the server's local timezone.
export function formatDateLabel(date: string | null, locale: Locale): string {
  if (!date) return "";
  return dateLabelFormatter(locale).format(new Date(`${date}T00:00:00Z`));
}

const DOTTED_DATE: Record<Locale, (day: string, month: string, year: string) => string> = {
  de: (day, month, year) => `${day}.${month}.${year}`,
  en: (day, month, year) => `${day}/${month}/${year}`,
  ru: (day, month, year) => `${day}.${month}.${year}`,
};

// An ISO date (YYYY-MM-DD) as "05.12.2026" (German) or "05/12/2026" (English).
export function formatDottedDate(date: string, locale: Locale): string {
  const [year, month, day] = date.split("-");
  return DOTTED_DATE[locale](day, month, year);
}

const shortDateFormatter = formatterCache({
  weekday: "short",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

// German writes the day with a dot ("4."), English without ("4").
const DAY_SUFFIX: Record<Locale, string> = { de: ".", en: "", ru: "" };

function dateParts(date: string, locale: Locale) {
  const parts = shortDateFormatter(locale).formatToParts(new Date(`${date}T00:00:00Z`));
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? "";
  const day = `${get("day")}${DAY_SUFFIX[locale]}`;
  return { weekday: get("weekday"), day, month: get("month"), year: get("year") };
}

// Label for the event's date: a single day as before ("Freitag, 4. September
// 2026"); a range compactly, naming month/year only where they differ:
// "Fr. 4. – So. 6. September 2026", "Fri 30 October – Sun 1 November 2026".
export function formatDateRangeLabel(start: string | null, end: string | null, locale: Locale): string {
  if (!start) return "";
  if (!end || end === start) return formatDateLabel(start, locale);

  const a = dateParts(start, locale);
  const b = dateParts(end, locale);
  const endText = `${b.weekday} ${b.day} ${b.month} ${b.year}`;

  if (a.year !== b.year) return `${a.weekday} ${a.day} ${a.month} ${a.year} – ${endText}`;
  if (a.month !== b.month) return `${a.weekday} ${a.day} ${a.month} – ${endText}`;
  return `${a.weekday} ${a.day} – ${endText}`;
}

const createdDateFormatter = formatterCache({
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Europe/Berlin",
});

// Formats a stored timestamp (e.g. an event's created_at) as a date, e.g.
// "4. September 2026" / "4 September 2026". Unlike formatDateLabel this is a
// real instant, so it is shown in German local time - late-evening UTC
// timestamps would otherwise land on the previous day.
export function formatCreatedDate(date: Date, locale: Locale): string {
  return createdDateFormatter(locale).format(date);
}

const TIME_LABEL: Record<Locale, { range: (start: string, end: string) => string; from: (start: string) => string }> = {
  de: { range: (start, end) => `${start} - ${end} Uhr`, from: (start) => `ab ${start} Uhr` },
  en: { range: (start, end) => `${start} – ${end}`, from: (start) => `from ${start}` },
  ru: { range: (start, end) => `${start}–${end}`, from: (start) => `с ${start}` },
};

// Formats the event's start/end times into the human-readable label shown
// on the event page, e.g. "09:30 - 12:00 Uhr" / "09:30 – 12:00", or "ab
// 09:30 Uhr" / "from 09:30" when no end time is set.
export function formatTimeLabel(startTime: string | null, endTime: string | null, locale: Locale): string {
  if (!startTime) return "";
  const label = TIME_LABEL[locale];
  return endTime ? label.range(startTime, endTime) : label.from(startTime);
}
