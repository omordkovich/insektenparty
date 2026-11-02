# Free-Event, bezahlte Events und automatische Löschung

**Datum:** 2026-11-02
**Status:** Entwurf, geprüft (wartet auf Freigabe)
**Baut auf:** `2026-09-23-paid-features-design.md` (Ledger `user_entitlements`),
`2026-10-08-date-poll-design.md` (Termin-Status `unknown`/`poll`/`fixed`)

## Warum

GASTZILLA lässt sich heute komplett kostenlos nutzen. Zwei Probleme:

1. **Speicher/Kosten:** Events und Gästedaten bleiben für immer liegen, auch
   von Nutzern, die eine einzige Party einladen und nie wiederkommen.
2. **Keine Einnahmen:** Wer kostenlos alles bekommt, kauft nichts.

Die Lösung trennt beides:
- **Ablauf und Löschung** für alle Events (auch bezahlte) löst Problem 1.
  Nebeneffekt: Gästedaten werden nicht länger gespeichert als nötig
  (DSGVO Art. 5 Abs. 1 lit. e).
- **Ein einmaliges Free-Event pro Konto.** Alles darüber hinaus wird gekauft.
  Das löst Problem 2.

## Ziele

- Jedes neue Konto bekommt **genau ein** kostenloses Event („Free-Event“),
  einmalig. Wird es gelöscht oder läuft es ab, gibt es kein neues.
- Ein Free-Event braucht ein **festes Datum**, das höchstens **3 Monate** nach
  dem Erstellen des Events liegt.
- Weitere Events gibt es nur als **bezahltes Event**.
- Ein Free-Event lässt sich in ein bezahltes Event umwandeln: Klick auf ein
  gesperrtes Feature öffnet einen Freischalt-Dialog.
- Jedes Event läuft ab einem **Stichtag** in drei Stufen ab und wird
  automatisch gelöscht. Das gilt auch für bestehende Events.
- Bezahlung ist noch nicht eingebaut. **Überall, wo gekauft wird**, gibt es
  vorerst Dummy-Buttons, die ohne Zahlung freischalten: Event freischalten,
  weiteres Event, Premium-Design. Sie sind auch in Produktion aktiv, weil die
  Domain ohnehin noch „under construction“ ist (`MAINTENANCE_MODE`).

## Nicht-Ziele

- Echte Bezahlung (Stripe). Pausiert bis zur Gewerbeanmeldung. Der Dummy-Button
  ist die Stelle, an der später der Checkout eingehängt wird.
- Preise, Bundles, Rechnungen, „Meine Käufe“.
- Weitere Extras (Gästelisten-Export, eigene Fragen, Mitbringliste). Später.
- Eigenes Bild statt Logo. Später, als eigenes Projekt und erst zusammen mit
  Stripe und Moderation (Missbrauchsrisiko bei anonymen Dummy-Käufen).
- Missbrauch über Konto löschen und neu registrieren verhindern (siehe
  „Bekannte Grenzen“).

## Anti-Ziele (wäre ein Fehlschlag, auch wenn es technisch läuft)

- Gäste sehen ein **falsches Datum**, weil der Gastgeber nicht verschieben darf.
  Verschieben bleibt daher erlaubt, nur eben innerhalb des Fensters.
- Ein Event verschwindet **ohne Vorwarnung** für den Gastgeber.
- Ein Free-Event lässt sich durch Datum-Verschieben oder Wiederverwenden
  endlos am Leben halten.
- Die Dummy-Buttons bleiben aus Versehen aktiv, wenn die Seite öffentlich
  startet. Sie müssen sich mit einer Variable abschalten lassen (siehe
  Dummy-Buttons).

## Begriffe

| Begriff | Bedeutung |
|---|---|
| **Free-Event** | `events.plan = 'free'`. Höchstens eins pro Konto, einmalig. |
| **Bezahltes Event** | `events.plan = 'paid'`. Neu erstellt aus einem gekauften Event-Guthaben oder umgewandelt aus dem Free-Event. |
| **Event-Guthaben** | Ein gekauftes, noch nicht benutztes bezahltes Event. Wird beim Erstellen eines Events verbraucht. |
| **Stichtag** | Der Tag, ab dem das Event als „vorbei“ gilt (Berechnung siehe unten). |

