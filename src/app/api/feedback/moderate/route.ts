import { NextResponse } from "next/server";
import { errorResponse } from "@/i18n/api-errors";
import { err } from "@/i18n/errors";
import { moderateReview } from "@/services/feedback-service";

// "Jetzt posten" / "Endgültig löschen" on the moderation page (German only).
// POST only - the links in the admin mail just open that page.
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("de", err("invalidRequest"), 400);
  }
  try {
    const result = await moderateReview(body);
    if (!result.ok) return errorResponse("de", result.error, result.status);
    return NextResponse.json({ result: result.result });
  } catch (error) {
    console.error("POST /api/feedback/moderate failed:", error);
    return errorResponse("de", err("invalidInput"), 500);
  }
}
