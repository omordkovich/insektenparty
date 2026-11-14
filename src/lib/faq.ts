// Questions shown on the start page. Also feeds the FAQPage structured data
// and /llms.txt, so search engines and AI assistants get the same answers
// visitors see.
import type { Locale } from "@/i18n/config";

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

// The same questions for the English start page (/en). Keep both lists in
// step: same order, same facts.
const FAQ_EN: FaqItem[] = [
  {
    question: "Is GASTZILLA free?",
    answer:
      "Your first event is free: every account gets one event with a fixed date no more than three months after you create it – with guest list, invitation text, password protection and the colour designs. Date polls, a date that's still open, dates up to twelve months ahead and an event page without the GASTZILLA note are paid extras, as are the premium designs. You'll soon be able to buy more events.",
  },
  {
    question: "How long is my event stored?",
    answer:
      "Until 90 days after the event – then GASTZILLA deletes the event, guest list and poll automatically. What counts is the last day of the event; with a date poll the latest option, and without a date six months after you created it. From 30 days after the event, the invitation link only shows that the invitation has expired. About a week before deletion we remind you by email.",
  },
  {
    question: "Do my guests need an account?",
    answer: "No, they just open the invitation link and add themselves.",
  },
  {
    question: "Can I agree on a date with my guests?",
    answer:
      "Yes. If the date isn't fixed yet, you suggest two to four dates – with or without a time. Your guests tick what suits them via the link. You fix the favourite with one click, and all votes automatically turn into yes and no replies on the guest list. Then you get a ready-made text to tell everyone the date via WhatsApp, email and more. Date polls are one of the paid extras.",
  },
  {
    question: "Can guests also decline?",
    answer:
      "Yes. Anyone who can't come ticks “I can't make it” when adding themselves – with a message if they like. They then show up on the guest list as “Declined”, and you get an email. So you know not only who's coming, but also who definitely isn't.",
  },
  {
    question: "Who can see the guest list?",
    answer:
      "Everyone who has the invitation link. Search engines can't find your event page. With a password, only people who know the password can see it.",
  },
  {
    question: "Can I protect my event with a password?",
    answer:
      "Yes. Tick “Password-protected” when you create the event or later in the event settings, and choose a password. Without it, visitors only see the title – no guest list, no date, no location. The password is added to the invitation text automatically, and anyone who doesn't have it can ask you for it on the event page.",
  },
  {
    question: "Do I have to write the invitation text myself?",
    answer:
      "No. On your event page GASTZILLA puts together an invitation text with title, date, location and link. You adjust the greeting and sign-off as you like and copy or share the text with one click. After a date poll there's a ready-made text, too, that tells everyone the chosen date.",
  },
  {
    question: "Are there ads?",
    answer: "No. GASTZILLA has no ads and doesn't use tracking cookies.",
  },
];

// The same questions for the Russian start page (/ru).
const FAQ_RU: FaqItem[] = [
  {
    question: "GASTZILLA бесплатный?",
    answer:
      "Первое мероприятие – бесплатно: каждый аккаунт один раз получает мероприятие с фиксированной датой не позже чем через три месяца после создания – со списком гостей, текстом приглашения, защитой паролем и цветными дизайнами. Выбор даты голосованием, пока не определённая дата, даты на срок до двенадцати месяцев вперёд и страница мероприятия без пометки GASTZILLA – платные опции, как и премиум-дизайны. Скоро можно будет докупать дополнительные мероприятия.",
  },
  {
    question: "Как долго хранится моё мероприятие?",
    answer:
      "До 90 дней после мероприятия – затем GASTZILLA автоматически удаляет мероприятие, список гостей и голосование. Считается последний день мероприятия, при голосовании – самый поздний вариант даты, а без даты – шесть месяцев после создания. Уже через 30 дней после мероприятия ссылка-приглашение показывает только, что приглашение истекло. Примерно за неделю до удаления мы напомним вам об этом по e-mail.",
  },
  {
    question: "Нужен ли гостям аккаунт?",
    answer: "Нет, они просто открывают ссылку-приглашение и записываются.",
  },
  {
    question: "Можно ли выбрать дату вместе с гостями?",
    answer:
      "Да. Если дата ещё не определена, вы предлагаете от двух до четырёх вариантов – со временем или без. Гости отмечают по ссылке, что им подходит. Лучший вариант вы утверждаете одним кликом, и все голоса автоматически превращаются в ответы «приду» и «не приду» в списке гостей. После этого вы получаете готовый текст, чтобы сообщить всем дату через WhatsApp, e-mail и другие сервисы. Выбор даты – платная опция.",
  },
  {
    question: "Могут ли гости отказаться?",
    answer:
      "Да. Кто не может прийти, при записи отмечает «Не смогу прийти» – по желанию с сообщением. В списке гостей он отображается как «Не придёт», а вы получаете письмо. Так вы знаете не только, кто придёт, но и кто точно не придёт.",
  },
  {
    question: "Кто видит список гостей?",
    answer:
      "Все, у кого есть ссылка-приглашение. Поисковые системы вашу страницу мероприятия не находят. С паролем список видят только те, кто знает пароль.",
  },
  {
    question: "Можно ли защитить мероприятие паролем?",
    answer:
      "Да. Отметьте «Защитить паролем» при создании или позже в настройках мероприятия и задайте пароль. Без пароля посетители видят только название – без списка гостей, даты и места. Пароль автоматически добавляется в текст приглашения, а кто его не знает, может запросить его у вас на странице мероприятия.",
  },
  {
    question: "Нужно ли писать текст приглашения самому?",
    answer:
      "Нет. На странице мероприятия GASTZILLA автоматически составляет текст приглашения с названием, датой, местом и ссылкой. Приветствие и подпись вы меняете по желанию и копируете или отправляете текст одним кликом. После голосования за дату тоже есть готовый текст, который сообщает всем выбранную дату.",
  },
  {
    question: "Есть ли реклама?",
    answer: "Нет. В GASTZILLA нет рекламы и отслеживающих cookie.",
  },
];

const FAQ_BY_LOCALE: Record<Locale, FaqItem[]> = { de: FAQ, en: FAQ_EN, ru: FAQ_RU };

export function faqEntries(locale: Locale): FaqItem[] {
  return FAQ_BY_LOCALE[locale];
}
