# Nutzer-Feedback: Bewertungs-Banner, Feedback-Mail und Freigabe

**Datum:** 2026-11-19
**Status:** Freigegeben 2026-11-19
**Baut auf:** `2026-11-02-free-event-and-expiry-design.md` (Stichtag, Lifecycle-Cron),
`2026-11-13-i18n-design.md` (Sprachen de/en/ru)

## Warum

Für SEO und Vertrauen soll die Startseite echte Stimmen von Gastgebern zeigen.
Google zeigt für selbst gesammelte Bewertungen meist keine Sterne in den
Suchergebnissen, der Gewinn sind indexierbarer Nutzertext und mehr Vertrauen bei
Besuchern. Bewertungen kommen von Gastgebern nach ihrem Event und werden vor der
Veröffentlichung von Hand geprüft.

## Ziele

- Banner ganz unten auf der Startseite (alle drei Sprachen, für Besucher und
  angemeldete Nutzer): Bewertungskarten laufen endlos von rechts nach links.
- Solange es in einer Sprache keine freigegebene Bewertung gibt, zeigt das
  Banner **Beispiel-Bewertungen**, sichtbar als „Beispiele“ gekennzeichnet. Ab
  der ersten freigegebenen Bewertung dieser Sprache nur noch echte.
- Nach dem Event bekommt der Gastgeber eine Mail von info@gastzilla.de mit der
  Bitte um Feedback und einem Link auf eine Feedback-Seite in seiner Kontosprache.
- Abgeschicktes Feedback wird **nicht** automatisch veröffentlicht. Es geht als
  Mail an info@gastzilla.de mit den Buttons **Posten** und **Löschen**. „Löschen“
  entfernt die Bewertung aus der DB.

## Nicht-Ziele

- Kein Admin-Bereich in der App, keine Rollen.
- Kein Bearbeiten des Bewertungstexts vor dem Posten (Echtheit).
- Keine Zuordnung Bewertung → Event oder → Konto (vom Owner so entschieden:
  wird nicht gebraucht; Datensparsamkeit).
- Kein `Review`/`AggregateRating` im JSON-LD, kein Eintrag in llms.txt.
- Kein Feedback von Gästen (sie haben keine E-Mail-Adresse bei uns).
- Kein Anlass-Feld (im Event nicht gespeichert, Owner: weglassen).

## Anti-Ziele (wäre ein Fehlschlag, auch wenn es technisch läuft)

- Beispiel-Bewertungen, die für Besucher wie echte aussehen (UWG Anhang Nr. 23b/23c).
- Ein Link-Scanner im Postfach (z. B. Outlook Safe Links) postet oder löscht
  Feedback, nur weil er die Links in der Admin-Mail öffnet.
- Feedback-Mails an Events, die nie stattgefunden haben, oder mehrfach pro Event.
- Feedback-Mail ohne Abmeldemöglichkeit (gilt rechtlich als Werbung, BGH VI ZR 225/17).

## Rahmenbedingungen

- Mails gehen bisher nur als reiner Text über nodemailer (`src/lib/email.ts`).
- Täglicher Cron `/api/cron/event-lifecycle` (05:00 UTC) verschickt bereits
  Lifecycle-Mails in der Kontosprache (`getUserContact` → `locale`).
- Events werden 90 Tage nach dem Stichtag gelöscht; Bewertungen müssen das überleben.
- Rechtstexte: jede Änderung in allen drei Sprachen, `PRIVACY_VERSION` erhöhen,
  Paritätstest (`legal-parity.test.ts`).
- Alle bestehenden Konten sind Testkonten des Owners (keine Rücksicht auf Altbestand nötig).
- Keine Commits durch Claude.

## Ansätze

- **A) Signierte Links (gewählt).** Jeder Link trägt Nutzdaten + Ablauf + HMAC-
  Signatur mit einem neuen Server-Geheimnis `FEEDBACK_SECRET`. Nichts in der DB
  speichern, ein Muster für alle drei Linkarten, Links laufen von selbst ab.
  Nachteil: einzelner Link nicht sperrbar (nur alle per Schlüsselwechsel) –
  unkritisch, weil pro Event nur einmal abgeschickt werden kann und eine
  gepostete/gelöschte Bewertung nicht erneut ausgelöst werden kann.
- **B) Zufalls-Tokens in der DB.** Einzeln sperrbar, kein neues Geheimnis, aber
  eigene Token-Tabelle (Events werden gelöscht) und Aufräum-Logik.
- **C) Admin-Bereich in der App.** Verworfen: Owner will ausdrücklich Mail mit zwei Buttons.

Owner hat A nicht ausdrücklich gewählt, aber keine Einwände; A passt zur Vorgabe,
nichts zuzuordnen.

