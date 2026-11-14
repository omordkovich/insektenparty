import type { Locale } from "@/i18n/config";
import { err, type ErrorMessage } from "@/i18n/errors";
// How many people fit: a hard cap on entries per event (protection against
// spam and endless lists, invisible to normal use) and the owner's optional
// limit on seats ("Teilnehmerzahl begrenzen"). Pure, shared by the guest
// form and the services.

/** Entries per event (acceptances and declines), for everyone. */
export const MAX_GUEST_ENTRIES = 300;
/** Votes per date poll. */
export const MAX_POLL_VOTES = 300;
/** Highest seat limit the owner can set. */
export const MAX_GUEST_CAPACITY = 300;

type SeatHolder = { declined: boolean; additionalGuests: number };

// An acceptance takes a seat for the guest and each companion; a decline
// takes none.
export function seatsOf(guest: SeatHolder): number {
  return guest.declined ? 0 : 1 + guest.additionalGuests;
}

export function occupiedSeats(guests: SeatHolder[]): number {
  return guests.reduce((sum, guest) => sum + seatsOf(guest), 0);
}

export function seatsLeftError(free: number): ErrorMessage {
  return err("seatsLeft", { free: Math.max(free, 0) });
}

export type CapacityCheck = { ok: true } | { ok: false; error: ErrorMessage };

// Saving an entry (new: previous = null). Declining, or keeping the seats
// one already has, always works - even on an overbooked list. The limit
// applies to the owner too: to add more people, they raise it first.
export function checkGuestCapacity(input: {
  maxGuests: number | null;
  entryCount: number;
  occupied: number;
  previous: SeatHolder | null;
  next: SeatHolder;
}): CapacityCheck {
  if (!input.previous && input.entryCount >= MAX_GUEST_ENTRIES) {
    return { ok: false, error: err("guestListFull") };
  }
  if (input.maxGuests === null) return { ok: true };

  const needed = seatsOf(input.next);
  const already = input.previous ? seatsOf(input.previous) : 0;
  if (needed <= already) return { ok: true };

  const free = input.maxGuests - (input.occupied - already);
  return needed <= free ? { ok: true } : { ok: false, error: seatsLeftError(free) };
}

const CAPACITY_LABEL: Record<
  Locale,
  { full: (occupied: number, max: number) => string; left: (free: number, max: number) => string }
> = {
  de: {
    full: (occupied, max) => `Ausgebucht (${occupied} von ${max} Plätzen belegt)`,
    left: (free, max) => `Noch ${free} von ${max} Plätzen frei`,
  },
  en: {
    full: (occupied, max) => `Fully booked (${occupied} of ${max} places taken)`,
    left: (free, max) => `${free} of ${max} places left`,
  },
  // "Свободно мест: 3 из 10" - no noun after the number, so no plural forms.
  ru: {
    full: (occupied, max) => `Мест больше нет (занято: ${occupied} из ${max})`,
    left: (free, max) => `Свободно мест: ${free} из ${max}`,
  },
};

// Shown above the guest list when the owner set a limit.
export function capacityLabel(maxGuests: number, occupied: number, locale: Locale): string {
  const label = CAPACITY_LABEL[locale];
  return occupied >= maxGuests ? label.full(occupied, maxGuests) : label.left(maxGuests - occupied, maxGuests);
}
