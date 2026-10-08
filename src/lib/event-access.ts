import { createHash, createHmac, timingSafeEqual } from "node:crypto";

// Password-protected events: after the right password a guest gets an
// HttpOnly cookie per event holding an HMAC of event id + password. Changing
// the password changes the expected value, so every earlier unlock expires.
// Kept free of Next.js so it can be tested.

export const EVENT_ACCESS_MAX_AGE_SECONDS = 180 * 24 * 60 * 60;

export function eventAccessCookieName(eventId: string): string {
  return `gz_event_${eventId}`;
}

export function getEventUnlockSecret(): string | null {
  return process.env.EVENT_UNLOCK_SECRET || null;
}

export function signEventAccess(eventId: string, password: string, secret: string): string {
  return createHmac("sha256", secret).update(`${eventId}:${password}`).digest("base64url");
}

// Hashing both sides first gives equal-length buffers, so the comparison
// leaks neither the content nor the length of the stored password.
function sameText(a: string, b: string): boolean {
  const digest = (value: string) => createHash("sha256").update(value).digest();
  return timingSafeEqual(digest(a), digest(b));
}

export function eventPasswordMatches(stored: string, attempt: string): boolean {
  return sameText(stored, attempt.trim());
}

export type EventAccessInfo = { id: string; ownerId: string | null; accessPassword: string | null };

export function hasEventAccess(
  event: EventAccessInfo,
  viewer: { userId?: string; token?: string; secret: string | null },
): boolean {
  if (!event.accessPassword) return true;
  if (viewer.userId && viewer.userId === event.ownerId) return true;
  // Without a secret nothing can be verified: protected events stay locked.
  if (!viewer.token || !viewer.secret) return false;
  return sameText(signEventAccess(event.id, event.accessPassword, viewer.secret), viewer.token);
}
