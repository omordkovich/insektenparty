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
  // Ready-to-copy invitation text, one entry per line; placeholders in
  // [brackets], always including [Link] for the invitation link.
  invitationText: string[];
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
    invitationText: [
      "Hallo liebe Eltern,",
      "[Name des Kindes] wird [Alter] und möchte das mit [eurem Kind] feiern! 🎈",
      "Wann: [Datum], [Uhrzeit von] bis [Uhrzeit bis]",
      "Wo: [Ort]",
      "Bitte tragt euer Kind bis [Datum] über diesen Link ein – dort könnt ihr auch Bring- und Abholzeit und Mitbringsel angeben: [Link]",
      "Wir freuen uns!",
      "[Dein Name]",
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
    id: "kids-playdate",
    slug: "spielverabredung",
    name: "Spielverabredung",
    title: "Spielverabredung für Kinder per Link organisieren",
    metaTitle: "Spielverabredung für Kinder organisieren – GASTZILLA",
    description:
      "Spielenachmittag für mehrere Kinder planen: Eltern sagen per Link ohne Konto zu und geben an, wann sie ihr Kind bringen und abholen. Kostenlos & werbefrei.",
    teaser: "Mehrere Kinder, ein Nachmittag – Eltern tragen Bring- und Abholzeit selbst ein.",
    intro: [
      "Wenn sich mehrere Kinder zum Spielen treffen – nach der Kita, auf dem Spielplatz oder bei euch zu Hause –, laufen die Absprachen meist über viele einzelne Eltern-Chats: Wer kommt, wann wird gebracht, wer holt wann ab, und darf das kleine Geschwisterkind mit?",
      "Mit GASTZILLA erstellst du in wenigen Minuten eine Seite für die Spielverabredung und schickst den Link an die Eltern. Sie tragen ihr Kind selbst ein – ganz ohne Konto oder App – und alle wissen, wer dabei ist.",
    ],
    benefitsTitle: "Darum passt GASTZILLA zur Spielverabredung",
    benefits: [
      {
        title: "Bringen und Abholen geklärt",
        text: "Eltern geben an, wann sie ihr Kind bringen, und können eintragen, bis wann es bleibt. So weißt du jederzeit, welche Kinder gerade da sind.",
      },
      {
        title: "Geschwister mit eintragen",
        text: "Kommt der kleine Bruder oder ein Elternteil mit? Begleitpersonen werden direkt bei der Zusage mit Namen eingetragen und mitgezählt.",
      },
      {
        title: "Wichtiges direkt dabei",
        text: "Eltern können eine Nachricht hinterlassen – zum Beispiel zu Allergien oder wer das Kind heute abholt.",
      },
      {
        title: "Snacks abstimmen",
        text: "Wer Obst, Muffins oder Getränke mitbringt, schreibt es dazu. Alle sehen es, und nichts kommt doppelt.",
      },
    ],
    invitationText: [
      "Hallo zusammen,",
      "die Kinder wollen sich mal wieder zum Spielen treffen! 🧸",
      "Wann: [Datum], ab [Uhrzeit]",
      "Wo: [Ort]",
      "Tragt euer Kind bitte hier ein und schreibt dazu, wann ihr es bringt und abholt: [Link]",
      "Liebe Grüße",
      "[Dein Name]",
    ],
    faq: [
      {
        question: "Brauchen die Eltern ein Konto oder eine App?",
        answer:
          "Nein. Die Eltern öffnen den Link im Browser und tragen ihr Kind ein. Nur du brauchst ein kostenloses Konto.",
      },
      {
        question: "Wer kann die Liste sehen?",
        answer:
          "Alle, die den Link haben. Suchmaschinen finden die Seite nicht. Teile den Link deshalb nur mit den Eltern der eingeladenen Kinder.",
      },
      {
        question: "Was kostet das?",
        answer:
          "Nichts. Ein Event mit allen Grundfunktionen ist bei GASTZILLA kostenlos und werbefrei.",
      },
    ],
    updated: "2026-10-07",
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
    invitationText: [
      "Hallo ihr Lieben,",
      "ich werde [Alter] – und das möchte ich mit euch feiern! 🥳",
      "Wann: [Datum] ab [Uhrzeit]",
      "Wo: [Ort]",
      "Sagt mir bitte bis [Datum] über diesen Link Bescheid, ob ihr kommt und wen ihr mitbringt: [Link]",
      "Ich freue mich auf euch!",
      "[Dein Name]",
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
    invitationText: [
      "Liebe Familie, liebe Freunde,",
      "wir trauen uns! 💍",
      "Am [Datum] möchten wir unsere Hochzeit mit euch feiern.",
      "Ort: [Ort], Beginn: [Uhrzeit]",
      "Bitte gebt uns bis [Datum] über diesen Link Bescheid, ob ihr dabei seid und wer euch begleitet: [Link]",
      "Wir freuen uns sehr auf euch!",
      "[Eure Namen]",
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
    invitationText: [
      "Liebe Kolleginnen und Kollegen,",
      "wir laden euch herzlich zu unserer [Weihnachtsfeier / Sommerfest / Teamevent] ein! 🎉",
      "Wann: [Datum], ab [Uhrzeit]",
      "Wo: [Ort]",
      "Bitte tragt euch bis [Datum] über diesen Link ein, damit wir gut planen können: [Link]",
      "Wir freuen uns auf einen schönen Abend mit euch!",
      "[Dein Name / Team]",
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
    invitationText: [
      "Hallo zusammen,",
      "der Grill wird angeworfen! 🔥",
      "Wann: [Datum] ab [Uhrzeit]",
      "Wo: [Ort]",
      "Für [Grillgut und Getränke] ist gesorgt – wer mag, bringt einen Salat oder Nachtisch mit. Tragt euch bitte hier ein und schreibt dazu, was ihr mitbringt: [Link]",
      "Bis bald!",
      "[Dein Name]",
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
    id: "carnival-party",
    slug: "karneval",
    name: "Karneval",
    title: "Karnevalsparty oder Karnevalssitzung – Einladung online erstellen",
    metaTitle: "Karnevalsparty & Karnevalssitzung planen – GASTZILLA",
    description:
      "Karnevalsparty, Sitzung, Weiberfastnacht oder Elfter im Elften: Gäste sagen per Link ohne Konto zu, verraten ihr Kostüm und tragen ein, was sie mitbringen.",
    teaser: "Party, Sitzung, Elfter im Elften oder Rosenmontag – Zusagen, Kostüme und Mitbringsel über einen Link.",
    intro: [
      "Alaaf und Helau! Ob Sessionsauftakt am Elften im Elften, gemeinsamer Besuch der Karnevalssitzung, Weiberfastnacht oder Rosenmontag: Wenn die Jecken loslegen, will alles gut vorbereitet sein. Wer kommt mit, wie viele Sitzungskarten braucht ihr, wer trifft sich schon vor dem Zug, und wer bringt Kölsch oder Alt, Berliner oder Frikadellen mit? Im Gruppenchat geht das zwischen Kostümfotos schnell unter.",
      "Mit GASTZILLA erstellst du in wenigen Minuten eine Einladungsseite für deine Karnevalsparty oder euren Sitzungsbesuch und teilst den Link. Deine Gäste tragen sich selbst ein – ohne Konto oder App – und du siehst alle Zusagen in einer Liste.",
    ],
    benefitsTitle: "Darum passt GASTZILLA zum Karneval",
    benefits: [
      {
        title: "Kostüm-Verrat per Nachricht",
        text: "Gäste können zu ihrer Zusage eine Nachricht schreiben – zum Beispiel, als was sie kommen. So stimmt ihr euch ab, und es gibt keine fünf Piraten.",
      },
      {
        title: "Gemeinsam zur Karnevalssitzung",
        text: "Alle tragen sich mit Begleitung ein – so weißt du rechtzeitig, wie viele Karten du für die Sitzung besorgen musst.",
      },
      {
        title: "Treffen vor und nach dem Zug",
        text: "Gäste geben an, wann sie kommen und auf Wunsch, bis wann sie bleiben. Feiert ihr von Weiberfastnacht bis Rosenmontag, gibst du einfach einen Zeitraum an.",
      },
      {
        title: "Mitbringsel für die Feier",
        text: "Wer Berliner, Frikadellen oder Getränke mitbringt, trägt es ein. Alle sehen es, und das Buffet passt.",
      },
    ],
    invitationText: [
      "Alaaf und Helau, ihr Jecken! 🎉",
      "Wir [feiern Weiberfastnacht / gehen zusammen zur Karnevalssitzung / feiern den Elften im Elften]!",
      "Wann: [Datum] ab [Uhrzeit]",
      "Wo: [Ort]",
      "Kostüm ist Pflicht! Sagt hier zu, verratet, als was ihr kommt, und tragt ein, was ihr mitbringt: [Link]",
      "[Dein Name]",
    ],
    faq: [
      {
        question: "Brauchen meine Gäste ein Konto oder eine App?",
        answer:
          "Nein. Deine Gäste öffnen den Einladungslink im Browser und tragen sich ein. Nur du als Gastgeber brauchst ein kostenloses Konto.",
      },
      {
        question: "Kann ich über GASTZILLA Karten für die Sitzung kaufen?",
        answer:
          "Nein. GASTZILLA sammelt nur die Zusagen. Die Karten besorgst du wie gewohnt beim Karnevalsverein – aber mit der richtigen Anzahl.",
      },
      {
        question: "Gibt es ein Karnevals-Design?",
        answer:
          "Ein eigenes Karnevals-Design gibt es nicht, aber mit bunten Farbdesigns wie „Rot“, „Gelb“ oder „Blau“ bekommt deine Einladung schnell die passende Stimmung.",
      },
      {
        question: "Was kostet das?",
        answer:
          "Nichts. Ein Event mit allen Grundfunktionen ist bei GASTZILLA kostenlos und werbefrei.",
      },
    ],
    updated: "2026-10-07",
  },
  {
    id: "oktoberfest",
    slug: "oktoberfest",
    name: "Oktoberfest",
    title: "Oktoberfest-Party oder Wiesn-Besuch – Einladung online erstellen",
    metaTitle: "Oktoberfest-Party & Wiesn-Besuch planen – GASTZILLA",
    description:
      "Oktoberfest-Party zu Hause oder gemeinsam auf die Wiesn: Gäste sagen per Link ohne Konto zu – und du weißt, für wie viele du im Festzelt reservieren musst.",
    teaser: "Oktoberfest-Party zu Hause oder gemeinsam auf die Wiesn – Zusagen, Brezn und Treffpunkt über einen Link.",
    intro: [
      "O’zapft is! Ob Oktoberfest-Party im Garten oder Partykeller, gemeinsam auf die Wiesn in München, auf den Cannstatter Wasen oder zum Oktoberfest in deiner Stadt: Damit der Tisch im Festzelt reicht und genug Brezn da sind, musst du wissen, wer mitkommt.",
      "Mit GASTZILLA erstellst du in wenigen Minuten eine Einladungsseite für deine Oktoberfest-Party oder euren Wiesn-Besuch und teilst den Link. Alle tragen sich selbst ein – ohne Konto oder App – und du hast die Zusagen in einer Liste.",
    ],
    benefitsTitle: "Darum passt GASTZILLA zum Oktoberfest",
    benefits: [
      {
        title: "Richtig reservieren im Festzelt",
        text: "Jeder trägt sich ein und nennt Begleitpersonen mit Namen. So weißt du, für wie viele Leute du einen Tisch im Zelt reservieren musst.",
      },
      {
        title: "Brezn, Obatzda und Weißwürste",
        text: "Bei der Party zu Hause trägt jeder ein, was er mitbringt. Alle sehen es – und am Ende fehlt weder Senf noch Brezn.",
      },
      {
        title: "Treffpunkt vor dem Zelt",
        text: "Ort und Uhrzeit stehen auf der Seite. Wer später nachkommt oder früher geht, gibt das einfach bei der Zusage an.",
      },
    ],
    invitationText: [
      "Servus beinand! 🥨",
      "O’zapft is – wir [feiern Oktoberfest bei mir / gehen zusammen auf die Wiesn]!",
      "Wann: [Datum] ab [Uhrzeit]",
      "Wo / Treffpunkt: [Ort]",
      "Tragt euch bitte bis [Datum] hier ein, damit ich [den Tisch reservieren / genug Brezn besorgen] kann – und schreibt dazu, was ihr mitbringt: [Link]",
      "Dirndl und Lederhosn gern gesehen!",
      "[Dein Name]",
    ],
    faq: [
      {
        question: "Kann ich über GASTZILLA einen Tisch im Festzelt reservieren?",
        answer:
          "Nein. GASTZILLA sammelt nur die Zusagen. Die Reservierung erledigst du wie gewohnt beim Festwirt – aber mit der richtigen Personenzahl.",
      },
      {
        question: "Gibt es ein Oktoberfest-Design?",
        answer:
          "Ein eigenes Oktoberfest-Design gibt es nicht, aber mit den Farbdesigns „Blau“ oder „Weiß“ bekommt deine Einladung schnell den passenden Look.",
      },
      {
        question: "Was kostet das?",
        answer:
          "Nichts. Ein Event mit allen Grundfunktionen ist bei GASTZILLA kostenlos und werbefrei.",
      },
    ],
    updated: "2026-10-07",
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
    invitationText: [
      "Hallo ihr Gruselgestalten! 🎃",
      "Ich lade euch zu meiner Halloweenparty ein.",
      "Wann: [Datum] ab [Uhrzeit]",
      "Wo: [Ort]",
      "Verkleidung erwünscht! Sagt hier zu, verratet, als was ihr kommt, und tragt ein, welche Snacks ihr mitbringt: [Link]",
      "Schaurige Grüße",
      "[Dein Name]",
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
    id: "advent-party",
    slug: "advent-weihnachtsmarkt",
    name: "Advent & Weihnachtsmarkt",
    title: "Adventsfeier, Glühweinabend oder Weihnachtsmarkt – per Link einladen",
    metaTitle: "Adventsfeier & Weihnachtsmarkt gemeinsam planen – GASTZILLA",
    description:
      "Adventsfeier, Glühweinabend oder gemeinsam auf den Weihnachtsmarkt: Gäste sagen per Link ohne Konto zu und geben an, wann sie kommen. Kostenlos & werbefrei.",
    teaser: "Adventskaffee, Glühwein am Feuer oder Weihnachtsmarkt – wer kommt wann und wer bringt was mit?",
    intro: [
      "Ob Adventskaffee mit den Nachbarn, Plätzchenbacken mit Freunden, Glühweinabend an der Feuerschale oder ein gemeinsamer Bummel über den Weihnachtsmarkt: In der Adventszeit ist viel los. Wer kommt nach der Arbeit dazu, wo trefft ihr euch, und wer bringt Plätzchen oder Tassen mit?",
      "Mit GASTZILLA erstellst du in wenigen Minuten eine Einladungsseite für deine Adventsfeier, deinen Glühweinabend oder euren Weihnachtsmarktbesuch und teilst den Link. Deine Gäste tragen sich selbst ein – ohne Konto oder App.",
    ],
    benefitsTitle: "Darum passt GASTZILLA zur Adventszeit",
    benefits: [
      {
        title: "Wer kommt wann?",
        text: "Gäste geben an, wann sie vorbeikommen und auf Wunsch, bis wann sie bleiben. So weißt du, wann der Glühwein warm sein muss.",
      },
      {
        title: "Plätzchen, Tassen, Kinderpunsch",
        text: "Jeder trägt ein, was er mitbringt. Alle sehen es – und am Ende fehlen weder Tassen noch der Punsch für die Kinder.",
      },
      {
        title: "Gemeinsam auf den Weihnachtsmarkt",
        text: "Nenne Treffpunkt und Uhrzeit – etwa am Eingang oder an der Glühweinbude. Wer später nachkommt, schreibt es einfach bei der Zusage dazu.",
      },
      {
        title: "Für Nachbarn, Verein oder Freunde",
        text: "Ein Link per WhatsApp, Signal, Telegram oder E-Mail genügt – für die Hausgemeinschaft genauso wie für den Verein oder den Freundeskreis.",
      },
    ],
    invitationText: [
      "Hallo ihr Lieben,",
      "zur Einstimmung auf die Adventszeit lade ich euch zu [Glühwein / Plätzchen / Adventskaffee / einem Bummel über den Weihnachtsmarkt] ein. ✨",
      "Wann: [Datum] ab [Uhrzeit]",
      "Wo / Treffpunkt: [Ort]",
      "Kommt vorbei, wann es euch passt – tragt euch einfach hier ein und schreibt dazu, wann ihr kommt und was ihr mitbringt: [Link]",
      "Liebe Grüße",
      "[Dein Name]",
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
        question: "Was kostet das?",
        answer:
          "Nichts. Ein Event mit allen Grundfunktionen ist bei GASTZILLA kostenlos und werbefrei.",
      },
    ],
    updated: "2026-10-07",
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
    invitationText: [
      "Liebe Familie,",
      "auch dieses Jahr wollen wir Weihnachten zusammen feiern! 🎄",
      "Wann: [Datum / Zeitraum]",
      "Wo: [Ort]",
      "Damit wir das Festessen gut planen können, tragt euch bitte hier ein und schreibt dazu, wer was mitbringt: [Link]",
      "Wir freuen uns auf euch!",
      "[Dein Name]",
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
    invitationText: [
      "Hallo zusammen,",
      "lasst uns das neue Jahr gemeinsam begrüßen! 🥂",
      "Wann: 31.12. ab [Uhrzeit]",
      "Wo: [Ort]",
      "Es gibt [Raclette / Fondue / Buffet] – sagt hier zu und tragt ein, was ihr mitbringt und wie lange ihr bleibt: [Link]",
      "Bis Silvester!",
      "[Dein Name]",
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
    invitationText: [
      "Hallo zusammen,",
      "Motto des Abends: [Motto]! 🕺",
      "Wann: [Datum] ab [Uhrzeit]",
      "Wo: [Ort]",
      "Kommt passend verkleidet – sagt hier zu, verratet euer Outfit und tragt ein, was ihr mitbringt: [Link]",
      "Ich freue mich auf euch!",
      "[Dein Name]",
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
    id: "group-travel",
    slug: "gruppenreise",
    name: "Gruppenreise & Vereinsfahrt",
    title: "Gruppenreise oder Vereinsfahrt organisieren – Anmeldung per Link",
    metaTitle: "Gruppenreise & Vereinsfahrt organisieren – GASTZILLA",
    description:
      "Mit dem Bus nach Paris oder Amsterdam, Wochenendtour oder Vereinsfahrt: Teilnehmer melden sich per Link ohne Konto an – mit Begleitung. Kostenlos & werbefrei.",
    teaser: "Busfahrt nach Paris, Wochenendtour oder Vereinsfahrt – Anmeldungen mit Begleitung in einer Liste.",
    intro: [
      "Ob Busfahrt zum Städtetrip nach Paris oder Amsterdam, Wochenendtour mit Freunden oder die jährliche Vereinsfahrt: Bei einer Gruppenreise hängt alles an der Teilnehmerzahl. Wie groß muss der Bus sein, wie viele Zimmer braucht ihr, und wer kommt mit Partner? Wer die Anmeldungen per Chat und Telefon einsammelt, zählt am Ende doch wieder von Hand.",
      "Mit GASTZILLA erstellst du eine Seite für eure Reise – mit Reisezeitraum, Abfahrtsort und Kontakt – und teilst den Link. Alle melden sich selbst an, ganz ohne Konto oder App, und du hast jederzeit die aktuelle Teilnehmerliste.",
    ],
    benefitsTitle: "Darum passt GASTZILLA zur Gruppenreise",
    benefits: [
      {
        title: "Teilnehmerzahl für Bus und Hotel",
        text: "Jeder meldet sich an und trägt Begleitpersonen mit Namen ein. So weißt du, wie viele Plätze im Bus und wie viele Zimmer ihr braucht.",
      },
      {
        title: "Reisezeitraum und Abfahrtsort",
        text: "Gib einen Zeitraum von bis an und nenne den Abfahrtsort. Deine Kontaktdaten stehen direkt auf der Seite, falls jemand Fragen hat.",
      },
      {
        title: "Wünsche direkt bei der Anmeldung",
        text: "Teilnehmer können eine Nachricht hinterlassen – etwa einen Zimmerwunsch oder dass sie unterwegs zusteigen.",
      },
      {
        title: "Ein Link für den ganzen Verein",
        text: "Teile die Anmeldung per WhatsApp, Signal, Telegram oder E-Mail. Bei jeder neuen Anmeldung bekommst du eine E-Mail.",
      },
    ],
    invitationText: [
      "Hallo zusammen,",
      "wir fahren gemeinsam nach [Reiseziel]! 🚌",
      "Wann: [Datum von] bis [Datum bis]",
      "Abfahrt: [Uhrzeit], [Abfahrtsort]",
      "Bitte meldet euch bis [Datum] über diesen Link an und tragt Begleitpersonen mit Namen ein – Zimmerwünsche gern als Nachricht: [Link]",
      "Bei Fragen erreicht ihr mich unter [Telefon].",
      "[Dein Name]",
    ],
    faq: [
      {
        question: "Kann ich über GASTZILLA die Reise buchen oder bezahlen lassen?",
        answer:
          "Nein. GASTZILLA sammelt nur die Anmeldungen. Bus, Hotel und Bezahlung organisierst du wie gewohnt selbst – aber mit der richtigen Teilnehmerzahl.",
      },
      {
        question: "Müssen sich die Teilnehmer registrieren?",
        answer:
          "Nein. Sie öffnen den Link im Browser und melden sich an. Nur du als Organisator brauchst ein kostenloses Konto.",
      },
      {
        question: "Wer kann die Teilnehmerliste sehen?",
        answer:
          "Alle, die den Link haben. Suchmaschinen finden die Seite nicht. Teile den Link deshalb nur mit der Gruppe, die mitfahren soll.",
      },
    ],
    updated: "2026-10-07",
  },
  {
    id: "culture-outing",
    slug: "kultur",
    name: "Kultur",
    title: "Kino, Theater, Oper oder Museum – gemeinsamen Besuch per Link planen",
    metaTitle: "Kino, Theater, Oper & Museum gemeinsam planen – GASTZILLA",
    description:
      "Kino, Theater, Oper, Museum, Konzert oder Stadion: Lade per Link ein, alle sagen ohne Konto zu – und du weißt, wie viele Karten du brauchst. Kostenlos.",
    teaser: "Kino, Theater, Oper, Museum oder Konzert – sehen, wer mitkommt und wie viele Karten nötig sind.",
    intro: [
      "Gemeinsam ins Kino, ins Theater oder in die Oper, durchs Museum, zum Konzert oder zum Heimspiel ins Stadion – die Idee ist schnell geboren. Danach beginnt das Nachfragen: Wer kommt mit, wer bringt jemanden mit, und wie viele Karten müsst ihr besorgen?",
      "Mit GASTZILLA erstellst du in wenigen Minuten eine Seite für euren Besuch und teilst den Link. Alle tragen sich selbst ein – ohne Konto oder App – und du siehst sofort, mit wie vielen Leuten du rechnen kannst.",
    ],
    benefitsTitle: "Darum passt GASTZILLA zum gemeinsamen Kulturbesuch",
    benefits: [
      {
        title: "Wissen, wie viele Karten nötig sind",
        text: "Jeder trägt sich ein und nennt Begleitpersonen mit Namen. Die Liste zeigt dir jederzeit, für wie viele Leute du Karten oder eine Gruppenführung besorgen musst.",
      },
      {
        title: "Treffpunkt und Uhrzeit für alle",
        text: "Ort, Datum und Uhrzeit stehen auf der Seite, dazu deine Kontaktdaten. Gäste geben an, wann sie zum Treffpunkt kommen.",
      },
      {
        title: "Absprachen ohne Gruppenchat",
        text: "Gäste können eine Nachricht hinterlassen – etwa, ob sie schon eine Karte haben oder nach der Vorstellung noch mitkommen.",
      },
    ],
    invitationText: [
      "Hallo zusammen,",
      "wer kommt mit [ins Kino / ins Theater / in die Oper / ins Museum]? 🎭",
      "Wann: [Datum], [Uhrzeit]",
      "Treffpunkt: [Ort]",
      "Tragt euch bitte bis [Datum] hier ein, damit ich die richtige Anzahl an Karten besorgen kann: [Link]",
      "Liebe Grüße",
      "[Dein Name]",
    ],
    faq: [
      {
        question: "Kann ich über GASTZILLA Tickets kaufen?",
        answer:
          "Nein. GASTZILLA ist kein Ticketshop – du sammelst nur die Zusagen. Die Karten besorgst du wie gewohnt beim Kino, Theater oder Veranstalter.",
      },
      {
        question: "Brauchen die anderen ein Konto oder eine App?",
        answer:
          "Nein. Sie öffnen den Link im Browser und tragen sich ein. Nur du brauchst ein kostenloses Konto.",
      },
      {
        question: "Was kostet das?",
        answer:
          "Nichts. Ein Event mit allen Grundfunktionen ist bei GASTZILLA kostenlos und werbefrei.",
      },
    ],
    updated: "2026-10-07",
  },
  {
    id: "going-out",
    slug: "ausgehen",
    name: "Ausgehen",
    title: "Restaurant, Bar, Club oder Escape Room – gemeinsam ausgehen per Link planen",
    metaTitle: "Restaurant, Bar, Club & Escape Room planen – GASTZILLA",
    description:
      "Restaurant, Bar, Club, Bowling oder Escape Room: Lade per Link ein, alle sagen ohne Konto zu – und du weißt, für wie viele du reservieren oder buchen musst.",
    teaser: "Restaurant, Cocktailbar, Stammkneipe, Club, Bowling oder Escape Room – sehen, wer dabei ist.",
    intro: [
      "Zusammen essen gehen, ein Abend in der Cocktailbar, die Runde in der Stammkneipe, danach in den Club – oder eine Partie Bowling, Billard oder Darts, ein Escape Room mit Freunden: Ausgehen ist schnell vorgeschlagen. Aber wer kommt wirklich mit, und für wie viele Leute musst du einen Tisch, eine Bahn oder einen Raum buchen?",
      "Mit GASTZILLA erstellst du in wenigen Minuten eine Seite für euren Abend und teilst den Link. Alle tragen sich selbst ein – ohne Konto oder App – und du siehst sofort, mit wie vielen Leuten du rechnen kannst.",
    ],
    benefitsTitle: "Darum passt GASTZILLA zum gemeinsamen Ausgehen",
    benefits: [
      {
        title: "Richtig reservieren und buchen",
        text: "Jeder trägt sich ein und nennt Begleitpersonen mit Namen. So weißt du, für wie viele Leute du im Restaurant, auf der Bowlingbahn oder im Escape Room buchen musst – gerade dort zählt die genaue Teamgröße.",
      },
      {
        title: "Später dazukommen, früher gehen",
        text: "Gäste geben an, wann sie kommen und auf Wunsch, bis wann sie bleiben – praktisch, wenn manche erst zum Club dazustoßen.",
      },
      {
        title: "Absprachen ohne Gruppenchat",
        text: "Gäste können eine Nachricht hinterlassen – etwa, ob sie vegetarisch essen oder erst nach dem Essen dazukommen.",
      },
    ],
    invitationText: [
      "Hallo zusammen,",
      "wer hat Lust auf [Restaurant / Cocktailbar / Stammkneipe / Club / Bowling / Escape Room]? 🍸",
      "Wann: [Datum] ab [Uhrzeit]",
      "Wo: [Ort]",
      "Tragt euch bitte bis [Datum] hier ein, damit ich für die richtige Anzahl reservieren kann: [Link]",
      "Bis dann!",
      "[Dein Name]",
    ],
    faq: [
      {
        question: "Kann ich über GASTZILLA einen Tisch reservieren oder einen Escape Room buchen?",
        answer:
          "Nein. GASTZILLA sammelt nur die Zusagen. Reservierung und Buchung erledigst du wie gewohnt beim Restaurant, der Bar, dem Bowlingcenter oder dem Escape-Room-Anbieter – aber mit der richtigen Personenzahl.",
      },
      {
        question: "Brauchen die anderen ein Konto oder eine App?",
        answer:
          "Nein. Sie öffnen den Link im Browser und tragen sich ein. Nur du brauchst ein kostenloses Konto.",
      },
      {
        question: "Was kostet das?",
        answer:
          "Nichts. Ein Event mit allen Grundfunktionen ist bei GASTZILLA kostenlos und werbefrei.",
      },
    ],
    updated: "2026-10-07",
  },
  {
    id: "sports-together",
    slug: "sport",
    name: "Sport zusammen",
    title: "Gemeinsam Sport machen – Laufen, Klettern, Fußball & Co. per Link organisieren",
    metaTitle: "Gemeinsam Sport machen – Laufen, Klettern & Co. – GASTZILLA",
    description:
      "Lauftreff, Klettern, Fußball, Hockey oder Snowboardtour: Lade per Link ein, alle sagen ohne Konto zu – und du siehst sofort, ob genug zusammenkommen.",
    teaser: "Lauftreff, Klettern, Fußball, Hockey oder ab in die Berge – sehen, ob genug Leute zusammenkommen.",
    intro: [
      "Ob Marathon-Training in der Gruppe, Klettern und Bouldern in der Halle, eine Runde Fußball im Park, Basketball, Handball oder Hockeytraining – oder gemeinsam mit Snowboard und Ski in die Berge: Damit es losgehen kann, müssen genug Leute dabei sein. Im Gruppenchat ist das oft bis zuletzt unklar.",
      "Mit GASTZILLA legst du in wenigen Minuten eine Seite für euren Termin an und teilst den Link. Alle tragen sich selbst ein – ohne Konto oder App – und jeder sieht auf einen Blick, wer dabei ist.",
    ],
    benefitsTitle: "Darum passt GASTZILLA zum gemeinsamen Sport",
    benefits: [
      {
        title: "Kommen genug Leute zusammen?",
        text: "Die Liste zeigt allen mit dem Link, wer zugesagt hat. So siehst du schnell, ob es für zwei Teams, die Laufgruppe oder eine Seilschaft reicht.",
      },
      {
        title: "Wer bringt was mit?",
        text: "Bälle, Schläger, Leibchen, Seil oder Getränke – jeder trägt ein, was er mitbringt. Dann steht am Ende niemand ohne Ausrüstung da.",
      },
      {
        title: "Treffpunkt und Startzeit",
        text: "Ort und Uhrzeit stehen auf der Seite. Wer später dazukommt oder früher gehen muss, gibt das einfach bei der Zusage an.",
      },
      {
        title: "Ab in die Berge",
        text: "Für das Snowboard- oder Skiwochenende gibst du einen Zeitraum an. Fahrgemeinschaften und Leihausrüstung klärt ihr per Nachricht direkt bei der Zusage.",
      },
    ],
    invitationText: [
      "Hallo zusammen,",
      "wer ist dabei? [Lauftreff / Klettern / Fußball / Hockey / Snowboard-Wochenende] am [Datum] um [Uhrzeit]! ⚽",
      "Treffpunkt: [Ort]",
      "Tragt euch hier ein, damit wir wissen, ob genug Leute zusammenkommen – und schreibt dazu, wer [Ball / Ausrüstung / Auto] mitbringt: [Link]",
      "Sportliche Grüße",
      "[Dein Name]",
    ],
    faq: [
      {
        question: "Brauchen die Mitspieler ein Konto oder eine App?",
        answer:
          "Nein. Sie öffnen den Link im Browser und tragen sich ein. Nur du als Organisator brauchst ein kostenloses Konto.",
      },
      {
        question: "Können sich Mitspieler wieder austragen?",
        answer:
          "Ja. Wer doch nicht kann, ändert oder löscht seinen Eintrag einfach. Du bekommst dazu eine E-Mail.",
      },
      {
        question: "Kann ich mehrere Termine anlegen?",
        answer:
          "Ein Event mit allen Grundfunktionen ist kostenlos. Weitere Events kannst du bald dazukaufen.",
      },
    ],
    updated: "2026-10-07",
  },
  {
    id: "tabletop-night",
    slug: "tabletop",
    name: "Tabletop & Brettspiele",
    title: "Tabletop- und Brettspielabend per Link organisieren",
    metaTitle: "Tabletop- und Brettspielabend organisieren – GASTZILLA",
    description:
      "Brettspielabend, Pen & Paper oder Tabletop-Runde: Mitspieler sagen per Link ohne Konto zu und tragen ein, welche Spiele sie mitbringen. Kostenlos & werbefrei.",
    teaser: "Brettspiele, Pen & Paper oder Tabletop – wer spielt mit und wer bringt welches Spiel mit?",
    intro: [
      "Ein guter Spieleabend steht und fällt mit der Runde: Für manche Spiele braucht es genau vier Leute, für die Pen-&-Paper-Kampagne die ganze Gruppe. Und dann ist da noch die Frage, wer welches Spiel, welche Armee oder welche Snacks mitbringt.",
      "Mit GASTZILLA legst du in wenigen Minuten eine Seite für euren Brettspiel-, Pen-&-Paper- oder Tabletop-Abend an und teilst den Link. Alle tragen sich selbst ein – ohne Konto oder App – und jeder sieht, wer dabei ist.",
    ],
    benefitsTitle: "Darum passt GASTZILLA zum Tabletop- und Brettspielabend",
    benefits: [
      {
        title: "Wie viele sitzen am Tisch?",
        text: "Die Liste zeigt allen mit dem Link, wer zugesagt hat. So weißt du rechtzeitig, ob es für das große Strategiespiel reicht oder ob ihr zwei Tische braucht.",
      },
      {
        title: "Wer bringt welches Spiel mit?",
        text: "Spiele, Erweiterungen, Miniaturen oder Snacks – jeder trägt ein, was er mitbringt. Alle sehen es, und niemand schleppt dasselbe Spiel an.",
      },
      {
        title: "Wünsche und Absprachen",
        text: "Gäste können eine Nachricht hinterlassen – etwa, worauf sie Lust haben oder ob ihr Charakterbogen noch beim Spielleiter liegt.",
      },
    ],
    invitationText: [
      "Hallo zusammen,",
      "es ist mal wieder Zeit für einen Spieleabend! 🎲",
      "Wann: [Datum] ab [Uhrzeit]",
      "Wo: [Ort]",
      "Tragt euch hier ein und schreibt dazu, welche Spiele ihr mitbringt oder worauf ihr Lust habt: [Link]",
      "Bis zum nächsten Wurf!",
      "[Dein Name]",
    ],
    faq: [
      {
        question: "Brauchen die Mitspieler ein Konto oder eine App?",
        answer:
          "Nein. Sie öffnen den Link im Browser und tragen sich ein. Nur du als Gastgeber brauchst ein kostenloses Konto.",
      },
      {
        question: "Können sich Mitspieler wieder austragen?",
        answer:
          "Ja. Wer doch nicht kann, ändert oder löscht seinen Eintrag einfach. Du bekommst dazu eine E-Mail.",
      },
      {
        question: "Was kostet das?",
        answer:
          "Nichts. Ein Event mit allen Grundfunktionen ist bei GASTZILLA kostenlos und werbefrei.",
      },
    ],
    updated: "2026-10-07",
  },
  {
    id: "gaming-night",
    slug: "gaming",
    name: "Gaming & LAN-Party",
    title: "Gamingabend oder LAN-Party per Link organisieren",
    metaTitle: "Gamingabend oder LAN-Party organisieren – GASTZILLA",
    description:
      "Konsolenabend oder LAN-Party: Mitspieler sagen per Link ohne Konto zu und tragen ein, wer Konsole, Controller oder Snacks mitbringt. Kostenlos & werbefrei.",
    teaser: "Konsolenabend oder LAN-Party – wer zockt mit und wer bringt Controller und Kabel?",
    intro: [
      "Ob Couch-Koop, Mario-Kart-Turnier oder LAN-Party übers Wochenende: Bevor es losgeht, muss geklärt sein, wer kommt, wer seinen Rechner mitbringt und ob genug Controller da sind. Im Gruppenchat gehen solche Absprachen schnell unter.",
      "Mit GASTZILLA legst du in wenigen Minuten eine Seite für deinen Gamingabend oder deine LAN-Party an und teilst den Link. Alle tragen sich selbst ein – ohne Konto oder App – und du hast den Überblick.",
    ],
    benefitsTitle: "Darum passt GASTZILLA zum Gamingabend",
    benefits: [
      {
        title: "Hardware abstimmen",
        text: "Konsole, Controller, Monitor, Netzwerkkabel oder Snacks – jeder trägt ein, was er mitbringt. So fehlt am Ende weder der vierte Controller noch das Verlängerungskabel.",
      },
      {
        title: "Auch übers Wochenende",
        text: "Für die LAN-Party gibst du einfach einen Zeitraum an. Gäste schreiben dazu, wann sie kommen und auf Wunsch, bis wann sie bleiben.",
      },
      {
        title: "Wer ist dabei?",
        text: "Die Liste zeigt allen mit dem Link, wer zugesagt hat – so wisst ihr, für welches Spiel genug Leute da sind.",
      },
    ],
    invitationText: [
      "Hallo zusammen,",
      "[Gamingabend / LAN-Party] bei mir! 🎮",
      "Wann: [Datum] ab [Uhrzeit] (bis [Datum / Uhrzeit])",
      "Wo: [Ort]",
      "Tragt euch hier ein und schreibt dazu, wer Konsole, Controller, Rechner oder Kabel mitbringt: [Link]",
      "GG!",
      "[Dein Name]",
    ],
    faq: [
      {
        question: "Brauchen die Mitspieler ein Konto oder eine App?",
        answer:
          "Nein. Sie öffnen den Link im Browser und tragen sich ein. Nur du als Gastgeber brauchst ein kostenloses Konto.",
      },
      {
        question: "Bekomme ich Bescheid, wenn sich jemand einträgt?",
        answer:
          "Ja. Bei jeder neuen Zusage und bei Änderungen an der Gästeliste bekommst du eine E-Mail.",
      },
      {
        question: "Was kostet das?",
        answer:
          "Nichts. Ein Event mit allen Grundfunktionen ist bei GASTZILLA kostenlos und werbefrei.",
      },
    ],
    updated: "2026-10-07",
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