## Regeln

### Was kann welches Event?

| | Free-Event | Bezahltes Event |
|---|---|---|
| Termin-Status | nur **Fester Termin** (Pflicht, auch beim Erstellen) | alle: Fester Termin, Abstimmung, Noch kein Termin |
| Spätestes Datum | Erstellungsdatum + **3 Monate** | Erstellungsdatum + **12 Monate** *(Vorschlag, offen)* |
| Datum ändern | ja, innerhalb des Fensters | ja, innerhalb des Fensters |
| Designs | freie Designs + einzeln gekaufte (pro Nutzer, `theme:<key>`, wie bisher) | **alle Designs inklusive** |
| Passwortschutz, Teilnehmerlimit, alles andere | wie heute | wie heute |
| Ablauf und Löschung | ja | ja |

„3 Monate“ = Kalendermonate ab dem Erstellungstag (Berliner Zeit), z. B.
erstellt am 15.01. → spätestes Datum 15.04. Gilt auch für das Enddatum eines
mehrtägigen Events.

Beim Umwandeln in ein bezahltes Event bleibt das Erstellungsdatum, das Fenster
wird also nur länger.

### Kontingent

- `canCreateEvent`: Free-Event noch nicht verbraucht **oder** mindestens ein
  Event-Guthaben vorhanden.
- Neues Event: Ist das Free-Event noch nicht verbraucht, wird es ein
  Free-Event und markiert das Free-Event als verbraucht. Sonst wird ein
  Guthaben verbraucht und es wird ein bezahltes Event.
- Hat der Nutzer das Free-Event noch nicht verbraucht **und** Guthaben, wird
  das neue Event trotzdem zuerst das Free-Event. Will er dafür bezahlte
  Features, wandelt er es um (siehe Freischalt-Dialog). *(Entscheidung Claude)*
- Löschen eines Events gibt **nichts** zurück, weder Free-Event noch Guthaben.
  Das ist eine Abkehr vom bisherigen „Löschen gibt den Slot frei“.
- Der Limit-Check und das Verbrauchen laufen in **einer Transaktion** mit
  Sperre pro Nutzer (die alte „bekannte Einschränkung“ mit zwei parallelen
  Requests fällt damit weg, weil jetzt etwas verbraucht wird).

### Stichtag

| Termin-Status | Stichtag |
|---|---|
| Fester Termin mit Datum | letzter Tag des Events (`event_end_date`, sonst `event_date`) |
| Abstimmung | spätester vorgeschlagener Termin; nach dem Festlegen gilt der feste Termin |
| Noch kein Termin, oder Fester Termin ohne Datum (Altdaten) | Erstellungsdatum + **6 Monate** |

Ändert sich das Datum, ändert sich der Stichtag mit. Das Fenster oben
verhindert, dass er endlos nach hinten wandert. Alle Tage in Berliner Zeit.

Ein neues oder geändertes festes Datum darf **nicht in der Vergangenheit**
liegen (wie heute schon bei Abstimmungs-Vorschlägen). Sonst wäre das Event
sofort „vorbei“ und ließe sich nicht mehr korrigieren. Bestehende Events mit
vergangenem Datum bleiben, wie sie sind. *(Entscheidung Claude)*

Wird eine Abstimmung bis zum spätesten Vorschlag nicht festgelegt, ist das
Event danach „vorbei“ wie jedes andere. Festlegen geht dann nicht mehr, die
Stimmen werden nicht übernommen (so mit dem Nutzer besprochen).

### Ablauf in drei Stufen (für alle Events)

| Ab | Gäste | Gastgeber |
|---|---|---|
| **Stichtag + 1 Tag** („vorbei“) | Seite sichtbar mit Hinweis „Diese Party war am …“. Kein Zu-/Absagen, Ändern, Löschen, Abstimmen. | Sieht alles, kann **nichts mehr ändern** (Datum, Texte, Design, Gäste). Kann das Event löschen. Hinweis „Dieses Event ist vorbei und wird am … gelöscht.“ |
| **Stichtag + 30 Tage** („abgelaufen“) | Link zeigt eine Seite „Diese Einladung ist abgelaufen“ (keine Eventdaten, keine Gästeliste). | Wie oben. Event steht in der Übersicht mit Löschdatum. |
| **Stichtag + 90 Tage** | – | Event wird endgültig gelöscht (inkl. Gäste, Vorschläge, Stimmen per Cascade). |

