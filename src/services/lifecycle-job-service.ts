import { deletionDate, isDueForDeletion, stichtag } from "@/lib/event-lifecycle";
import { dueMail, type LifecycleMail } from "@/lib/lifecycle-mails";
import { deleteEventById, getAllLifecycleRows, markMailSent } from "@/repositories/event-repository";
import { sendLifecycleMail } from "@/services/notification-service";

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
    if (!kind) continue;
    try {
      if (await sendLifecycleMail(kind, row, mailDate(kind, day, row.latestPollDate))) {
        await markMailSent(row.id, kind);
        mailed += 1;
      }
    } catch (error) {
      console.error(`Lifecycle job: ${kind} mail for event ${row.id} failed:`, error);
    }
  }
  return { mailed, deleted };
}

// The date a mail talks about.
function mailDate(kind: LifecycleMail, day: string, latestPollDate: string | null): string {
  if (kind === "deletion_notice") return deletionDate(day);
  if (kind === "poll_reminder") return latestPollDate ?? day;
  return day;
}
