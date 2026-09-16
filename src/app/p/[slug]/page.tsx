import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getDb } from "@/db";
import { parties } from "@/db/schema";
import { Footer } from "@/components/Footer";
import { GuestSection } from "@/components/GuestSection";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { MadeWithBadge } from "@/components/MadeWithBadge";
import { ParallaxSideGraphics } from "@/components/ParallaxSideGraphics";
import type { PartyConfig } from "@/lib/party-config";
import { createClient } from "@/lib/supabase/server";
import { THEME_ASSETS, type ThemeKey } from "@/lib/theme-presets";

type PartyPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function PartyPage({ params }: PartyPageProps) {
  const { slug } = await params;
  const db = getDb();
  const [party] = await db.select().from(parties).where(eq(parties.slug, slug));

  if (!party) {
    notFound();
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const isOwner = data?.claims?.sub === party.ownerId;

  const config: PartyConfig = {
    kicker: party.kicker,
    title: party.title,
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
      <Header config={config} />
      <main className="flex-1">
        <Hero config={config} partyId={party.id} isOwner={isOwner} />
        <GuestSection
          apiBasePath={`/api/parties/${party.id}/guests`}
          defaultArrivalTime={config.defaultArrivalTime}
        />
      </main>
      <Footer config={config} partyId={party.id} isOwner={isOwner} />
      <MadeWithBadge />

      <ParallaxSideGraphics
        leftSrc={config.assets.plantsLeft}
        rightSrc={config.assets.plantsRight}
      />
    </div>
  );
}
