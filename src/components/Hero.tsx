import { eventConfig } from "@/lib/event";

function LeafIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="currentColor" aria-hidden="true">
      <path d="M52 8C28 10 12 28 10 52c24-2 40-20 42-44Z" />
      <path d="M18 46c8-10 18-18 28-24" fill="none" stroke="currentColor" strokeWidth="3" />
    </svg>
  );
}

function ButterflyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="currentColor" aria-hidden="true">
      <path d="M32 18c-8-14-24-10-24 4 0 10 8 16 18 16 2 0 4-1 6-2v16h2V36c2 1 4 2 6 2 10 0 18-6 18-16 0-14-16-18-24-4Z" />
    </svg>
  );
}



export function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pb-10 pt-4">
      <LeafIcon className="insect-silhouette animate-float left-2 top-8 h-16 w-16 sm:left-8" />
      <ButterflyIcon className="insect-silhouette animate-float right-4 top-4 h-14 w-14 sm:right-16" />

      <div className="page-shell relative animate-fade-up text-center">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-honey-dark">
          Kindergeburtstag
        </p>
        <h1 className="font-[family-name:var(--font-display)] text-5xl leading-none text-leaf-dark sm:text-6xl md:text-7xl">
          {eventConfig.title}
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-muted sm:text-xl">
          {eventConfig.greeting}
        </p>

        <dl className="mx-auto mt-8 grid max-w-xl gap-3 text-left sm:grid-cols-3 sm:text-center">
          <div>
            <dt className="text-xs font-bold uppercase tracking-wide text-leaf">Datum</dt>
            <dd className="mt-1 font-semibold">{eventConfig.dateLabel}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-wide text-leaf">Uhrzeit</dt>
            <dd className="mt-1 font-semibold">{eventConfig.timeLabel}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-wide text-leaf">Ort</dt>
            <dd className="mt-1 font-semibold">{eventConfig.locationLabel}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
