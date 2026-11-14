import { apiErrors } from "@/i18n/api-errors";
import { err } from "@/i18n/errors";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isUuid, validateRequestBody } from "@/lib/validation";
import { deleteEventForOwner, updateEventForOwner } from "@/services/event-service";

type RouteContext = {
  params: Promise<{ eventId: string }>;
};

// Partial update: the body may contain any subset of the known event fields
// plus an optional "theme" and "accessPassword" (string, or null to remove
// the password protection) - in practice either one field from the inline
// EditableField save, or {theme, accessPassword} from EventDialog's settings
// mode. Unknown keys are ignored (see event-service.ts).
export async function PATCH(request: Request, context: RouteContext) {
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

    const bodyValidation = validateRequestBody(body);
    if (!bodyValidation.ok) {
      return fail(bodyValidation.error, 400);
    }

    const result = await updateEventForOwner(eventId, userId, bodyValidation.value);

    if (!result.ok) {
      return fail(result.error, result.status);
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("PATCH /api/events/[eventId] failed:", error);
    return fail(err("eventSaveFailed"), 500);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
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

    const result = await deleteEventForOwner(eventId, userId);

    if (!result.ok) {
      return fail(result.error, result.status);
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("DELETE /api/events/[eventId] failed:", error);
    return fail(err("eventDeleteFailed"), 500);
  }
}
