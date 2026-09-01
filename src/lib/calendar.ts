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
    "PRODID:-//Insektenparty//Einladung//DE",
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
