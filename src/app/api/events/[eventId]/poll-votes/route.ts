import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isUuid } from "@/lib/validation";
import { denyLockedEvent } from "@/services/event-access-service";
import { createPollVoteForEvent, getPollForEvent } from "@/services/poll-vote-service";

type RouteContext = {
  params: Promise<{ eventId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { eventId } = await context.params;
    if (!isUuid(eventId)) {
      return NextResponse.json({ error: "Ungültige Event-ID." }, { status: 400 });
    }

    const denied = await denyLockedEvent(eventId);
    if (denied) return denied;

    const result = await getPollForEvent(eventId);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    return NextResponse.json(result.data);
  } catch (error) {
    console.error("GET /api/events/[eventId]/poll-votes failed:", error);
    return NextResponse.json({ error: "Die Abstimmung konnte nicht geladen werden." }, { status: 500 });
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { eventId } = await context.params;
    if (!isUuid(eventId)) {
      return NextResponse.json({ error: "Ungültige Event-ID." }, { status: 400 });
    }

    const denied = await denyLockedEvent(eventId);
    if (denied) return denied;

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Ungültige Anfragedaten." }, { status: 400 });
    }

    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();

    const result = await createPollVoteForEvent(eventId, body, data?.claims?.sub);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    return NextResponse.json(result.data, { status: 201 });
  } catch (error) {
    console.error("POST /api/events/[eventId]/poll-votes failed:", error);
    return NextResponse.json(
      { error: "Deine Stimme konnte nicht gespeichert werden. Bitte versuche es erneut." },
      { status: 500 },
    );
  }
}
