import { apiErrors } from "@/i18n/api-errors";
import { err } from "@/i18n/errors";
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
  const fail = apiErrors(context);
  try {
    const { eventId } = await context.params;
    if (!isUuid(eventId)) {
      return fail(err("invalidEventId"), 400);
    }

    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();
    const userId = data?.claims?.sub;
    if (!userId) {
      return fail(err("signInRequired"), 401);
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return fail(err("invalidRequest"), 400);
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
    return fail(err("dateSaveFailed"), 500);
  }
}
