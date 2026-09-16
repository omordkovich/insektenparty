import { eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { getDb } from "@/db";
import { parties } from "@/db/schema";
import { Header } from "@/components/Header";
import { ParallaxSideGraphics } from "@/components/ParallaxSideGraphics";
import { PartyEditForm } from "@/components/PartyEditForm";
import type { PartyConfig } from "@/lib/party-config";
import { createClient } from "@/lib/supabase/server";
import { THEME_ASSETS, type ThemeKey } from "@/lib/theme-presets";

type PartyEditPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function PartyEditPage({ params }: PartyEditPageProps) {
  const { slug } = await params;
  const db = getDb();
  const [party] = await db.select().from(parties).where(eq(parties.slug, slug));

  if (!party) {
    notFound();
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;

  if (!userId || userId !== party.ownerId) {
    redirect("/kein-zugang");
  }

  const headerConfig: PartyConfig = {
    kicker: party.kicker,
    title: party.title || "Deine Party",
    greeting: party.greeting,
    dateLabel: party.dateLabel,
    timeLabel: party.timeLabel,
    locationLabel: party.locationLabel,
    defaultArrivalTime: party.defaultArrivalTime,
    eventDate: party.eventDate,
    eventStartTime: party.eventStartTime,
    eventEndTime: party.eventEndTime,
    contact: {
      name: party.contactName,
      phone: party.contactPhone,
      email: party.contactEmail,
    },
    assets: THEME_ASSETS[party.theme as ThemeKey],
  };

  return (
    <div className="relative flex min-h-full flex-col" style={{ isolation: "isolate" }}>
      <Header config={headerConfig} />
      <main className="flex-1">
        <PartyEditForm party={party} />
      </main>

      <ParallaxSideGraphics
        leftSrc={headerConfig.assets.plantsLeft}
        rightSrc={headerConfig.assets.plantsRight}
      />
    </div>
  );
}
