import { and, asc, eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { events, guests } from "@/db/schema";
import type { GuestInput } from "@/lib/validation";

export type GuestRow = typeof guests.$inferSelect;

export async function getGuestsByEventId(eventId: string): Promise<GuestRow[]> {
  return getDb()
    .select()
    .from(guests)
    .where(eq(guests.eventId, eventId))
    // Declined guests go to the end of the list.
    .orderBy(asc(guests.declined), asc(guests.arrivalTime), asc(guests.name));
}

// What the capacity rules need, read while the event row is locked.
export type CapacitySnapshot = {
  maxGuests: number | null;
  entryCount: number;
  occupied: number;
  previous: { declined: boolean; additionalGuests: number } | null;
};

/** Returns an error message to refuse the change, or null to go ahead. */
export type CapacityGuard = (snapshot: CapacitySnapshot) => string | null;

export type GuestWriteResult =
  | { ok: true; row: GuestRow }
  | { ok: false; reason: "refused"; error: string }
  | { ok: false; reason: "notFound" };

function guestValues(input: GuestInput) {
  return {
    name: input.name,
    additionalGuests: input.additionalGuests,
    additionalGuestNames: input.additionalGuestNames,
    arrivalTime: input.arrivalTime,
    arrivalEndTime: input.arrivalEndTime,
    departureTime: input.departureTime,
    departureEndTime: input.departureEndTime,
    bringingSomething: input.bringingSomething,
    bringingDescription: input.bringingDescription,
    hasMessage: input.hasMessage,
    message: input.message,
    declined: input.declined,
  };
}

type Tx = Parameters<Parameters<ReturnType<typeof getDb>["transaction"]>[0]>[0];

// Locks the event row for the rest of the transaction - concurrent sign-ups
// for the same event wait here, so the seat count they check is current.
async function readCapacity(tx: Tx, eventId: string, guestId: string | null): Promise<CapacitySnapshot> {
  await tx.execute(sql`select id from events where id = ${eventId} for update`);
  const [event] = await tx.select({ maxGuests: events.maxGuests }).from(events).where(eq(events.id, eventId));
  const rows = await tx
    .select({ id: guests.id, declined: guests.declined, additionalGuests: guests.additionalGuests })
    .from(guests)
    .where(eq(guests.eventId, eventId));
  const previous = rows.find((row) => row.id === guestId) ?? null;
  return {
    maxGuests: event?.maxGuests ?? null,
    entryCount: rows.length,
    occupied: rows.reduce((sum, row) => sum + (row.declined ? 0 : 1 + row.additionalGuests), 0),
    previous: previous ? { declined: previous.declined, additionalGuests: previous.additionalGuests } : null,
  };
}

export async function createGuest(
  eventId: string,
  input: GuestInput,
  guard: CapacityGuard,
): Promise<GuestWriteResult> {
  return getDb().transaction(async (tx) => {
    const refused = guard(await readCapacity(tx, eventId, null));
    if (refused) return { ok: false, reason: "refused", error: refused };
    const [row] = await tx
      .insert(guests)
      .values({ eventId, ...guestValues(input) })
      .returning();
    return { ok: true, row };
  });
}

export async function updateGuest(
  eventId: string,
  guestId: string,
  input: GuestInput,
  guard: CapacityGuard,
): Promise<GuestWriteResult> {
  return getDb().transaction(async (tx) => {
    const snapshot = await readCapacity(tx, eventId, guestId);
    if (!snapshot.previous) return { ok: false, reason: "notFound" };
    const refused = guard(snapshot);
    if (refused) return { ok: false, reason: "refused", error: refused };
    const [row] = await tx
      .update(guests)
      .set({ ...guestValues(input), updatedAt: new Date() })
      .where(and(eq(guests.id, guestId), eq(guests.eventId, eventId)))
      .returning();
    return row ? { ok: true, row } : { ok: false, reason: "notFound" };
  });
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
