import { ContentPage } from "@/components/ContentPage";
import { LEGAL_INFO } from "@/lib/legal-info";
import { pageMetadata } from "@/lib/page-metadata";

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
    </ContentPage>
  );
}
