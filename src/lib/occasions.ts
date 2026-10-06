import type { FaqItem } from "@/lib/faq";

// Info pages per occasion (/einladung/<slug>) - for search engines and AI
// assistants, nothing in the app depends on them. One entry here is all a
// new page needs: the page itself, the overview, the start page section,
// the sitemap and llms.txt are all built from this list.
// Only describe what GASTZILLA really does - no invented designs or numbers.
export type Occasion = {
  // Language-independent key; links the language versions of an occasion
  // once there are more languages. Never changes.
  id: string;
  // German URL part, /einladung/<slug>.
  slug: string;
  // Short name for chips and breadcrumbs.
  name: string;
  // H1, contains the search term.
  title: string;
  metaTitle: string;
  // Search result snippet, max. 160 characters.
  description: string;
  // One sentence for the overview page and llms.txt.
  teaser: string;
  intro: string[];
  // Own field because German needs zum/zur/zu depending on the occasion.
  benefitsTitle: string;
  benefits: { title: string; text: string }[];
  faq: FaqItem[];
  // Last real text change (sitemap lastModified), YYYY-MM-DD.
  updated: string;
};

export type Breadcrumb = { name: string; path: string };

export const OCCASIONS_PATH = "/einladung";

export const OCCASIONS_HUB = {
  title: "Online-Einladungen für jeden Anlass",
  metaTitle: "Online-Einladungen für jeden Anlass – GASTZILLA",
  description:
    "Ob Kindergeburtstag, Hochzeit oder Grillabend: Erstelle kostenlos eine digitale Einladung, teile den Link und sammle alle Zusagen in einer Gästeliste.",
  intro:
    "Egal, was du feierst: Mit GASTZILLA bekommt jeder Anlass seine eigene Einladungsseite. Deine Gäste sagen per Link zu – ohne Konto, ohne App und ohne Zusagen-Chaos im Gruppenchat.",
};

