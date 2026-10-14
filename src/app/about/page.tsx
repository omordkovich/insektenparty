import Link from "next/link";
import { ContentPage } from "@/components/ContentPage";
import { JsonLd } from "@/components/JsonLd";
import { UpdatedDate } from "@/components/UpdatedDate";
import { COMPARISON } from "@/lib/comparison";
import { LEGAL_INFO } from "@/lib/legal-info";
import { pageMetadata } from "@/lib/page-metadata";
import { ABOUT_UPDATED, INSTAGRAM_HANDLE, INSTAGRAM_URL } from "@/lib/site";
import { aboutStructuredData } from "@/lib/structured-data";

export const metadata = pageMetadata({
  title: "Über uns – GASTZILLA",
  description:
    "Warum es GASTZILLA gibt und wer dahintersteht: digitale Einladungen und Gästelisten – werbefrei, ohne Tracking, mit Servern in der EU.",
  path: "/about",
});

const VALUES = [
  "Keine Werbung",
  "Keine Tracking-Cookies",
  "Daten auf Servern in der EU",
  "Event-Seiten erscheinen nicht in Suchmaschinen",
];

export default function AboutPage() {
  return (
    <ContentPage title="Über uns">
      <JsonLd data={aboutStructuredData({ updated: ABOUT_UPDATED })} />
      <div className="space-y-4 text-lg text-muted">
        <p>
          GASTZILLA ist entstanden, weil Einladungen zu oft im Gruppenchat untergehen: Wer kommt?
          Wer bringt was mit? Wie viele Kinder? Statt Nachrichten zu zählen, gibt es bei GASTZILLA
          einen Link, über den sich alle selbst eintragen – und eine Liste, die immer stimmt.
        </p>
        <p>
          Hinter GASTZILLA steht <strong className="text-leaf-dark">{LEGAL_INFO.name}</strong> aus
          Köln, der die Plattform als Freiberufler entwickelt und betreibt.
        </p>
      </div>

      <h2 className="mt-8 font-display text-2xl text-leaf-dark">Was uns wichtig ist</h2>
      <ul className="mt-3 space-y-2 text-muted">
        {VALUES.map((value) => (
          <li key={value} className="flex items-start gap-2">
            <span aria-hidden="true" className="font-bold text-leaf-dark">
              ✓
            </span>
            {value}
          </li>
        ))}
      </ul>

      <h2 className="mt-8 font-display text-2xl text-leaf-dark">Wofür GASTZILLA gemacht ist</h2>
      <p className="mt-3 text-muted">
        GASTZILLA sammelt Zu- und Absagen – auf Wunsch nach einer Terminabstimmung. Tickets,
        Bezahlung oder Reservierungen gehören bewusst nicht dazu. Wann eine WhatsApp-Umfrage oder
        Doodle reicht und wann GASTZILLA besser passt, steht im{" "}
        <Link href={COMPARISON.path} className="font-bold text-leaf-dark underline underline-offset-2">
          Vergleich
        </Link>
        .
      </p>

      <h2 className="mt-8 font-display text-2xl text-leaf-dark">Kontakt</h2>
      <p className="mt-3 text-muted">
        Fragen, Ideen oder Kritik? Schreib an{" "}
        <a
          href={`mailto:${LEGAL_INFO.email}`}
          className="font-bold text-leaf-dark underline underline-offset-2"
        >
          {LEGAL_INFO.email}
        </a>{" "}
        oder folge GASTZILLA auf Instagram:{" "}
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="me noopener noreferrer"
          className="font-bold text-leaf-dark underline underline-offset-2"
        >
          {INSTAGRAM_HANDLE}
        </a>
        .
      </p>

      <UpdatedDate date={ABOUT_UPDATED} className="mt-8 text-center" />
    </ContentPage>
  );
}
