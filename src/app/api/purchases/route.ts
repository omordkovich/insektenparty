import { apiErrors } from "@/i18n/api-errors";
import { err } from "@/i18n/errors";
import { NextResponse } from "next/server";
import { purchase } from "@/services/purchase-service";
import { createClient } from "@/lib/supabase/server";
import { consentRequiredError } from "@/lib/terms-consent";

export async function POST(request: Request) {
  const fail = apiErrors();
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();
    const userId = data?.claims?.sub;

    if (!userId) {
      return fail(err("signInRequired"), 401);
    }

    const consentError = consentRequiredError(data.claims.user_metadata);
    if (consentError) {
      return fail(consentError, 403);
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return fail(err("invalidRequest"), 400);
    }

    const result = await purchase(userId, body);

    if (!result.ok) {
      return fail(result.error, result.status);
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("POST /api/purchases failed:", error);
    return fail(err("purchaseFailed"), 500);
  }
}
