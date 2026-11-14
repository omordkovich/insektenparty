import { errorResponse } from "@/i18n/api-errors";
import { err, type ErrorMessage } from "@/i18n/errors";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  EVENT_ACCESS_MAX_AGE_SECONDS,
  eventAccessCookieName,
  eventPasswordMatches,
  getEventUnlockSecret,
  hasEventAccess,
  signEventAccess,
  type EventAccessInfo,
} from "@/lib/event-access";
import { createClient } from "@/lib/supabase/server";
import { getEventAccessInfo, getEventLanguage } from "@/repositories/event-repository";
import { getEventLifecycle } from "@/services/event-lifecycle-service";

export type EventAccessResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; error: ErrorMessage };

export const EVENT_LOCKED_ERROR = err("eventLocked");
export const EVENT_EXPIRED_ERROR = err("eventExpired");

// A small pause after a wrong password slows down guessing (passwords may
// be as short as 4 characters - this is a privacy screen, not a vault).
const WRONG_PASSWORD_DELAY_MS = 500;

// Who is looking at the event: the signed-in owner, a guest who unlocked it
// (cookie), or someone who still needs the password.
export async function getViewerAccess(
  event: EventAccessInfo,
): Promise<{ userId: string | undefined; isOwner: boolean; hasAccess: boolean }> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  const token = (await cookies()).get(eventAccessCookieName(event.id))?.value;

  return {
    userId,
    isOwner: !!userId && userId === event.ownerId,
    hasAccess: hasEventAccess(event, { userId, token, secret: getEventUnlockSecret() }),
  };
}

// Guest API routes: 403 for a locked event. Unknown events pass through so
// the guest service keeps answering 404 as before.
export async function denyLockedEvent(eventId: string): Promise<NextResponse | null> {
  const event = await getEventAccessInfo(eventId);
  if (!event) return null;
  const { hasAccess } = await getViewerAccess(event);
  return hasAccess ? null : errorResponse(await getEventLanguage(eventId), EVENT_LOCKED_ERROR, 403);
}

// Guest API routes that hand out data (GET): 410 for an expired event, to
// everyone but its owner - the event page shows the same to non-owners.
// Unknown events pass through (404 comes from the service).
export async function denyExpiredEvent(eventId: string): Promise<NextResponse | null> {
  const lifecycle = await getEventLifecycle(eventId);
  if (lifecycle?.stage !== "expired") return null;
  const event = await getEventAccessInfo(eventId);
  if (!event) return null;
  const { isOwner } = await getViewerAccess(event);
  return isOwner ? null : errorResponse(await getEventLanguage(eventId), EVENT_EXPIRED_ERROR, 410);
}

export async function unlockEvent(
  eventId: string,
  body: unknown,
): Promise<EventAccessResult<{ cookie: { name: string; value: string; maxAge: number } | null }>> {
  const event = await getEventAccessInfo(eventId);
  if (!event) {
    return { ok: false, status: 404, error: err("eventNotFound") };
  }
  if (!event.accessPassword) {
    return { ok: true, data: { cookie: null } };
  }

  const attempt = (body as { password?: unknown } | null)?.password;
  if (typeof attempt !== "string" || !eventPasswordMatches(event.accessPassword, attempt)) {
    await new Promise((resolve) => setTimeout(resolve, WRONG_PASSWORD_DELAY_MS));
    return { ok: false, status: 401, error: err("wrongPassword") };
  }

  const secret = getEventUnlockSecret();
  if (!secret) {
    console.error("EVENT_UNLOCK_SECRET is not set.");
    return {
      ok: false,
      status: 500,
      error: err("eventOpenFailedLater"),
    };
  }

  return {
    ok: true,
    data: {
      cookie: {
        name: eventAccessCookieName(event.id),
        value: signEventAccess(event.id, event.accessPassword, secret),
        maxAge: EVENT_ACCESS_MAX_AGE_SECONDS,
      },
    },
  };
}
