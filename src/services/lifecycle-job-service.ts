import { deletionDate, isDueForDeletion, stichtag } from "@/lib/event-lifecycle";
import { dueMail, feedbackRequestDue, type LifecycleMail } from "@/lib/lifecycle-mails";
import {
  deleteEventById,
  getAllLifecycleRows,
  markFeedbackRequestSent,
  markMailSent,
} from "@/repositories/event-repository";
import { addDays } from "@/lib/date-poll";
import { deletePendingReviewsCreatedBefore } from "@/repositories/review-repository";
import { sendFeedbackRequestMail, sendLifecycleMail } from "@/services/notification-service";

// Feedback that was never approved is deleted this many days after it came in.
export const PENDING_REVIEW_MAX_DAYS = 30;

// Daily job. Idempotent: deletions are final and every mail is marked after
// it was sent, so a second run on the same day does nothing. `<=` rules in
// dueMail / isDueForDeletion catch up on a skipped day. An error on one
// event is logged and never stops the others; its mail is retried next run.
export async function runLifecycleJob(today: string): Promise<{ mailed: number; deleted: number }> {
  const rows = await getAllLifecycleRows();
  let mailed = 0;
  let deleted = 0;

  for (const row of rows) {
    const day = stichtag(row);
    if (isDueForDeletion(day, today)) {
      try {
        await deleteEventById(row.id);
        deleted += 1;
      } catch (error) {
        console.error(`Lifecycle job: deleting event ${row.id} failed:`, error);
      }
      continue;
    }

    const kind = dueMail(row, today);
    if (kind) {
      try {
        if (await sendLifecycleMail(kind, row, mailDate(kind, day, row.latestPollDate))) {
          await markMailSent(row.id, kind);
          mailed += 1;
        }
      } catch (error) {
        console.error(`Lifecycle job: ${kind} mail for event ${row.id} failed:`, error);
      }
    }

    // Own sent mark, so it never competes with the mails above.
    if (feedbackRequestDue(row, today)) {
      try {
        if (await sendFeedbackRequestMail(row, today)) {
          await markFeedbackRequestSent(row.id);
          mailed += 1;
        }
      } catch (error) {
        console.error(`Lifecycle job: feedback mail for event ${row.id} failed:`, error);
      }
    }
  }
  try {
    await deletePendingReviewsCreatedBefore(addDays(today, -PENDING_REVIEW_MAX_DAYS));
  } catch (error) {
    console.error("Lifecycle job: deleting unreviewed feedback failed:", error);
  }
  return { mailed, deleted };
}

// The date a mail talks about.
function mailDate(kind: LifecycleMail, day: string, latestPollDate: string | null): string {
  if (kind === "deletion_notice") return deletionDate(day);
  if (kind === "poll_reminder") return latestPollDate ?? day;
  return day;
}
