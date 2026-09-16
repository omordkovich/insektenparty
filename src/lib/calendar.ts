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

export function buildCalendarLink(params: {
  title: string;
  description: string;
  location: string;
  date: string;
  startTime: string;
  endTime: string;
}): string {
  const dtStart = toIcsDateTime(params.date, params.startTime);
  const dtEnd = toIcsDateTime(params.date, params.endTime);
  const stamp = dtStart;

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//GASTZILLA//Einladung//DE",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${stamp}-${params.title.replace(/\s+/g, "-")}@insektenparty`,
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
export function buildGoogleCalendarLink(params: {
  title: string;
  description: string;
  location: string;
  date: string;
  startTime: string;
  endTime: string;
}): string {
  const dates = `${toIcsDateTime(params.date, params.startTime)}/${toIcsDateTime(params.date, params.endTime)}`;
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

const dateLabelFormatter = new Intl.DateTimeFormat("de-DE", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

// Formats an ISO date (YYYY-MM-DD) into the human-readable label shown on
// the party page, e.g. "Sonntag, 13. September 2026". Parsed and formatted
// in UTC throughout so the result never shifts by a day depending on the
// server's local timezone.
export function formatDateLabel(date: string | null): string {
  if (!date) return "";
  return dateLabelFormatter.format(new Date(`${date}T00:00:00Z`));
}

// Formats the event's start/end times into the human-readable label shown
// on the party page, e.g. "09:30 - 12:00 Uhr" or "ab 09:30 Uhr" when no end
// time is set.
export function formatTimeLabel(startTime: string | null, endTime: string | null): string {
  if (!startTime) return "";
  if (!endTime) return `ab ${startTime} Uhr`;
  return `${startTime} - ${endTime} Uhr`;
}
