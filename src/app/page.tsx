import { AuthButtons } from "@/components/AuthButtons";
import { Button } from "@/components/Button";
import { EventList } from "@/components/EventList";
import { LegalLinks } from "@/components/LegalLinks";
import { SiteHeader } from "@/components/SiteHeader";
import type { ThemeKey } from "@/lib/theme-presets";
import { createClient } from "@/lib/supabase/server";
import { getEventsByOwner } from "@/repositories/event-repository";
import { getUserEntitlements } from "@/services/entitlement-service";

export default async function Home() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  const name =
    typeof claims?.user_metadata?.name === "string" ? claims.user_metadata.name : null;

  const myEvents = claims
    ? (await getEventsByOwner(claims.sub)).map((event) => ({
        ...event,
        theme: event.theme as ThemeKey,
      }))
    : [];

  const entitlements = claims ? await getUserEntitlements(claims.sub) : null;

  return (
    <>
      <SiteHeader />
      <main className="flex min-h-full flex-col items-center px-6 py-16 text-center">
        <h1 className="max-w-xl text-2xl font-normal text-zinc-800 sm:text-3xl">
          {claims ? `Hi ${name ?? claims.email}` : "Willkommen bei GASTZILLA!"}
        </h1>

        {!claims ? (
          <>
            <p className="mt-3 max-w-md text-zinc-600">
              Melde dich an, um deine Events zu verwalten.
            </p>
            <div className="mt-6">
              <AuthButtons />
            </div>
          </>
        ) : (
          <>
            <div className="mt-8 w-full">
              <EventList
                initialEvents={myEvents}
                eventLimit={entitlements?.eventLimit ?? 1}
                unlockedThemes={entitlements?.unlockedThemes ?? []}
              />
            </div>
            <div className="mt-6">
              <form action="/auth/signout" method="post">
                <Button variant="outline" type="submit">
                  Logout
                </Button>
              </form>
            </div>
          </>
        )}

        <LegalLinks className="mt-auto pt-12" />
      </main>
    </>
  );
}