## Design

### Daten

Neue Tabelle `public.reviews` (Migration `supabase/migrations/2026-11-19-add-reviews.sql`,
Drizzle-Schema in `src/db/schema.ts`):

| Spalte | Typ | |
|---|---|---|
| `id` | uuid pk default random | |
| `rating` | smallint not null, check 1–5 | |
| `text` | varchar(200) not null | Länge 20–200 (Zod), nach `trim` |
| `display_name` | varchar(100) null | Name, nur wenn Checkbox gesetzt; sonst null; Validierung wie Kontoname |
| `language` | text not null, check in ('de','en','ru') | Sprache der Feedback-Seite |
| `status` | text not null default 'pending', check in ('pending','approved') | |
| `created_at` | timestamptz not null default now() | |
| `approved_at` | timestamptz null | |

Kein `event_id`, kein `user_id`. RLS wie bei den übrigen Tabellen (Zugriff nur
über die Server-DB-Verbindung).

`public.events` bekommt zwei Spalten:
- `feedback_request_sent_at timestamptz` – Feedback-Mail verschickt.
- `feedback_submitted_at timestamptz` – Feedback für dieses Event abgeschickt
  (Sperre gegen doppeltes Abschicken; einzige Verbindung, geht mit dem Event).

Abmeldung: `auth.users.raw_user_meta_data.feedback_mails = false` (per SQL in
`user-repository.ts`, wie die übrigen auth.users-Zugriffe). `getUserContact`
liefert zusätzlich `feedbackMails: boolean` (fehlt = true).

### Signierte Links (`src/lib/feedback-token.ts`)

`signFeedbackToken({ kind, id, exp? }, secret)` → `<base64url(json)>.<hmac>`,
`verifyFeedbackToken(token, kind, secret, today)` → Nutzdaten oder null
(falsche Art, Signatur, abgelaufen). `timingSafeEqual`, Muster wie `src/lib/event-access.ts`.

| Art | id | Ablauf | Ziel |
|---|---|---|---|
| `feedback` | Event-ID | Versandtag + 30 Tage | Feedback-Seite |
| `moderate` | Review-ID | keiner | Bestätigungsseite Posten/Löschen |
| `unsubscribe` | User-ID | keiner | Abmeldeseite |

Ohne `FEEDBACK_SECRET` werden keine Feedback-Mails verschickt und alle drei
Seiten zeigen „Link ungültig“ (wie `CRON_SECRET`/`EVENT_UNLOCK_SECRET`). Neuer
Eintrag in `.env.example`.

### Feedback-Mail an den Gastgeber (Cron)

Im täglichen `runLifecycleJob` zusätzlich zu den bestehenden Mails (eigene
Sent-Spalte, also unabhängig von der „eine Mail pro Lauf“-Regel in `dueMail`).
Fällig, wenn alles zutrifft:
- `dateMode = 'fixed'` und `eventDate` gesetzt (Event mit echtem Termin),
- `lifecycleStage(stichtag, today) === 'over'` (frühestens 1 Tag nach dem Stichtag,
  spätestens bis Tag 29 – so werden verpasste Läufe nachgeholt, aber keine alten Events angeschrieben),
- mindestens ein Gast mit `declined = false`,
- `feedback_request_sent_at` und `feedback_submitted_at` leer,
- Owner existiert, hat E-Mail, `feedbackMails !== false`.

Mail in Kontosprache, Text + HTML (ein Button „Feedback geben“, Abmeldelink im
Fuß, Hinweis warum er die Mail bekommt). Danach `feedback_request_sent_at` setzen.
Fehler bei einem Event stoppen die anderen nicht (wie bisher).

`sendEmail` bekommt ein optionales `html`-Feld; `text` bleibt Pflicht (Fallback).
HTML schlicht, inline-Styles, Farben der Seite (`--leaf`/amber).

### Feedback-Seite (`/[locale]/feedback?t=…`, `noindex`, nicht in Sitemap)

Lokalisierter Pfad über das bestehende Routing (Builder: Muster der anderen
Seiten übernehmen). Zustände:
- Token ungültig/abgelaufen → freundliche Meldung + Link zur Startseite.
- Event gelöscht oder `feedback_submitted_at` gesetzt → „Danke, Feedback ist schon angekommen“.
- Sonst Formular: Event-Titel als Kontext, 1–5 Sterne (Pflicht, tastaturbedienbar),
  Text (Pflicht, 20–200 Zeichen, `CharCounter`), Checkbox „Mein Vorname darf mit
  der Bewertung erscheinen“ (Namensfeld vorausgefüllt mit dem Kontonamen,
  editierbar, gleiche Validierung wie der Kontoname: `validatePersonName` / `personNameSchema`, 2–100 Zeichen; ohne Haken wird kein Name gespeichert), Pflicht-
  Checkbox „Ich bin einverstanden, dass GASTZILLA meine Bewertung auf gastzilla.de
  veröffentlicht“ mit Link zur Datenschutzerklärung (`LegalLink`).
