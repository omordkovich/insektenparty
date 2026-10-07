// Questions shown on the start page. Also feeds the FAQPage structured data
// and /llms.txt, so search engines and AI assistants get the same answers
// visitors see.
export type FaqItem = { question: string; answer: string };

export const FAQ: FaqItem[] = [
  {
    question: "Ist GASTZILLA kostenlos?",
    answer:
      "Ja – ein Event mit allen Grundfunktionen ist kostenlos. Weitere Events und Premium-Designs kannst du bald dazukaufen.",
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
    question: "Muss ich den Einladungstext selbst schreiben?",
    answer:
      "Nein. Auf deiner Event-Seite setzt GASTZILLA automatisch einen Einladungstext mit Titel, Datum, Ort und Link zusammen. Anrede und Gruß passt du nach Wunsch an und kopierst den Text mit einem Klick.",
  },
  {
    question: "Gibt es Werbung?",
    answer: "Nein. GASTZILLA ist werbefrei und setzt keine Tracking-Cookies ein.",
  },
];
