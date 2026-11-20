import type { Locale } from "@/i18n/config";
import { err, type ErrorMessage } from "@/i18n/errors";
import { todayInBerlin } from "@/lib/date-poll";
import { sendEmail } from "@/lib/email";
import { buildFeedbackAdminMail } from "@/lib/feedback-mails";
import { getFeedbackSecret, signFeedbackToken, verifyFeedbackToken, type FeedbackTokenKind } from "@/lib/feedback-token";
import { SITE_URL } from "@/lib/site";
import { isUuid, validateFeedback } from "@/lib/validation";
import type { ReviewRecord } from "@/db/schema";
import {
  approveReview,
  deleteReview,
  getFeedbackEventInfo,
  getReview,
  submitReviewForEvent,
} from "@/repositories/review-repository";
import { disableFeedbackMails, getUserContact } from "@/repositories/user-repository";

// Host feedback: the feedback page (link from the mail after the event), the
// moderation by info@gastzilla.de ("Posten" / "Löschen") and the unsubscribe
// link. Pages only READ (getFeedbackPageState, getModerationState): mail
// scanners open links, so every change needs the POST from a button.

const LINK_INVALID = err("feedbackLinkInvalid");
const DEFAULT_ADMIN_EMAIL = "info@gastzilla.de";

type Failure<S extends number> = { ok: false; status: S; error: ErrorMessage };

// The id behind a valid token of this kind (always a uuid), else null.
function tokenId(token: unknown, kind: FeedbackTokenKind, today: string): string | null {
  const secret = getFeedbackSecret();
  if (!secret || typeof token !== "string") return null;
  const payload = verifyFeedbackToken(token, kind, secret, today);
  return payload && isUuid(payload.id) ? payload.id : null;
}

function bodyRecord(body: unknown): Record<string, unknown> {
  return body && typeof body === "object" ? (body as Record<string, unknown>) : {};
}

// --- Feedback page -------------------------------------------------------------

export type FeedbackPageState =
  | { kind: "invalid" }
  | { kind: "gone" }
  | { kind: "done" }
  | { kind: "form"; title: string; ownerName: string | null };

export async function getFeedbackPageState(token: string | undefined, today: string): Promise<FeedbackPageState> {
  const eventId = tokenId(token, "feedback", today);
  if (!eventId) return { kind: "invalid" };
  const event = await getFeedbackEventInfo(eventId);
  if (!event) return { kind: "gone" };
  if (event.submitted) return { kind: "done" };
  const owner = event.ownerId ? await getUserContact(event.ownerId) : null;
  return { kind: "form", title: event.title, ownerName: owner?.name ?? null };
}

export async function submitFeedback(
  body: unknown,
  locale: Locale,
  today: string,
): Promise<{ ok: true } | Failure<400 | 403 | 409 | 410>> {
  const { token, ...fields } = bodyRecord(body);
  const eventId = tokenId(token, "feedback", today);
  if (!eventId) return { ok: false, status: 403, error: LINK_INVALID };

  const input = validateFeedback(fields);
  if (!input.ok) return { ok: false, status: 400, error: input.error };

  const result = await submitReviewForEvent(eventId, { ...input.value, language: locale });
  if (result.status !== "created") {
    return result.status === "already"
      ? { ok: false, status: 409, error: err("feedbackAlreadySent") }
      : { ok: false, status: 410, error: err("feedbackEventGone") };
  }

  try {
    await sendAdminMail(result.review);
  } catch (error) {
    // The review is stored; it just waits without a mail. Logged for us.
    console.error(`Feedback: admin mail for review ${result.review.id} failed:`, error);
  }
  return { ok: true };
}

async function sendAdminMail(review: ReviewRecord): Promise<void> {
  const secret = getFeedbackSecret();
  if (!secret) return;
  const token = encodeURIComponent(signFeedbackToken({ kind: "moderate", id: review.id }, secret));
  const link = (action: "approve" | "delete") => `${SITE_URL}/feedback/moderieren?t=${token}&a=${action}`;
  const mail = buildFeedbackAdminMail({
    rating: review.rating,
    text: review.text,
    displayName: review.displayName,
    language: review.language as Locale,
    createdAt: review.createdAt,
    approveLink: link("approve"),
    deleteLink: link("delete"),
  });
  await sendEmail({ to: process.env.FEEDBACK_ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL, ...mail });
}

// --- Moderation ("Posten" / "Löschen") -------------------------------------------

export type ModerationState = { kind: "invalid" } | { kind: "gone" } | { kind: "review"; review: ReviewRecord };

export async function getModerationState(token: string | undefined): Promise<ModerationState> {
  const id = tokenId(token, "moderate", todayInBerlin());
  if (!id) return { kind: "invalid" };
  const review = await getReview(id);
  return review ? { kind: "review", review } : { kind: "gone" };
}

export type ModerationResult = "approved" | "already_approved" | "deleted" | "gone";

export async function moderateReview(body: unknown): Promise<{ ok: true; result: ModerationResult } | Failure<400 | 403>> {
  const { token, action } = bodyRecord(body);
  const id = tokenId(token, "moderate", todayInBerlin());
  if (!id) return { ok: false, status: 403, error: LINK_INVALID };
  if (action !== "approve" && action !== "delete") return { ok: false, status: 400, error: err("invalidRequest") };

  const review = await getReview(id);
  if (!review) return { ok: true, result: "gone" };
  if (action === "delete") {
    return { ok: true, result: (await deleteReview(id)) ? "deleted" : "gone" };
  }
  return { ok: true, result: (await approveReview(id)) ? "approved" : "already_approved" };
}

// --- Unsubscribe -------------------------------------------------------------------

export function isValidUnsubscribeToken(token: string | undefined): boolean {
  return tokenId(token, "unsubscribe", todayInBerlin()) !== null;
}

export async function unsubscribeFeedback(body: unknown): Promise<{ ok: true } | Failure<403>> {
  const userId = tokenId(bodyRecord(body).token, "unsubscribe", todayInBerlin());
  if (!userId) return { ok: false, status: 403, error: LINK_INVALID };
  await disableFeedbackMails(userId);
  return { ok: true };
}
