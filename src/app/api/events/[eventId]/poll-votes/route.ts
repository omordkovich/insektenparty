import { apiErrors } from "@/i18n/api-errors";
import { err } from "@/i18n/errors";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isUuid } from "@/lib/validation";
import { denyExpiredEvent, denyLockedEvent } from "@/services/event-access-service";
import { createPollVoteForEvent, getPollForEvent } from "@/services/poll-vote-service";

type RouteContext = {
  params: Promise<{ eventId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const fail = apiErrors(context);
  try {
    const { eventId } = await context.params;
    if (!isUuid(eventId)) {
      return fail(err("invalidEventId"), 400);
    }

    const denied = await denyLockedEvent(eventId);
    if (denied) return denied;

    const expired = await denyExpiredEvent(eventId);
    if (expired) return expired;

    const result = await getPollForEvent(eventId);
    if (!result.ok) {
      return fail(result.error, result.status);
    }
    return NextResponse.json(result.data);
  } catch (error) {
    console.error("GET /api/events/[eventId]/poll-votes failed:", error);
    return fail(err("pollLoadFailed"), 500);
  }
}

export async function POST(request: Request, context: RouteContext) {
  const fail = apiErrors(context);
  try {
    const { eventId } = await context.params;
    if (!isUuid(eventId)) {
      return fail(err("invalidEventId"), 400);
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

    const result = await createPollVoteForEvent(eventId, body, data?.claims?.sub);
    if (!result.ok) {
      return fail(result.error, result.status);
    }
    return NextResponse.json(result.data, { status: 201 });
  } catch (error) {
    console.error("POST /api/events/[eventId]/poll-votes failed:", error);
    return fail(err("voteSaveFailed"), 500);
  }
}
