import { getRecaptchaToken, verifyRecaptchaToken } from "@/lib/recaptcha";
import type { GuestDto } from "@/lib/types";
import { normalizeArrivalTime, validateGuestInput } from "@/lib/validation";
import { getEventOwnerId } from "@/repositories/event-repository";
import {
  createGuest,
  deleteGuest,
  getGuestsByEventId,
  updateGuest,
  type GuestRow,
} from "@/repositories/guest-repository";

export type GuestServiceResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; error: string };

function toGuestDto(row: GuestRow): GuestDto {
  return {
    id: row.id,
    name: row.name,
    additionalGuests: row.additionalGuests,
    additionalGuestNames: row.additionalGuestNames,
    arrivalTime: normalizeArrivalTime(String(row.arrivalTime)),
    bringingSomething: row.bringingSomething,
    bringingDescription: row.bringingDescription,
    hasMessage: row.hasMessage,
    message: row.message,
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

  const created = await createGuest(eventId, validation.data);
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

  const updated = await updateGuest(eventId, guestId, validation.data);
  if (!updated) {
    return { ok: false, status: 404, error: "Gast wurde nicht gefunden." };
  }

  return { ok: true, data: toGuestDto(updated) };
}

export async function deleteGuestForEvent(
  eventId: string,
  guestId: string,
): Promise<GuestServiceResult<{ ok: true }>> {
  const deleted = await deleteGuest(eventId, guestId);
  if (!deleted) {
    return { ok: false, status: 404, error: "Gast wurde nicht gefunden." };
  }
  return { ok: true, data: { ok: true } };
}