- Nach dem Absenden: Dankeseite.

`POST /api/feedback` (Token im Body, Zod-Validierung, Fehlertexte über
`src/i18n/api-errors.ts`): in **einer Transaktion** Review `pending` anlegen und
`feedback_submitted_at` setzen (bedingt auf `is null`, sonst 409). Danach
Admin-Mail; schlägt sie fehl, bleibt die Review gespeichert (Log-Eintrag).

### Admin-Mail und Freigabe

An `FEEDBACK_ADMIN_EMAIL` (Default `info@gastzilla.de`), immer Deutsch, Text + HTML:
Sterne, Text, Name oder „(ohne Namen)“, Sprache, Datum. Zwei Buttons, beide auf
`/feedback/moderieren?t=<moderate-token>&a=approve|delete` (ohne Locale, `noindex`,
in `maintenance.ts` erreichbar).

Die Seite führt **nichts per GET** aus: sie zeigt die Bewertung und einen Button
„Jetzt posten“ bzw. „Endgültig löschen“, der per POST (Server Action oder
`POST /api/feedback/moderate`) ausführt:
- approve: `status = 'approved'`, `approved_at = now()`; schon gepostet → Hinweis.
- delete: Zeile löschen (auch eine bereits gepostete – so kann man später noch entfernen).
- Review existiert nicht mehr → „Schon gelöscht“.

Danach kurze Bestätigung. Startseite zeigt neue Bewertungen beim nächsten Aufruf
(Startseite ist ohnehin dynamisch).

### Abmeldeseite (`/[locale]/feedback/abmelden?t=…`)

Zeigt Erklärung + Button „Keine Feedback-Mails mehr“ (POST, wieder wegen Link-
Scannern). Setzt `feedback_mails = false`. Konto gelöscht → trotzdem Erfolg anzeigen.

### Banner (`src/components/ReviewsBanner.tsx`)

Server-Komponente in `LandingContent`, nach dem FAQ, vor den Rechtslinks.
- Daten: freigegebene Reviews **aller Sprachen**, neueste zuerst, max. 20
  (geändert 2026-11-19, Wunsch des Inhabers: Bewertungen werden einmal in ihrer
  Originalsprache gespeichert und überall im Originaltext gezeigt, nie
  übersetzt; Sprachwechsel ändert nur den Rahmen). Die ganze Karte folgt der
  Sprache der Bewertung (Anführungszeichen, Ersatzname ohne Vorname, Datum,
  Sterne-Beschriftung) und ist mit `lang` markiert - auf jeder Sprachversion
  der Website identisch.
- Unter dem Banner Button „Alle Bewertungen ansehen“ → `/bewertungen`
  (`/en/…`, `/ru/…`): alle freigegebenen Bewertungen (max. 200), neueste
  zuerst, mit Monat/Jahr der Freigabe. Ohne echte Bewertung: Beispiele mit
  Hinweis, `noindex`, nicht in der Sitemap; sonst indexierbar, Sitemap mit
  Datum der neuesten Freigabe. Datenschutzerklärung nennt Startseite und
  Bewertungsseite.
  Keine → 6 Beispiele aus `src/lib/example-reviews.ts` (geändert 2026-11-19:
  je zwei de/en/ru, jedes einmal in seiner Sprache, nie übersetzt, auf jeder
  Sprachversion gleich - wie echte Bewertungen) und
  Kennzeichnung „(Beispiele)“ neben der Überschrift.
- Überschrift „Was Gastgeber sagen“ (h2), Karte: Sterne (mit `aria-label`
  „5 von 5 Sternen“), Zitat, Name oder „Gastgeber:in“ / „Host“ / „Организатор“.
- Unter dem Banner: „Bewertungen stammen von Gastgebern nach ihrem Event und
  werden vor der Veröffentlichung gesichtet.“ (§ 5b Abs. 3 UWG). Bei Beispielen
  stattdessen „Beispiel-Bewertungen – echte folgen bald.“
