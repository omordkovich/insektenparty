import { and, asc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { guests } from "@/db/schema";
import type { GuestInput } from "@/lib/validation";

export type GuestRow = typeof guests.$inferSelect;

export async function getGuestsByEventId(eventId: string): Promise<GuestRow[]> {
  return getDb()
    .select()
    .from(guests)
    .where(eq(guests.eventId, eventId))
    .orderBy(asc(guests.arrivalTime), asc(guests.name));
}

export async function createGuest(eventId: string, input: GuestInput): Promise<GuestRow> {
  const [created] = await getDb()
    .insert(guests)
    .values({
      eventId,
      name: input.name,
      additionalGuests: input.additionalGuests,
      additionalGuestNames: input.additionalGuestNames,
      arrivalTime: input.arrivalTime,
      bringingSomething: input.bringingSomething,
      bringingDescription: input.bringingDescription,
      hasMessage: input.hasMessage,
      message: input.message,
    })
    .returning();
  return created;
}

export async function updateGuest(
  eventId: string,
  guestId: string,
  input: GuestInput,
): Promise<GuestRow | undefined> {
  const [updated] = await getDb()
    .update(guests)
    .set({
      name: input.name,
      additionalGuests: input.additionalGuests,
      additionalGuestNames: input.additionalGuestNames,
      arrivalTime: input.arrivalTime,
      bringingSomething: input.bringingSomething,
      bringingDescription: input.bringingDescription,
      hasMessage: input.hasMessage,
      message: input.message,
      updatedAt: new Date(),
    })
    .where(and(eq(guests.id, guestId), eq(guests.eventId, eventId)))
    .returning();
  return updated;
}

export async function deleteGuest(
  eventId: string,
  guestId: string,
): Promise<{ id: string; name: string } | undefined> {
  const [deleted] = await getDb()
    .delete(guests)
    .where(and(eq(guests.id, guestId), eq(guests.eventId, eventId)))
    .returning({ id: guests.id, name: guests.name });
  return deleted;
}
