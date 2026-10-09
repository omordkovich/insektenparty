import { occasionIconUrl } from "@/lib/occasion-icons";
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
    "Ob Kindergeburtstag, Hochzeit oder Grillabend: Erstelle kostenlos eine digitale Einladung, teile den Link und sammle alle Zu- und Absagen in einer Gästeliste.",
  intro:
    "Egal, was du feierst: Mit GASTZILLA bekommt jeder Anlass seine eigene Einladungsseite. Deine Gäste sagen per Link zu oder ab – ohne Konto, ohne App und ohne Zusagen-Chaos im Gruppenchat. Steht der Termin noch nicht fest, stimmen sie vorher einfach darüber ab.",
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
        title: "Kuchen, Muffins & Co. abstimmen",
        text: "Wer Kuchen, Muffins oder Saft mitbringt, schreibt es dazu. Alle sehen es – und es gibt keine fünf Nudelsalate.",
      },
      {
        title: "Ein Link für den Klassenchat",
        text: "Teile die Einladung per WhatsApp, Signal, Telegram oder E-Mail. Bei jeder Zu- oder Absage bekommst du eine Benachrichtigung per E-Mail.",
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
        question: "Wie viele Kinder lädt man zum Kindergeburtstag ein?",
        answer:
          "Eine beliebte Faustregel: so viele Kinder, wie das Geburtstagskind alt wird. Mit GASTZILLA siehst du jederzeit, wie viele zugesagt haben – Geschwister und Begleitpersonen werden mitgezählt.",
      },
      {
        question: "Wie früh sollte man zum Kindergeburtstag einladen?",
        answer:
          "Üblich sind zwei bis drei Wochen vorher. So können die Eltern den Termin und ein Geschenk planen.",
      },
      {
        question: "Wie lange dauert ein Kindergeburtstag?",
        answer:
          "Für jüngere Kinder reichen meist zwei bis drei Stunden, für ältere Kinder auch drei bis vier. Mit GASTZILLA tragen die Eltern Bring- und Abholzeit selbst ein – so ist das Ende für alle klar.",
      },
      {
        question: "Sehen andere Eltern, wer zum Kindergeburtstag kommt?",
        answer:
          "Ja – alle, die den Einladungslink haben, also die eingeladenen Familien. Suchmaschinen finden deine Event-Seite nicht. Teile den Link deshalb nur mit den Eltern, die du einladen möchtest – oder schütze die Seite zusätzlich mit einem Passwort.",
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
        question: "Ab wann machen Kinder Spielverabredungen?",
        answer:
          "Viele Kinder verabreden sich ab dem Kindergartenalter – anfangs oft mit einem Elternteil dabei, später allein.",
      },
      {
        question: "Wie lange sollte eine Spielverabredung dauern?",
        answer:
          "Für kleinere Kinder reichen oft zwei bis drei Stunden. Mit GASTZILLA tragen die Eltern Bring- und Abholzeit selbst ein – so ist für alle klar, wann Schluss ist.",
      },
      {
        question: "Wie erfahre ich von Allergien?",
        answer:
          "Eltern können bei der Zusage eine Nachricht hinterlassen, etwa zu Allergien oder wer das Kind abholt. Die Nachricht steht direkt beim Eintrag in der Liste.",
      },
      {
        question: "Wer sieht, welche Kinder kommen?",
        answer:
          "Alle, die den Link haben. Suchmaschinen finden die Seite nicht. Teile den Link deshalb nur mit den Eltern der eingeladenen Kinder. Mit einem Passwort sieht die Liste außerdem nur, wer das Passwort kennt.",
      },
    ],
    updated: "2026-10-07",
  },
  {
    id: "school-start",
    slug: "einschulung",
    name: "Einschulung & Schulstart",
    title: "Einladung zur Einschulung online erstellen",
    metaTitle: "Einladung zur Einschulung online erstellen – GASTZILLA",
    description:
      "Einschulungsfeier oder Treffen zum neuen Schuljahr: Familie und Freunde sagen per Link ohne Konto zu und tragen ein, was sie mitbringen. Kostenlos & werbefrei.",
    teaser: "Einschulungsfeier oder Treffen zum Schuljahresstart – wer kommt zur Feier nach der Schule?",
    intro: [
      "Der erste Schultag ist ein großer Tag – für das Schulkind und die ganze Familie. Nach der Einschulungsfeier in der Schule geht es oft weiter mit Kaffee und Kuchen zu Hause oder im Restaurant. Wer kommt mit, wer kommt erst zur Feier danach, und wer bringt einen Kuchen mit?",
      "Auch zum neuen Schuljahr treffen sich Klassen, Eltern oder Freundeskreise gern – zum Kennenlernen oder Grillen. Mit GASTZILLA erstellst du in wenigen Minuten eine Einladungsseite und teilst den Link. Alle tragen sich selbst ein – ohne Konto oder App.",
    ],
    benefitsTitle: "Darum passt GASTZILLA zur Einschulung",
    benefits: [
      {
        title: "Schulfeier und Familienfeier im Blick",
        text: "Gäste geben an, wann sie kommen – ob schon zur Feier in der Schule oder erst zu Kaffee und Kuchen danach.",
      },
      {
        title: "Kuchen und Geschenke abstimmen",
        text: "Wer einen Kuchen oder ein Geschenk für die Schultüte mitbringt, trägt es ein. Alle sehen es, und nichts kommt doppelt.",
      },
      {
        title: "Großeltern und Paten dabei",
        text: "Begleitpersonen werden mit Namen eingetragen und mitgezählt. So weißt du, wie viele Plätze du zu Hause oder im Restaurant brauchst.",
      },
      {
        title: "Kennenlernen zum Schuljahresstart",
        text: "Für das Treffen der neuen Klasse teilst du den Link einfach im Klassenchat – alle Familien tragen sich selbst ein.",
      },
    ],
    invitationText: [
      "Liebe Familie, liebe Freunde,",
      "[Name] kommt in die Schule – das wollen wir feiern! 🎒",
      "Wann: [Datum], ab [Uhrzeit] (nach der Einschulungsfeier)",
      "Wo: [Ort]",
      "Bitte sagt bis [Datum] hier zu und schreibt dazu, ob ihr einen Kuchen mitbringt: [Link]",
      "Wir freuen uns auf euch!",
      "[Eure Namen]",
    ],
    faq: [
      {
        question: "Wie feiert man die Einschulung?",
        answer:
          "Meist geht es nach der Feier in der Schule mit Kaffee und Kuchen oder einem Essen weiter – zu Hause oder im Restaurant, mit Familie, Paten und Freunden.",
      },
      {
        question: "Wie viele Personen dürfen zur Einschulung mitkommen?",
        answer:
          "Das legt jede Schule selbst fest – oft sind es wegen begrenzter Plätze nur wenige Begleitpersonen pro Kind. Die Feier danach planst du frei: Mit GASTZILLA tragen sich Großeltern, Paten und Freunde selbst ein.",
      },
      {
        question: "Wann sollte ich zur Einschulungsfeier einladen?",
        answer:
          "Etwa drei bis vier Wochen vorher. Den genauen Termin der Einschulung erfahrt ihr von der Schule.",
      },
      {
        question: "Wer sieht die Zusagen zur Einschulungsfeier?",
        answer:
          "Alle, die den Link haben. Suchmaschinen finden die Seite nicht. Teile den Link deshalb nur mit den eingeladenen Familien – oder schütze die Seite zusätzlich mit einem Passwort.",
      },
    ],
    updated: "2026-10-07",
  },
  {
    id: "school-events",
    slug: "kita-schulfeste",
    name: "Kita- & Schulfeste",
    title: "Kita- und Schulfeste organisieren – Anmeldung per Link",
    metaTitle: "Kita- & Schulfeste organisieren – GASTZILLA",
    description:
      "Abschiedsfeier, Sommerfest, Laternenfest oder Tag der offenen Tür: Familien melden sich per Link ohne Konto an und tragen ein, was sie mitbringen.",
    teaser: "Abschiedsfeier, Sommerfest, Laternenfest oder Tag der offenen Tür – Anmeldungen und Kuchenbuffet über einen Link.",
    intro: [
      "Ob Abschiedsfeier der Vorschulkinder, Abschlussfeier der vierten Klasse, Sommerfest, Laternenfest, Elternabend oder Tag der offenen Tür: Wer in Kita oder Schule ein Fest organisiert, sammelt Anmeldungen, Helfer und Kuchenspenden – meist über Zettel an der Pinnwand und viele Nachrichten.",
      "Mit GASTZILLA erstellt ihr – ob Kita-Team, Lehrkräfte oder Elternbeirat – in wenigen Minuten eine Seite für euer Fest und teilt den Link. Familien tragen sich selbst ein, ganz ohne Konto oder App.",
    ],
    benefitsTitle: "Darum passt GASTZILLA zu Kita- und Schulfesten",
    benefits: [
      {
        title: "Kuchenbuffet ohne Zettelwirtschaft",
        text: "Familien tragen ein, was sie zum Buffet beisteuern – Kuchen, Salat oder Getränke. Alle sehen es, und das Buffet ist gut gemischt.",
      },
      {
        title: "Wissen, wie viele kommen",
        text: "Geschwister, Eltern und Großeltern werden mit eingetragen und mitgezählt. So plant ihr Bänke, Essen und Getränke passend.",
      },
      {
        title: "Ein Link für alle Familien",
        text: "Teilt den Link per WhatsApp, Signal, Telegram oder E-Mail – oder schreibt ihn in den Elternbrief.",
      },
      {
        title: "Zeitfenster im Blick",
        text: "Familien geben an, wann sie kommen – praktisch für den Tag der offenen Tür, damit ihr wisst, wie viele Besucher wann da sind.",
      },
    ],
    invitationText: [
      "Liebe Eltern,",
      "wir laden euch herzlich zu [unserem Sommerfest / unserer Abschiedsfeier / unserem Laternenfest / unserem Tag der offenen Tür] ein! 🏫",
      "Wann: [Datum], [Uhrzeit von] bis [Uhrzeit bis]",
      "Wo: [Kita / Schule, Adresse]",
      "Bitte meldet euch bis [Datum] hier an und tragt ein, ob ihr etwas zum Buffet mitbringt: [Link]",
      "Wir freuen uns auf euch!",
      "[Kita-Team / Elternbeirat]",
    ],
    faq: [
      {
        question: "Was bringt man zum Kita-Sommerfest mit?",
        answer:
          "Meist steuern Familien etwas zum Buffet bei – Kuchen, Muffins, Salate, Obst oder Getränke. Mit GASTZILLA trägt jede Familie ein, was sie mitbringt, und das Buffet ist gut gemischt.",
      },
      {
        question: "Eignet sich das für einen Tag der offenen Tür?",
        answer:
          "Ja. Interessierte Familien melden sich an und geben an, wann sie kommen möchten. So wisst ihr, wie viele Besucher zu welcher Zeit da sind. Bedenkt: Alle mit dem Link sehen die Anmeldungen.",
      },
      {
        question: "Wer kann die Anmeldungen sehen?",
        answer:
          "Alle, die den Link haben – also alle Familien, an die ihr ihn schickt. Suchmaschinen finden die Seite nicht. Mit einem Passwort stellt ihr außerdem sicher, dass nur eingeladene Familien die Liste öffnen. Familien können sich auch nur mit Vornamen oder als „Familie M.“ eintragen.",
      },
      {
        question: "Braucht die Kita oder Schule ein eigenes Konto?",
        answer:
          "Es reicht ein kostenloses Konto für die Person, die das Fest organisiert. Familien brauchen kein Konto und keine App.",
      },
    ],
    updated: "2026-10-07",
  },
  {
    id: "graduation",
    slug: "abifeier",
    name: "Abifeier & Abiball",
    title: "Abifeier, Abiball oder Abigag – gemeinsam planen per Link",
    metaTitle: "Abifeier, Abiball & Abigag planen – GASTZILLA",
    description:
      "Abiball, Abifeier, Abigag oder Abschlussfeier: Mitschüler, Familien und Lehrkräfte sagen per Link ohne Konto zu und tragen ihre Gäste mit ein. Kostenlos.",
    teaser: "Abiball, Abigag oder Abschlussfeier – wer kommt, mit wie vielen Gästen, und wer hilft mit?",
    intro: [
      "Das Abitur ist geschafft – jetzt wird gefeiert! Ob Abiball mit Familien und Lehrkräften, Abigag am letzten Schultag, Abschlussfeier nach der zehnten Klasse oder private Abifeier mit Freunden: Wer organisiert, muss wissen, wer kommt, wie viele Gäste jeder mitbringt und wer beim Aufbau hilft.",
      "Mit GASTZILLA erstellt ihr in wenigen Minuten eine Seite für eure Feier und teilt den Link im Jahrgangschat. Alle tragen sich selbst ein – ohne Konto oder App.",
    ],
    benefitsTitle: "Darum passt GASTZILLA zur Abifeier",
    benefits: [
      {
        title: "Gäste pro Person im Blick",
        text: "Jeder trägt ein, wen er mitbringt – Eltern, Geschwister oder Partner. So wisst ihr, wie viele Plätze ihr beim Abiball braucht.",
      },
      {
        title: "Helfer für Abigag und Aufbau",
        text: "Wer Deko, Musik, Getränke oder den Aufbau übernimmt, trägt es ein. Alle sehen es, und nichts bleibt liegen.",
      },
      {
        title: "Zeitplan für den großen Tag",
        text: "Gäste geben an, wann sie kommen – ob schon zur Zeugnisübergabe oder erst zum Ball am Abend.",
      },
      {
        title: "Ein Link für den ganzen Jahrgang",
        text: "Teilt den Link per WhatsApp, Signal, Telegram oder E-Mail – an Mitschüler, Familien und Lehrkräfte.",
      },
    ],
    invitationText: [
      "Hallo zusammen,",
      "wir haben es geschafft – Zeit für [den Abiball / die Abifeier / den Abigag]! 🎓",
      "Wann: [Datum], ab [Uhrzeit]",
      "Wo: [Ort]",
      "Bitte tragt euch bis [Datum] hier ein und schreibt dazu, wie viele Gäste ihr mitbringt und wobei ihr helft: [Link]",
      "Wir freuen uns auf euch!",
      "[Euer Abikomitee / Dein Name]",
    ],
    faq: [
      {
        question: "Wer wird zum Abiball eingeladen?",
        answer:
          "Meist die Abiturientinnen und Abiturienten mit Familie und Partnern, dazu Lehrkräfte und Schulleitung. Wie viele Gäste jeder mitbringen darf, legt ihr selbst fest – mit GASTZILLA trägt jeder seine Gäste ein.",
      },
      {
        question: "Wie früh sollte man den Abiball planen?",
        answer:
          "Location und Termin werden oft ein Jahr oder länger im Voraus gebucht. Die Zusagen der Gäste sammelt ihr dann meist zwei bis drei Monate vor dem Ball.",
      },
      {
        question: "Kann ich über GASTZILLA Karten für den Abiball verkaufen?",
        answer:
          "Nein. GASTZILLA sammelt nur die Zusagen. Ticketverkauf und Bezahlung organisiert ihr wie gewohnt – aber mit der richtigen Gästezahl.",
      },
      {
        question: "Wer sieht, wer zum Abiball kommt?",
        answer:
          "Alle, die den Link haben – also euer Jahrgang und alle, an die ihr ihn weiterschickt. Suchmaschinen finden die Seite nicht. Wollt ihr die Liste enger halten, schützt sie mit einem Passwort.",
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
        text: "Statt Nachrichten zu zählen, siehst du auf einen Blick, wer kommt. Bei jeder Zu- oder Absage bekommst du eine E-Mail.",
      },
      {
        title: "Partner und Freunde mitbringen",
        text: "Gäste tragen Partner, Freunde oder Kinder direkt mit Namen ein. So weißt du, für wie viele Leute du Essen und Getränke einplanen musst.",
      },
      {
        title: "Glückwünsche und Absprachen",
        text: "Zu jeder Zusage kann eine Nachricht gehören – für Glückwünsche oder den Hinweis, dass jemand später kommt.",
      },
      {
        title: "Buffet gemeinsam füllen",
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
        question: "Wie früh lädt man zum Geburtstag ein?",
        answer:
          "Für eine kleine Feier reichen meist zwei bis drei Wochen. Für einen runden Geburtstag mit vielen Gästen sind vier bis sechs Wochen üblich.",
      },
      {
        question: "Kann man per WhatsApp zum Geburtstag einladen?",
        answer:
          "Ja, das ist heute ganz normal. Mit GASTZILLA schickst du per WhatsApp einen Link zu deiner Einladungsseite – dort stehen alle Infos, und die Zusagen landen gesammelt in einer Liste statt verstreut im Chat.",
      },
      {
        question: "Kann ich eine Überraschungsparty planen?",
        answer:
          "Ja – schick den Link nur an die Gäste, nicht an das Geburtstagskind. Alle mit dem Link sehen die Gästeliste, Suchmaschinen finden die Seite nicht. Schütze die Seite zusätzlich mit einem Passwort – dann bleibt die Überraschung auch dann geheim, wenn der Link doch beim Geburtstagskind landet.",
      },
      {
        question: "Wie bekomme ich die Zusagen bis zu einem Stichtag?",
        answer:
          "Nenne den Stichtag im Einladungstext, zum Beispiel „Bitte sagt bis zum 1. Mai zu“. Bei jeder Zu- oder Absage bekommst du eine E-Mail, und in der Liste siehst du, wer schon dabei ist – und wer nicht kann.",
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
        text: "Bei jeder Zu- oder Absage bekommst du eine E-Mail. Ändert jemand seinen Eintrag, siehst du das sofort – ohne Excel-Tabelle und Nachzählen.",
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
        question: "Wie lange vor der Hochzeit verschickt man die Einladungen?",
        answer:
          "Üblich ist ein „Save the Date“ sechs bis zwölf Monate vorher und die eigentliche Einladung drei bis vier Monate vor der Hochzeit. Mit GASTZILLA legst du die Seite früh an und ergänzt Details später – bereits verschickte Links funktionieren weiter.",
      },
      {
        question: "Wie viele Hochzeitsgäste sagen ab?",
        answer:
          "Häufig wird mit etwa zehn bis zwanzig Prozent Absagen gerechnet – je nach Anreise und Jahreszeit. Mit GASTZILLA sagen Gäste über den Link zu oder ab – du siehst jederzeit, wer kommt und wer nicht, und kannst bei den anderen gezielt nachfragen.",
      },
      {
        question: "Können Gäste ihre Begleitung angeben?",
        answer:
          "Ja. Partner, Kinder oder weitere Begleitpersonen werden bei der Zusage mit Namen eingetragen und mitgezählt – praktisch für Sitzplan und Tischkarten.",
      },
      {
        question: "Wer sieht unsere Gästeliste?",
        answer:
          "Alle, die den Einladungslink haben. Suchmaschinen finden eure Event-Seite nicht. Teile den Link deshalb nur mit den Gästen, die du einladen möchtest – oder schütze die Seite zusätzlich mit einem Passwort.",
      },
    ],
    updated: "2026-10-06",
  },
  {
    id: "bachelor-party",
    slug: "junggesellenabschied",
    name: "Junggesellenabschied",
    title: "Junggesellenabschied planen – Einladung per Link",
    metaTitle: "Junggesellenabschied planen – Einladung per Link – GASTZILLA",
    description:
      "Junggesellen- oder Junggesellinnenabschied planen: Freunde sagen per Link ohne Konto zu – für den JGA-Abend oder das ganze Wochenende. Kostenlos & werbefrei.",
    teaser: "JGA-Abend oder -Wochenende – wer ist dabei, wer kümmert sich um Shirts, Spiele und Bollerwagen?",
    intro: [
      "Ob Junggesellen- oder Junggesellinnenabschied, ob ein Abend in der Stadt oder ein ganzes Wochenende in Hamburg, Prag oder am See: Für einen gelungenen JGA müssen Trauzeugen und Freunde viel abstimmen. Wer ist dabei, wer kommt erst später dazu, und wer besorgt Shirts, Spiele oder den Bollerwagen?",
      "Mit GASTZILLA erstellst du in wenigen Minuten eine Seite für den JGA und teilst den Link in der Runde. Alle tragen sich selbst ein – ohne Konto oder App – und du hast den Überblick.",
    ],
    benefitsTitle: "Darum passt GASTZILLA zum Junggesellenabschied",
    benefits: [
      {
        title: "Wie groß wird die Runde?",
        text: "Die Liste zeigt allen mit dem Link, wer zugesagt hat. So weißt du früh, für wie viele Leute du Unterkunft, Tisch oder Programm buchen musst.",
      },
      {
        title: "Aufgaben verteilen",
        text: "Shirts, Spiele, Deko oder Getränke – jeder trägt ein, was er übernimmt. Alle sehen es, und nichts bleibt liegen.",
      },
      {
        title: "Für den Abend oder das ganze Wochenende",
        text: "Für ein JGA-Wochenende gibst du einen Zeitraum an. Gäste schreiben dazu, wann sie kommen und auf Wunsch, bis wann sie bleiben.",
      },
      {
        title: "Termin gemeinsam finden",
        text: "Bei vielen Kalendern ist der Termin das Schwierigste. Schlag bis zu vier Wochenenden vor, alle stimmen per Link ab – der Favorit wird mit einem Klick festgelegt.",
      },
    ],
    invitationText: [
      "Hallo zusammen,",
      "[Name] heiratet – Zeit für den Junggesellenabschied! 🥂",
      "Wann: [Datum / Zeitraum] ab [Uhrzeit]",
      "Wo / Treffpunkt: [Ort]",
      "Tragt euch bitte bis [Datum] hier ein und schreibt dazu, was ihr übernehmt: [Link]",
      "Psst – nichts verraten!",
      "[Dein Name]",
    ],
    faq: [
      {
        question: "Wie lange vor der Hochzeit findet der JGA statt?",
        answer:
          "Meist einige Wochen vor der Hochzeit. Für ein ganzes Wochenende lohnt es sich, zwei bis drei Monate vorher einzuladen, damit Unterkunft und Programm gebucht werden können.",
      },
      {
        question: "Wie viele Leute lädt man zum JGA ein?",
        answer:
          "Das hängt vom Programm ab – oft sind es enge Freundinnen und Freunde und Geschwister, meist zwischen einer Handvoll und rund fünfzehn Personen. Mit GASTZILLA siehst du früh, wie groß die Runde wird.",
      },
      {
        question: "Kann die Braut oder der Bräutigam die Planung sehen?",
        answer:
          "Nur mit dem Link: Alle, die ihn haben, sehen die Liste. Schick ihn deshalb nur an die Runde, die mitfeiert – Suchmaschinen finden die Seite nicht. Mit einem Passwort bleibt die Planung auch dann geheim, wenn der Link weitergeleitet wird.",
      },
      {
        question: "Kann ich über GASTZILLA Kosten aufteilen?",
        answer:
          "Nein. GASTZILLA sammelt die Zusagen und wer was übernimmt. Die Kosten teilt ihr wie gewohnt untereinander – du weißt dann aber genau, durch wie viele.",
      },
    ],
    updated: "2026-10-09",
  },
  {
    id: "baby-shower",
    slug: "babyparty",
    name: "Babyparty & Gender Reveal",
    title: "Babyparty oder Gender Reveal Party – Einladung online erstellen",
    metaTitle: "Babyparty & Gender Reveal planen – GASTZILLA",
    description:
      "Babyparty, Baby Shower oder Gender Reveal: Gäste sagen per Link ohne Konto zu, stimmen Geschenke ab und geben ihren Tipp ab. Kostenlos & werbefrei.",
    teaser: "Baby Shower oder Gender Reveal – Zusagen, Geschenke abstimmen und Tipps sammeln über einen Link.",
    intro: [
      "Ob Babyparty für die werdenden Eltern oder Gender Reveal Party, bei der endlich verraten wird, ob es ein Junge oder ein Mädchen wird: Wer einlädt, will wissen, wer kommt – und dass nicht fünf Gäste denselben Strampler schenken.",
      "Mit GASTZILLA erstellst du in wenigen Minuten eine Einladungsseite und teilst den Link. Freunde und Familie tragen sich selbst ein – ganz ohne Konto oder App.",
    ],
    benefitsTitle: "Darum passt GASTZILLA zur Babyparty",
    benefits: [
      {
        title: "Geschenke ohne Doppelungen",
        text: "Wer etwas mitbringt – ob Geschenk, Kuchen oder Deko –, trägt es ein. Alle sehen es, und nichts wird doppelt geschenkt.",
      },
      {
        title: "Junge oder Mädchen? Tipps sammeln",
        text: "Bei der Gender Reveal Party geben Gäste ihren Tipp einfach als Nachricht zu ihrer Zusage ab – aufgelöst wird bei der Feier.",
      },
      {
        title: "Partner und Kinder mitzählen",
        text: "Partner und Kinder werden direkt mit Namen eingetragen und mitgezählt. So weißt du, wie viele Gäste kommen.",
      },
    ],
    invitationText: [
      "Hallo ihr Lieben,",
      "[wir bekommen ein Baby / Name bekommt ein Baby] – das wollen wir mit euch feiern! 🍼",
      "Wann: [Datum] ab [Uhrzeit]",
      "Wo: [Ort]",
      "Sagt bitte hier zu und schreibt dazu, was ihr mitbringt – zur Gender Reveal Party gern auch euren Tipp: Junge oder Mädchen? [Link]",
      "Wir freuen uns auf euch!",
      "[Dein Name]",
    ],
    faq: [
      {
        question: "In welcher Schwangerschaftswoche feiert man die Babyparty?",
        answer:
          "Meist im letzten Drittel der Schwangerschaft, einige Wochen vor dem Geburtstermin. Eine Gender Reveal Party wird häufig gefeiert, sobald das Geschlecht bekannt ist.",
      },
      {
        question: "Was bringt man zur Babyparty mit?",
        answer:
          "Oft kleine Geschenke für das Baby oder die Eltern und etwas fürs Buffet. Mit GASTZILLA trägt jeder ein, was er mitbringt – so wird nichts doppelt geschenkt.",
      },
      {
        question: "Wie sammle ich die Tipps für die Gender Reveal Party?",
        answer:
          "Gäste schreiben ihren Tipp – Junge oder Mädchen – einfach als Nachricht zu ihrer Zusage. Die Nachrichten stehen direkt bei den Einträgen in der Liste.",
      },
      {
        question: "Können die werdenden Eltern die Planung sehen?",
        answer:
          "Alle, die den Einladungslink haben, sehen die Liste. Suchmaschinen finden deine Event-Seite nicht. Planst du eine Überraschung für die werdenden Eltern, schick ihnen den Link also nicht – und schütze die Seite am besten zusätzlich mit einem Passwort.",
      },
    ],
    updated: "2026-10-07",
  },
  {
    id: "christening",
    slug: "taufe-kommunion",
    name: "Taufe & Kommunion",
    title: "Taufe, Kommunion oder Konfirmation – Einladung online erstellen",
    metaTitle: "Taufe, Kommunion & Konfirmation planen – GASTZILLA",
    description:
      "Taufe, Kommunion, Konfirmation, Firmung oder Jugendweihe: Familie und Paten sagen per Link ohne Konto zu und tragen Begleitung mit ein. Kostenlos & werbefrei.",
    teaser: "Taufe, Kommunion, Konfirmation oder Jugendweihe – wer kommt zum Gottesdienst, wer zur Feier?",
    intro: [
      "Ob Taufe, Erstkommunion, Konfirmation, Firmung, Jugendweihe oder Bar und Bat Mizwa: Zu diesen Festen kommt die ganze Familie zusammen – oft mit Paten, Großeltern und Freunden von weit her. Wer kommt schon zum Gottesdienst, wer erst zur Feier danach, und für wie viele Personen muss der Tisch im Restaurant reserviert werden?",
      "Mit GASTZILLA erstellst du in wenigen Minuten eine Einladungsseite und teilst den Link. Alle tragen sich selbst ein – ganz ohne Konto oder App – und du hast die Zusagen in einer Liste.",
    ],
    benefitsTitle: "Darum passt GASTZILLA zu Taufe und Kommunion",
    benefits: [
      {
        title: "Gottesdienst und Feier im Blick",
        text: "Gäste geben an, wann sie kommen – ob schon zum Gottesdienst oder erst zur Feier danach. So weißt du, wer wann da ist.",
      },
      {
        title: "Richtig reservieren",
        text: "Partner und Kinder werden mit Namen eingetragen und mitgezählt. So weißt du, für wie viele Personen du im Restaurant oder beim Caterer planen musst.",
      },
      {
        title: "Geschenke und Kuchen abstimmen",
        text: "Wer ein Geschenk oder einen Kuchen mitbringt, trägt es ein. Alle sehen es, und nichts wird doppelt geschenkt.",
      },
      {
        title: "Einfach für alle Generationen",
        text: "Ein Link per WhatsApp, Signal, Telegram oder E-Mail genügt – auch Großeltern und Paten brauchen keine App und kein Konto.",
      },
    ],
    invitationText: [
      "Liebe Familie, liebe Freunde,",
      "wir feiern [die Taufe / die Erstkommunion / die Konfirmation] von [Name] und laden euch herzlich ein! 🕊️",
      "Gottesdienst: [Datum], [Uhrzeit], [Kirche]",
      "Feier danach: ab [Uhrzeit], [Ort]",
      "Bitte sagt bis [Datum] hier zu und tragt ein, wer mitkommt: [Link]",
      "Wir freuen uns auf euch!",
      "[Eure Namen]",
    ],
    faq: [
      {
        question: "Wie feiert man eine Taufe?",
        answer:
          "Meist folgt auf den Gottesdienst ein Essen oder Kaffee und Kuchen mit Familie, Paten und Freunden – zu Hause, im Gemeindehaus oder im Restaurant.",
      },
      {
        question: "Wie früh lädt man zur Taufe oder Kommunion ein?",
        answer:
          "Üblich sind etwa vier bis sechs Wochen vorher, damit Paten und Verwandte von weiter weg planen können.",
      },
      {
        question: "Können Gäste angeben, ob sie zum Gottesdienst kommen?",
        answer:
          "Ja. Gäste geben ihre Ankunftszeit an – so siehst du, wer schon zum Gottesdienst kommt und wer erst zur Feier danach.",
      },
      {
        question: "Passt GASTZILLA auch für Jugendweihe oder Bar Mizwa?",
        answer:
          "Ja. GASTZILLA ist für jedes Fest gedacht. Titel, Begrüßungstext und Design wählst du selbst.",
      },
    ],
    updated: "2026-10-07",
  },
  {
    id: "funeral",
    slug: "trauerfeier",
    name: "Trauerfeier & Beerdigung",
    title: "Trauerfeier, Beerdigung oder Gedenkfeier – Einladung online erstellen",
    metaTitle: "Einladung zur Trauerfeier & Beerdigung online – GASTZILLA",
    description:
      "Trauerfeier, Beerdigung, Urnenbeisetzung oder Trauerkaffee: Angehörige und Freunde geben per Link Bescheid, ob sie kommen – auf Wunsch mit Passwort geschützt.",
    teaser: "Trauerfeier, Beisetzung oder Trauerkaffee – in Ruhe wissen, wer kommt.",
    intro: [
      "Wenn ein geliebter Mensch stirbt, bleibt wenig Zeit und viel zu organisieren: Trauerfeier, Beerdigung oder Urnenbeisetzung, danach oft ein Trauerkaffee oder Leichenschmaus. Dafür müsst ihr wissen, wer kommt – und viele Telefonate und Nachrichten sind in dieser Zeit eine zusätzliche Last.",
      "Mit GASTZILLA erstellst du eine schlichte Seite mit Ort und Zeit und teilst den Link mit Familie, Freunden und Bekannten. Sie geben selbst Bescheid, ob sie kommen – ohne Konto oder App. Auf Wunsch schützt du die Seite mit einem Passwort.",
    ],
    benefitsTitle: "So hilft GASTZILLA bei Trauerfeier und Beerdigung",
    benefits: [
      {
        title: "Wissen, wer zum Trauerkaffee kommt",
        text: "Angehörige und Freunde geben selbst Bescheid und tragen Begleitpersonen mit ein. So weißt du, für wie viele Personen du im Café oder Restaurant reservieren musst.",
      },
      {
        title: "Trauerfeier, Beisetzung und Kaffee im Blick",
        text: "Gäste geben an, wann sie kommen – ob schon zur Trauerfeier oder erst zur Beisetzung oder zum Kaffee danach.",
      },
      {
        title: "Rückmeldung ohne Telefonate",
        text: "Wer kommen kann, sagt zu; wer verhindert ist, sagt ab und kann ein paar Worte hinterlassen. Du musst niemandem hinterhertelefonieren.",
      },
      {
        title: "Geschützt und ohne Werbung",
        text: "Die Seite erscheint nicht in Suchmaschinen und lässt sich mit einem Passwort schützen. GASTZILLA zeigt keine Werbung.",
      },
    ],
    invitationText: [
      "Liebe Angehörige, Freunde und Bekannte,",
      "in stiller Trauer nehmen wir Abschied von [Name].",
      "Die Trauerfeier findet am [Datum] um [Uhrzeit] in [Ort] statt. Anschließend [Beisetzung / Trauerkaffee in Ort].",
      "Bitte geben Sie uns über diesen Link Bescheid, ob Sie kommen: [Link]",
      "[Ihre Namen]",
    ],
    faq: [
      {
        question: "Kann man per WhatsApp zur Trauerfeier einladen?",
        answer:
          "Ja, das ist heute üblich – gerade wenn wenig Zeit bleibt. Mit GASTZILLA verschickst du einen Link per WhatsApp, E-Mail oder Nachricht; dort stehen Ort und Zeit, und die Rückmeldungen kommen gesammelt an. Angehörige ohne Smartphone erreichst du natürlich weiterhin am besten persönlich.",
      },
      {
        question: "Wen lädt man zur Beerdigung und zum Trauerkaffee ein?",
        answer:
          "Zur Trauerfeier kann meist jeder kommen, der sich verabschieden möchte – Ort und Zeit stehen oft in der Traueranzeige. Zum anschließenden Trauerkaffee oder Leichenschmaus laden viele Familien gezielt ein, etwa Familie, enge Freunde und Wegbegleiter. Den Link für die Rückmeldung schickst du dann nur an diese Gäste.",
      },
      {
        question: "Wie lange vor der Trauerfeier sollte man da sein?",
        answer:
          "Üblich ist es, etwa eine Viertelstunde vor Beginn da zu sein, um in Ruhe anzukommen und einen Platz zu finden.",
      },
      {
        question: "Wer kann die Seite sehen?",
        answer:
          "Nur wer den Link hat – und wenn du ein Passwort setzt, nur wer auch das Passwort kennt. Suchmaschinen finden die Seite nicht. Für einen ruhigen Rahmen eignen sich schlichte Designs wie „Weiß“ oder „Schwarz“.",
      },
    ],
    updated: "2026-10-09",
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
        title: "Buffet und Teamfrühstück abstimmen",
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
        question: "Was kann man als Firmenfeier machen?",
        answer:
          "Beliebt sind ein Sommerfest mit Grill, die Weihnachtsfeier im Restaurant, ein Teamevent wie Escape Room, Bowling oder Kochkurs oder ein gemeinsamer Ausflug.",
      },
      {
        question: "Wie früh sollte man zur Weihnachtsfeier einladen?",
        answer:
          "Für Weihnachtsfeiern sind sechs bis acht Wochen üblich, weil Termine im Dezember schnell belegt sind. Für Sommerfest oder Teamevent reichen meist drei bis vier Wochen. Steht der Abend noch nicht fest, schlägst du bis zu vier Termine vor und lässt das Team per Link abstimmen.",
      },
      {
        question: "Müssen sich die Kollegen registrieren?",
        answer:
          "Nein. Sie öffnen den Einladungslink im Browser und tragen sich ein. Nur du als Organisator brauchst ein kostenloses Konto.",
      },
      {
        question: "Ist GASTZILLA für Firmen geeignet?",
        answer:
          "GASTZILLA ist werbefrei, setzt keine Tracking-Cookies ein und speichert die Daten auf Servern in der EU. Teilnehmende tragen nur ihren Namen ein – ein Konto brauchen sie nicht.",
      },
    ],
    updated: "2026-10-09",
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
        question: "Was bringt man zur Grillparty mit?",
        answer:
          "Typisch sind Salate, Brot, Dips, Nachtisch oder Getränke – oft bringt auch jeder sein eigenes Grillgut mit. Mit GASTZILLA schreibt jeder dazu, was er mitbringt; weil alle die Liste sehen, ergänzt sich das Buffet von selbst.",
      },
      {
        question: "Was mache ich, wenn es regnet?",
        answer:
          "Ändere Ort oder Uhrzeit einfach auf deiner Event-Seite – wer den Link öffnet, sieht sofort die aktuellen Angaben. Schick am besten kurz einen Hinweis in die Gruppe.",
      },
      {
        question: "Können Gäste ihren Eintrag später ändern?",
        answer:
          "Ja. Wenn sich etwas ändert – andere Uhrzeit, ein Gast mehr, ein anderes Mitbringsel oder doch eine Absage –, passen sie ihren Eintrag einfach an. Du bekommst dazu eine E-Mail.",
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
        title: "Wer kommt als was?",
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
        question: "Kann ich ein ganzes Karnevalswochenende planen?",
        answer:
          "Ja. Gib als Datum einen Zeitraum an, zum Beispiel von Weiberfastnacht bis Rosenmontag. Gäste tragen ein, wann sie dazukommen.",
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
        question: "Ab wann kann man Wiesn-Tische reservieren?",
        answer:
          "Das legt jedes Festzelt selbst fest – bei den großen Zelten oft schon viele Monate vorher. Sammle die Zusagen also früh, dann weißt du rechtzeitig, für wie viele Plätze du anfragen musst.",
      },
      {
        question: "Wie viele Leute passen an einen Wiesn-Tisch?",
        answer:
          "An einen Tisch im Festzelt passen meist rund zehn Personen. Mit der Zusagenliste weißt du, wie viele Tische du anfragen musst.",
      },
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
        title: "Kostüme abstimmen",
        text: "Gäste können zu ihrer Zusage eine Nachricht schreiben – zum Beispiel, als was sie kommen. So gibt es keine drei Draculas.",
      },
      {
        title: "Grusel-Buffet abstimmen",
        text: "Wer Kürbissuppe, Monster-Muffins oder Getränke mitbringt, trägt es ein. Alle sehen, was schon da ist.",
      },
      {
        title: "Ein Link für die ganze Clique",
        text: "Teile die Einladung per WhatsApp, Signal, Telegram oder E-Mail. Bei jeder Zu- oder Absage bekommst du eine E-Mail.",
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
        question: "Wie früh sollte ich zur Halloweenparty einladen?",
        answer:
          "Etwa zwei bis drei Wochen vorher – Ende Oktober sind viele Wochenenden schnell verplant, und alle brauchen Zeit für ihr Kostüm.",
      },
      {
        question: "Kann ich auch eine Halloweenparty für Kinder planen?",
        answer:
          "Ja. Eltern tragen ihr Kind ein und geben an, wann sie es bringen und wieder abholen – praktisch, wenn die Kinder danach noch um die Häuser ziehen.",
      },
      {
        question: "Gibt es ein Halloween-Design?",
        answer:
          "Ein eigenes Halloween-Design gibt es nicht, aber mit den Farbdesigns „Schwarz“ oder „Orange“ bekommt deine Einladung schnell eine passende Stimmung.",
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
        question: "Kann ich auch einen Besuch auf dem Weihnachtsmarkt planen?",
        answer:
          "Ja. Nenne Treffpunkt und Uhrzeit, zum Beispiel am Eingang oder an der Glühweinbude. Wer später nachkommt, schreibt es einfach bei der Zusage dazu.",
      },
      {
        question: "Eignet sich das für eine Adventsfeier im Verein oder in der Nachbarschaft?",
        answer:
          "Ja. Ein Link genügt für alle – Nachbarn, Vereinsmitglieder oder Freunde tragen sich selbst ein, ohne Konto oder App.",
      },
      {
        question: "Wie früh sollte ich zur Adventsfeier einladen?",
        answer:
          "Etwa drei bis vier Wochen vorher – in der Adventszeit sind die Wochenenden schnell voll.",
      },
    ],
    updated: "2026-10-07",
  },
  {
    id: "family-celebration",
    slug: "familienfest",
    name: "Familienfest & Feiertage",
    title: "Familienfest oder Feiertag – Einladung online erstellen",
    metaTitle: "Familienfest & Feiertage gemeinsam planen – GASTZILLA",
    description:
      "Weihnachten, Ostern, Iftar, Zuckerfest, Chanukka oder Thanksgiving: Familie und Freunde sagen per Link ohne Konto zu und tragen ein, was sie mitbringen.",
    teaser: "Weihnachten, Ostern, Iftar, Chanukka, Thanksgiving & Co. – wer kommt und wer bringt welches Gericht mit?",
    intro: [
      "Ob Weihnachten oder Ostern, Iftar im Ramadan oder das Zuckerfest, Chanukka oder Pessach, Diwali, Nouruz oder Thanksgiving: Wenn die ganze Familie zusammenkommt, gibt es viel abzustimmen. Wer kommt an welchem Tag, wer bringt welches Gericht mit, und wie viele Plätze braucht ihr am Tisch? Bis alles geklärt ist, sind Familienchat und Telefon heiß gelaufen.",
      "Mit GASTZILLA erstellst du eine Einladungsseite für euer Familienfest und teilst den Link. Alle tragen sich selbst ein – ganz ohne Konto oder App, ob Großeltern, Cousinen oder Freunde der Familie.",
    ],
    benefitsTitle: "Darum passt GASTZILLA zum Familienfest",
    benefits: [
      {
        title: "Wer bringt welches Gericht mit?",
        text: "Jeder trägt ein, was er beisteuert – Vorspeise, Hauptgang, Nachtisch oder Getränke. Alle sehen es, und am Ende fehlt nichts und nichts ist doppelt.",
      },
      {
        title: "Pünktlich zum Essen – oder über mehrere Tage",
        text: "Gäste geben an, wann sie kommen und auf Wunsch, bis wann sie bleiben – etwa pünktlich zum Fastenbrechen. Feiert ihr über mehrere Tage, gibst du einfach einen Zeitraum an.",
      },
      {
        title: "Die ganze Familie im Blick",
        text: "Partner und Kinder werden mit Namen eingetragen und mitgezählt. So weißt du, wie viele Plätze am Tisch du brauchst.",
      },
      {
        title: "Wünsche und Hinweise",
        text: "Gäste können eine Nachricht hinterlassen – zum Beispiel zu Allergien, vegetarischem Essen oder Speisevorschriften.",
      },
    ],
    invitationText: [
      "Liebe Familie, liebe Freunde,",
      "wir feiern [Weihnachten / Ostern / Iftar / das Zuckerfest / Chanukka / Thanksgiving] zusammen! 🍽️",
      "Wann: [Datum / Zeitraum] ab [Uhrzeit]",
      "Wo: [Ort]",
      "Damit wir gut planen können, tragt euch bitte hier ein und schreibt dazu, wer was mitbringt: [Link]",
      "Wir freuen uns auf euch!",
      "[Dein Name]",
    ],
    faq: [
      {
        question: "Passt GASTZILLA auch für religiöse Feste?",
        answer:
          "Ja. GASTZILLA ist für jedes Fest gedacht – ob Weihnachten, Ostern, Ramadan, Chanukka, Diwali oder Thanksgiving. Titel, Begrüßungstext und Design wählst du selbst.",
      },
      {
        question: "Wie stimmen wir ab, wer welches Gericht mitbringt?",
        answer:
          "Jeder trägt bei der Zusage ein, was er beisteuert. Alle sehen die Liste – so ergänzt sich das Festessen, und nichts kommt doppelt.",
      },
      {
        question: "Können Gäste auf Speisevorschriften hinweisen?",
        answer:
          "Ja. Allergien, vegetarisches Essen oder Speisevorschriften schreiben Gäste einfach als Nachricht zu ihrer Zusage.",
      },
      {
        question: "Wie finden wir einen Termin, an dem die ganze Familie kann?",
        answer:
          "Lass die Familie abstimmen: Du schlägst zwei bis vier Termine vor, jeder hakt per Link an, was passt. Den Termin mit den meisten Stimmen legst du fest – alle, die abgestimmt haben, stehen danach direkt in der Gästeliste.",
      },
    ],
    updated: "2026-10-09",
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
        question: "Wie früh sollte ich zu Silvester einladen?",
        answer:
          "Am besten drei bis vier Wochen vorher, denn viele planen Silvester früh. Kurzfristig geht es aber auch – die Seite steht in wenigen Minuten.",
      },
      {
        question: "Was bringt man zur Silvesterparty mit?",
        answer:
          "Typisch sind Sekt oder andere Getränke, Knabbereien, Salate oder Zutaten für Raclette oder Fondue. Mit GASTZILLA trägt jeder ein, was er mitbringt – alle sehen es, und nichts fehlt.",
      },
      {
        question: "Was kann man an Silvester zu Hause machen?",
        answer:
          "Beliebt sind Raclette oder Fondue, ein Spieleabend, eine Mottoparty oder ein gemeinsames Anstoßen um Mitternacht mit Blick aufs Feuerwerk.",
      },
      {
        question: "Können Gäste angeben, ob sie übernachten?",
        answer:
          "Gäste geben an, bis wann sie bleiben, und können eine Nachricht hinterlassen – etwa, ob sie einen Schlafplatz brauchen.",
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
        question: "Welche Mottopartys gibt es?",
        answer:
          "Beliebt sind zum Beispiel 80er, 90er, Bad Taste, Hawaii, Casino oder Hollywood. Wichtig ist ein Motto, zu dem jeder leicht ein Outfit findet.",
      },
      {
        question: "Wie früh sollte ich zur Mottoparty einladen?",
        answer:
          "Etwa drei bis vier Wochen vorher, damit alle Zeit haben, ein passendes Kostüm zu besorgen.",
      },
      {
        question: "Gibt es Designs passend zu meinem Motto?",
        answer:
          "Eigene Motto-Designs gibt es nicht, aber du kannst aus mehreren Farbdesigns wählen und Titel und Begrüßungstext frei auf dein Motto zuschneiden.",
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
          "Alle, die den Link haben. Suchmaschinen finden die Seite nicht. Teile den Link deshalb nur mit der Gruppe, die mitfahren soll – oder schütze die Seite zusätzlich mit einem Passwort.",
      },
      {
        question: "Wie legen wir den Reisetermin gemeinsam fest?",
        answer:
          "Schlage zwei bis vier mögliche Termine vor und lass die Gruppe per Link abstimmen. So siehst du, wann die meisten mitfahren können – und buchst Bus und Unterkunft für den beliebtesten Termin.",
      },
    ],
    updated: "2026-10-09",
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
        title: "Treffpunkt vor der Vorstellung",
        text: "Ort, Datum und Uhrzeit stehen auf der Seite, dazu deine Kontaktdaten. Gäste geben an, wann sie zum Treffpunkt kommen – mit etwas Puffer vor Beginn.",
      },
      {
        title: "Wer hat schon eine Karte?",
        text: "Gäste schreiben dazu, ob sie schon eine Karte haben, eine Ermäßigung nutzen oder nach der Vorstellung noch mitkommen.",
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
        question: "Lohnt sich eine Gruppenkarte?",
        answer:
          "Viele Theater, Museen und Kinos bieten Gruppenpreise ab einer bestimmten Personenzahl. Mit der Zusagenliste weißt du rechtzeitig, ob ihr die Gruppengröße erreicht.",
      },
      {
        question: "Kann ich auch eine Führung für die Gruppe planen?",
        answer:
          "Ja. Sammle die Zusagen mit GASTZILLA und buche die Führung anschließend mit der passenden Teilnehmerzahl beim Museum oder Theater.",
      },
      {
        question: "Kann ich über GASTZILLA Tickets kaufen?",
        answer:
          "Nein. GASTZILLA ist kein Ticketshop – du sammelst nur die Zusagen. Die Karten besorgst du wie gewohnt beim Kino, Theater oder Veranstalter.",
      },
      {
        question: "Wie finden wir einen Termin für den Theater- oder Kinobesuch?",
        answer:
          "Trag die möglichen Vorstellungen als Terminvorschläge ein, zum Beispiel zwei Abende mit Uhrzeit. Alle stimmen per Link ab, und du kaufst die Karten für den Termin, an dem die meisten können.",
      },
    ],
    updated: "2026-10-09",
  },
  {
    id: "rehearsal",
    slug: "probe",
    name: "Proben & Auftritte",
    title: "Bandprobe, Chorprobe oder Auftritt – Zusagen per Link sammeln",
    metaTitle: "Bandprobe, Chorprobe & Auftritt planen – GASTZILLA",
    description:
      "Bandprobe, Orchester- oder Chorprobe, Probenwochenende oder Auftritt: Musiker sagen per Link ohne Konto zu – und du siehst, wer dabei ist. Kostenlos.",
    teaser: "Band-, Orchester- oder Chorprobe, Probenwochenende oder Auftritt – wer ist dabei, wer bringt was mit?",
    intro: [
      "Ob Bandprobe im Proberaum, Orchester- oder Chorprobe, Probenwochenende oder Auftritt beim Stadtfest: Damit sich der Termin lohnt, müssen die richtigen Leute da sein. Fehlt der Bass, die zweite Geige oder der halbe Sopran? Im Gruppenchat erfährt man das oft erst kurz vorher.",
      "Mit GASTZILLA legst du in wenigen Minuten eine Seite für den Termin an und teilst den Link. Alle tragen sich selbst ein – ohne Konto oder App – und jeder sieht, wer kommt.",
    ],
    benefitsTitle: "Darum passt GASTZILLA zu Proben und Auftritten",
    benefits: [
      {
        title: "Sind alle Stimmen besetzt?",
        text: "Musiker schreiben zu ihrer Zusage, welches Instrument oder welche Stimme sie übernehmen. So siehst du vorher, ob die Besetzung steht.",
      },
      {
        title: "Equipment und Noten abstimmen",
        text: "Verstärker, Notenständer, Kabel, Noten oder Getränke – jeder trägt ein, was er mitbringt. Dann fehlt beim Aufbau nichts.",
      },
      {
        title: "Probenwochenende planen",
        text: "Für ein Probenwochenende gibst du einen Zeitraum an. Alle schreiben dazu, wann sie anreisen und auf Wunsch, bis wann sie bleiben.",
      },
    ],
    invitationText: [
      "Hallo zusammen,",
      "nächste [Bandprobe / Orchesterprobe / Chorprobe] am [Datum] um [Uhrzeit]! 🎵",
      "Wo: [Proberaum / Ort]",
      "Tragt euch bitte hier ein und schreibt dazu, mit welchem Instrument oder welcher Stimme ihr dabei seid: [Link]",
      "Bis dann!",
      "[Dein Name]",
    ],
    faq: [
      {
        question: "Kann ich regelmäßige Proben anlegen?",
        answer:
          "Jeder Termin ist bei GASTZILLA ein eigenes Event. Ein Event mit allen Grundfunktionen ist kostenlos, weitere Events kannst du bald dazukaufen. Für ein Probenwochenende reicht ein Event mit Zeitraum.",
      },
      {
        question: "Wie sehe ich, wer welches Instrument spielt?",
        answer:
          "Bitte die Musiker, bei der Zusage Instrument oder Stimme als Nachricht anzugeben. Die Nachricht steht in der Liste direkt beim jeweiligen Eintrag.",
      },
      {
        question: "Eignet sich das auch für einen Auftritt mit Helfern?",
        answer:
          "Ja. Für Konzert oder Vereinsfest tragen sich Musiker und Helfer ein und schreiben dazu, wann sie kommen und was sie mitbringen.",
      },
      {
        question: "Wie finden wir einen Probentermin, der allen passt?",
        answer:
          "Schlage bis zu vier Probentermine vor. Alle haken an, was passt – fehlt jemand Wichtiges, siehst du es sofort und legst den Termin fest, an dem die Besetzung steht.",
      },
    ],
    updated: "2026-10-09",
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
        title: "Essenswünsche vorab",
        text: "Gäste können eine Nachricht hinterlassen – etwa, ob sie vegetarisch essen, eine Allergie haben oder erst nach dem Essen dazukommen.",
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
        question: "Wie viele Personen braucht man für einen Escape Room?",
        answer:
          "Die meisten Escape Rooms sind für etwa zwei bis sechs Personen ausgelegt – die genaue Gruppengröße nennt der Anbieter. Mit der Zusagenliste siehst du, ob ihr ein oder zwei Teams braucht.",
      },
      {
        question: "Wie früh sollte ich für eine größere Gruppe reservieren?",
        answer:
          "Für Restaurants und Bars am Wochenende lohnt sich eine Reservierung meist ein bis zwei Wochen vorher – sammle die Zusagen also rechtzeitig.",
      },
      {
        question: "Kann ich über GASTZILLA einen Tisch reservieren oder einen Escape Room buchen?",
        answer:
          "Nein. GASTZILLA sammelt nur die Zusagen. Reservierung und Buchung erledigst du wie gewohnt beim Restaurant, der Bar, dem Bowlingcenter oder dem Escape-Room-Anbieter – aber mit der richtigen Personenzahl.",
      },
      {
        question: "Wie finden wir einen Abend, an dem alle Zeit haben?",
        answer:
          "Statt im Chat hin und her zu schreiben, schlägst du ein paar Abende vor und alle haken an, was passt. Für den Favoriten reservierst du dann – mit der richtigen Personenzahl.",
      },
    ],
    updated: "2026-10-09",
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
        title: "Ausrüstung abstimmen",
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
        question: "Wie viele Leute brauchen wir für ein Spiel?",
        answer:
          "Für Fußball auf dem Kleinfeld reichen oft fünf gegen fünf, für Basketball drei gegen drei. Mit der Zusagenliste seht ihr vorher, ob es reicht – oder ob noch jemand fehlt.",
      },
      {
        question: "Können sich Mitspieler wieder austragen?",
        answer:
          "Ja. Wer doch nicht kann, hakt in seinem Eintrag einfach „Ich sage ab“ an. Du bekommst dazu eine E-Mail.",
      },
      {
        question: "Kann ich mehrere Termine anlegen?",
        answer:
          "Ein Event mit allen Grundfunktionen ist kostenlos. Weitere Events kannst du bald dazukaufen.",
      },
      {
        question: "Wie finden wir einen Termin, an dem genug Leute können?",
        answer:
          "Schlage zwei bis vier Termine vor und lass alle abstimmen. Du siehst für jeden Termin, wie viele können – und legst den fest, an dem genug Mitspieler zusammenkommen.",
      },
    ],
    updated: "2026-10-09",
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
      {
        title: "Spieleabend-Termin finden",
        text: "Für die Pen-&-Paper-Runde muss die ganze Gruppe können. Schlag bis zu vier Abende vor – alle stimmen per Link ab, und der Favorit wird zum festen Termin.",
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
        question: "Was bringt man zum Spieleabend mit?",
        answer:
          "Spiele, die man gern zeigen möchte, dazu Snacks und Getränke. Mit GASTZILLA schreibt jeder dazu, was er mitbringt – so liegen am Ende nicht drei Exemplare desselben Spiels auf dem Tisch.",
      },
      {
        question: "Wie viele Leute passen zu einem Spieleabend?",
        answer:
          "Viele Brettspiele sind für drei bis sechs Personen gedacht. Kommen mehr, spielt ihr an zwei Tischen – mit der Zusagenliste siehst du rechtzeitig, wie viele es werden.",
      },
      {
        question: "Wie stimmen wir ab, was gespielt wird?",
        answer:
          "Gäste können bei der Zusage eine Nachricht hinterlassen – etwa, worauf sie Lust haben. So siehst du vorher, welche Spiele gefragt sind.",
      },
      {
        question: "Eignet sich das auch für eine Pen-&-Paper-Kampagne?",
        answer:
          "Ja. Die Spielrunde trägt sich ein, und per Nachricht klärt ihr Charakterbögen, Snacks oder wer später dazukommt.",
      },
    ],
    updated: "2026-10-09",
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
      {
        title: "Termin für die LAN-Party finden",
        text: "Schlag mögliche Wochenenden vor und lass alle abstimmen. Wer zustimmt, steht nach dem Festlegen direkt auf der Gästeliste.",
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
        question: "Wie funktioniert eine LAN-Party?",
        answer:
          "Alle bringen ihren Rechner oder ihre Konsole mit und verbinden sich über ein gemeinsames Netzwerk, um zusammen zu spielen – oft einen ganzen Tag oder ein Wochenende lang. Mit GASTZILLA klärst du vorher, wer kommt und wer Netzwerk-Switch, Kabel oder Steckdosenleisten mitbringt.",
      },
      {
        question: "Kann ich eine LAN-Party über mehrere Tage planen?",
        answer:
          "Ja. Gib einen Zeitraum an. Gäste schreiben dazu, wann sie kommen, bis wann sie bleiben und welche Hardware sie mitbringen.",
      },
      {
        question: "Wie verhindere ich, dass Controller oder Kabel fehlen?",
        answer:
          "Jeder trägt bei der Zusage ein, was er mitbringt – Konsole, Controller, Rechner, Monitor oder Netzwerkkabel. Alle sehen die Liste, und Lücken fallen sofort auf.",
      },
      {
        question: "Eignet sich das auch für ein Mario-Kart-Turnier?",
        answer:
          "Ja. Alle tragen sich ein, und du siehst vorher, wie viele mitspielen – so planst du Runden und Controller passend.",
      },
    ],
    updated: "2026-10-09",
  },
  {
    id: "date-poll",
    slug: "terminabstimmung",
    name: "Termin abstimmen",
    title: "Termin abstimmen und einladen – Terminumfrage per Link",
    metaTitle: "Termin abstimmen: Terminumfrage & Einladung per Link – GASTZILLA",
    description:
      "Gemeinsamen Termin finden: bis zu 4 Vorschläge, Gäste stimmen per Link ohne Konto ab. Termin festlegen und allen per WhatsApp & Co. mitteilen – kostenlos.",
    teaser: "Noch kein Datum? Gäste stimmen per Link ab, welcher Termin passt – danach sagen sie direkt zu.",
    intro: [
      "Bevor man einlädt, muss oft erst ein Termin her: Wann haben die meisten Zeit? Im Gruppenchat endet die Frage nach dem passenden Datum schnell in Dutzenden Nachrichten – und am Ende weiß niemand mehr, wer wann kann.",
      "Mit GASTZILLA schlägst du zwei bis vier Termine vor – mit oder ohne Uhrzeit – und teilst den Link. Deine Gäste haken an, was ihnen passt, oder wählen „Nichts davon passt“, ganz ohne Konto oder App. Du siehst sofort, welcher Termin vorne liegt, legst ihn mit einem Klick fest, und alle, die abgestimmt haben, stehen direkt als Zu- oder Absage in der Gästeliste. Zum Schluss bekommst du einen fertigen Text, mit dem du allen den Termin per WhatsApp, E-Mail & Co. mitteilst.",
    ],
    benefitsTitle: "Darum lohnt sich die Terminabstimmung mit GASTZILLA",
    benefits: [
      {
        title: "Abstimmung und Einladung in einem",
        text: "Erst den Termin finden, dann zusagen lassen – über denselben Link. Niemand muss sich nach der Abstimmung noch einmal eintragen, und die Terminbestätigung zum Teilen ist schon fertig.",
      },
      {
        title: "Ohne Konto, ohne App",
        text: "Gäste öffnen den Link, tragen ihren Namen ein und haken die passenden Termine an. Fertig.",
      },
      {
        title: "Der Favorit auf einen Blick",
        text: "Eine Übersicht zeigt, wer welchen Termin kann. Der Termin mit den meisten Stimmen ist hervorgehoben.",
      },
      {
        title: "Flexibel bleiben",
        text: "Fehlt ein Termin, fügst du ihn später hinzu – die bisherigen Stimmen bleiben erhalten. Bei jeder Stimme bekommst du eine E-Mail.",
      },
    ],
    invitationText: [
      "Hallo zusammen,",
      "ich möchte [Anlass] mit euch feiern – aber wann passt es euch am besten?",
      "Stimmt bitte bis [Datum] hier ab, welche Termine euch passen: [Link]",
      "Sobald der Termin feststeht, könnt ihr euch über denselben Link eintragen.",
      "[Dein Name]",
    ],
    faq: [
      {
        question: "Wie finde ich einen gemeinsamen Termin?",
        answer:
          "Schlage zwei bis vier Termine vor und schick den Link an alle. Jeder hakt an, was passt. Der Termin mit den meisten Stimmen ist hervorgehoben – den legst du fest, und die Abstimmung wird zur Gästeliste.",
      },
      {
        question: "Wie teile ich allen den festgelegten Termin mit?",
        answer:
          "Sobald du den Termin festlegst, schlägt GASTZILLA dir einen Text vor: dass ihr euch gemeinsam für diesen Termin entschieden habt, mit Datum, Ort und Link, und der Bitte, die Angaben in der Gästeliste zu vervollständigen. Anrede und Gruß passt du an, dann kopierst du den Text oder teilst ihn direkt per WhatsApp, E-Mail & Co.",
      },
      {
        question: "Muss ich bei den Terminvorschlägen eine Uhrzeit angeben?",
        answer:
          "Nein, die Uhrzeit ist optional. Du kannst auch nur Tage vorschlagen und die Uhrzeit ergänzen, sobald der Termin feststeht.",
      },
      {
        question: "Was passiert, wenn ich den Termin festlege?",
        answer:
          "Die Abstimmung endet. Wer den Termin angehakt hat, steht als Zusage in der Gästeliste, alle anderen als Absage. Gäste können ihren Eintrag danach wie gewohnt ergänzen, etwa um Begleitpersonen oder Mitbringsel.",
      },
    ],
    updated: "2026-10-09",
  },
];

export function occasionPath(occasion: Occasion): string {
  return `${OCCASIONS_PATH}/${occasion.slug}`;
}

// Monoline icon per occasion, hosted on Cloudinary (see occasion-icons.ts).
// Named after the id, so it survives slug or language changes.
export function occasionIconPath(occasion: Occasion): string {
  return occasionIconUrl(occasion.id);
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
