import type { Locale } from "@/i18n/config";
import { serverTranslator } from "@/i18n/translator";
import { localizedPath } from "@/lib/page-metadata";
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
  // Feedback mail (see feedbackRequestDue): guests who did not decline, and
  // whether the mail went out / feedback came in.
  acceptedGuests: number;
  feedbackRequestSentAt: Date | null;
  feedbackSubmittedAt: Date | null;
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

// Feedback mail to the host: only for an event that really took place (fixed
// date, at least one acceptance), once, from the day after its last day while
// the event page is "over" (days 1-29) - so a skipped run is caught up, but no
// long-past event is asked. Independent of dueMail (own sent mark).
export function feedbackRequestDue(row: LifecycleMailRow, today: string): boolean {
  if (row.dateMode !== "fixed" || !row.eventDate) return false;
  if (row.acceptedGuests < 1 || row.feedbackRequestSentAt || row.feedbackSubmittedAt) return false;
  return lifecycleStage(stichtag(row), today) === "over";
}

// `date` is the deletion date, the Stichtag or the latest poll proposal,
// depending on the kind.
export function buildLifecycleMessage(
  kind: LifecycleMail,
  event: { title: string; slug: string },
  date: string,
  locale: Locale,
): { subject: string; text: string } {
  const t = serverTranslator(locale, "mail");
  const values = { title: event.title, date: formatDottedDate(date, locale), link: buildEventShareUrl(event.slug) };
  switch (kind) {
    case "deletion_notice":
      return {
        subject: t("deletionSubject", values),
        text: t("deletionText", { ...values, home: `${SITE_URL}${localizedPath("/", locale)}` }),
      };
    case "date_reminder":
      return { subject: t("dateReminderSubject", values), text: t("dateReminderText", values) };
    case "poll_reminder":
      return { subject: t("pollReminderSubject", values), text: t("pollReminderText", values) };
  }
}
