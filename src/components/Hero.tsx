import { EditableDateField } from "@/components/EditableDateField";
import { EditableField } from "@/components/EditableField";
import { EditableTimeRangeField } from "@/components/EditableTimeRangeField";
import { buildCalendarLink, buildGoogleCalendarLink, buildMapsLink } from "@/lib/calendar";
import type { EventConfig } from "@/lib/event-config";

type HeroProps = {
  config: EventConfig;
  eventId: string;
  isOwner: boolean;
};

export function Hero({ config, eventId, isOwner }: HeroProps) {
  const hasEventDateTime =
    !!config.eventDate && !!config.eventStartTime && !!config.eventEndTime;

  const calendarParams = hasEventDateTime
    ? {
        title: config.title,
        description: config.greeting,
        location: config.locationLabel,
        date: config.eventDate as string,
        startTime: config.eventStartTime as string,
        endTime: config.eventEndTime as string,
      }
    : null;
  const icsLink = calendarParams ? buildCalendarLink(calendarParams) : null;
  const googleCalendarLink = calendarParams
    ? buildGoogleCalendarLink(calendarParams)
    : null;

  return (
    <section className="page-shell relative py-6">
      <div className="animate-fade-up rounded-[2rem] border border-leaf/20 bg-[var(--surface)] p-5 text-center shadow-(--shadow) sm:p-8">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-honey-dark">
          <EditableField
            eventId={eventId}
            fieldKey="kicker"
            value={config.kicker}
            placeholder="z. B. Kindergeburtstag"
            isOwner={isOwner}
            ariaLabel="Kicker bearbeiten"
            className="text-sm font-semibold uppercase tracking-[0.2em] text-honey-dark"
          />
        </p>
        <h1 className="font-display text-[clamp(1.5rem,9vw,3rem)] leading-none text-leaf-dark sm:text-6xl md:text-7xl">
          <EditableField
            eventId={eventId}
            fieldKey="title"
            value={config.title}
            placeholder="Titel deines Events"
            isOwner={isOwner}
            ariaLabel="Titel bearbeiten"
            className="font-display text-[clamp(1.5rem,9vw,3rem)] leading-none text-leaf-dark sm:text-6xl md:text-7xl"
          />
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-muted sm:text-xl">
          <EditableField
            eventId={eventId}
            fieldKey="greeting"
            value={config.greeting}
            placeholder="Begrüßungstext für deine Gäste"
            isOwner={isOwner}
            as="textarea"
            ariaLabel="Begrüßungstext bearbeiten"
            className="text-lg text-muted sm:text-xl"
          />
        </p>

        <dl className="mx-auto mt-8 grid max-w-xl gap-3 text-left sm:grid-cols-3 sm:text-center">
          <div>
            <dt className="text-xs font-bold uppercase tracking-wide text-leaf">Datum</dt>
            <dd className="mt-1 font-semibold">
              <EditableDateField
                eventId={eventId}
                value={config.eventDate}
                displayLabel={config.dateLabel}
                isOwner={isOwner}
                ariaLabel="Datum bearbeiten"
                className="font-semibold"
                calendarLinks={
                  icsLink && googleCalendarLink
                    ? { icsHref: icsLink, googleHref: googleCalendarLink }
                    : undefined
                }
              />
            </dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-wide text-leaf">Uhrzeit</dt>
            <dd className="mt-1 font-semibold">
              <EditableTimeRangeField
                eventId={eventId}
                startValue={config.eventStartTime}
                endValue={config.eventEndTime}
                displayLabel={config.timeLabel}
                isOwner={isOwner}
                ariaLabel="Uhrzeit bearbeiten"
                className="font-semibold"
              />
            </dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-wide text-leaf">Ort</dt>
            <dd className="mt-1 font-semibold">
              <EditableField
                eventId={eventId}
                fieldKey="locationLabel"
                value={config.locationLabel}
                placeholder="Adresse oder Ort der Feier"
                isOwner={isOwner}
                ariaLabel="Ort bearbeiten"
                className="font-semibold"
                link={{ href: buildMapsLink(config.locationLabel), external: true }}
              />
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
