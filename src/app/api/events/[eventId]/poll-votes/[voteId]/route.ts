import { apiErrors } from "@/i18n/api-errors";
import { err } from "@/i18n/errors";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isUuid } from "@/lib/validation";
import { denyLockedEvent } from "@/services/event-access-service";
import { deletePollVoteForEvent, updatePollVoteForEvent } from "@/services/poll-vote-service";

type RouteContext = {
  params: Promise<{ eventId: string; voteId: string }>;
};

async function readBody(request: Request): Promise<unknown | null> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const fail = apiErrors(context);
  try {
    const { eventId, voteId } = await context.params;
    if (!isUuid(eventId) || !isUuid(voteId)) {
      return fail(err("invalidId"), 400);
    }

    const denied = await denyLockedEvent(eventId);
    if (denied) return denied;

    const body = await readBody(request);
    if (body === null) {
      return fail(err("invalidRequest"), 400);
    }

    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();

    const result = await updatePollVoteForEvent(eventId, voteId, body, data?.claims?.sub);
    if (!result.ok) {
      return fail(result.error, result.status);
    }
    return NextResponse.json(result.data);
  } catch (error) {
    console.error("PATCH /api/events/[eventId]/poll-votes/[voteId] failed:", error);
    return fail(err("voteSaveFailed"), 500);
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const fail = apiErrors(context);
  try {
    const { eventId, voteId } = await context.params;
    if (!isUuid(eventId) || !isUuid(voteId)) {
      return fail(err("invalidId"), 400);
    }

    const denied = await denyLockedEvent(eventId);
    if (denied) return denied;

    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();

    const body = (await readBody(request)) ?? {};
    const result = await deletePollVoteForEvent(eventId, voteId, body, data?.claims?.sub);
    if (!result.ok) {
      return fail(result.error, result.status);
    }
    return NextResponse.json(result.data);
  } catch (error) {
    console.error("DELETE /api/events/[eventId]/poll-votes/[voteId] failed:", error);
    return fail(err("voteDeleteFailed"), 500);
  }
}
