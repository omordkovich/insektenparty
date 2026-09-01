import { AddToCalendarLink } from "@/components/AddToCalendarLink";
import { buildCalendarLink, buildGoogleCalendarLink, buildMapsLink } from "@/lib/calendar";
import type { PartyConfig } from "@/lib/event";

type HeroProps = {
  config: PartyConfig;
};

export function Hero({ config }: HeroProps) {
  const calendarParams = {
    title: config.title,
    description: config.greeting,
    location: config.locationLabel,
    date: config.eventDate,
    startTime: config.eventStartTime,
    endTime: config.eventEndTime,
  };
  const icsLink = buildCalendarLink(calendarParams);
  const googleCalendarLink = buildGoogleCalendarLink(calendarParams);
  const mapsLink = buildMapsLink(config.locationLabel);

  return (
    <section className="page-shell relative py-6">
      <div className="animate-fade-up rounded-[2rem] border border-leaf/20 bg-[var(--surface)] p-5 text-center shadow-[var(--shadow)] sm:p-8">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-honey-dark">
          {config.kicker}
        </p>
        <h1 className="font-[family-name:var(--font-display)] text-[clamp(1.5rem,9vw,3rem)] leading-none text-leaf-dark sm:text-6xl md:text-7xl">
          {config.title}
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-muted sm:text-xl">
          {config.greeting}
        </p>

        <dl className="mx-auto mt-8 grid max-w-xl gap-3 text-left sm:grid-cols-3 sm:text-center">
          <div>
            <dt className="text-xs font-bold uppercase tracking-wide text-leaf">Datum</dt>
            <dd className="mt-1 font-semibold">
              <AddToCalendarLink
                icsHref={icsLink}
                googleHref={googleCalendarLink}
                className="underline decoration-leaf/40 underline-offset-4 hover:text-leaf-dark"
              >
                {config.dateLabel}
              </AddToCalendarLink>
            </dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-wide text-leaf">Uhrzeit</dt>
            <dd className="mt-1 font-semibold">{config.timeLabel}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-wide text-leaf">Ort</dt>
            <dd className="mt-1 font-semibold">
              <a
                href={mapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-leaf/40 underline-offset-4 hover:text-leaf-dark"
              >
                {config.locationLabel}
              </a>
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
