import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isUuid } from "@/lib/validation";
import { deleteEventForOwner, updateEventForOwner } from "@/services/event-service";

type RouteContext = {
  params: Promise<{ eventId: string }>;
};

// Partial update: the body may contain any subset of the known event fields
// plus an optional "theme" (in practice either one field from the inline
// EditableField save, or {theme, title} together from EventDialog's edit
// mode). Unknown keys are ignored (see event-service.ts).
export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { eventId } = await context.params;
    if (!isUuid(eventId)) {
      return NextResponse.json({ error: "Ungültige Event-ID." }, { status: 400 });
    }

    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();
    const userId = data?.claims?.sub;

    if (!userId) {
      return NextResponse.json({ error: "Bitte melde dich an." }, { status: 401 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Ungültige Anfragedaten." }, { status: 400 });
    }

    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      return NextResponse.json({ error: "Ungültige Anfragedaten." }, { status: 400 });
    }

    const result = await updateEventForOwner(eventId, userId, body as Record<string, unknown>);

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("PATCH /api/events/[eventId] failed:", error);
    return NextResponse.json(
      { error: "Das Event konnte nicht gespeichert werden. Bitte versuche es erneut." },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { eventId } = await context.params;
    if (!isUuid(eventId)) {
      return NextResponse.json({ error: "Ungültige Event-ID." }, { status: 400 });
    }

    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();
    const userId = data?.claims?.sub;

    if (!userId) {
      return NextResponse.json({ error: "Bitte melde dich an." }, { status: 401 });
    }

    const result = await deleteEventForOwner(eventId, userId);

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("DELETE /api/events/[eventId] failed:", error);
    return NextResponse.json(
      { error: "Das Event konnte nicht gelöscht werden. Bitte versuche es erneut." },
      { status: 500 },
    );
  }
}
