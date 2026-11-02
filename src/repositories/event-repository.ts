import { and, desc, eq, max, min } from "drizzle-orm";
import { getDb } from "@/db";
import { datePollOptions, events, userEntitlements } from "@/db/schema";
import { isDateMode, todayInBerlin } from "@/lib/date-poll";
import type { LifecycleInput } from "@/lib/event-lifecycle";
import { isEventPlan, type EventPlan } from "@/lib/event-plan";
import { FREE_EVENT_FEATURE } from "@/lib/features";
import type { LifecycleMail } from "@/lib/lifecycle-mails";
import { slugKeyOf } from "@/lib/slug";
import { findOldestUnusedCreditId, lockUserLedger } from "@/repositories/entitlement-repository";

export type EventRow = typeof events.$inferSelect;

// Finds an event by the address it was opened with: the current address
// first, otherwise by its key (the last part) - so links from before a
// rename still work. Callers redirect when event.slug differs.
export async function getEventByAddress(address: string): Promise<EventRow | undefined> {
  const [exact] = await getDb().select().from(events).where(eq(events.slug, address));
  if (exact) return exact;
  const [byKey] = await getDb()
    .select()
    .from(events)
    .where(eq(events.slugKey, slugKeyOf(address)));
  return byKey;
}

export async function getEventAddress(
  id: string,
  ownerId: string,
): Promise<{ slug: string; slugKey: string | null; slugName: string | null } | undefined> {
  const [event] = await getDb()
    .select({ slug: events.slug, slugKey: events.slugKey, slugName: events.slugName })
    .from(events)
    .where(and(eq(events.id, id), eq(events.ownerId, ownerId)));
  return event;
}

export async function eventExistsById(id: string): Promise<boolean> {
  const [event] = await getDb()
    .select({ id: events.id })
    .from(events)
    .where(eq(events.id, id));
  return !!event;
}

// Returns undefined when the event does not exist, distinct from a null
// ownerId (an event that exists but has no recorded owner).
export async function getEventOwnerId(id: string): Promise<string | null | undefined> {
  const [event] = await getDb()
    .select({ ownerId: events.ownerId })
    .from(events)
    .where(eq(events.id, id));
  return event ? event.ownerId : undefined;
}

// Owner, plan and the Berlin day the event was created - what the date
// rules of a plan need. An unexpected plan value counts as "free".
// Undefined when the event does not exist.
export async function getEventPlanInfo(
  id: string,
): Promise<{ ownerId: string | null; plan: EventPlan; createdOn: string } | undefined> {
  const [event] = await getDb()
    .select({ ownerId: events.ownerId, plan: events.plan, createdAt: events.createdAt })
    .from(events)
    .where(eq(events.id, id));
  if (!event) return undefined;
  return {
    ownerId: event.ownerId,
    plan: isEventPlan(event.plan) ? event.plan : "free",
    createdOn: todayInBerlin(event.createdAt),
  };
}

// What the lifecycle (Stichtag) is computed from: the event's date, its
// creation day and the latest poll proposal. Undefined when the event does
// not exist.
export async function getLifecycleInput(id: string): Promise<LifecycleInput | undefined> {
  const [event] = await getDb()
    .select({
      dateMode: events.dateMode,
      eventDate: events.eventDate,
      eventEndDate: events.eventEndDate,
      createdAt: events.createdAt,
    })
    .from(events)
    .where(eq(events.id, id));
  if (!event) return undefined;
  const [latest] = await getDb()
    .select({ latest: max(datePollOptions.date) })
    .from(datePollOptions)
    .where(eq(datePollOptions.eventId, id));
  return {
    dateMode: isDateMode(event.dateMode) ? event.dateMode : "unknown",
    eventDate: event.eventDate,
    eventEndDate: event.eventEndDate,
    createdOn: todayInBerlin(event.createdAt),
    latestPollDate: latest?.latest ?? null,
  };
}

export type EventNotificationInfo = { ownerId: string | null; title: string; slug: string };

export async function getEventForNotification(
  id: string,
): Promise<EventNotificationInfo | undefined> {
  const [event] = await getDb()
    .select({ ownerId: events.ownerId, title: events.title, slug: events.slug })
    .from(events)
    .where(eq(events.id, id));
  return event;
}

export type EventAccessRow = {
  id: string;
  ownerId: string | null;
  accessPassword: string | null;
  title: string;
  slug: string;
};

