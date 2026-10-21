import type { FaqItem } from "@/lib/faq";
import type { Breadcrumb } from "@/lib/occasions";

// /vergleich: when a WhatsApp poll or Doodle is enough and when GASTZILLA
// fits better - for "Doodle Alternative" / "Terminumfrage WhatsApp"
// searches and AI answers to "what should I use for ...". Other services
// are described only by what they are built for, never with feature
// claims we can't check; FAQ questions come from real Google suggestions.
export const COMPARISON = {
  path: "/vergleich",
  name: "Vergleich",
  title: "WhatsApp-Umfrage, Doodle oder GASTZILLA – was passt zu deiner Einladung?",
  metaTitle: "WhatsApp-Umfrage oder Doodle? Der Vergleich – GASTZILLA",
  description:
    "WhatsApp-Umfrage, Doodle oder Einladungsseite? Wann was passt – und wie du Termin, Zusagen, Begleitpersonen und Mitbringsel an einem Ort sammelst.",
  teaser:
    "Wann eine WhatsApp-Umfrage reicht, wann Doodle passt und wann eine Einladungsseite mit Gästeliste die bessere Wahl ist.",
  intro: [
    "Kurz gesagt: Eine WhatsApp-Umfrage reicht für eine schnelle Frage in einer festen Gruppe, Doodle ist auf das Finden eines Termins ausgelegt. GASTZILLA verbindet beides mit einer Gästeliste – erst den Termin abstimmen, dann über denselben Link zu- oder absagen, mit Begleitpersonen, Ankunftszeit und Mitbringseln.",
    "Hier siehst du, wann welches Werkzeug passt – und wo GASTZILLA bewusst aufhört.",
  ],
  options: [
    {
      name: "WhatsApp-Umfrage",
      heading: "Eine WhatsApp-Umfrage reicht, wenn …",
      points: [
        "alle Gäste schon in derselben WhatsApp-Gruppe sind",
        "du nur eine schnelle Frage klären willst, etwa „Freitag oder Samstag?“",
        "dir eine Antwort pro Person genügt – ohne Begleitpersonen, Ankunftszeit oder Mitbringsel",
      ],
      note: "Was danach kommt – wer jemanden mitbringt, wer was mitbringt, wer doch absagt – läuft wieder über einzelne Nachrichten, und die Umfrage rutscht im Chatverlauf nach oben.",
    },
    {
      name: "Doodle",
      heading: "Doodle passt, wenn …",
      points: [
        "es vor allem um den Termin geht, etwa für ein Meeting oder eine Vereinssitzung",
        "mehr als vier Terminvorschläge zur Auswahl stehen sollen",
        "nach der Terminfindung keine Gästeliste mit Zu- und Absagen nötig ist",
      ],
      note: "Doodle ist auf Terminfindung ausgelegt. Begleitpersonen, Ankunftszeiten und Mitbringsel deiner Gäste sammelst du dort nicht in einer Gästeliste.",
    },
    {
      name: "GASTZILLA",
      heading: "GASTZILLA passt, wenn …",
      points: [
        "du zu einer Feier oder einem Treffen einlädst und wissen willst, wer wirklich kommt",
        "Gäste Begleitpersonen, Ankunftszeit oder Mitbringsel angeben sollen",
        "auch Gäste außerhalb deiner Chatgruppe dabei sind – sie brauchen nur den Link, kein Konto und keine App",
        "erst der Termin abgestimmt werden soll (zwei bis vier Vorschläge) und die Stimmen danach direkt zur Gästeliste werden",
      ],
      note: "Als Gastgeber legst du ein kostenloses Konto an. Ein Event mit allen Grundfunktionen ist kostenlos.",
    },
  ],
  faq: [
    {
      question: "Kann man eine Terminumfrage per WhatsApp machen?",
      answer:
        "Ja, auf zwei Wegen: als WhatsApp-Umfrage direkt in der Gruppe oder als Link zu einer Terminabstimmung, den du in den Chat schickst. Bei GASTZILLA stimmen über den Link auch Gäste ab, die nicht in der Gruppe sind – und sobald der Termin feststeht, sagen sie über denselben Link zu.",
    },
    {
      question: "Kann man eine Einladung mit Terminabstimmung kostenlos erstellen?",
      answer:
        "Ja. Bei GASTZILLA ist ein Event mit allen Grundfunktionen kostenlos – Terminabstimmung, Gästeliste und fertiger Einladungstext eingeschlossen. Weitere Events und Premium-Designs kannst du bald dazukaufen.",
    },
    {
      question: "Muss man sich für eine Terminabstimmung anmelden?",
      answer:
        "Bei GASTZILLA nur du als Gastgeber, mit einem kostenlosen Konto. Deine Gäste stimmen über den Link ab – ohne Anmeldung und ohne App.",
    },
    {
      question: "Kann man eine Terminumfrage nachträglich ändern?",
      answer:
        "Bei GASTZILLA ja: Fehlt ein Termin, fügst du ihn später hinzu (bis zu vier insgesamt), und die bisherigen Stimmen bleiben erhalten. Deine Gäste können ihre Stimme ändern oder löschen, bis du den Termin festlegst.",
    },
    {
      question: "Wann ist GASTZILLA nicht das Richtige?",
      answer:
        "Wenn du Tickets verkaufen, Geld einsammeln, Plätze reservieren oder einen Sitzplan erstellen willst. GASTZILLA sammelt Zu- und Absagen – für Bezahlung und Reservierungen brauchst du ein anderes Werkzeug.",
    },
  ] satisfies FaqItem[],
  // Shown under the page: comparisons must stay factual and dated.
  disclaimer:
    "Stand: Oktober 2026. WhatsApp ist eine Marke der WhatsApp LLC, Doodle eine Marke der Doodle AG. Angaben zu anderen Diensten ohne Gewähr – ihre Funktionen können sich ändern.",
  // Last real text change (sitemap lastModified, visible date), YYYY-MM-DD.
  updated: "2026-10-14",
};

export function comparisonBreadcrumbs(): Breadcrumb[] {
  return [
    { name: "Startseite", path: "/" },
    { name: COMPARISON.name, path: COMPARISON.path },
  ];
}
