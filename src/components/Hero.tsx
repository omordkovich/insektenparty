import Image from "next/image";
import { eventConfig } from "@/lib/event";

export function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pb-10 pt-4">
      <Image
        src="/insects/bee.png"
        alt=""
        width={144}
        height={80}
        aria-hidden="true"
        className="insect-deco animate-buzz left-1 top-8 h-16 w-28 sm:left-4 sm:h-20 sm:w-36"
      />
      <Image
        src="/insects/butterfly.png"
        alt=""
        width={144}
        height={96}
        aria-hidden="true"
        className="insect-deco animate-float right-2 top-2 h-20 w-28 sm:right-10 sm:h-24 sm:w-36"
      />

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
