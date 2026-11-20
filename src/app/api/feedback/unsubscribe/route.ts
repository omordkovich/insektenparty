import { NextResponse } from "next/server";
import { apiErrors } from "@/i18n/api-errors";
import { err } from "@/i18n/errors";
import { unsubscribeFeedback } from "@/services/feedback-service";

// "Keine Feedback-Mails mehr" (button on the unsubscribe page).
export async function POST(request: Request) {
  const fail = apiErrors();
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail(err("invalidRequest"), 400);
  }
  try {
    const result = await unsubscribeFeedback(body);
    if (!result.ok) return fail(result.error, result.status);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("POST /api/feedback/unsubscribe failed:", error);
    return fail(err("invalidInput"), 500);
  }
}
