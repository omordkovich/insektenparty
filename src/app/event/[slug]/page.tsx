import { notFound, permanentRedirect } from "next/navigation";
import { DatePollSection } from "@/components/DatePollSection";
import { DateUnknownNotice } from "@/components/DateUnknownNotice";
import { EventExpiredPage } from "@/components/EventExpiredPage";
import { EventLockedPage } from "@/components/EventLockedPage";
import { EventOverNotice } from "@/components/EventOverNotice";
import { Footer } from "@/components/Footer";
import { GuestSection } from "@/components/GuestSection";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { ParallaxSideGraphics } from "@/components/ParallaxSideGraphics";
import { formatDateLabel, formatDateRangeLabel, formatDottedDate } from "@/lib/calendar";
import { countYes, isDateMode, todayInBerlin } from "@/lib/date-poll";
import type { DateSettings } from "@/lib/date-poll-form";
import type { EventConfig } from "@/lib/event-config";
import { isEventPlan, latestAllowedDate } from "@/lib/event-plan";
import { unlockedThemesFor } from "@/lib/features";
import type { InvitationBase } from "@/lib/invitation-text";
import { isDummyPaymentEnabled } from "@/lib/payments";
import type { UnlockContext } from "@/lib/products";
import { buildEventShareUrl } from "@/lib/share";
import { getPollOptions, getPollVotes } from "@/repositories/date-poll-repository";
import { getEventByAddress } from "@/repositories/event-repository";
import { THEME_ASSETS, type ThemeKey } from "@/lib/theme-presets";
import { normalizeArrivalTime } from "@/lib/validation";
import { getUserEntitlements } from "@/services/entitlement-service";
import { getViewerAccess } from "@/services/event-access-service";
import { getEventLifecycle } from "@/services/event-lifecycle-service";

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
  const lifecycle = await getEventLifecycle(event.id);
  const stage = lifecycle?.stage ?? "active";
  // Long past: only the owner still sees the event. Checked before the
  // password page, which would name the event.
  if (stage === "expired" && !isOwner) {
    return <EventExpiredPage />;
  }
  // Over: everything is shown, nothing can be changed any more.
  const readOnly = stage !== "active";
  // Password-protected and neither the owner nor unlocked: only the title.
  if (!hasAccess) {
    return <EventLockedPage eventId={event.id} title={event.title} />;
  }
  // The password only ever goes to the signed-in owner.
  const ownerAccessPassword = isOwner ? event.accessPassword : null;
  const theme = event.theme as ThemeKey;
  const plan = isEventPlan(event.plan) ? event.plan : "free";
  // Owner only: what the "Freischalten" dialogs and the design picker need.
  const entitlements = isOwner && event.ownerId ? await getUserEntitlements(event.ownerId) : null;
  const unlockedThemes = entitlements ? unlockedThemesFor(entitlements, plan) : [];
  const unlock: UnlockContext | null = entitlements
    ? { eventCredits: entitlements.eventCredits, dummyPayments: isDummyPaymentEnabled() }
    : null;
  // Owner only: the X at the badge, while the event can still be changed.
  const canRemoveBadge = unlock !== null && !event.badgeHidden && !readOnly;
  const dateMode = isDateMode(event.dateMode) ? event.dateMode : "fixed";
  const eventStartTime = event.eventStartTime ? normalizeArrivalTime(event.eventStartTime) : null;
  const eventEndTime = event.eventEndTime ? normalizeArrivalTime(event.eventEndTime) : null;

  // Owner only: what the "Termin" window (pencil at the date) starts from.
  let dateSettings: DateSettings | null = null;
  if (isOwner && !readOnly) {
    const [options, votes] =
      dateMode === "poll" ? await Promise.all([getPollOptions(event.id), getPollVotes(event.id)]) : [[], []];
    dateSettings = {
      mode: dateMode,
      date: event.eventDate,
      endDate: event.eventEndDate,
      startTime: eventStartTime,
      endTime: eventEndTime,
      options: options.map((option) => ({ ...option, yesCount: countYes(option, votes) })),
      voteCount: votes.length,
      plan,
      maxDate: latestAllowedDate(plan, todayInBerlin(event.createdAt)),
    };
  }

  const config: EventConfig = {
    kicker: event.kicker,
    title: event.title,
    greeting: event.greeting,
    dateLabel: event.dateLabel,
    timeLabel: event.timeLabel,
    locationLabel: event.locationLabel,
    defaultArrivalTime: event.defaultArrivalTime,
    dateMode,
    eventDate: event.eventDate,
    eventEndDate: event.eventEndDate,
    eventStartTime,
    eventEndTime,
    contact: {
      name: event.contactName,
      phone: event.contactPhone,
      email: event.contactEmail,
    },
    assets: THEME_ASSETS[theme],
  };

  // Owner only: the event facts for the "Termin steht fest" message.
  const announcement: InvitationBase | null = isOwner
    ? {
        title: config.title,
        location: config.locationLabel,
        contactName: config.contact.name,
        url: buildEventShareUrl(slug),
        password: ownerAccessPassword,
      }
    : null;

  // Guests are told when the party was, the owner when the event goes.
  const partyDateLabel =
    dateMode === "fixed" && event.eventDate
      ? formatDateRangeLabel(event.eventDate, event.eventEndDate)
      : formatDateLabel(lifecycle?.stichtag ?? null);

  return (
    <div className="relative flex min-h-dvh flex-col" style={{ isolation: "isolate" }}>
      <Header
        config={config}
        logoHref={isOwner ? "/" : `/event/${slug}/info`}
        readOnly={readOnly}
        themeEdit={
          unlock
            ? {
                eventId: event.id,
                theme,
                unlockedThemes,
                accessPassword: ownerAccessPassword,
                maxGuests: event.maxGuests,
                unlock,
              }
            : undefined
        }
      />
      <main>
        {readOnly && lifecycle ? (
          isOwner ? (
            <EventOverNotice isOwner deletionDateLabel={formatDottedDate(lifecycle.deletionDate)} />
          ) : (
            <EventOverNotice isOwner={false} dateLabel={partyDateLabel} />
          )
        ) : null}
        <Hero
          config={config}
          eventId={event.id}
          isOwner={isOwner}
          dateSettings={dateSettings}
          announcement={announcement}
          unlock={unlock}
          readOnly={readOnly}
        />
        {dateMode === "fixed" ? (
          <GuestSection
            apiBasePath={`/api/events/${event.id}/guests`}
            // The guest form starts with the event's start time.
            defaultArrivalTime={config.eventStartTime ?? config.defaultArrivalTime}
            isOwner={isOwner}
            maxGuests={event.maxGuests}
            readOnly={readOnly}
          />
        ) : dateMode === "poll" ? (
          <DatePollSection
            eventId={event.id}
            isOwner={isOwner}
            announcement={announcement}
            readOnly={readOnly}
          />
        ) : (
          <DateUnknownNotice />
        )}
      </main>
      <Footer
        config={config}
        eventId={event.id}
        slug={slug}
        isOwner={isOwner}
        accessPassword={ownerAccessPassword}
        badgeHidden={event.badgeHidden}
        removeBadge={canRemoveBadge ? unlock : null}
        readOnly={readOnly}
      />

      <ParallaxSideGraphics
        leftSrc={config.assets.plantsLeft}
        rightSrc={config.assets.plantsRight}
      />
    </div>
  );
}
