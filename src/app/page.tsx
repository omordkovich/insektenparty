import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { parties } from "@/db/schema";
import { AuthButtons } from "@/components/AuthButtons";
import { Button } from "@/components/Button";
import { CreatePartyButton } from "@/components/CreatePartyButton";
import { PartyList } from "@/components/PartyList";
import { SiteHeader } from "@/components/SiteHeader";
import type { ThemeKey } from "@/lib/theme-presets";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  const name =
    typeof claims?.user_metadata?.name === "string" ? claims.user_metadata.name : null;

  const myParties = claims
    ? (
        await getDb()
          .select({
            id: parties.id,
            slug: parties.slug,
            title: parties.title,
            theme: parties.theme,
          })
          .from(parties)
          .where(eq(parties.ownerId, claims.sub))
          .orderBy(desc(parties.createdAt))
      ).map((party) => ({ ...party, theme: party.theme as ThemeKey }))
    : [];

  return (
    <>
      <SiteHeader />
      <main className="flex min-h-full flex-col items-center justify-center px-6 py-16 text-center">
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
            <div className="mt-8">
              <PartyList initialParties={myParties} />
            </div>
            <div className="mt-6">
              <CreatePartyButton />
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
      </main>
    </>
  );
}
