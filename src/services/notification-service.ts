import type { Locale } from "@/i18n/config";
import { serverTranslator } from "@/i18n/translator";
import { buildLifecycleMessage, type LifecycleMail } from "@/lib/lifecycle-mails";
import { sendEmail } from "@/lib/email";
import { addDays } from "@/lib/date-poll";
import { buildFeedbackRequestMail } from "@/lib/feedback-mails";
import { FEEDBACK_LINK_VALID_DAYS, getFeedbackSecret, signFeedbackToken } from "@/lib/feedback-token";
import { localizedPath } from "@/lib/page-metadata";
import { SITE_URL } from "@/lib/site";
import { buildEventShareUrl } from "@/lib/share";
import { getEventForNotification } from "@/repositories/event-repository";
import { getUserContact } from "@/repositories/user-repository";

export type GuestChangeKind = "created" | "updated" | "declined" | "deleted";

export function buildGuestChangeMessage(
  kind: GuestChangeKind,
  guestName: string,
  eventTitle: string,
  locale: Locale,
): { subject: string; text: string } {
  const t = serverTranslator(locale, "mail");
  const values = { name: guestName, title: eventTitle };
  switch (kind) {
    case "created":
      return { subject: t("guestCreatedSubject", values), text: t("guestCreatedText", values) };
    case "updated":
      return { subject: t("guestUpdatedSubject", values), text: t("guestUpdatedText", values) };
    case "declined":
      return { subject: t("guestDeclinedSubject", values), text: t("guestDeclinedText", values) };
    case "deleted":
      return { subject: t("guestDeletedSubject", values), text: t("guestDeletedText", values) };
  }
}

export type PollVoteChangeKind = "created" | "updated" | "deleted";

export function buildPollVoteMessage(
  kind: PollVoteChangeKind,
  voterName: string,
  choice: string,
  eventTitle: string,
  locale: Locale,
): { subject: string; text: string } {
  const t = serverTranslator(locale, "mail");
  const values = { name: voterName, title: eventTitle, choice };
  switch (kind) {
    case "created":
      return { subject: t("voteCreatedSubject", values), text: t("voteCreatedText", values) };
    case "updated":
      return { subject: t("voteUpdatedSubject", values), text: t("voteUpdatedText", values) };
    case "deleted":
      return { subject: t("voteDeletedSubject", values), text: t("voteDeletedText", values) };
  }
}

// Best-effort: a failure here must never fail the request that triggered
// it, so every error is caught and logged rather than thrown.
async function notifyOwner(
  eventId: string,
  build: (eventTitle: string, locale: Locale) => { subject: string; text: string },
): Promise<void> {
  try {
    const event = await getEventForNotification(eventId);
    if (!event || !event.ownerId) return;

    const owner = await getUserContact(event.ownerId);
    if (!owner?.email) return;

    // The owner's account language, not the event's.
    const { subject, text } = build(event.title, owner.locale);
    const link = buildEventShareUrl(event.slug);

    // "Event ansehen": during a poll the page shows the vote, not the list.
    await sendEmail({
      to: owner.email,
      subject,
      text: `${text}\n\n${serverTranslator(owner.locale, "mail")("viewEvent", { link })}`,
    });
  } catch (error) {
    console.error("notifyOwner failed:", error);
  }
}

export async function notifyOwnerOfGuestChange(
  eventId: string,
  kind: GuestChangeKind,
  guestName: string,
): Promise<void> {
  await notifyOwner(eventId, (eventTitle, locale) => buildGuestChangeMessage(kind, guestName, eventTitle, locale));
}

export async function notifyOwnerOfPollVote(
  eventId: string,
  kind: PollVoteChangeKind,
  voterName: string,
  /** The chosen dates, written in the owner's language. */
  describeChoice: (locale: Locale) => string,
): Promise<void> {
  await notifyOwner(eventId, (eventTitle, locale) =>
    buildPollVoteMessage(kind, voterName, describeChoice(locale), eventTitle, locale),
  );
}

// Daily lifecycle mails (deletion notice, date and poll reminders). Unlike
// the best-effort notifications above, a send error is thrown so the job
// does not mark the mail as sent. Returns false when there is nobody to
// mail (no owner or no address) - nothing is sent and nothing is an error.
export async function sendLifecycleMail(
  kind: LifecycleMail,
  event: { ownerId: string | null; title: string; slug: string },
  date: string,
): Promise<boolean> {
  if (!event.ownerId) return false;
  const owner = await getUserContact(event.ownerId);
  if (!owner?.email) return false;

  const { subject, text } = buildLifecycleMessage(kind, event, date, owner.locale);
  await sendEmail({ to: owner.email, subject, text });
  return true;
}

// "Wie war dein Event?" - once, the day after the event (lifecycle job).
// False when nothing was sent: no FEEDBACK_SECRET, no owner/e-mail, or the
// owner unsubscribed from feedback mails.
export async function sendFeedbackRequestMail(
  event: { id: string; ownerId: string | null; title: string },
  today: string,
): Promise<boolean> {
  const secret = getFeedbackSecret();
  if (!secret || !event.ownerId) return false;
  const owner = await getUserContact(event.ownerId);
  if (!owner?.email || !owner.feedbackMails) return false;

  const feedback = signFeedbackToken(
    { kind: "feedback", id: event.id, exp: addDays(today, FEEDBACK_LINK_VALID_DAYS) },
    secret,
  );
  const unsubscribe = signFeedbackToken({ kind: "unsubscribe", id: event.ownerId }, secret);
  const base = `${SITE_URL}${localizedPath("/feedback", owner.locale)}`;
  const mail = buildFeedbackRequestMail(
    {
      title: event.title,
      feedbackLink: `${base}?t=${encodeURIComponent(feedback)}`,
      unsubscribeLink: `${base}/abmelden?t=${encodeURIComponent(unsubscribe)}`,
    },
    owner.locale,
  );
  await sendEmail({ to: owner.email, ...mail });
  return true;
}
