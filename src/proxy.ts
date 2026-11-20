import createIntlMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "@/i18n/routing";
import { maintenanceHtml, shouldShowMaintenance } from "@/lib/maintenance";
import { sectionRedirect } from "@/lib/section-redirect";
import { updateSession } from "@/lib/supabase/proxy";

const intlMiddleware = createIntlMiddleware(routing);

// Paths that never get a language prefix: route handlers, event pages (their
// language comes from the event), metadata files.
const NON_INTL_SECTIONS = ["/api", "/event", "/p", "/.well-known", "/monitoring", "/_vercel"];
const NON_INTL_PATHS = new Set([
  "/auth/callback",
  "/auth/confirm",
  "/auth/consent",
  "/auth/delete-account",
  "/auth/signout",
  "/llms.txt",
  "/robots.txt",
  "/sitemap.xml",
]);

export function isIntlPath(pathname: string): boolean {
  if (NON_INTL_PATHS.has(pathname)) return false;
  return !NON_INTL_SECTIONS.some((section) => pathname === section || pathname.startsWith(`${section}/`));
}

export async function proxy(request: NextRequest) {
  // Under construction (MAINTENANCE_MODE=true): answer before anything else
  // runs. 503 + Retry-After tells search engines it's temporary, so they
  // neither index the placeholder nor drop the real pages.
  if (
    shouldShowMaintenance({
      enabled: process.env.MAINTENANCE_MODE,
      host: request.headers.get("host") ?? "",
      pathname: request.nextUrl.pathname,
    })
  ) {
    return new NextResponse(maintenanceHtml(), {
      status: 503,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "retry-after": "3600",
        "cache-control": "no-store",
      },
    });
  }

  const sectionTarget = sectionRedirect(request.nextUrl.pathname);
  if (sectionTarget) {
    const url = request.nextUrl.clone();
    url.pathname = sectionTarget;
    return NextResponse.redirect(url, 308);
  }

  const createResponse = isIntlPath(request.nextUrl.pathname)
    ? () => intlMiddleware(request)
    : () => NextResponse.next({ request });
  return await updateSession(request, createResponse);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
