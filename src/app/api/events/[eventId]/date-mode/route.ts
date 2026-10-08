import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isUuid } from "@/lib/validation";
import { changeDateMode } from "@/services/date-mode-service";

type RouteContext = {
  params: Promise<{ eventId: string }>;
};

// Owner only: "Noch kein Termin" / "Termin abstimmen lassen" / "Fester
// Termin". 409 with needsConfirm + counts when guests or votes would be lost.
export async function PUT(request: Request, context: RouteContext) {
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

    const result = await changeDateMode(eventId, userId, body);
    if (!result.ok) {
      return NextResponse.json(
        { error: result.error, ...(result.confirm ? { needsConfirm: true, ...result.confirm } : {}) },
        { status: result.status },
      );
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("PUT /api/events/[eventId]/date-mode failed:", error);
    return NextResponse.json(
      { error: "Der Termin konnte nicht gespeichert werden. Bitte versuche es erneut." },
      { status: 500 },
    );
  }
}
