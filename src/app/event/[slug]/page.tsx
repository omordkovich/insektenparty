import { notFound, permanentRedirect } from "next/navigation";
import { EventLockedPage } from "@/components/EventLockedPage";
import { Footer } from "@/components/Footer";
import { GuestSection } from "@/components/GuestSection";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { ParallaxSideGraphics } from "@/components/ParallaxSideGraphics";
import type { EventConfig } from "@/lib/event-config";
import { getEventByAddress } from "@/repositories/event-repository";
import { THEME_ASSETS, type ThemeKey } from "@/lib/theme-presets";
import { normalizeArrivalTime } from "@/lib/validation";
import { getUserEntitlements } from "@/services/entitlement-service";
import { getViewerAccess } from "@/services/event-access-service";

type EventPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function EventPage({ params }: EventPageProps) {
  const { slug } = await params;
  const event = await getEventByAddress(slug);

  if (!event) {
    notFound();
  }
  // Opened with an old address (event renamed since): go to the current one.
  if (event.slug !== slug) {
    permanentRedirect(`/event/${event.slug}`);
  }

  const { isOwner, hasAccess } = await getViewerAccess(event);
  // Password-protected and neither the owner nor unlocked: only the title.
  if (!hasAccess) {
    return <EventLockedPage eventId={event.id} title={event.title} />;
  }
  // The password only ever goes to the signed-in owner.
  const ownerAccessPassword = isOwner ? event.accessPassword : null;
  const theme = event.theme as ThemeKey;
  const unlockedThemes =
    isOwner && event.ownerId ? (await getUserEntitlements(event.ownerId)).unlockedThemes : [];

  const config: EventConfig = {
    kicker: event.kicker,
    title: event.title,
    greeting: event.greeting,
    dateLabel: event.dateLabel,
    timeLabel: event.timeLabel,
    locationLabel: event.locationLabel,
    defaultArrivalTime: event.defaultArrivalTime,
    eventDate: event.eventDate,
    eventEndDate: event.eventEndDate,
    eventStartTime: event.eventStartTime ? normalizeArrivalTime(event.eventStartTime) : null,
    eventEndTime: event.eventEndTime ? normalizeArrivalTime(event.eventEndTime) : null,
    contact: {
      name: event.contactName,
      phone: event.contactPhone,
      email: event.contactEmail,
    },
    assets: THEME_ASSETS[theme],
  };

  return (
    <div className="relative flex min-h-dvh flex-col" style={{ isolation: "isolate" }}>
      <Header
        config={config}
        logoHref={isOwner ? "/" : `/event/${slug}/info`}
        themeEdit={
          isOwner
            ? { eventId: event.id, theme, unlockedThemes, accessPassword: ownerAccessPassword }
            : undefined
        }
      />
      <main>
        <Hero config={config} eventId={event.id} isOwner={isOwner} />
        <GuestSection
          apiBasePath={`/api/events/${event.id}/guests`}
          defaultArrivalTime={config.defaultArrivalTime}
          isOwner={isOwner}
        />
      </main>
      <Footer
        config={config}
        eventId={event.id}
        slug={slug}
        isOwner={isOwner}
        accessPassword={ownerAccessPassword}
      />

      <ParallaxSideGraphics
        leftSrc={config.assets.plantsLeft}
        rightSrc={config.assets.plantsRight}
      />
    </div>
  );
}
