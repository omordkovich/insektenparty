import { createServerClient } from "@supabase/ssr";
import type { NextRequest, NextResponse } from "next/server";

// `createResponse` builds the response this request gets (a plain
// NextResponse.next or next-intl's rewrite). It is called again once the
// session cookies are refreshed, so the new cookies reach both the browser
// and the server components.
export async function updateSession(
  request: NextRequest,
  createResponse: () => NextResponse,
): Promise<NextResponse> {
  let supabaseResponse = createResponse();
  // A redirect (e.g. "/" → "/en") renders nothing - the follow-up request
  // refreshes the session.
  if (supabaseResponse.status >= 300 && supabaseResponse.status < 400) {
    return supabaseResponse;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = createResponse();
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
          Object.entries(headers).forEach(([key, value]) =>
            supabaseResponse.headers.set(key, value),
          );
        },
      },
    },
  );

  // Do not run code between createServerClient and getClaims() - a refresh
  // here is what keeps the session cookie valid across requests. Removing
  // this call is what causes users to get randomly logged out.
  await supabase.auth.getClaims();

  return supabaseResponse;
}
