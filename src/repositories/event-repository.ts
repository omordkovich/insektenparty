import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { events } from "@/db/schema";

export type EventRow = typeof events.$inferSelect;

export async function getEventBySlug(slug: string): Promise<EventRow | undefined> {
  const [event] = await getDb().select().from(events).where(eq(events.slug, slug));
  return event;
}

export async function eventExistsById(id: string): Promise<boolean> {
  const [event] = await getDb()
    .select({ id: events.id })
    .from(events)
    .where(eq(events.id, id));
  return !!event;
}

export type EventListItem = {
  id: string;
  slug: string;
  title: string;
  theme: string;
};

export async function getEventsByOwner(ownerId: string): Promise<EventListItem[]> {
  return getDb()
    .select({ id: events.id, slug: events.slug, title: events.title, theme: events.theme })
    .from(events)
    .where(eq(events.ownerId, ownerId))
    .orderBy(desc(events.createdAt));
}

export async function createEvent(input: {
  ownerId: string;
  slug: string;
  theme: string;
  title: string;
}): Promise<{ slug: string }> {
  // Every other field starts empty - the owner fills them in via the
  // inline-editable fields on the event page (placeholders guide them
  // there); only name and theme are picked up front.
  const [created] = await getDb()
    .insert(events)
    .values({
      ownerId: input.ownerId,
      slug: input.slug,
      theme: input.theme,
      kicker: "",
      title: input.title,
      greeting: "",
      dateLabel: "",
      timeLabel: "",
      locationLabel: "",
      defaultArrivalTime: "",
      eventDate: null,
      eventStartTime: null,
      eventEndTime: null,
      contactName: "",
      contactPhone: "",
      contactEmail: "",
    })
    .returning({ slug: events.slug });
  return created;
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
