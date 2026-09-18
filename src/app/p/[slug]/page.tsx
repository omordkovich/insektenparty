import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getDb } from "@/db";
import { events } from "@/db/schema";
import { Footer } from "@/components/Footer";
import { GuestSection } from "@/components/GuestSection";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { ParallaxSideGraphics } from "@/components/ParallaxSideGraphics";
import type { EventConfig } from "@/lib/event-config";
import { createClient } from "@/lib/supabase/server";
import { THEME_ASSETS, type ThemeKey } from "@/lib/theme-presets";
import { normalizeArrivalTime } from "@/lib/validation";

type EventPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function EventPage({ params }: EventPageProps) {
  const { slug } = await params;
  const db = getDb();
  const [event] = await db.select().from(events).where(eq(events.slug, slug));

  if (!event) {
    notFound();
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const isOwner = data?.claims?.sub === event.ownerId;

  const config: EventConfig = {
    kicker: event.kicker,
    title: event.title,
    greeting: event.greeting,
    dateLabel: event.dateLabel,
    timeLabel: event.timeLabel,
    locationLabel: event.locationLabel,
    defaultArrivalTime: event.defaultArrivalTime,
    eventDate: event.eventDate,
    eventStartTime: event.eventStartTime ? normalizeArrivalTime(event.eventStartTime) : null,
    eventEndTime: event.eventEndTime ? normalizeArrivalTime(event.eventEndTime) : null,
    contact: {
      name: event.contactName,
      phone: event.contactPhone,
      email: event.contactEmail,
    },
    assets: THEME_ASSETS[event.theme as ThemeKey],
  };

  return (
    <div className="relative flex min-h-full flex-col" style={{ isolation: "isolate" }}>
      <Header config={config} />
      <main className="flex-1">
        <Hero config={config} eventId={event.id} isOwner={isOwner} />
        <GuestSection
          apiBasePath={`/api/events/${event.id}/guests`}
          defaultArrivalTime={config.defaultArrivalTime}
        />
      </main>
      <Footer config={config} eventId={event.id} isOwner={isOwner} />

      <ParallaxSideGraphics
        leftSrc={config.assets.plantsLeft}
        rightSrc={config.assets.plantsRight}
      />
    </div>
  );
}
