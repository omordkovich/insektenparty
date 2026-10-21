import { describe, expect, it } from "vitest";
import {
  capacityLabel,
  checkGuestCapacity,
  MAX_GUEST_ENTRIES,
  occupiedSeats,
  seatsOf,
} from "@/lib/guest-capacity";

const coming = (additionalGuests = 0) => ({ declined: false, additionalGuests });
const declined = { declined: true, additionalGuests: 0 };

describe("seats", () => {
  it("counts acceptances with their companions, declines count nothing", () => {
    expect(seatsOf(coming(2))).toBe(3);
    expect(seatsOf(declined)).toBe(0);
    expect(occupiedSeats([coming(), coming(3), declined])).toBe(5);
  });
});

describe("checkGuestCapacity", () => {
  const base = { maxGuests: 10, entryCount: 4, occupied: 8, previous: null };

  it("caps the number of entries for everyone, the owner included", () => {
    expect(
      checkGuestCapacity({ ...base, maxGuests: null, entryCount: MAX_GUEST_ENTRIES, next: declined }),
    ).toEqual({ ok: false, error: "Die Gästeliste ist voll." });
    expect(
      checkGuestCapacity({ ...base, maxGuests: null, entryCount: MAX_GUEST_ENTRIES, previous: coming(), next: coming(1) }),
    ).toEqual({ ok: true });
  });

  it("allows entries while seats are free", () => {
    expect(checkGuestCapacity({ ...base, next: coming(1) })).toEqual({ ok: true });
    expect(checkGuestCapacity({ ...base, maxGuests: null, occupied: 999, next: coming(5) })).toEqual({ ok: true });
  });

  it("names the free seats when the request needs more", () => {
    expect(checkGuestCapacity({ ...base, next: coming(2) })).toEqual({
      ok: false,
      error: "Es sind nur noch 2 Plätze frei.",
    });
    expect(checkGuestCapacity({ ...base, occupied: 9, next: coming(1) })).toEqual({
      ok: false,
      error: "Es ist nur noch 1 Platz frei.",
    });
    expect(checkGuestCapacity({ ...base, occupied: 10, next: coming() })).toEqual({
      ok: false,
      error: "Leider ausgebucht – es sind keine Plätze mehr frei.",
    });
  });

  it("always lets people decline or keep what they already have", () => {
    expect(checkGuestCapacity({ ...base, occupied: 12, next: declined })).toEqual({ ok: true });
    // Overbooked list, guest only edits the message: same seats as before.
    expect(checkGuestCapacity({ ...base, occupied: 12, previous: coming(1), next: coming(1) })).toEqual({ ok: true });
    // Own seats count as free when changing an entry.
    expect(checkGuestCapacity({ ...base, occupied: 10, previous: coming(1), next: coming(1) })).toEqual({ ok: true });
    expect(checkGuestCapacity({ ...base, occupied: 10, previous: coming(1), next: coming(2) })).toEqual({
      ok: false,
      error: "Es sind nur noch 2 Plätze frei.",
    });
  });

  it("applies to everyone - the owner raises the limit to add more", () => {
    expect(checkGuestCapacity({ ...base, occupied: 10, next: coming(4) })).toEqual({
      ok: false,
      error: "Leider ausgebucht – es sind keine Plätze mehr frei.",
    });
  });
});

describe("capacityLabel", () => {
  it("shows the free seats, or that the event is full", () => {
    expect(capacityLabel(12, 8)).toBe("Noch 4 von 12 Plätzen frei");
    expect(capacityLabel(12, 11)).toBe("Noch 1 von 12 Plätzen frei");
    expect(capacityLabel(12, 12)).toBe("Ausgebucht (12 von 12 Plätzen belegt)");
    expect(capacityLabel(12, 14)).toBe("Ausgebucht (14 von 12 Plätzen belegt)");
  });
});
