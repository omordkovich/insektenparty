import { Button } from "@/components/Button";
import { EventList } from "@/components/EventList";
import { LandingContent } from "@/components/LandingContent";
import { LegalLinks } from "@/components/LegalLinks";
import { LinkExpiredDialog, type LinkExpiredKind } from "@/components/LinkExpiredDialog";
import { pageMetadata } from "@/lib/page-metadata";
import { SITE_DESCRIPTION } from "@/lib/site";
import { SiteHeader } from "@/components/SiteHeader";
import type { ThemeKey } from "@/lib/theme-presets";
import { createClient } from "@/lib/supabase/server";
import { getEventsByOwner } from "@/repositories/event-repository";
import { getUserEntitlements } from "@/services/entitlement-service";

export const metadata = pageMetadata({
  title: "GASTZILLA – Digitale Einladungen & Gästelisten für jedes Event",
  description: SITE_DESCRIPTION,
  path: "/",
});

type HomeProps = {
  searchParams: Promise<{ link_expired?: string | string[] }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const { link_expired } = await searchParams;
  const linkExpired: LinkExpiredKind | null =
    link_expired === "recovery" ? "recovery" : link_expired === "signup" ? "signup" : null;

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
        {!claims ? (
          <LandingContent />
        ) : (
          <>
            <h1 className="max-w-xl text-2xl font-normal text-zinc-800 sm:text-3xl">
              Hi {name ?? claims.email}
            </h1>
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

      {linkExpired ? <LinkExpiredDialog kind={linkExpired} /> : null}
    </>
  );
}
