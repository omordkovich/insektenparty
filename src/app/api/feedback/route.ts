import { NextResponse } from "next/server";
import { DEFAULT_LOCALE, isLocale } from "@/i18n/config";
import { errorResponse } from "@/i18n/api-errors";
import { err } from "@/i18n/errors";
import { todayInBerlin } from "@/lib/date-poll";
import { submitFeedback } from "@/services/feedback-service";

// Feedback page: stores the host's review (pending) and mails it to
// info@gastzilla.de for approval. `locale` is the language of the page and
// becomes the review's language.
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse(DEFAULT_LOCALE, err("invalidRequest"), 400);
  }
  const requested = body && typeof body === "object" ? (body as { locale?: unknown }).locale : undefined;
  const locale = isLocale(requested) ? requested : DEFAULT_LOCALE;

  try {
    const result = await submitFeedback(body, locale, todayInBerlin());
    if (!result.ok) return errorResponse(locale, result.error, result.status);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("POST /api/feedback failed:", error);
    return errorResponse(locale, err("feedbackSendFailed"), 500);
  }
}
