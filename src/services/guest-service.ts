import { checkGuestCapacity } from "@/lib/guest-capacity";
import { getRecaptchaToken, verifyRecaptchaToken } from "@/lib/recaptcha";
import type { GuestDto } from "@/lib/types";
import { normalizeArrivalTime, validateGuestInput } from "@/lib/validation";
import { getEventDateMode } from "@/repositories/date-poll-repository";
import { getEventOwnerId } from "@/repositories/event-repository";
import {
  createGuest,
  deleteGuest,
  getGuestsByEventId,
  updateGuest,
  type CapacityGuard,
  type GuestRow,
} from "@/repositories/guest-repository";
import { notifyOwnerOfGuestChange } from "@/services/notification-service";

export type GuestServiceResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; error: string };

export const DATE_NOT_FIXED_ERROR = "Der Termin steht noch nicht fest.";

// Seat limit and entry cap, checked while the event row is locked (see
// guest-repository). They apply to the owner too.
function capacityGuard(next: { declined: boolean; additionalGuests: number }): CapacityGuard {
  return (snapshot) => {
    const check = checkGuestCapacity({ ...snapshot, next });
    return check.ok ? null : check.error;
  };
}

// Entries only once the date is fixed - before that guests vote instead.
async function isDateFixed(eventId: string): Promise<boolean> {
  return (await getEventDateMode(eventId)) === "fixed";
}

// Postgres TIME comes back as HH:mm:ss; null stays null.
function optionalTime(value: string | null): string | null {
  return value ? normalizeArrivalTime(String(value)) : null;
}

function toGuestDto(row: GuestRow): GuestDto {
  return {
    id: row.id,
    name: row.name,
    additionalGuests: row.additionalGuests,
    additionalGuestNames: row.additionalGuestNames,
    arrivalTime: optionalTime(row.arrivalTime),
    arrivalEndTime: optionalTime(row.arrivalEndTime),
    departureTime: optionalTime(row.departureTime),
    departureEndTime: optionalTime(row.departureEndTime),
    bringingSomething: row.bringingSomething,
    bringingDescription: row.bringingDescription,
    hasMessage: row.hasMessage,
    message: row.message,
    declined: row.declined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listGuestsForEvent(eventId: string): Promise<GuestDto[]> {
  const rows = await getGuestsByEventId(eventId);
  return rows.map(toGuestDto);
}

export async function createGuestForEvent(
  eventId: string,
  body: unknown,
  requesterId?: string,
): Promise<GuestServiceResult<GuestDto>> {
  const ownerId = await getEventOwnerId(eventId);
  if (ownerId === undefined) {
    return { ok: false, status: 404, error: "Event wurde nicht gefunden." };
  }
  if (!(await isDateFixed(eventId))) {
    return { ok: false, status: 409, error: DATE_NOT_FIXED_ERROR };
  }

  // The event owner manages their own guest list while signed in, so the
  // bot check (aimed at the public RSVP form) doesn't apply to them.
  const isOwnerRequest = requesterId !== undefined && requesterId === ownerId;
  if (!isOwnerRequest) {
    const recaptcha = await verifyRecaptchaToken(getRecaptchaToken(body));
    if (!recaptcha.ok) {
      return { ok: false, status: recaptcha.status, error: recaptcha.error };
    }
  }

  const validation = validateGuestInput(body);
  if (!validation.ok) {
    return { ok: false, status: 400, error: validation.error };
  }

  const result = await createGuest(eventId, validation.data, capacityGuard(validation.data));
  if (!result.ok) {
    return result.reason === "refused"
      ? { ok: false, status: 409, error: result.error }
      : { ok: false, status: 404, error: "Event wurde nicht gefunden." };
  }
  const created = result.row;

  if (!isOwnerRequest) {
    await notifyOwnerOfGuestChange(eventId, created.declined ? "declined" : "created", created.name);
  }

  return { ok: true, data: toGuestDto(created) };
}

export async function updateGuestForEvent(
  eventId: string,
  guestId: string,
  body: unknown,
  requesterId?: string,
): Promise<GuestServiceResult<GuestDto>> {
  const ownerId = await getEventOwnerId(eventId);
  const isOwnerRequest = requesterId !== undefined && requesterId === ownerId;
  if (!(await isDateFixed(eventId))) {
    return { ok: false, status: 409, error: DATE_NOT_FIXED_ERROR };
  }
  if (!isOwnerRequest) {
    const recaptcha = await verifyRecaptchaToken(getRecaptchaToken(body));
    if (!recaptcha.ok) {
      return { ok: false, status: recaptcha.status, error: recaptcha.error };
    }
  }

  const validation = validateGuestInput(body);
  if (!validation.ok) {
    return { ok: false, status: 400, error: validation.error };
  }

  const result = await updateGuest(
    eventId,
    guestId,
    validation.data,
    capacityGuard(validation.data),
  );
  if (!result.ok) {
    return result.reason === "refused"
      ? { ok: false, status: 409, error: result.error }
      : { ok: false, status: 404, error: "Gast wurde nicht gefunden." };
  }
  const updated = result.row;

  if (!isOwnerRequest) {
    await notifyOwnerOfGuestChange(eventId, updated.declined ? "declined" : "updated", updated.name);
  }

  return { ok: true, data: toGuestDto(updated) };
}

export async function deleteGuestForEvent(
  eventId: string,
  guestId: string,
  body: unknown,
  requesterId?: string,
): Promise<GuestServiceResult<{ ok: true }>> {
  const ownerId = await getEventOwnerId(eventId);
  const isOwnerRequest = requesterId !== undefined && requesterId === ownerId;

  if (!isOwnerRequest) {
    const recaptcha = await verifyRecaptchaToken(getRecaptchaToken(body));
    if (!recaptcha.ok) {
      return { ok: false, status: recaptcha.status, error: recaptcha.error };
    }
  }

  const deleted = await deleteGuest(eventId, guestId);
  if (!deleted) {
    return { ok: false, status: 404, error: "Gast wurde nicht gefunden." };
  }

  if (!isOwnerRequest) {
    await notifyOwnerOfGuestChange(eventId, "deleted", deleted.name);
  }

  return { ok: true, data: { ok: true } };
}
