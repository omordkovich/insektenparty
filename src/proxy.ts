import { NextResponse, type NextRequest } from "next/server";
import { maintenanceHtml, shouldShowMaintenance } from "@/lib/maintenance";
import { updateSession } from "@/lib/supabase/proxy";

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

  return await updateSession(request);
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
