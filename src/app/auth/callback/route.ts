import { type NextRequest, NextResponse } from "next/server";
import { isSafeRelativePath } from "@/lib/redirect";
import { createClient } from "@/lib/supabase/server";
import {
  consentMetadata,
  GOOGLE_CONSENT_COOKIE,
  GOOGLE_CONSENT_COOKIE_PATH,
  hasAcceptedTerms,
} from "@/lib/terms-consent";

// OAuth return point (Google). Exchanges the one-time `code` for a session.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");
  // Set by the register tab once the AGB/age checkboxes were ticked. Supabase
  // can't carry user metadata through an OAuth redirect, so the consent is
  // recorded here after the sign-in. Login-tab sign-ins don't set it: the
  // start page's ConsentDialog asks for the consent instead.
  const consentGiven = request.cookies.get(GOOGLE_CONSENT_COOKIE)?.value === "1";

  const redirectTo = request.nextUrl.clone();
  redirectTo.pathname = next && isSafeRelativePath(next) ? next : "/";
  redirectTo.search = "";

  const respond = (url: URL) => {
    const response = NextResponse.redirect(url);
    // One-time use, whatever happened.
    response.cookies.delete({ name: GOOGLE_CONSENT_COOKIE, path: GOOGLE_CONSENT_COOKIE_PATH });
    return response;
  };

  const failed = () => {
    redirectTo.pathname = "/";
    redirectTo.search = "?auth_error=1";
    return respond(redirectTo);
  };

  // No code: the user cancelled at Google, or the link was tampered with.
  if (!code) return failed();

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.user) return failed();

  // An account that already accepted keeps its original consent record.
  if (consentGiven && !hasAcceptedTerms(data.user.user_metadata)) {
    const { error: updateError } = await supabase.auth.updateUser({ data: consentMetadata() });
    // The JWT in the session cookie still carries the old metadata; refresh it
    // so the server sees the consent on the very next request.
    if (!updateError) await supabase.auth.refreshSession();
  }

  return respond(redirectTo);
}
