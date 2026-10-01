import Link from "next/link";
import type { ReactNode } from "react";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import { AuthButtons } from "./AuthButtons";

const cardClass =
  "rounded-[2rem] border border-leaf/20 bg-[var(--surface)] p-5 shadow-(--shadow) sm:p-8";

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

const STEPS: { text: string; icon: ReactNode }[] = [
  { text: "Event anlegen und Design für jeden Anlass aussuchen", icon: <CalendarPlusIcon /> },
  { text: "Einladungslink teilen", icon: <ShareIcon /> },
  { text: "Zusagen jederzeit im Blick – mit Benachrichtigung per E-Mail", icon: <ListCheckIcon /> },
];

const FAQ: { question: string; answer: string }[] = [
  {
    question: "Ist GASTZILLA kostenlos?",
    answer:
      "Ja – ein Event mit allen Grundfunktionen ist kostenlos. Weitere Events und Premium-Designs kannst du dazukaufen.",
  },
  {
    question: "Brauchen meine Gäste ein Konto?",
    answer: "Nein, sie öffnen einfach den Einladungslink und tragen sich ein.",
  },
  {
    question: "Wer sieht die Gästeliste?",
    answer:
      "Alle, die den Einladungslink haben. Suchmaschinen finden deine Event-Seite nicht.",
  },
  {
    question: "Gibt es Werbung?",
    answer: "Nein. GASTZILLA ist werbefrei und setzt keine Tracking-Cookies ein.",
  },
];

// Tells search engines what GASTZILLA is (schema.org WebApplication).
const STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  applicationCategory: "LifestyleApplication",
  operatingSystem: "Web",
  inLanguage: "de",
  offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
};

// Start page for visitors who are not logged in - the content search
// engines index (logged-in users see their event list instead).
export function LandingContent() {
  return (
    <div className="w-full max-w-3xl space-y-8">
      <script
        type="application/ld+json"
        // Static data; "<" escaped so the JSON can never close the tag.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(STRUCTURED_DATA).replace(/</g, "\\u003c"),
        }}
      />
      <section className="text-center">
        <h1 className="font-display text-3xl leading-tight text-leaf-dark sm:text-5xl">
          Digitale Einladungen &amp; Gästelisten für jedes Event
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

      <section aria-labelledby="steps-title" className={cardClass}>
        <h2 id="steps-title" className="text-center font-display text-2xl text-leaf-dark sm:text-3xl">
          So funktioniert&apos;s
        </h2>
        <ol className="mt-6 grid gap-4 sm:grid-cols-3">
          {STEPS.map((step, index) => (
            <li key={step.text} className="flex flex-col items-center text-center">
              <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-button-primary text-button-primary-text">
                {step.icon}
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[var(--surface-solid)] bg-honey text-[11px] font-bold text-on-honey">
                  {index + 1}
                </span>
              </span>
              <p className="mt-3 text-muted">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="faq-title" className={cardClass}>
        <h2 id="faq-title" className="text-center font-display text-2xl text-leaf-dark sm:text-3xl">
          Häufige Fragen
        </h2>
        <div className="mt-6 space-y-2 text-left">
          {FAQ.map((item) => (
            <details
              key={item.question}
              className="group rounded-2xl border border-leaf/15 px-4 py-3 open:bg-leaf/5"
            >
              <summary className="cursor-pointer list-none font-bold text-leaf-dark marker:hidden">
                <span className="mr-2 inline-block transition group-open:rotate-90">›</span>
                {item.question}
              </summary>
              <p className="mt-2 pl-5 text-muted">{item.answer}</p>
            </details>
          ))}
        </div>
        <p className="mt-6 text-center text-sm text-muted">
          Mehr über die Idee hinter GASTZILLA:{" "}
          <Link href="/about" className="font-bold text-leaf-dark underline underline-offset-2">
            Über uns
          </Link>
        </p>
      </section>
    </div>
  );
}

function ClockIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function GuestIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="10" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
      <path d="M3 20c0-3.3 3.1-6 7-6s7 2.7 7 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M16 11l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CalendarPlusIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M3 10h18M8 3v4M16 3v4M12 13v5M9.5 15.5h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ListCheckIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 6l1.5 1.5L7 5M3 12l1.5 1.5L7 11M3 18l1.5 1.5L7 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11 6h10M11 12h10M11 18h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="18" cy="5" r="3" stroke="currentColor" strokeWidth="2" />
      <circle cx="6" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
      <circle cx="18" cy="19" r="3" stroke="currentColor" strokeWidth="2" />
      <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