Serverseitig liefern alle schreibenden Endpunkte (Gäste, Stimmen, Event-PATCH,
date-mode) ab „vorbei“ `409` mit „Dieses Event ist vorbei.“ Das Löschen des
Events durch den Owner bleibt erlaubt.

### E-Mails an den Gastgeber

| Wann | Betreff (Vorschlag) | Inhalt |
|---|---|---|
| Stichtag + 83 Tage (7 Tage vor Löschung) | „Dein Event „X“ wird am … gelöscht“ | Löschdatum, Link zur Übersicht, Hinweis „Nächste Party? Weiteres Event freischalten“. |
| 30 Tage vor Stichtag, nur bei „Noch kein Termin“ | „Setz einen Termin für „X““ | „Ohne Termin läuft dein Event am … ab.“ |
| 3 Tage vor dem spätesten Vorschlag, nur bei laufender Abstimmung und nur, wenn die Abstimmung mindestens 3 Tage alt ist | „Leg den Termin für „X“ fest“ | „Deine Abstimmung endet am …. Danach kannst du keinen Termin mehr festlegen.“ *(Entscheidung Claude)* |

Jede Mail wird pro Event höchstens einmal gesendet (Versand vermerken, z. B.
`events.deletion_notice_sent_at`, `events.date_reminder_sent_at`). Versand über
das bestehende SMTP (`src/lib/email.ts`).

### Freischalt-Dialog

Ein Dialog, vier Anlässe:

1. **„Dieses Event freischalten“**: Klick auf ein gesperrtes Feature eines
   Free-Events. Gesperrt sind: „Termin abstimmen lassen“, „Noch kein Termin
   bekannt“ (im Termin-Fenster und im Erstellen-Dialog) und ein Datum außerhalb
   des 3-Monats-Fensters (die Fehlermeldung bekommt einen Link „Mehr Zeit?
   Event freischalten“). Der Dialog zählt auf, was ein bezahltes Event kann.
   Button → Event wird `paid`, der Dialog schließt, das gewählte Feature ist
   sofort nutzbar. Hat der Nutzer schon Guthaben, wird **zuerst ein Guthaben
   verbraucht** (Button „Mit vorhandenem Event-Guthaben freischalten“), sonst
   wird gekauft. *(Entscheidung Claude)*
2. **„Weiteres Event“**: Klick auf den gesperrten Button „Event erstellen“.
   Button → ein Event-Guthaben wird gutgeschrieben, danach öffnet sich der
   Erstellen-Dialog.
3. **„Design freischalten“**: Klick auf ein gesperrtes Premium-Design im
   Design-Picker eines Free-Events (heute nur der Hinweis „bald
   freischalten“). Zwei Wege:
   - „Nur dieses Design“ → Zeile `theme:<key>` im Ledger (pro Nutzer, wie
     bisher), das Design ist sofort auswählbar.
   - „Ganzes Event freischalten, alle Designs inklusive“ → wie Anlass 1.
4. **„Ohne GASTZILLA-Hinweis“**: Der Owner sieht am Abzeichen „made with
   Gastzilla“ im Footer seiner Event-Seite oben rechts ein kleines **X**
   (Gäste nicht). Klick → Dialog, **0,99 €**. Button → das Abzeichen
   verschwindet auf dieser Event-Seite für alle Besucher.
   - Gilt **pro Event**, für Free- und bezahlte Events gleich, also **nicht**
     in den 2,99 € enthalten (Entscheidung des Nutzers).
   - Teilen-Buttons und die Links zu Impressum/Datenschutz/AGB bleiben immer
     sichtbar (rechtlich Pflicht). Nur das Logo entfällt.
   - Ab „vorbei“ nicht mehr kaufbar (wie alle Änderungen).

Gesperrte Optionen bleiben sichtbar: abgedimmt mit Schloss-Icon, wie die
gesperrten Designs heute. Der bisherige Text „bald freischalten“ entfällt an
diesen Stellen.

