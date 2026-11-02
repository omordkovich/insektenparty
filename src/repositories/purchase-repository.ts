import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { events, userEntitlements } from "@/db/schema";
import { NO_BADGE_FEATURE, PAID_EVENT_FEATURE } from "@/lib/features";
import { findOldestUnusedCreditId, lockUserLedger } from "@/repositories/entitlement-repository";

export const DUMMY_SOURCE = "dummy";

// One ledger row, e.g. a bought event credit or an unlocked theme.
export async function insertEntitlement(input: {
  userId: string;
  feature: string;
  source: string;
}): Promise<void> {
  await getDb().insert(userEntitlements).values({
    userId: input.userId,
    feature: input.feature,
    quantity: 1,
    source: input.source,
  });
}

// Undefined when the event does not exist.
export async function getEventBadgeHidden(eventId: string): Promise<boolean | undefined> {
  const [event] = await getDb()
    .select({ badgeHidden: events.badgeHidden })
    .from(events)
    .where(eq(events.id, eventId));
  return event?.badgeHidden;
}

// Turns a free event into a paid one in one transaction, under the user's
// ledger lock: an unused credit is consumed; with useDummy and no credit a
// credit is bought and consumed on the spot. "no_credit" = neither possible,
// "already_paid" = the event was upgraded in the meantime (or isn't the
// user's) - nothing is written then.
export async function upgradeEventToPaid(
  eventId: string,
  userId: string,
  useDummy: boolean,
): Promise<"used_credit" | "purchased" | "no_credit" | "already_paid"> {
  return getDb().transaction(async (tx) => {
    await lockUserLedger(tx, userId);

    const [event] = await tx
      .select({ plan: events.plan })
      .from(events)
      .where(and(eq(events.id, eventId), eq(events.ownerId, userId)));
    if (!event || event.plan === "paid") return "already_paid";

    const consumedAt = new Date();
    const creditId = await findOldestUnusedCreditId(tx, userId);
    let outcome: "used_credit" | "purchased";
    if (creditId) {
      await tx
        .update(userEntitlements)
        .set({ consumedEventId: eventId, consumedAt })
        .where(eq(userEntitlements.id, creditId));
      outcome = "used_credit";
    } else if (useDummy) {
      await tx.insert(userEntitlements).values({
        userId,
        feature: PAID_EVENT_FEATURE,
        quantity: 1,
        source: DUMMY_SOURCE,
        consumedEventId: eventId,
        consumedAt,
      });
      outcome = "purchased";
    } else {
      return "no_credit";
    }

    await tx
      .update(events)
      .set({ plan: "paid", updatedAt: consumedAt })
      .where(and(eq(events.id, eventId), eq(events.ownerId, userId)));
    return outcome;
  });
}

// Removes the "made with GASTZILLA" badge from one event: the ledger row
// (already tied to the event) and the flag are written together. The update
// only matches while the badge is still shown, so concurrent requests write
// one ledger row at most ("already_hidden" = another request was first).
// "not_found" = the event doesn't exist or isn't the user's.
export async function hideEventBadge(
  eventId: string,
  userId: string,
  source: string,
): Promise<"hidden" | "already_hidden" | "not_found"> {
  return getDb().transaction(async (tx) => {
    const [updated] = await tx
      .update(events)
      .set({ badgeHidden: true, updatedAt: new Date() })
      .where(and(eq(events.id, eventId), eq(events.ownerId, userId), eq(events.badgeHidden, false)))
      .returning({ id: events.id });
    if (!updated) {
      const [existing] = await tx
        .select({ id: events.id })
        .from(events)
        .where(and(eq(events.id, eventId), eq(events.ownerId, userId)));
      return existing ? "already_hidden" : "not_found";
    }
    await tx.insert(userEntitlements).values({
      userId,
      feature: NO_BADGE_FEATURE,
      quantity: 1,
      source,
      consumedEventId: eventId,
      consumedAt: new Date(),
    });
    return "hidden";
  });
}
