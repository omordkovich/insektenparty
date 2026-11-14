import { apiErrors } from "@/i18n/api-errors";
import { err } from "@/i18n/errors";
import { NextResponse } from "next/server";
import { isUuid } from "@/lib/validation";
import { requestEventPassword } from "@/services/password-request-service";

type RouteContext = {
  params: Promise<{ eventId: string }>;
};

// Locked event page: "Passwort anfragen" - mails the request to the owner.
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

    const result = await requestEventPassword(eventId, body);
    if (!result.ok) {
      return fail(result.error, result.status);
    }
    return NextResponse.json(result.data);
  } catch (error) {
    console.error("POST /api/events/[eventId]/password-request failed:", error);
    return fail(err("requestSendFailed"), 500);
  }
}
