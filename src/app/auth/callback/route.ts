import { type NextRequest, NextResponse } from "next/server";
import { DISPLAY_NAME_KEY, getAccountName } from "@/lib/account";
import { isSafeRelativePath } from "@/lib/redirect";
import {
  parseSignupIntent,
  SIGNUP_INTENT_COOKIE,
  SIGNUP_INTENT_PATH,
} from "@/lib/signup-intent";
import { createClient } from "@/lib/supabase/server";
import { consentMetadata, hasAcceptedTerms } from "@/lib/terms-consent";

// OAuth return point (Google). Exchanges the one-time `code` for a session.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");
  // Set by the register tab once name and AGB/age checkboxes were filled in.
  // Supabase can't carry user metadata through an OAuth redirect, so it is
  // recorded here after the sign-in. Login-tab sign-ins have no intent: the
  // start page's ConsentDialog asks for it instead.
  const intent = parseSignupIntent(request.cookies.get(SIGNUP_INTENT_COOKIE)?.value);

  const redirectTo = request.nextUrl.clone();
  redirectTo.pathname = next && isSafeRelativePath(next) ? next : "/";
  redirectTo.search = "";

  const respond = (url: URL) => {
    const response = NextResponse.redirect(url);
    // One-time use, whatever happened.
    response.cookies.delete({ name: SIGNUP_INTENT_COOKIE, path: SIGNUP_INTENT_PATH });
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

  if (intent) {
    // Only fill in what is missing: an existing account that used the
    // register tab keeps its original consent record and name.
    const metadata = data.user.user_metadata;
    const update: Record<string, unknown> = {};
    if (!hasAcceptedTerms(metadata)) Object.assign(update, consentMetadata());
    if (!getAccountName(metadata)) update[DISPLAY_NAME_KEY] = intent.displayName;

    if (Object.keys(update).length > 0) {
      const { error: updateError } = await supabase.auth.updateUser({ data: update });
      // The JWT in the session cookie still carries the old metadata; refresh
      // it so the server sees the new values on the very next request.
      if (!updateError) await supabase.auth.refreshSession();
    }
  }

  return respond(redirectTo);
}
