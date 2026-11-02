import { addDays } from "@/lib/date-poll";
import { formatDottedDate } from "@/lib/calendar";
import {
  deletionDate,
  lifecycleStage,
  stichtag,
  type LifecycleInput,
} from "@/lib/event-lifecycle";
import { buildEventShareUrl } from "@/lib/share";
import { SITE_URL } from "@/lib/site";

export type LifecycleMail = "deletion_notice" | "date_reminder" | "poll_reminder";

export type LifecycleMailRow = LifecycleInput & {
  // Berlin day the poll started (its earliest proposal was added); null
  // without proposals.
  pollStartedOn: string | null;
  deletionNoticeSentAt: Date | null;
  dateReminderSentAt: Date | null;
};

// Days before the deletion / Stichtag / latest poll proposal a mail goes out.
export const DELETION_NOTICE_DAYS_BEFORE = 7;
export const DATE_REMINDER_DAYS_BEFORE = 30;
export const POLL_REMINDER_DAYS_BEFORE = 3;
// A poll must be at least this old before it gets a reminder.
export const POLL_REMINDER_MIN_AGE_DAYS = 3;

// Which mail (if any) is due for an event today. `>=` instead of `=`, so a
// skipped run is caught up the next day; the sent flags keep it to one mail
// per kind. At most one mail per run: the deletion notice wins.
export function dueMail(row: LifecycleMailRow, today: string): LifecycleMail | null {
  const day = stichtag(row);

  if (!row.deletionNoticeSentAt && today >= addDays(deletionDate(day), -DELETION_NOTICE_DAYS_BEFORE)) {
    return "deletion_notice";
  }

  // Both reminders share date_reminder_sent_at.
  if (row.dateReminderSentAt || lifecycleStage(day, today) !== "active") return null;

  const withoutDate = row.dateMode === "unknown" || (row.dateMode === "fixed" && !row.eventDate && !row.eventEndDate);
  if (withoutDate && today >= addDays(day, -DATE_REMINDER_DAYS_BEFORE)) return "date_reminder";

  if (
    row.dateMode === "poll" &&
    row.latestPollDate &&
    today >= addDays(row.latestPollDate, -POLL_REMINDER_DAYS_BEFORE) &&
    row.pollStartedOn !== null &&
    row.pollStartedOn <= addDays(today, -POLL_REMINDER_MIN_AGE_DAYS)
  ) {
    return "poll_reminder";
  }
  return null;
}

// `date` is the deletion date, the Stichtag or the latest poll proposal,
// depending on the kind.
export function buildLifecycleMessage(
  kind: LifecycleMail,
  event: { title: string; slug: string },
  date: string,
): { subject: string; text: string } {
  const link = buildEventShareUrl(event.slug);
  switch (kind) {
    case "deletion_notice":
      return {
        subject: `Dein Event „${event.title}“ wird am ${formatDottedDate(date)} gelöscht`,
        text:
          `Dein Event „${event.title}“ wird am ${formatDottedDate(date)} gelöscht, ` +
          `inklusive Gästeliste und Abstimmung.\n\n` +
          `Zu deinen Events: ${SITE_URL}/\n\n` +
          `Nächste Party? Weiteres Event freischalten`,
      };
    case "date_reminder":
      return {
        subject: `Setz einen Termin für „${event.title}“`,
        text: `Ohne Termin läuft dein Event am ${formatDottedDate(date)} ab.\n\nEvent ansehen: ${link}`,
      };
    case "poll_reminder":
      return {
        subject: `Leg den Termin für „${event.title}“ fest`,
        text:
          `Deine Abstimmung endet am ${formatDottedDate(date)}. ` +
          `Danach kannst du keinen Termin mehr festlegen.\n\nEvent ansehen: ${link}`,
      };
  }
}
