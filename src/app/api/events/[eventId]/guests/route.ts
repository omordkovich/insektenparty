import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isUuid } from "@/lib/validation";
import { createGuestForEvent, listGuestsForEvent } from "@/services/guest-service";

type RouteContext = {
  params: Promise<{ eventId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { eventId } = await context.params;
    if (!isUuid(eventId)) {
      return NextResponse.json({ error: "Ungültige Event-ID." }, { status: 400 });
    }

    const guests = await listGuestsForEvent(eventId);
    return NextResponse.json(guests);
  } catch (error) {
    console.error("GET /api/events/[eventId]/guests failed:", error);
    return NextResponse.json(
      { error: "Die Gästeliste konnte nicht geladen werden." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { eventId } = await context.params;
    if (!isUuid(eventId)) {
      return NextResponse.json({ error: "Ungültige Event-ID." }, { status: 400 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Ungültige Anfragedaten." }, { status: 400 });
    }

    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();
    const requesterId = data?.claims?.sub;

    const result = await createGuestForEvent(eventId, body, requesterId);

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json(result.data, { status: 201 });
  } catch (error) {
    console.error("POST /api/events/[eventId]/guests failed:", error);
    return NextResponse.json(
      {
        error: "Der Gast konnte nicht gespeichert werden. Bitte versuche es erneut.",
      },
      { status: 500 },
    );
  }
}
