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

export function seatsLeftError(free: number): string {
  if (free <= 0) return "Leider ausgebucht – es sind keine Plätze mehr frei.";
  return free === 1 ? "Es ist nur noch 1 Platz frei." : `Es sind nur noch ${free} Plätze frei.`;
}

export type CapacityCheck = { ok: true } | { ok: false; error: string };

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
    return { ok: false, error: "Die Gästeliste ist voll." };
  }
  if (input.maxGuests === null) return { ok: true };

  const needed = seatsOf(input.next);
  const already = input.previous ? seatsOf(input.previous) : 0;
  if (needed <= already) return { ok: true };

  const free = input.maxGuests - (input.occupied - already);
  return needed <= free ? { ok: true } : { ok: false, error: seatsLeftError(free) };
}

// Shown above the guest list when the owner set a limit.
export function capacityLabel(maxGuests: number, occupied: number): string {
  if (occupied >= maxGuests) return `Ausgebucht (${occupied} von ${maxGuests} Plätzen belegt)`;
  return `Noch ${maxGuests - occupied} von ${maxGuests} Plätzen frei`;
}