// What the password protection needs: who owns the event, its password
// (null = open) and what a locked visitor may see (title) or be sent (slug).
export async function getEventAccessInfo(id: string): Promise<EventAccessRow | undefined> {
  const [event] = await getDb()
    .select({
      id: events.id,
      ownerId: events.ownerId,
      accessPassword: events.accessPassword,
      title: events.title,
      slug: events.slug,
    })
    .from(events)
    .where(eq(events.id, id));
  return event;
}

export type EventListRow = LifecycleInput & {
  id: string;
  slug: string;
  title: string;
  theme: string;
  plan: EventPlan;
};

// The owner's events with what the "Meine Events" list needs: the plan and
// everything the Stichtag is computed from (incl. the latest poll proposal,
// joined in one query instead of one per event).
export async function getEventsByOwner(ownerId: string): Promise<EventListRow[]> {
  const latestPoll = getDb()
    .select({ eventId: datePollOptions.eventId, latest: max(datePollOptions.date).as("latest_poll_date") })
    .from(datePollOptions)
    .groupBy(datePollOptions.eventId)
    .as("latest_poll");
  const rows = await getDb()
    .select({
      id: events.id,
      slug: events.slug,
      title: events.title,
      theme: events.theme,
      plan: events.plan,
      dateMode: events.dateMode,
      eventDate: events.eventDate,
      eventEndDate: events.eventEndDate,
      createdAt: events.createdAt,
      latestPollDate: latestPoll.latest,
    })
    .from(events)
    .leftJoin(latestPoll, eq(latestPoll.eventId, events.id))
    .where(eq(events.ownerId, ownerId))
    .orderBy(desc(events.createdAt));
  return rows.map(({ createdAt, ...row }) => ({
    ...row,
    plan: isEventPlan(row.plan) ? row.plan : "free",
    dateMode: isDateMode(row.dateMode) ? row.dateMode : "unknown",
    createdOn: todayInBerlin(createdAt),
  }));
}

export type LifecycleJobRow = LifecycleInput & {
  pollStartedOn: string | null;
  id: string;
  ownerId: string | null;
  title: string;
  slug: string;
  deletionNoticeSentAt: Date | null;
  dateReminderSentAt: Date | null;
};

// Every event with what the daily lifecycle job needs: the Stichtag inputs
// (latest poll proposal joined in one query, as in getEventsByOwner), the
// owner and the mail-sent marks.
export async function getAllLifecycleRows(): Promise<LifecycleJobRow[]> {
  const latestPoll = getDb()
    .select({
      eventId: datePollOptions.eventId,
      latest: max(datePollOptions.date).as("latest_poll_date"),
      startedAt: min(datePollOptions.createdAt).as("poll_started_at"),
    })
    .from(datePollOptions)
    .groupBy(datePollOptions.eventId)
    .as("latest_poll");
  const rows = await getDb()
    .select({
      id: events.id,
      ownerId: events.ownerId,
      title: events.title,
      slug: events.slug,
      dateMode: events.dateMode,
      eventDate: events.eventDate,
      eventEndDate: events.eventEndDate,
      createdAt: events.createdAt,
      latestPollDate: latestPoll.latest,
      pollStartedAt: latestPoll.startedAt,
      deletionNoticeSentAt: events.deletionNoticeSentAt,
      dateReminderSentAt: events.dateReminderSentAt,
    })
    .from(events)
    .leftJoin(latestPoll, eq(latestPoll.eventId, events.id));
  return rows.map(({ createdAt, pollStartedAt, ...row }) => ({
    ...row,
    dateMode: isDateMode(row.dateMode) ? row.dateMode : "unknown",
    createdOn: todayInBerlin(createdAt),
    // The poll's clock starts with its earliest proposal; "Abstimmung neu
    // machen" replaces all of them and so restarts it.
    pollStartedOn: pollStartedAt ? todayInBerlin(new Date(pollStartedAt)) : null,
  }));
}

// Notes that a lifecycle mail went out. Both reminders share one mark.
export async function markMailSent(id: string, kind: LifecycleMail): Promise<void> {
  const now = new Date();
  await getDb()
    .update(events)
    .set(kind === "deletion_notice" ? { deletionNoticeSentAt: now } : { dateReminderSentAt: now })
    .where(eq(events.id, id));
}

