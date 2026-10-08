import { AddToCalendarLink } from "@/components/AddToCalendarLink";
import { DateEditButton } from "@/components/DateEditButton";
import { EditableField } from "@/components/EditableField";
import { buildCalendarLink, buildGoogleCalendarLink, buildMapsLink } from "@/lib/calendar";
import type { DateSettings } from "@/lib/date-poll-form";
import type { EventConfig } from "@/lib/event-config";

type HeroProps = {
  config: EventConfig;
  eventId: string;
  isOwner: boolean;
  /** Owner only: shows the pencil at the date that opens the "Termin" window. */
  dateSettings?: DateSettings | null;
};

export function Hero({ config, eventId, isOwner, dateSettings }: HeroProps) {
  const dateFixed = config.dateMode === "fixed";
  const hasEventDateTime =
    dateFixed && !!config.eventDate && !!config.eventStartTime && !!config.eventEndTime;

  const calendarParams = hasEventDateTime
    ? {
        title: config.title,
        description: config.greeting,
        location: config.locationLabel,
        date: config.eventDate as string,
        endDate: config.eventEndDate,
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
            editHint="Mit dem Titel ändert sich auch der Einladungslink. Bereits verschickte Links funktionieren weiter."
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
              {/* Date and time are set in the owner's "Termin" window. */}
              <span className="inline-flex items-center gap-2">
                {dateFixed && config.dateLabel ? (
                  icsLink && googleCalendarLink ? (
                    <AddToCalendarLink
                      icsHref={icsLink}
                      googleHref={googleCalendarLink}
                      className="underline decoration-leaf/40 underline-offset-4 hover:text-leaf-dark"
                    >
                      {config.dateLabel}
                    </AddToCalendarLink>
                  ) : (
                    config.dateLabel
                  )
                ) : dateFixed ? (
                  dateSettings ? <span className="opacity-40">Datum festlegen</span> : null
                ) : (
                  <span className="text-muted">
                    {config.dateMode === "poll" ? "Wird abgestimmt" : "Termin folgt"}
                  </span>
                )}
                {dateSettings ? <DateEditButton eventId={eventId} dateSettings={dateSettings} /> : null}
              </span>
            </dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-wide text-leaf">Uhrzeit</dt>
            <dd className="mt-1 font-semibold">
              {dateFixed ? config.timeLabel : <span className="text-muted">–</span>}
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
