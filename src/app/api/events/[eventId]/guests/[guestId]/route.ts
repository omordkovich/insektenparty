import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isUuid } from "@/lib/validation";
import { deleteGuestForEvent, updateGuestForEvent } from "@/services/guest-service";

type RouteContext = {
  params: Promise<{ eventId: string; guestId: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { eventId, guestId } = await context.params;
    if (!isUuid(eventId) || !isUuid(guestId)) {
      return NextResponse.json({ error: "Ungültige ID." }, { status: 400 });
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

    const result = await updateGuestForEvent(eventId, guestId, body, requesterId);

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("PATCH /api/events/[eventId]/guests/[guestId] failed:", error);
    return NextResponse.json(
      {
        error: "Der Gast konnte nicht gespeichert werden. Bitte versuche es erneut.",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { eventId, guestId } = await context.params;
    if (!isUuid(eventId) || !isUuid(guestId)) {
      return NextResponse.json({ error: "Ungültige ID." }, { status: 400 });
    }

    const result = await deleteGuestForEvent(eventId, guestId);

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("DELETE /api/events/[eventId]/guests/[guestId] failed:", error);
    return NextResponse.json(
      {
        error: "Der Gast konnte nicht gelöscht werden. Bitte versuche es erneut.",
      },
      { status: 500 },
    );
  }
}