**Dummy-Buttons:** Beschriftung „Freischalten (Test, ohne Zahlung)“. Sie
schreiben eine Ledger-Zeile mit `source = 'dummy'`. Sie sind aktiv, solange
die Umgebungsvariable `PAYMENTS_DUMMY=true` gesetzt ist, **auch in
Produktion** (Entscheidung des Nutzers: Domain ist noch „under construction“).
Die Variable wird lokal und auf Vercel gesetzt. Ohne sie zeigt der Dialog
denselben Inhalt mit „Bald verfügbar“ statt Button, und der Endpunkt antwortet
`403`. So lässt sich der Dummy vor dem öffentlichen Start oder mit Stripe
abschalten. Das Verbrauchen eines vorhandenen Guthabens geht immer.

Alle neuen Regeln (Free-Event, Sperren, Ablauf, Löschung) gehen sofort live.

### Erstellen-Dialog

- Free-Event: Der Dialog bekommt einen Termin-Block „Fester Termin“ (Datum,
  von, bis, wie im Termin-Fenster), Pflicht. Die anderen beiden Optionen sind
  sichtbar und gesperrt → Freischalt-Dialog. Wird dort freigeschaltet, wird
  das neue Event direkt als bezahltes erstellt (verbraucht Guthaben statt
  Free-Event).
- Bezahltes Event: wie heute (startet mit „Noch kein Termin bekannt“).

## Datenmodell

**`events`**
- `plan text not null default 'free'`, `check (plan in ('free','paid'))`.
- `deletion_notice_sent_at timestamptz null`, `date_reminder_sent_at timestamptz null`.
- `badge_hidden boolean not null default false` („Ohne GASTZILLA-Hinweis“;
  der Kauf steht zusätzlich als Ledger-Zeile `no_badge` mit
  `consumed_event_id`).

**Free-Event verbraucht** (Änderung bei der Planung): keine Spalte in
`profiles` (dort ist `name` Pflicht, nicht jeder Nutzer hat eine Zeile),
sondern eine Ledger-Zeile `feature = 'free_event'`, sobald das Free-Event
erstellt wurde. Bleibt, auch wenn das Event gelöscht wird.

**Dummy-Preise** (vom Nutzer bestätigt): bezahltes Event **2,99 €** (alle
Designs inklusive), einzelnes Design **0,99 €**, ohne GASTZILLA-Hinweis
**0,99 €** pro Event. Konstanten in
`src/lib/products.ts`, im Dialog angezeigt mit „Testphase – es wird nichts
berechnet“. Begründung: Bei Stripe fällt pro Zahlung eine feste Gebühr von
rund 0,25 € an, die kleinere Preise zum großen Teil auffrisst.

**`user_entitlements`** (Ledger)
- Neues Feature `paid_event` (quantity immer 1), Check-Constraint erweitern.
- Neue Spalte `consumed_event_id uuid null` und `consumed_at timestamptz null`.
  `consumed_at is null` = verfügbares Guthaben. Beim Umwandeln eines
  Free-Events wird eine Zeile geschrieben und sofort verbraucht (Historie).
  `consumed_event_id` ohne FK bzw. `on delete set null`, damit die Zeile das
  Löschen des Events überlebt und das Guthaben **nicht** zurückkommt.
- `source`: `'manual'`, `'dummy'`, später `'stripe'`.
- `event_slot` wird abgelöst (siehe Bestandsdaten).

**Stichtag:** reine Funktion in `src/lib/` (testbar). Ob er zusätzlich als
Spalte gespeichert oder für den Cron per SQL berechnet wird, entscheidet der
Builder. Er muss in App und Cron gleich herauskommen.

## Automatik

Täglicher Job (Vercel Cron, Route `/api/cron/event-lifecycle`, geschützt mit
`CRON_SECRET`), weil er Mails über das App-SMTP versendet:
1. Erinnerungsmails „Termin setzen“.
2. Löschhinweis-Mails.
3. Events mit Stichtag + 90 Tage löschen.

Die Stufen „vorbei“ und „abgelaufen“ brauchen keinen Job. Sie werden beim
Aufruf aus dem Stichtag berechnet. Der Job muss idempotent sein (zweimal
laufen schadet nicht). Fällt er einen Tag aus, holt der nächste Lauf alles nach
(`<=` statt `=`).

