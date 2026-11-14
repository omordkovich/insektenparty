import { apiErrors } from "@/i18n/api-errors";
import { err } from "@/i18n/errors";
import { NextResponse } from "next/server";
import { isUuid } from "@/lib/validation";
import { unlockEvent } from "@/services/event-access-service";

type RouteContext = {
  params: Promise<{ eventId: string }>;
};

// Locked event page: checks the password and sets the unlock cookie.
export async function POST(request: Request, context: RouteContext) {
  const fail = apiErrors(context);
  try {
    const { eventId } = await context.params;
    if (!isUuid(eventId)) {
      return fail(err("invalidEventId"), 400);
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return fail(err("invalidRequest"), 400);
    }

    const result = await unlockEvent(eventId, body);
    if (!result.ok) {
      return fail(result.error, result.status);
    }

    const response = NextResponse.json({ ok: true });
    if (result.data.cookie) {
      response.cookies.set(result.data.cookie.name, result.data.cookie.value, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: result.data.cookie.maxAge,
      });
    }
    return response;
  } catch (error) {
    console.error("POST /api/events/[eventId]/unlock failed:", error);
    return fail(err("eventOpenFailed"), 500);
  }
}
