import Link from "next/link";
import type { ReactNode } from "react";
import { FAQ } from "@/lib/faq";
import { siteStructuredData } from "@/lib/structured-data";
import { OCCASIONS, OCCASIONS_PATH } from "@/lib/occasions";
import { AuthButtons } from "./AuthButtons";
import { cardClass } from "./card";
import { FaqSection } from "./FaqSection";
import { HowItWorks } from "./HowItWorks";
import { JsonLd } from "./JsonLd";
import { ClockIcon, GuestIcon, ShareIcon } from "./LandingIcons";
import { OccasionChips } from "./OccasionChips";

const BENEFITS: { title: string; text: string; icon: ReactNode }[] = [
  {
    title: "In 2 Minuten fertig",
    text: "Titel, Datum, Ort, Design wählen – fertig ist deine Einladungsseite.",
    icon: <ClockIcon />,
  },
  {
    title: "Gäste brauchen kein Konto",
    text: "Zusagen, Begleitpersonen, Mitbringsel und Nachrichten direkt über den Link.",
    icon: <GuestIcon />,
  },
  {
    title: "Teilen, wo deine Gäste sind",
    text: "WhatsApp, Signal, Telegram, E-Mail – oder einfach den Link kopieren.",
    icon: <ShareIcon />,
  },
];

// Start page for visitors who are not logged in - the content search
// engines index (logged-in users see their event list instead).
export function LandingContent() {
  return (
    <div className="w-full max-w-3xl space-y-8">
      <JsonLd data={siteStructuredData()} />
      <section className="text-center">
        <h1 className="font-display text-3xl leading-tight text-leaf-dark sm:text-5xl">
          Online-Einladung &amp; Gästeliste kostenlos erstellen
        </h1>
        <p className="mt-4 text-xl font-bold text-amber-700 sm:text-2xl">
          Schluss mit Zusagen-Chaos im Gruppenchat.
        </p>
        <p className="mx-auto mt-4 max-w-xl text-lg text-muted">
          Erstelle in wenigen Minuten eine Einladungsseite für Geburtstag, Hochzeit,
          Grillabend oder Firmenfeier. Teile den Link – deine Gäste tragen sich selbst ein.
        </p>
        <div className="mt-6 flex justify-center">
          <AuthButtons registerLabel="Kostenlos starten" />
        </div>
      </section>

      <section aria-labelledby="benefits-title" className={cardClass}>
        <h2 id="benefits-title" className="sr-only">
          Vorteile
        </h2>
        <ul className="grid gap-6 sm:grid-cols-3">
          {BENEFITS.map((benefit) => (
            <li key={benefit.title} className="text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-leaf/10 text-leaf-dark">
                {benefit.icon}
              </span>
              <h3 className="mt-3 font-display text-lg text-leaf-dark">{benefit.title}</h3>
              <p className="mt-1 text-sm text-muted">{benefit.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <HowItWorks />

      <section aria-labelledby="occasions-title" className={cardClass}>
        <h2 id="occasions-title" className="text-center font-display text-2xl text-leaf-dark sm:text-3xl">
          Für jeden Anlass
        </h2>
        <div className="mt-6">
          <OccasionChips occasions={OCCASIONS} />
        </div>
        <p className="mt-6 text-center text-sm">
          <Link href={OCCASIONS_PATH} className="font-bold text-leaf-dark underline underline-offset-2">
            Alle Anlässe →
          </Link>
        </p>
      </section>

      <FaqSection items={FAQ}>
        <p className="mt-6 text-center text-sm text-muted">
          Mehr über die Idee hinter GASTZILLA:{" "}
          <Link href="/about" className="font-bold text-leaf-dark underline underline-offset-2">
            Über uns
          </Link>
        </p>
      </FaqSection>
    </div>
  );
}
