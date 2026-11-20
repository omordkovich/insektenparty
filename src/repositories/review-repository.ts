import { and, desc, eq, isNull, lt, max } from "drizzle-orm";
import type { Locale } from "@/i18n/config";
import { getDb } from "@/db";
import { events, reviews, type ReviewRecord } from "@/db/schema";

export type NewReview = { rating: number; text: string; displayName: string | null; language: Locale };

export type SubmitReviewResult =
  | { status: "created"; review: ReviewRecord }
  | { status: "already" | "missing" };

// One transaction: marks the event as "feedback submitted" (only if it was
// not yet) and stores the review. The conditional update is the lock against
// a second submission (double click, two tabs).
export async function submitReviewForEvent(eventId: string, review: NewReview): Promise<SubmitReviewResult> {
  return getDb().transaction(async (tx) => {
    const marked = await tx
      .update(events)
      .set({ feedbackSubmittedAt: new Date() })
      .where(and(eq(events.id, eventId), isNull(events.feedbackSubmittedAt)))
      .returning({ id: events.id });
    if (marked.length === 0) {
      const [existing] = await tx.select({ id: events.id }).from(events).where(eq(events.id, eventId));
      return { status: existing ? "already" : "missing" };
    }
    const [row] = await tx.insert(reviews).values(review).returning();
    return { status: "created", review: row };
  });
}

export async function getReview(id: string): Promise<ReviewRecord | undefined> {
  const [row] = await getDb().select().from(reviews).where(eq(reviews.id, id));
  return row;
}

// True when the review went from pending to approved.
export async function approveReview(id: string): Promise<boolean> {
  const rows = await getDb()
    .update(reviews)
    .set({ status: "approved", approvedAt: new Date() })
    .where(and(eq(reviews.id, id), eq(reviews.status, "pending")))
    .returning({ id: reviews.id });
  return rows.length > 0;
}

// True when a row was deleted.
export async function deleteReview(id: string): Promise<boolean> {
  const rows = await getDb().delete(reviews).where(eq(reviews.id, id)).returning({ id: reviews.id });
  return rows.length > 0;
}

// Lifecycle job: reviews nobody approved within the deadline are deleted
// (privacy policy: unpublished reviews are not kept). `day`: YYYY-MM-DD,
// compared at midnight UTC - an hour or two either way does not matter.
export async function deletePendingReviewsCreatedBefore(day: string): Promise<number> {
  const rows = await getDb()
    .delete(reviews)
    .where(and(eq(reviews.status, "pending"), lt(reviews.createdAt, new Date(`${day}T00:00:00Z`))))
    .returning({ id: reviews.id });
  return rows.length;
}

// Approved reviews of every language, newest first. Each is stored once, in
// the language it was written in, and shown in that original text.
export async function getApprovedReviews(limit: number): Promise<ReviewRecord[]> {
  return getDb()
    .select()
    .from(reviews)
    .where(eq(reviews.status, "approved"))
    .orderBy(desc(reviews.approvedAt))
    .limit(limit);
}

// Sitemap of the reviews page: when the newest review was approved (null:
// none yet).
export async function getLatestApproval(): Promise<Date | null> {
  const [row] = await getDb()
    .select({ latest: max(reviews.approvedAt) })
    .from(reviews)
    .where(eq(reviews.status, "approved"));
  return row?.latest ?? null;
}

// What the feedback page needs to know about the event behind a link.
export async function getFeedbackEventInfo(
  eventId: string,
): Promise<{ title: string; ownerId: string | null; submitted: boolean } | undefined> {
  const [row] = await getDb()
    .select({ title: events.title, ownerId: events.ownerId, submittedAt: events.feedbackSubmittedAt })
    .from(events)
    .where(eq(events.id, eventId));
  return row ? { title: row.title, ownerId: row.ownerId, submitted: row.submittedAt !== null } : undefined;
}
