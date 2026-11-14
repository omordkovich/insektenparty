import { apiErrors } from "@/i18n/api-errors";
import { err } from "@/i18n/errors";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isUuid } from "@/lib/validation";
import { denyLockedEvent } from "@/services/event-access-service";
import { deleteGuestForEvent, updateGuestForEvent } from "@/services/guest-service";

type RouteContext = {
  params: Promise<{ eventId: string; guestId: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const fail = apiErrors(context);
  try {
    const { eventId, guestId } = await context.params;
    if (!isUuid(eventId) || !isUuid(guestId)) {
      return fail(err("invalidId"), 400);
    }

    const denied = await denyLockedEvent(eventId);
    if (denied) return denied;

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return fail(err("invalidRequest"), 400);
    }

    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();
    const requesterId = data?.claims?.sub;

    const result = await updateGuestForEvent(eventId, guestId, body, requesterId);

    if (!result.ok) {
      return fail(result.error, result.status);
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("PATCH /api/events/[eventId]/guests/[guestId] failed:", error);
    return fail(err("guestSaveFailed"), 500);
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const fail = apiErrors(context);
  try {
    const { eventId, guestId } = await context.params;
    if (!isUuid(eventId) || !isUuid(guestId)) {
      return fail(err("invalidId"), 400);
    }

    const denied = await denyLockedEvent(eventId);
    if (denied) return denied;

    let body: unknown = null;
    try {
      body = await request.json();
    } catch {
      // A missing/empty body is fine for owner requests (see the recaptcha
      // check inside deleteGuestForEvent); public requests without a token
      // are rejected there.
    }

    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();
    const requesterId = data?.claims?.sub;

    const result = await deleteGuestForEvent(eventId, guestId, body, requesterId);

    if (!result.ok) {
      return fail(result.error, result.status);
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("DELETE /api/events/[eventId]/guests/[guestId] failed:", error);
    return fail(err("guestDeleteFailed"), 500);
  }
}
