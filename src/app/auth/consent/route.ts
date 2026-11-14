import { apiErrors } from "@/i18n/api-errors";
import { err } from "@/i18n/errors";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { consentUpdate } from "@/lib/terms-consent";

// Records AGB/privacy/age consent for the signed-in user. Used by the
// ConsentDialog for accounts created through Google's login tab, which skips
// the checkboxes, and for accounts that still have to agree to changed AGB.
// Timestamp and versions are set here, not by the client.
export async function POST() {
  const fail = apiErrors();
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;

  if (!claims) {
    return fail(err("signInRequired"), 401);
  }

  const update = consentUpdate(claims.user_metadata);
  if (update) {
    const { error } = await supabase.auth.updateUser({ data: update });
    if (error) {
      return fail(err("consentSaveFailed"), 500);
    }
    // Make the new metadata visible in the session's JWT right away.
    await supabase.auth.refreshSession();
  }

  return NextResponse.json({ ok: true });
}
