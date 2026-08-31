import type { PartyConfig } from "@/lib/event";

type HeroProps = {
  config: PartyConfig;
};

export function Hero({ config }: HeroProps) {
  return (
    <section className="relative overflow-hidden px-4 pb-10 pt-4">
      <div className="page-shell relative animate-fade-up text-center">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-honey-dark">
          {config.kicker}
        </p>
        <h1 className="font-[family-name:var(--font-display)] text-5xl leading-none text-leaf-dark sm:text-6xl md:text-7xl">
          {config.title}
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-muted sm:text-xl">
          {config.greeting}
        </p>

        <dl className="mx-auto mt-8 grid max-w-xl gap-3 text-left sm:grid-cols-3 sm:text-center">
          <div>
            <dt className="text-xs font-bold uppercase tracking-wide text-leaf">Datum</dt>
            <dd className="mt-1 font-semibold">{config.dateLabel}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-wide text-leaf">Uhrzeit</dt>
            <dd className="mt-1 font-semibold">{config.timeLabel}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-wide text-leaf">Ort</dt>
            <dd className="mt-1 font-semibold">{config.locationLabel}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
