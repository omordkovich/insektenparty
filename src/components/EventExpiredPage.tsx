import Link from "next/link";
import { cardClass } from "./card";
import { SiteHeader } from "./SiteHeader";

// Shown instead of an event 30 days after its date to everyone but the
// owner. Nothing about the event is revealed - not even its title.
export function EventExpiredPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex flex-col items-center px-4 pt-4 pb-16">
        <div className={`${cardClass} w-full max-w-md text-center`}>
          <h1 className="font-display text-3xl leading-tight text-leaf-dark">Diese Einladung ist abgelaufen.</h1>
          <Link
            href="/"
            className="mt-6 inline-flex min-h-12 items-center justify-center rounded-2xl bg-button-primary px-6 text-base font-bold text-button-primary-text transition hover:brightness-90"
          >
            Zur Startseite
          </Link>
        </div>
      </main>
    </>
  );
}
