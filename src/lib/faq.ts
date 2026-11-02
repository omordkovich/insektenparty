// Questions shown on the start page. Also feeds the FAQPage structured data
// and /llms.txt, so search engines and AI assistants get the same answers
// visitors see.
export type FaqItem = { question: string; answer: string };

export const FAQ: FaqItem[] = [
  {
    question: "Ist GASTZILLA kostenlos?",
    answer:
      "Dein erstes Event ist kostenlos: Jedes Konto bekommt einmalig ein Event mit festem Termin, der höchstens drei Monate nach dem Erstellen liegt – mit Gästeliste, Einladungstext, Passwortschutz und den Farbdesigns. Terminabstimmung, ein noch offener Termin, Termine bis zwölf Monate nach dem Erstellen und eine Event-Seite ohne GASTZILLA-Hinweis sind kostenpflichtige Extras, ebenso die Premium-Designs. Weitere Events kannst du bald dazukaufen.",
  },
  {
    question: "Wie lange bleibt mein Event gespeichert?",
    answer:
      "Bis 90 Tage nach dem Event – dann löscht GASTZILLA Event, Gästeliste und Abstimmung automatisch. Maßgeblich ist der letzte Tag des Events, bei einer Terminabstimmung der späteste Vorschlag und ohne Termin sechs Monate nach dem Erstellen. Schon 30 Tage nach dem Event zeigt der Einladungslink nur noch, dass die Einladung abgelaufen ist. Etwa eine Woche vor dem Löschen erinnern wir dich per E-Mail daran.",
  },
  {
    question: "Brauchen meine Gäste ein Konto?",
    answer: "Nein, sie öffnen einfach den Einladungslink und tragen sich ein.",
  },
  {
    question: "Kann ich den Termin mit meinen Gästen abstimmen?",
    answer:
      "Ja. Steht der Termin noch nicht fest, schlägst du zwei bis vier Termine vor – mit oder ohne Uhrzeit. Deine Gäste haken über den Link an, was ihnen passt. Den Favoriten legst du mit einem Klick fest, und alle Stimmen werden automatisch zu Zu- und Absagen in der Gästeliste. Danach bekommst du einen fertigen Text, mit dem du allen den Termin per WhatsApp, E-Mail & Co. mitteilst. Die Terminabstimmung gehört zu den kostenpflichtigen Extras.",
  },
  {
    question: "Können Gäste auch absagen?",
    answer:
      "Ja. Wer nicht kommen kann, hakt beim Eintragen „Ich sage ab“ an – auf Wunsch mit einer Nachricht. In der Gästeliste steht der Gast dann als „Abgesagt“, und du bekommst eine E-Mail. So weißt du nicht nur, wer kommt, sondern auch, wer sicher nicht kommt.",
  },
  {
    question: "Wer sieht die Gästeliste?",
    answer:
      "Alle, die den Einladungslink haben. Suchmaschinen finden deine Event-Seite nicht. Mit einem Passwort sieht sie außerdem nur, wer das Passwort kennt.",
  },
  {
    question: "Kann ich mein Event mit einem Passwort schützen?",
    answer:
      "Ja. Hake beim Erstellen oder später in den Event-Einstellungen „Passwortgeschützt“ an und lege ein Passwort fest. Ohne Passwort sehen Besucher nur den Titel – keine Gästeliste, kein Datum, keinen Ort. Im Einladungstext steht das Passwort automatisch, und wer es nicht hat, kann es über die Event-Seite bei dir anfragen.",
  },
  {
    question: "Muss ich den Einladungstext selbst schreiben?",
    answer:
      "Nein. Auf deiner Event-Seite setzt GASTZILLA automatisch einen Einladungstext mit Titel, Datum, Ort und Link zusammen. Anrede und Gruß passt du nach Wunsch an und kopierst oder teilst den Text mit einem Klick. Nach einer Terminabstimmung gibt es ebenso einen fertigen Text, der allen den festgelegten Termin mitteilt.",
  },
  {
    question: "Gibt es Werbung?",
    answer: "Nein. GASTZILLA ist werbefrei und setzt keine Tracking-Cookies ein.",
  },
];