## Bestandsdaten (Stand 2026-11-02: 4 Events, 2 Gastgeber, alle `fixed`)

- Pro Gastgeber wird das **älteste** Event `free`, alle weiteren `paid`.
  `free_event_used_at` wird für jeden Gastgeber mit Event gesetzt.
- Bestehende `event_slot`-Zeilen (heute: eine manuelle Zeile mit quantity 4)
  werden zu `paid_event`-Zeilen umgerechnet. So viele, wie der Nutzer
  bezahlte Events hat, werden als verbraucht markiert, der Rest bleibt
  Guthaben. Danach wird `event_slot` entfernt.
- Free-Events, deren Datum schon außerhalb des 3-Monats-Fensters liegt, bleiben
  unangetastet (Bestandsschutz). Die Regel greift erst beim nächsten Ändern.
- Der Ablauf gilt sofort für alle. Heute heißt das: 2 Events sind 50 und 59
  Tage vorbei, also sofort „abgelaufen“ (Gästelink aus) und werden in 31 bzw.
  40 Tagen gelöscht. Der Löschhinweis kommt 7 Tage vorher. 2 Events haben
  `fixed` ohne Datum → Stichtag 07.04.2027.

## Texte & Recht

- **Datenschutzerklärung, Abschnitt 15 „Speicherdauer“:** Events, Gästeeinträge
  und Abstimmungen werden 90 Tage nach dem Stichtag automatisch gelöscht.
  `PRIVACY_VERSION` erhöhen.
- **AGB, Leistungsbeschreibung:** ein kostenloses Event pro Konto (einmalig,
  festes Datum innerhalb von 3 Monaten), automatische Löschung 90 Tage nach dem
  Stichtag. Ob eine geänderte AGB eine neue Zustimmung der Bestandsnutzer
  braucht, klärt der Builder mit dem bestehenden `TERMS_VERSION`-Mechanismus.
- **FAQ „Ist GASTZILLA kostenlos?“** (`src/lib/faq.ts`) und weitere öffentliche
  Texte (Landing, `FEATURES`, Anlass-Seiten, `llms.txt`), die Terminabstimmung
  als kostenlos darstellen: anpassen, mit dem Projekt-Skill
  `optimizing-seo-aeo-geo`.

## Tests

- Reine Funktionen: Stichtag für alle Termin-Status inkl. Altdaten, Stufe zu
  einem Datum, 3-/12-Monats-Grenze (Monatsende, mehrtägig), Kontingent
  (Free verbraucht/nicht, Guthaben 0/1, Löschen gibt nichts zurück).
- Services: Free-Event ohne festes Datum → 400, Datum außerhalb Fenster → 400,
  `poll`/`unknown` auf Free → 403, Umwandeln → danach erlaubt, alle
  Schreib-Endpunkte ab „vorbei“ → 409, Dummy (Event, Guthaben, Design) mit
  `PAYMENTS_DUMMY` → freigeschaltet, ohne → 403,
  paralleles Erstellen verbraucht nicht doppelt.
- Cron: Mails genau einmal, Löschung an der Grenze, Nachholen nach Ausfall.
- Migration: Bestandsdaten wie oben.
- Browser: Erstellen (Free mit Pflichtdatum), gesperrte Optionen → Dialog →
  freischalten, gesperrter „Event erstellen“ → Guthaben → erstellen, Event-Seite
  in den Stufen „vorbei“ und „abgelaufen“ (Datum in lokalen Testdaten).
  Achtung: lokal = Produktions-DB, Testdaten nur nach Rückfrage.

## Bekannte Grenzen

- Wer sein Konto löscht und sich mit derselben E-Mail neu registriert, bekommt
  wieder ein Free-Event. Später lösbar über einen Hash der E-Mail-Adresse
  verbrauchter Free-Events.

## Dem Builder überlassen

- Genaue Texte in Dialogen, Hinweisen und Mails (Ton wie bestehende Texte).
- Gespeicherter vs. berechneter Stichtag.
- Aufteilung auf Repository/Service nach der Layered Architecture.
