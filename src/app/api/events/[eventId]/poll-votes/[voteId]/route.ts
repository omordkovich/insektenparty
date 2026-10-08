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
  try {
    const { eventId, voteId } = await context.params;
    if (!isUuid(eventId) || !isUuid(voteId)) {
      return NextResponse.json({ error: "Ungültige ID." }, { status: 400 });
    }

    const denied = await denyLockedEvent(eventId);
    if (denied) return denied;

    const body = await readBody(request);
    if (body === null) {
      return NextResponse.json({ error: "Ungültige Anfragedaten." }, { status: 400 });
    }

    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();

    const result = await updatePollVoteForEvent(eventId, voteId, body, data?.claims?.sub);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    return NextResponse.json(result.data);
  } catch (error) {
    console.error("PATCH /api/events/[eventId]/poll-votes/[voteId] failed:", error);
    return NextResponse.json(
      { error: "Deine Stimme konnte nicht gespeichert werden. Bitte versuche es erneut." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const { eventId, voteId } = await context.params;
    if (!isUuid(eventId) || !isUuid(voteId)) {
      return NextResponse.json({ error: "Ungültige ID." }, { status: 400 });
    }

    const denied = await denyLockedEvent(eventId);
    if (denied) return denied;

    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();

    const body = (await readBody(request)) ?? {};
    const result = await deletePollVoteForEvent(eventId, voteId, body, data?.claims?.sub);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    return NextResponse.json(result.data);
  } catch (error) {
    console.error("DELETE /api/events/[eventId]/poll-votes/[voteId] failed:", error);
    return NextResponse.json(
      { error: "Die Stimme konnte nicht gelöscht werden. Bitte versuche es erneut." },
      { status: 500 },
    );
  }
}