- Geändert nach Test (2026-11-19, Wunsch des Inhabers): `ReviewsCarousel`,
  eine native Scroll-Leiste (`overflow-x: auto`). Ab 6 Bewertungen (inkl.
  der 6 Beispiele): Liste zweimal hintereinander (zweite Kopie `aria-hidden`),
  läuft endlos und konstant langsam (25 px/s, per JS, springt nach einer Kopie
  unsichtbar zurück). Unter 6 Bewertungen: jede Karte genau einmal, kein
  Auffüllen, kein automatisches Laufen; passen alle hinein, stehen sie mittig
  (ohne Pfeile), sonst wischen/Pfeile (vom Ende zurück zum Anfang). Ränder mit
  Fade-Maske.
  Maus darüber: Laufen stoppt, die Karte nächst zur Mitte gleitet in die Mitte,
  die Fade-Maske wird breiter (Nachbarkarten halb ausgeblendet), Pfeil-Buttons
  erscheinen links und rechts am Container (holen die vorige/nächste Karte in
  die Mitte, endlos). Touch: frei wischen, läuft 3,5 s danach weiter.
  Tastatur: Fokus stoppt und zeigt die Pfeile. `prefers-reduced-motion:
  reduce` → kein automatisches Laufen. Innenabstand oben/unten, damit die
  Kartenschatten nicht abgeschnitten werden.
- Texte im Server-HTML (indexierbar); ohne JS bleibt die Leiste wischbar. Mobil
  375 px ohne horizontales Seiten-Scrollen.
- Beispieltexte: 6 pro Sprache, nur verifizierte Features (project-map.md),
  keine Superlative, kurze Vornamen; englische Texte für englische Leser geschrieben.

### Rechtliches

- Datenschutzerklärung (de/en/ru) neuer Abschnitt „Feedback und Bewertungen“:
  Feedback-Mail nach dem Event (Art. 6 Abs. 1 lit. f DSGVO, § 7 Abs. 3 UWG,
  jederzeit abbestellbar per Link oder Mail), was gespeichert wird (Sterne, Text,
  optional Vorname, Sprache – keine Verbindung zu Konto oder Event), Prüfung vor
  Veröffentlichung, Veröffentlichung auf der Startseite (Einwilligung auf dem
  Formular, Art. 6 Abs. 1 lit. a), Löschung jederzeit auf Anfrage; nicht
  freigegebene werden sofort gelöscht. `PRIVACY_VERSION = "2026-11-19"`.
- Hinweis bei der Registrierung (§ 7 Abs. 3 Nr. 4 UWG verlangt ihn beim Erheben
  der Adresse): eine Zeile im Registrierungsdialog, dass wir nach dem Event um
  Feedback bitten und man das jederzeit abbestellen kann.
- AGB bleiben unverändert (Veröffentlichungs-Einwilligung steht im Formular),
  also kein erneutes Zustimmen nötig.
- Kein Anwalt hat das geprüft; der Owner sollte die Texte gegenlesen lassen.

### Sprachen

Alle neuen Texte (Mail, Feedback-Seite, Abmeldeseite, Banner, Beispiele) in
de/en/ru über `messages/*.json`; `messages.test.ts` prüft Vollständigkeit.
Moderationsseite und Admin-Mail nur Deutsch.

### Tests

- `feedback-token.test.ts`: Signieren/Prüfen, falsche Art, manipuliert, abgelaufen.
- Fälligkeitslogik der Feedback-Mail (reine Funktion, z. B. in `lifecycle-mails.ts`):
  jede Bedingung einzeln.
- Service-Tests: Abschicken (doppelt → 409, ohne Namen-Haken kein Name), Freigabe,
  Löschen, Abmelden.
- Banner: Fallback auf Beispiele + Kennzeichnung.
- `legal-parity.test.ts`, `messages.test.ts` grün.
- Danach `npx tsc --noEmit`, `npx eslint src`, `npm test`, Startseite im Dev-Server
  (Banner, mobil 375 px, reduzierte Bewegung, Seitenquelltext enthält Texte).

## Eigene Entscheidungen (zur Prüfung durch den Owner)

- Mail nur bei festem Termin + mindestens einer Zusage; Fenster Tag 1–29 nach Stichtag.
- Feedback-Link gilt 30 Tage.
- Textlänge 20–200 Zeichen (Owner). Name wie Kontoname validiert (Owner).
- Namens-Fallback „Gastgeber:in“.
- Gelöscht werden kann auch eine schon gepostete Bewertung (über denselben Link).
- Admin-Adresse per `FEEDBACK_ADMIN_EMAIL`, Default info@gastzilla.de.
- Hinweiszeile im Registrierungsdialog.

## Für den Builder offen

- Genaue Pfadnamen pro Sprache (Muster aus `src/i18n/routing.ts` übernehmen).
- Feedback-, Abmelde- und Moderationsseite samt API-Routen müssen im
  Wartungsmodus erreichbar sein (`src/lib/maintenance.ts`, wie Event-Seiten).
- Ob die Moderation als Server Action oder API-Route läuft.
- HTML-Mail-Layout im Detail.