// For the lifecycle job (no owner check); guests, poll options and votes
// go with the event through their foreign keys.
export async function deleteEventById(id: string): Promise<void> {
  await getDb().delete(events).where(eq(events.id, id));
}

// Undefined when the event does not exist or belongs to someone else.
export async function getEventTheme(id: string, ownerId: string): Promise<string | undefined> {
  const [event] = await getDb()
    .select({ theme: events.theme })
    .from(events)
    .where(and(eq(events.id, id), eq(events.ownerId, ownerId)));
  return event?.theme;
}

// The four date/time columns, for validating a change to some of them
// against the rest. Undefined when the event does not exist or belongs to
// someone else.
export async function getEventSchedule(
  id: string,
  ownerId: string,
): Promise<
  | { eventDate: string | null; eventEndDate: string | null; eventStartTime: string | null; eventEndTime: string | null }
  | undefined
> {
  const [event] = await getDb()
    .select({
      eventDate: events.eventDate,
      eventEndDate: events.eventEndDate,
      eventStartTime: events.eventStartTime,
      eventEndTime: events.eventEndTime,
    })
    .from(events)
    .where(and(eq(events.id, id), eq(events.ownerId, ownerId)));
  return event;
}

// Creates the event and uses up its quota in one transaction: the free
// event gets its ledger row, a paid event consumes the oldest unused credit.
// The per-owner advisory lock serialises concurrent creations, so the quota
// re-checked here can't be used twice. "no_quota" = nothing left by now.
export async function createEvent(input: {
  ownerId: string;
  slug: string;
  slugKey: string;
  slugName: string;
  theme: string;
  title: string;
  accessPassword: string | null;
  dateMode: string;
  plan: EventPlan;
}): Promise<{ id: string; slug: string } | "no_quota"> {
  return getDb().transaction(async (tx) => {
    await lockUserLedger(tx, input.ownerId);

    let creditId: string | null = null;
    if (input.plan === "free") {
      const [used] = await tx
        .select({ id: userEntitlements.id })
        .from(userEntitlements)
        .where(and(eq(userEntitlements.userId, input.ownerId), eq(userEntitlements.feature, FREE_EVENT_FEATURE)))
        .limit(1);
      if (used) return "no_quota";
    } else {
      creditId = await findOldestUnusedCreditId(tx, input.ownerId);
      if (!creditId) return "no_quota";
    }

    // Every other field starts empty - the owner fills them in via the
    // inline-editable fields on the event page (placeholders guide them
    // there); only name and theme are picked up front.
    const [created] = await tx
      .insert(events)
      .values({
        ownerId: input.ownerId,
        slug: input.slug,
        slugKey: input.slugKey,
        slugName: input.slugName,
        theme: input.theme,
        kicker: "",
        title: input.title,
        greeting: "",
        dateLabel: "",
        timeLabel: "",
        locationLabel: "",
        defaultArrivalTime: "",
        eventDate: null,
        eventEndDate: null,
        eventStartTime: null,
        eventEndTime: null,
        contactName: "",
        contactPhone: "",
        contactEmail: "",
        accessPassword: input.accessPassword,
        dateMode: input.dateMode,
        plan: input.plan,
      })
      .returning({ id: events.id, slug: events.slug });

    const consumedAt = new Date();
    if (creditId === null) {
      await tx.insert(userEntitlements).values({
        userId: input.ownerId,
        feature: FREE_EVENT_FEATURE,
        quantity: 1,
        consumedEventId: created.id,
        consumedAt,
      });
    } else {
      await tx
        .update(userEntitlements)
        .set({ consumedEventId: created.id, consumedAt })
        .where(eq(userEntitlements.id, creditId));
    }
    return created;
  });
}

export async function updateEvent(
  id: string,
  ownerId: string,
  fields: Partial<typeof events.$inferInsert>,
): Promise<EventRow | undefined> {
  const [updated] = await getDb()
    .update(events)
    .set({ ...fields, updatedAt: new Date() })
    .where(and(eq(events.id, id), eq(events.ownerId, ownerId)))
    .returning();
  return updated;
}

export async function deleteEvent(
  id: string,
  ownerId: string,
): Promise<{ id: string } | undefined> {
  const [deleted] = await getDb()
    .delete(events)
    .where(and(eq(events.id, id), eq(events.ownerId, ownerId)))
    .returning({ id: events.id });
  return deleted;
}