export const OCCASIONS: Occasion[] = [
  {
    id: "kids-birthday",
    slug: "kindergeburtstag",
    name: "Kindergeburtstag",
    title: "Einladung zum Kindergeburtstag online erstellen",
    metaTitle: "Einladung zum Kindergeburtstag online erstellen – GASTZILLA",
    description:
      "Kindergeburtstag-Einladung per Link: Eltern sagen ohne Konto zu, du siehst Bring- und Abholzeiten und Mitbringsel auf einen Blick. Kostenlos & werbefrei.",
    teaser: "Eltern sagen per Link zu – mit Bring- und Abholzeit, Geschwistern und Mitbringseln.",
    intro: [
      "Beim Kindergeburtstag laufen die Zusagen meist kreuz und quer: ein paar im Klassenchat, ein paar per Nachricht, eine auf dem Schulhof. Wer kommt jetzt eigentlich, wer bringt das Geschwisterkind mit, und wann wird wer abgeholt?",
      "Mit GASTZILLA erstellst du in wenigen Minuten eine Einladungsseite für den Kindergeburtstag und schickst den Link an die Eltern. Sie tragen ihr Kind selbst ein – ganz ohne Konto oder App – und du hast alle Zusagen in einer Liste.",
    ],
    benefitsTitle: "Darum passt GASTZILLA zum Kindergeburtstag",
    benefits: [
      {
        title: "Bring- und Abholzeiten im Blick",
        text: "Eltern können angeben, wann sie ihr Kind bringen und wieder abholen. So weißt du, wer wann da ist – und niemand wartet vergeblich an der Tür.",
      },
      {
        title: "Geschwister und Begleitung",
        text: "Kommt ein Elternteil oder das Geschwisterkind mit? Begleitpersonen werden direkt bei der Zusage mit Namen eingetragen und mitgezählt.",
      },
      {
        title: "Mitbringsel abstimmen",
        text: "Wer Kuchen, Muffins oder Saft mitbringt, schreibt es dazu. Alle sehen es – und es gibt keine fünf Nudelsalate.",
      },
      {
        title: "Ein Link für den Klassenchat",
        text: "Teile die Einladung per WhatsApp, Signal, Telegram oder E-Mail. Bei jeder neuen Zusage bekommst du eine Benachrichtigung per E-Mail.",
      },
    ],
    faq: [
      {
        question: "Brauchen die Eltern ein Konto oder eine App?",
        answer:
          "Nein. Die Eltern öffnen einfach den Einladungslink im Browser und tragen ihr Kind ein. Nur du als Gastgeber brauchst ein kostenloses Konto.",
      },
      {
        question: "Wer kann die Gästeliste sehen?",
        answer:
          "Alle, die den Einladungslink haben – also die eingeladenen Familien. Suchmaschinen finden deine Event-Seite nicht. Teile den Link deshalb nur mit den Eltern, die du einladen möchtest.",
      },
      {
        question: "Was kostet die Einladung zum Kindergeburtstag?",
        answer:
          "Nichts. Ein Event mit allen Grundfunktionen ist bei GASTZILLA kostenlos und werbefrei.",
      },
      {
        question: "Können die Eltern den Termin in ihren Kalender übernehmen?",
        answer:
          "Ja – sofern du Datum und Uhrzeit angibst: Ein Klick aufs Datum bietet den Termin für den eigenen Kalender oder Google Kalender an.",
      },
    ],
    updated: "2026-10-06",
  },
  {
    id: "birthday",
    slug: "geburtstag",
    name: "Geburtstag",
    title: "Geburtstagseinladung online erstellen",
    metaTitle: "Geburtstagseinladung online erstellen – GASTZILLA",
    description:
      "Geburtstagseinladung per Link: Gäste sagen ohne Konto zu, bringen Begleitung mit und schreiben dir eine Nachricht – ob 18., 30. oder 50. Kostenlos & werbefrei.",
    teaser: "Ob 18., 30. oder 60. – Zusagen, Begleitung und Glückwünsche in einer Liste.",
    intro: [
      "Ob kleine Runde oder große Feier zum runden Geburtstag: Spätestens eine Woche vorher fragst du dich, wer eigentlich kommt. Ein paar haben im Gruppenchat zugesagt, andere per Sprachnachricht, und von einigen hast du noch gar nichts gehört.",
      "Mit GASTZILLA erstellst du in wenigen Minuten eine Einladungsseite für deinen Geburtstag und teilst den Link. Deine Gäste tragen sich selbst ein – ohne Konto oder App – und du hast alle Zusagen in einer Liste.",
    ],
    benefitsTitle: "Darum passt GASTZILLA zum Geburtstag",
    benefits: [
      {
        title: "Alle Zusagen an einem Ort",
        text: "Statt Nachrichten zu zählen, siehst du auf einen Blick, wer kommt. Bei jeder neuen Zusage bekommst du eine E-Mail.",
      },
      {
        title: "Mit Begleitung",
        text: "Gäste tragen Partner, Freunde oder Kinder direkt mit Namen ein. So weißt du, für wie viele Leute du Essen und Getränke einplanen musst.",
      },
      {
        title: "Glückwünsche und Absprachen",
        text: "Zu jeder Zusage kann eine Nachricht gehören – für Glückwünsche oder den Hinweis, dass jemand später kommt.",
      },
      {
        title: "Mitbringsel abstimmen",
        text: "Wer einen Kuchen, Salat oder Getränke mitbringt, schreibt es dazu. Alle sehen es, und nichts kommt doppelt.",
      },
    ],
    faq: [
      {
        question: "Brauchen meine Gäste ein Konto oder eine App?",
        answer:
          "Nein. Deine Gäste öffnen den Einladungslink im Browser und tragen sich ein. Nur du als Gastgeber brauchst ein kostenloses Konto.",
      },
      {
        question: "Wer kann die Gästeliste sehen?",
        answer:
          "Alle, die den Einladungslink haben. Suchmaschinen finden deine Event-Seite nicht. Planst du eine Überraschungsparty, schick den Link also nicht an das Geburtstagskind.",
      },
      {
        question: "Was kostet die Geburtstagseinladung?",
        answer:
          "Nichts. Ein Event mit allen Grundfunktionen ist bei GASTZILLA kostenlos und werbefrei.",
      },
      {
        question: "Können Gäste den Termin in ihren Kalender übernehmen?",
        answer:
          "Ja – sofern du Datum und Uhrzeit angibst: Ein Klick aufs Datum bietet den Termin für den eigenen Kalender oder Google Kalender an.",
      },
    ],
    updated: "2026-10-06",
  },
  {
    id: "wedding",
    slug: "hochzeit",
    name: "Hochzeit",
    title: "Hochzeitseinladung online erstellen – mit Gästeliste",
    metaTitle: "Hochzeitseinladung online erstellen – GASTZILLA",
    description:
      "Digitale Hochzeitseinladung mit Gästeliste: Gäste sagen per Link zu, tragen Begleitung mit Namen ein und schreiben dir eine Nachricht. Kostenlos & werbefrei.",
    teaser: "Zusagen mit Begleitung, Namen und persönlicher Nachricht – alles in einer Liste.",
    intro: [
      "Bei einer Hochzeit willst du dich um die schönen Dinge kümmern – nicht um Zusagen, die per Telefon, WhatsApp und auf Zetteln eintrudeln. Wer kommt mit Partner, wer bringt die Kinder mit, und wie viele seid ihr am Ende wirklich?",
      "Mit GASTZILLA erstellst du eine Einladungsseite für eure Hochzeit, Verlobungsfeier oder den Polterabend und verschickst nur noch einen Link. Deine Gäste tragen sich selbst ein – ohne Konto oder App – und du hast jederzeit die aktuelle Gästeliste.",
    ],
    benefitsTitle: "Darum passt GASTZILLA zur Hochzeit",
    benefits: [
      {
        title: "Begleitung mit Namen",
        text: "Gäste tragen Partner, Kinder oder weitere Begleitpersonen direkt mit Namen ein. So weißt du genau, wer kommt – praktisch für Sitzplan und Tischkarten.",
      },
      {
        title: "Persönliche Nachrichten",
        text: "Zu jeder Zusage kann eine Nachricht gehören: Glückwünsche, Allergien, ein Liedwunsch für die Party. Alles landet gesammelt bei dir.",
      },
      {
        title: "Immer die aktuelle Liste",
        text: "Bei jeder neuen Zusage bekommst du eine E-Mail. Ändert jemand seinen Eintrag, siehst du das sofort – ohne Excel-Tabelle und Nachzählen.",
      },
      {
        title: "Ein Link für alle",
        text: "Verschicke die Einladung per WhatsApp, Signal, Telegram oder E-Mail – an die Familie genauso wie an Freunde und Kollegen.",
      },
    ],
    faq: [
      {
        question: "Brauchen unsere Gäste ein Konto oder eine App?",
        answer:
          "Nein. Deine Gäste öffnen den Einladungslink im Browser und tragen sich ein – auch Oma und Opa kommen damit zurecht. Nur du brauchst ein kostenloses Konto.",
      },
      {
        question: "Wer kann die Gästeliste sehen?",
        answer:
          "Alle, die den Einladungslink haben. Suchmaschinen finden eure Event-Seite nicht. Teile den Link deshalb nur mit den Gästen, die du einladen möchtest.",
      },
      {
        question: "Was kostet die Hochzeitseinladung?",
        answer:
          "Nichts. Ein Event mit allen Grundfunktionen ist bei GASTZILLA kostenlos und werbefrei.",
      },
      {
        question: "Können Gäste den Termin in ihren Kalender übernehmen?",
        answer:
          "Ja – sofern du Datum und Uhrzeit angibst: Ein Klick aufs Datum bietet den Termin für den eigenen Kalender oder Google Kalender an.",
      },
    ],
    updated: "2026-10-06",
  },
  {
    id: "company-party",
    slug: "firmenfeier",
    name: "Firmenfeier",
    title: "Einladung zur Firmenfeier online erstellen",
    metaTitle: "Einladung zur Firmenfeier online erstellen – GASTZILLA",
    description:
      "Einladung zur Weihnachtsfeier oder zum Sommerfest per Link: Kollegen sagen ohne Konto zu, du siehst alle Zusagen auf einen Blick. Werbefrei, Server in der EU.",
    teaser: "Weihnachtsfeier, Sommerfest oder Teamevent – Zusagen der Kollegen ohne Umfrage-Chaos.",
    intro: [
      "Ob Weihnachtsfeier, Sommerfest oder Teamevent: Wer die Feier organisiert, jagt meist Zusagen hinterher – per Mail, im Team-Chat und auf dem Flur. Am Ende weiß niemand so genau, für wie viele Leute bestellt werden muss.",
      "Mit GASTZILLA legst du in wenigen Minuten eine Einladungsseite an und teilst den Link im Team. Kolleginnen und Kollegen tragen sich selbst ein – ohne Konto, ohne App und ohne dass jemand eine Umfrage auswerten muss.",
    ],
    benefitsTitle: "Darum passt GASTZILLA zur Firmenfeier",
    benefits: [
      {
        title: "Ein Link für das ganze Team",
        text: "Kopiere den Einladungslink in den Team-Chat, den Newsletter oder eine E-Mail. Wer ihn hat, kann sich eintragen – ganz ohne Registrierung.",
      },
      {
        title: "Planbare Zahlen",
        text: "Begleitpersonen werden mitgezählt, Ankunftszeiten stehen direkt dabei. So weißt du, für wie viele Leute du Essen und Getränke planen musst.",
      },
      {
        title: "Wer bringt was mit?",
        text: "Beim Teamfrühstück oder Sommerfest mit Buffet tragen alle ein, was sie mitbringen. Doppelte Salate und fehlende Getränke fallen sofort auf.",
      },
      {
        title: "Datensparsam",
        text: "GASTZILLA ist werbefrei, setzt keine Tracking-Cookies ein und speichert die Daten auf Servern in der EU.",
      },
    ],
    faq: [
      {
        question: "Müssen sich die Kollegen registrieren?",
        answer:
          "Nein. Sie öffnen den Einladungslink im Browser und tragen sich ein. Nur du als Organisator brauchst ein kostenloses Konto.",
      },
      {
        question: "Wer kann die Gästeliste sehen?",
        answer:
          "Alle, die den Einladungslink haben. Suchmaschinen finden die Event-Seite nicht. Teile den Link deshalb nur mit den Personen, die eingeladen sind.",
      },
      {
        question: "Was kostet die Einladung zur Firmenfeier?",
        answer:
          "Ein Event mit allen Grundfunktionen ist kostenlos und werbefrei. Weitere Events und Premium-Designs kannst du bald dazukaufen.",
      },
      {
        question: "Bekomme ich Bescheid, wenn sich jemand einträgt?",
        answer:
          "Ja. Bei jeder neuen Zusage und bei Änderungen an der Gästeliste bekommst du eine E-Mail.",
      },
    ],
    updated: "2026-10-06",
  },
  {
    id: "barbecue",
    slug: "grillparty",
    name: "Grillparty & Gartenfest",
    title: "Einladung zur Grillparty online erstellen",
    metaTitle: "Einladung zur Grillparty online erstellen – GASTZILLA",
    description:
      "Grillparty oder Gartenfest per Link planen: Gäste sagen ohne Konto zu und tragen ein, was sie mitbringen – Salat, Fleisch oder Getränke. Kostenlos & werbefrei.",
    teaser: "Gäste tragen ein, was sie mitbringen – Salat, Grillgut oder Getränke.",
    intro: [
      "Eine Grillparty lebt davon, dass alle etwas mitbringen. Genau da wird es chaotisch: Drei Nudelsalate, kein Brot, und die Getränke hat jeder dem anderen überlassen. Dazu kommen Zusagen, die irgendwo im Gruppenchat untergehen.",
      "Mit GASTZILLA erstellst du eine Einladungsseite für Grillabend, Gartenfest oder Sommerparty und teilst den Link. Deine Gäste tragen sich selbst ein und schreiben dazu, was sie mitbringen – ganz ohne Konto oder App.",
    ],
    benefitsTitle: "Darum passt GASTZILLA zur Grillparty",
    benefits: [
      {
        title: "Mitbringsel im Blick",
        text: "Jeder Gast schreibt dazu, was er mitbringt. Alle sehen es – so gibt es Salat, Brot und Getränke statt fünfmal Kartoffelsalat.",
      },
      {
        title: "Kommen und gehen, wie es passt",
        text: "Gäste geben an, wann sie kommen und auf Wunsch auch, bis wann sie bleiben. Praktisch, wenn du den Grill zur richtigen Zeit anwerfen willst.",
      },
      {
        title: "Familie und Freunde mitbringen",
        text: "Begleitpersonen werden direkt mit eingetragen und mitgezählt. So weißt du, wie viele Würstchen und Stühle du brauchst.",
      },
      {
        title: "Ein Link für alle Kanäle",
        text: "Teile die Einladung per WhatsApp, Signal, Telegram oder E-Mail – an Nachbarn, Freunde und Familie gleichzeitig.",
      },
    ],
    faq: [
      {
        question: "Brauchen meine Gäste ein Konto oder eine App?",
        answer:
          "Nein. Deine Gäste öffnen den Einladungslink im Browser und tragen sich ein. Nur du als Gastgeber brauchst ein kostenloses Konto.",
      },
      {
        question: "Können Gäste ihren Eintrag später ändern?",
        answer:
          "Ja. Wenn sich etwas ändert – andere Uhrzeit, ein Gast mehr oder ein anderes Mitbringsel –, passen sie ihren Eintrag einfach an. Du bekommst dazu eine E-Mail.",
      },
      {
        question: "Was kostet die Einladung zur Grillparty?",
        answer:
          "Nichts. Ein Event mit allen Grundfunktionen ist bei GASTZILLA kostenlos und werbefrei.",
      },
    ],
    updated: "2026-10-06",
  },
  {
    id: "halloween-party",
    slug: "halloweenparty",
    name: "Halloweenparty",
    title: "Einladung zur Halloweenparty online erstellen",
    metaTitle: "Einladung zur Halloweenparty online erstellen – GASTZILLA",
    description:
      "Halloweenparty per Link organisieren: Gäste sagen ohne Konto zu, verraten ihr Kostüm und tragen ein, welche Snacks sie mitbringen. Kostenlos & werbefrei.",
    teaser: "Zusagen, Kostüm-Verrat und Grusel-Snacks – alles über einen Link.",
    intro: [
      "Für eine gelungene Halloweenparty brauchst du Kostüme, Kürbisse und Grusel-Snacks – und einen Überblick, wer eigentlich kommt. Den verliert man schnell, wenn Zusagen quer über alle Chats verteilt sind.",
      "Mit GASTZILLA erstellst du eine Einladungsseite für deine Halloweenparty und teilst den Link. Deine Gäste tragen sich selbst ein, ganz ohne Konto oder App – und du siehst alle Zusagen in einer Liste.",
    ],
    benefitsTitle: "Darum passt GASTZILLA zur Halloweenparty",
    benefits: [
      {
        title: "Passendes Design",
        text: "Wähle ein dunkles Design wie „Schwarz“ oder ein kräftiges „Orange“ – und gib deiner Einladung den richtigen Grusel-Look.",
      },
      {
        title: "Kostüm-Verrat per Nachricht",
        text: "Gäste können zu ihrer Zusage eine Nachricht schreiben – zum Beispiel, als was sie kommen. So gibt es keine drei Draculas.",
      },
      {
        title: "Grusel-Buffet abstimmen",
        text: "Wer Kürbissuppe, Monster-Muffins oder Getränke mitbringt, trägt es ein. Alle sehen, was schon da ist.",
      },
      {
        title: "Ein Link für die ganze Clique",
        text: "Teile die Einladung per WhatsApp, Signal, Telegram oder E-Mail. Bei jeder neuen Zusage bekommst du eine E-Mail.",
      },
    ],
    faq: [
      {
        question: "Brauchen meine Gäste ein Konto oder eine App?",
        answer:
          "Nein. Deine Gäste öffnen den Einladungslink im Browser und tragen sich ein. Nur du als Gastgeber brauchst ein kostenloses Konto.",
      },
      {
        question: "Gibt es ein Halloween-Design?",
        answer:
          "Ein eigenes Halloween-Design gibt es nicht, aber mit den Farbdesigns „Schwarz“ oder „Orange“ bekommt deine Einladung schnell eine passende Stimmung.",
      },
      {
        question: "Was kostet die Einladung zur Halloweenparty?",
        answer:
          "Nichts. Ein Event mit allen Grundfunktionen ist bei GASTZILLA kostenlos und werbefrei.",
      },
    ],
    updated: "2026-10-06",
  },
  {
    id: "mulled-wine-evening",
    slug: "gluehweinabend",
    name: "Glühweinabend",
    title: "Einladung zum Glühweinabend online erstellen",
    metaTitle: "Einladung zum Glühweinabend online erstellen – GASTZILLA",
    description:
      "Glühweinabend oder Adventstreffen per Link planen: Gäste sagen ohne Konto zu, geben an, wann sie kommen, und was sie mitbringen. Kostenlos & werbefrei.",
    teaser: "Adventsabend mit Freunden – wer kommt wann und wer bringt Tassen mit?",
    intro: [
      "Ein Glühweinabend ist schnell geplant – auf dem Balkon, im Garten oder in der Feuerschale vor dem Haus. Schwieriger ist der Überblick: Wer kommt nach der Arbeit vorbei, wer bleibt länger, und wer bringt Plätzchen mit?",
      "Mit GASTZILLA erstellst du in wenigen Minuten eine Einladungsseite für deinen Glühweinabend oder dein Adventstreffen und teilst den Link. Deine Gäste tragen sich selbst ein – ohne Konto oder App.",
    ],
    benefitsTitle: "Darum passt GASTZILLA zum Glühweinabend",
    benefits: [
      {
        title: "Wer kommt wann?",
        text: "Gäste geben an, wann sie vorbeikommen und auf Wunsch, bis wann sie bleiben. So weißt du, wann der Topf auf dem Herd stehen muss.",
      },
      {
        title: "Plätzchen, Tassen, Kinderpunsch",
        text: "Jeder trägt ein, was er mitbringt. Alle sehen es – und am Ende fehlen weder Tassen noch der Punsch für die Kinder.",
      },
      {
        title: "Spontan einladen",
        text: "Die Einladungsseite steht in wenigen Minuten. Teile den Link per WhatsApp, Signal, Telegram oder E-Mail – auch kurzfristig.",
      },
    ],
    faq: [
      {
        question: "Brauchen meine Gäste ein Konto oder eine App?",
        answer:
          "Nein. Deine Gäste öffnen den Einladungslink im Browser und tragen sich ein. Nur du als Gastgeber brauchst ein kostenloses Konto.",
      },
      {
        question: "Bekomme ich Bescheid, wenn sich jemand einträgt?",
        answer:
          "Ja. Bei jeder neuen Zusage und bei Änderungen an der Gästeliste bekommst du eine E-Mail.",
      },
      {
        question: "Was kostet die Einladung zum Glühweinabend?",
        answer:
          "Nichts. Ein Event mit allen Grundfunktionen ist bei GASTZILLA kostenlos und werbefrei.",
      },
    ],
    updated: "2026-10-06",
  },
  {
    id: "christmas",
    slug: "weihnachtsfest",
    name: "Weihnachtsfest",
    title: "Einladung zum Weihnachtsfest online erstellen",
    metaTitle: "Einladung zum Weihnachtsfest online erstellen – GASTZILLA",
    description:
      "Weihnachten mit Familie und Freunden planen: Gäste sagen per Link ohne Konto zu und tragen ein, was sie zum Festessen mitbringen. Kostenlos & werbefrei.",
    teaser: "Familie und Freunde sagen per Link zu – und stimmen ab, wer was zum Festessen beiträgt.",
    intro: [
      "Weihnachten mit der ganzen Familie heißt: viele Absprachen. Wer kommt an welchem Tag, wer bringt den Nachtisch mit, und kommt die Cousine diesmal mit Freund? Bis alles geklärt ist, sind Familienchat und Telefon heiß gelaufen.",
      "Mit GASTZILLA erstellst du eine Einladungsseite für euer Weihnachtsfest – ob Heiligabend, Weihnachtsessen oder Treffen zwischen den Jahren – und teilst den Link. Alle tragen sich selbst ein, ganz ohne Konto oder App.",
    ],
    benefitsTitle: "Darum passt GASTZILLA zum Weihnachtsfest",
    benefits: [
      {
        title: "Wer bringt was zum Festessen?",
        text: "Jeder trägt ein, was er beisteuert – Rotkohl, Nachtisch oder Wein. Alle sehen es, und am Ende fehlt nichts und nichts ist doppelt.",
      },
      {
        title: "Auch über mehrere Tage",
        text: "Feiert ihr vom 24. bis zum 26.? Gib einfach einen Zeitraum an. Gäste schreiben dazu, wann sie kommen und auf Wunsch, bis wann sie bleiben.",
      },
      {
        title: "Die ganze Familie im Blick",
        text: "Partner und Kinder werden mit Namen eingetragen und mitgezählt. So weißt du, wie viele Plätze am Tisch du brauchst.",
      },
      {
        title: "Einfach für alle Generationen",
        text: "Ein Link per WhatsApp, Signal, Telegram oder E-Mail genügt. Niemand muss eine App installieren oder ein Konto anlegen.",
      },
    ],
    faq: [
      {
        question: "Brauchen meine Gäste ein Konto oder eine App?",
        answer:
          "Nein. Deine Gäste öffnen den Einladungslink im Browser und tragen sich ein. Nur du als Gastgeber brauchst ein kostenloses Konto.",
      },
      {
        question: "Können Gäste ihren Eintrag später ändern?",
        answer:
          "Ja. Wenn sich etwas ändert – eine andere Uhrzeit, ein Gast mehr oder ein anderes Gericht –, passen sie ihren Eintrag einfach an. Du bekommst dazu eine E-Mail.",
      },
      {
        question: "Was kostet die Einladung zum Weihnachtsfest?",
        answer:
          "Nichts. Ein Event mit allen Grundfunktionen ist bei GASTZILLA kostenlos und werbefrei.",
      },
    ],
    updated: "2026-10-06",
  },
  {
    id: "new-years-eve",
    slug: "silvester",
    name: "Silvester",
    title: "Einladung zur Silvesterparty online erstellen",
    metaTitle: "Einladung zur Silvesterparty online erstellen – GASTZILLA",
    description:
      "Silvesterparty per Link planen: Gäste sagen ohne Konto zu, geben an, wann sie kommen und bis wann sie bleiben, und was sie mitbringen. Kostenlos & werbefrei.",
    teaser: "Wer feiert mit, wer bringt Raclette-Käse und wer bleibt bis zum Neujahrsfrühstück?",
    intro: [
      "Für Silvester stehen die Pläne oft erst kurz vorher fest. Wer feiert mit, wer kommt erst nach dem Essen dazu, und wer bringt Sekt, Raclette-Käse oder Fondue-Brot mit? Im Gruppenchat behält da niemand den Überblick.",
      "Mit GASTZILLA erstellst du in wenigen Minuten eine Einladungsseite für deine Silvesterparty und teilst den Link. Deine Gäste tragen sich selbst ein – ohne Konto oder App – und du siehst alle Zusagen in einer Liste.",
    ],
    benefitsTitle: "Darum passt GASTZILLA zur Silvesterparty",
    benefits: [
      {
        title: "Kommen und bleiben",
        text: "Gäste geben an, wann sie kommen und auf Wunsch, bis wann sie bleiben. So weißt du, wer zum Essen da ist und wer erst zum Anstoßen dazustößt.",
      },
      {
        title: "Raclette, Fondue oder Buffet",
        text: "Jeder trägt ein, was er mitbringt. Alle sehen es – so gibt es genug Käse, Brot und Sekt, aber keine fünf Kartoffelsalate.",
      },
      {
        title: "Kurzfristig einladen",
        text: "Die Einladungsseite steht in wenigen Minuten. Teile den Link per WhatsApp, Signal, Telegram oder E-Mail – auch wenige Tage vor Silvester.",
      },
    ],
    faq: [
      {
        question: "Brauchen meine Gäste ein Konto oder eine App?",
        answer:
          "Nein. Deine Gäste öffnen den Einladungslink im Browser und tragen sich ein. Nur du als Gastgeber brauchst ein kostenloses Konto.",
      },
      {
        question: "Bekomme ich Bescheid, wenn sich jemand einträgt?",
        answer:
          "Ja. Bei jeder neuen Zusage und bei Änderungen an der Gästeliste bekommst du eine E-Mail.",
      },
      {
        question: "Was kostet die Einladung zur Silvesterparty?",
        answer:
          "Nichts. Ein Event mit allen Grundfunktionen ist bei GASTZILLA kostenlos und werbefrei.",
      },
    ],
    updated: "2026-10-06",
  },
  {
    id: "theme-party",
    slug: "mottoparty",
    name: "Mottoparty",
    title: "Einladung zur Mottoparty online erstellen",
    metaTitle: "Einladung zur Mottoparty online erstellen – GASTZILLA",
    description:
      "Mottoparty per Link organisieren: Gäste sagen ohne Konto zu, verraten ihr Outfit per Nachricht und tragen ein, was sie mitbringen. Kostenlos & werbefrei.",
    teaser: "80er, Bad Taste oder Hawaii – Zusagen, Outfit-Verrat und Mitbringsel über einen Link.",
    intro: [
      "Ob 80er, Bad Taste, Hawaii oder Casino-Abend: Bei einer Mottoparty gibt es viel zu klären. Wer kommt, wer kommt als was, und wer bringt die passenden Snacks mit? Im Gruppenchat geht das schnell unter.",
      "Mit GASTZILLA erstellst du eine Einladungsseite für deine Mottoparty, beschreibst das Motto im Begrüßungstext und teilst den Link. Deine Gäste tragen sich selbst ein – ohne Konto oder App.",
    ],
    benefitsTitle: "Darum passt GASTZILLA zur Mottoparty",
    benefits: [
      {
        title: "Motto direkt auf der Einladung",
        text: "Titel, Begrüßungstext und Design wählst du selbst – so wissen alle sofort, worauf sie sich einstellen müssen.",
      },
      {
        title: "Outfit-Verrat per Nachricht",
        text: "Gäste können zu ihrer Zusage eine Nachricht schreiben, zum Beispiel, als was sie kommen. So stimmt ihr euch ab, und niemand kommt im gleichen Kostüm.",
      },
      {
        title: "Passende Snacks und Getränke",
        text: "Wer etwas mitbringt, trägt es ein. Alle sehen es, und das Buffet passt am Ende zum Motto.",
      },
    ],
    faq: [
      {
        question: "Brauchen meine Gäste ein Konto oder eine App?",
        answer:
          "Nein. Deine Gäste öffnen den Einladungslink im Browser und tragen sich ein. Nur du als Gastgeber brauchst ein kostenloses Konto.",
      },
      {
        question: "Gibt es Designs passend zu meinem Motto?",
        answer:
          "Eigene Motto-Designs gibt es nicht, aber du kannst aus mehreren Farbdesigns wählen und Titel und Begrüßungstext frei auf dein Motto zuschneiden.",
      },
      {
        question: "Was kostet die Einladung zur Mottoparty?",
        answer:
          "Nichts. Ein Event mit allen Grundfunktionen ist bei GASTZILLA kostenlos und werbefrei.",
      },
    ],
    updated: "2026-10-06",
  },
  {
    id: "group-trip",
    slug: "gruppenausflug",
    name: "Gruppenausflug",
    title: "Gruppenausflug organisieren – Anmeldung per Link",
    metaTitle: "Gruppenausflug organisieren – Anmeldung per Link – GASTZILLA",
    description:
      "Gruppenausflug, Vereinsfahrt oder Wanderung planen: Teilnehmer melden sich per Link ohne Konto an, Begleitpersonen werden mitgezählt. Kostenlos & werbefrei.",
    teaser: "Teilnehmer melden sich per Link an – mit Begleitung, auch für mehrtägige Touren.",
    intro: [
      "Beim Gruppenausflug hängt alles an der Teilnehmerzahl: Wie viele Tickets, wie viele Plätze im Restaurant, wie viele Autos? Wer die Anmeldungen per Chat einsammelt, zählt am Ende doch wieder alles von Hand.",
      "Mit GASTZILLA erstellst du eine Seite für deinen Ausflug – ob Wanderung, Vereinsfahrt, Klassentreffen oder Wochenendtour – und teilst den Link. Alle melden sich selbst an, ganz ohne Konto oder App.",
    ],
    benefitsTitle: "Darum passt GASTZILLA zum Gruppenausflug",
    benefits: [
      {
        title: "Teilnehmer zählen sich selbst",
        text: "Jeder trägt sich ein und nennt Begleitpersonen mit Namen. Die Gästeliste zeigt dir jederzeit, mit wie vielen Leuten du planen kannst.",
      },
      {
        title: "Auch für mehrere Tage",
        text: "Gib einen Zeitraum von bis an – für Wochenendtouren oder Vereinsfahrten. Treffpunkt und Kontakt stehen direkt auf der Seite.",
      },
      {
        title: "Fragen direkt bei der Anmeldung",
        text: "Teilnehmer können eine Nachricht hinterlassen, etwa zu Mitfahrgelegenheit oder Verpflegung. So hast du alles an einem Ort.",
      },
    ],
    faq: [
      {
        question: "Müssen sich die Teilnehmer registrieren?",
        answer:
          "Nein. Sie öffnen den Link im Browser und melden sich an. Nur du als Organisator brauchst ein kostenloses Konto.",
      },
      {
        question: "Wer kann die Teilnehmerliste sehen?",
        answer:
          "Alle, die den Link haben. Suchmaschinen finden die Seite nicht. Teile den Link deshalb nur mit der Gruppe, die du einladen möchtest.",
      },
      {
        question: "Was kostet die Planung des Ausflugs?",
        answer:
          "Nichts. Ein Event mit allen Grundfunktionen ist bei GASTZILLA kostenlos und werbefrei.",
      },
    ],
    updated: "2026-10-06",
  },
  {
    id: "casual-meetup",
    slug: "verabredung",
    name: "Verabredungen",
    title: "Verabredungen und Treffen einfach per Link planen",
    metaTitle: "Verabredungen und Treffen per Link planen – GASTZILLA",
    description:
      "Spieleabend, Kinoabend oder Stammtisch: Lade per Link ein, Freunde sagen ohne Konto zu – und du siehst sofort, wer dabei ist. Kostenlos & werbefrei.",
    teaser: "Spieleabend, Kino oder Stammtisch – sehen, wer dabei ist, ohne Chat-Chaos.",
    intro: [
      "Nicht jedes Treffen ist eine große Party. Aber auch beim Spieleabend, Kinobesuch oder Stammtisch kommt die Frage: Wer ist eigentlich dabei? Im Gruppenchat gehen die Antworten zwischen Memes und Sprachnachrichten schnell unter.",
      "Mit GASTZILLA legst du in wenigen Minuten eine Seite für dein Treffen an und teilst den Link. Deine Freunde tragen sich selbst ein – ohne Konto oder App – und alle sehen auf einen Blick, wer kommt.",
    ],
    benefitsTitle: "Darum passt GASTZILLA zu Verabredungen",
    benefits: [
      {
        title: "Schnell erstellt",
        text: "Titel, Datum, Ort – fertig. Die Seite steht in wenigen Minuten und lässt sich jederzeit anpassen.",
      },
      {
        title: "Alle sehen, wer kommt",
        text: "Die Liste ist für alle mit dem Link sichtbar. Niemand muss im Chat nachfragen, ob genug Leute für die Doppelkopfrunde zusammenkommen.",
      },
      {
        title: "Kurze Absprachen inklusive",
        text: "Wer etwas mitbringt oder später kommt, schreibt es direkt dazu – statt einer weiteren Nachricht in den Gruppenchat.",
      },
    ],
    faq: [
      {
        question: "Brauchen meine Freunde ein Konto oder eine App?",
        answer:
          "Nein. Sie öffnen den Link im Browser und tragen sich ein. Nur du brauchst ein kostenloses Konto.",
      },
      {
        question: "Kann ich mehrere Treffen anlegen?",
        answer:
          "Ein Event mit allen Grundfunktionen ist kostenlos. Weitere Events kannst du bald dazukaufen.",
      },
      {
        question: "Gibt es Werbung?",
        answer: "Nein. GASTZILLA ist werbefrei und setzt keine Tracking-Cookies ein.",
      },
    ],
    updated: "2026-10-06",
  },
];

export function occasionPath(occasion: Occasion): string {
  return `${OCCASIONS_PATH}/${occasion.slug}`;
}

export function getOccasionBySlug(slug: string): Occasion | undefined {
  return OCCASIONS.find((occasion) => occasion.slug === slug);
}

// Shared by the visible breadcrumb navigation and the BreadcrumbList schema.
export function hubBreadcrumbs(): Breadcrumb[] {
  return [
    { name: "Startseite", path: "/" },
    { name: "Anlässe", path: OCCASIONS_PATH },
  ];
}

export function occasionBreadcrumbs(occasion: Occasion): Breadcrumb[] {
  return [...hubBreadcrumbs(), { name: occasion.name, path: occasionPath(occasion) }];
}

// The overview page changes whenever one of its occasions does.
export function latestOccasionUpdate(): string {
  return OCCASIONS.map((occasion) => occasion.updated).sort().at(-1) ?? "";
}
