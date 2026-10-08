# Terminabstimmung (Termin-Status pro Event)

**Datum:** 2026-10-08
**Status:** Design genehmigt

## Ziel

Der Owner legt fest, ob der Termin seines Events noch offen ist, abgestimmt
wird oder feststeht. Bei einer Abstimmung haken Gäste an, welche der 2–4
Terminvorschläge passen (oder „Nichts davon passt“). Legt der Owner einen
Vorschlag fest, werden die Stimmen in die Gästeliste übernommen.

## Termin-Status

Neue Spalte `events.date_mode` (`unknown` | `poll` | `fixed`).

| Status | Datum/Uhrzeit auf der Seite | Gäste können … |
|---|---|---|
| `unknown` – Noch kein Termin bekannt | „Termin folgt“ | Seite ansehen, sich **nicht** eintragen |
| `poll` – Termin abstimmen lassen | „Wird abgestimmt“ | abstimmen, sich **nicht** eintragen |
| `fixed` – Fester Termin | Datum + Uhrzeit | sich eintragen, zu-/absagen (wie heute) |

### Wechsel

| Von → nach | Folge |
|---|---|
| `unknown` → `poll`, `unknown` → `fixed` | nichts geht verloren |
| `poll` → `fixed` | mit gewähltem Vorschlag (`fromOptionId`): Stimmen werden übernommen (siehe unten); mit anderem Datum: Stimmen verfallen |
| `fixed` → `poll`, `fixed` → `unknown` | **Gästeliste wird geleert** |
| `poll` → `unknown` | **Stimmen (und Vorschläge) werden gelöscht** |
| `poll` → `poll` „Abstimmung neu machen“ | **Stimmen werden gelöscht**, neue Vorschläge |
| `poll` → `poll` „Termin hinzufügen“ | Stimmen bleiben |
| `fixed` → `fixed` (Datum ändern) | Gästeliste bleibt (wie heute) |

Datenverlust nur nach Bestätigung (Dialog + Server, siehe API).

### Übernahme beim Festlegen (`poll` → `fixed` mit `fromOptionId`)

| Stimme zum festgelegten Vorschlag | Gästeliste |
|---|---|
| ✓ angehakt | **Zusage**, Ankunftszeit = Startzeit des Vorschlags, keine Begleitpersonen |
| nicht angehakt / „Nichts davon passt“ | **Absage** |
| „?“ – Stimme älter als der Vorschlag (`vote.updated_at < option.created_at`) | **nicht übernommen** |

Danach werden Vorschläge und Stimmen gelöscht.

### Bestehende Events

Migration setzt `date_mode = 'fixed'` – laufende Einladungen ändern sich nicht.

## Daten

- `events.date_mode text not null default 'fixed'` mit
  `check (date_mode in ('unknown','poll','fixed'))`.
- `date_poll_options`: `id uuid pk`, `event_id uuid not null references events on delete cascade`,
  `date date not null`, `start_time time not null`, `end_time time null`,
  `position integer not null`, `created_at timestamptz not null default now()`.
  Max. 4 pro Event (Service).
- `date_poll_votes`: `id uuid pk`, `event_id uuid not null references events on delete cascade`,
  `name varchar(100) not null`, `option_ids uuid[] not null default '{}'`,
  `none_fit boolean not null default false`, `created_at`, `updated_at`.
- Eine Abstimmung existiert genau bei `date_mode = 'poll'`; beim Verlassen von
  `poll` werden Vorschläge und Stimmen gelöscht.
- Migration in `supabase/migrations/2026-10-08-…-date-poll.sql`, Schema in
  `src/db/schema.ts`; Aufbau/Berechtigungen wie Tabelle `guests`.

## Regeln (Validierung, Browser + Server, `validation.ts`)

**Vorschläge** (neue Abstimmung: 2–4; Hinzufügen: Summe ≤ 4)
- Datum und Startzeit Pflicht, Endzeit optional, `HH:mm`.
- Datum nicht in der Vergangenheit (Vergleich mit heutigem Datum).
- Keine zwei Vorschläge mit gleichem Datum + Startzeit (auch nicht gegen bestehende).
- Endzeit = Startzeit: Fehler. Endzeit früher als Startzeit = „bis nach
  Mitternacht“ → beim Festlegen `eventEndDate = Datum + 1 Tag`.

**Fester Termin** – Datum + Startzeit Pflicht, Endzeit optional; Prüfung über
das bestehende `validateEventSchedule` (Mitternachtsfall über Enddatum wie oben).

**Stimme** – `name` (Regeln wie Gastname), `optionIds` (nur Vorschläge dieses
Events, ohne Duplikate), `noneFit`. Genau eins: mindestens ein Vorschlag
**oder** `noneFit`. Meldung: „Bitte wähle mindestens einen Termin oder
‚Nichts davon passt‘.“

## Oberfläche

### Fenster „Termin“ (Owner, Stift am Datum)

> **Änderung 2026-10-08:** Der Termin-Block steht nicht mehr in „Event
> erstellen“ / „Event-Einstellungen“, sondern in einem eigenen Fenster, das
> der Owner über den Stift am Datum auf der Event-Seite öffnet – in allen
> drei Status. Neue Events starten mit „Noch kein Termin bekannt“. Die
> direkte Bearbeitung von Datum/Uhrzeit auf der Seite entfällt; „Fester
> Termin“ hat dafür ein optionales „bis Datum“ für mehrtägige Events
> (`endDate` im Request). Der Einstellungen-Button neben dem Logo zeigt ein
> Zahnrad.
>
> **Änderung 2026-10-08 (2):** Die Uhrzeit ist bei Vorschlägen und beim
> festen Termin optional (`date_poll_options.start_time` nullable). „bis“
> nur zusammen mit „von“. Vorschlag ohne Uhrzeit: Label „Sa. 17.10.“;
> Zusagen daraus bekommen keine Ankunftszeit.

Neuer Block **„Termin“** mit drei Optionen (Radio):
○ Noch kein Termin bekannt · ○ Termin abstimmen lassen · ○ Fester Termin.
Beim Erstellen nichts vorausgewählt, Pflicht.

- **Noch kein Termin bekannt** – keine weiteren Felder.
- **Termin abstimmen lassen, neue Abstimmung** – 2–4 Zeilen (Datum, von, bis
  optional), „+ Termin hinzufügen“ (verschwindet bei 4), Papierkorb pro Zeile
  solange nicht gespeichert.
- **Termin abstimmen lassen, laufende Abstimmung** – Liste der Vorschläge mit
  „✓ n“; **„+ Termin hinzufügen“** (bis max. 4, Stimmen bleiben);
  **„Abstimmung neu machen“** (Rückfrage „Alle n Stimmen werden gelöscht.“,
  danach leere Zeilen). Kein Löschen einzelner Vorschläge.
- **Fester Termin** – Datum, von, bis (Datum + von Pflicht). Aus einer
  Abstimmung kommend: die Vorschläge darüber zum Antippen
  („Sa. 12.07. · 15–18 Uhr (✓ 4)“) – füllt die Felder; bleiben sie
  unverändert, wird `fromOptionId` mitgeschickt. Bei abweichendem Datum Hinweis
  „Die Stimmen der Abstimmung verfallen.“
- **Rückwärts-Wechsel** – Bestätigung mit Zahlen („Die Gästeliste mit 7
  Einträgen wird gelöscht.“ / „Die 6 Stimmen werden gelöscht.“).

### Event-Seite

- **`unknown`**: Datum/Uhrzeit „Termin folgt“ (nicht inline editierbar, keine
  Kalender-Links); statt Gästeliste: „Der Termin steht noch nicht fest. Sobald
  er feststeht, kannst du dich hier eintragen.“
- **`poll`**: Datum/Uhrzeit „Wird abgestimmt“ (nicht inline editierbar, keine
  Kalender-Links); statt Gästeliste Bereich **„Wann passt es dir?“**:
  - Desktop: Tabelle – Spalten = Vorschläge („Sa. 12.07. · 15:00–18:00“),
    Zeilen = Teilnehmer, Zellen ✓ / – / ?; „Nichts davon passt“ in der Zeile
    markiert; Fußzeile Anzahl ✓; Vorschlag(e) mit den meisten ✓ hervorgehoben;
    Bearbeiten/Löschen pro Zeile.
  - Mobile: Karte pro Vorschlag (Datum, Uhrzeit, „✓ n“, Namen), darunter
    „Nichts davon passt: …“ und die Teilnehmerliste mit Bearbeiten/Löschen.
  - Button **„Abstimmen“** → Dialog: Name, Checkbox pro Vorschlag, Trenner,
    Checkbox **„Nichts davon passt“** (schließt die anderen aus und umgekehrt),
    reCAPTCHA (nicht für Owner), Button **„Auswahl bestätigen“**.
  - Owner: pro Vorschlag **„Diesen Termin festlegen“** → Bestätigung
    („Sa. 12.07., 15:00–18:00 Uhr festlegen? 3 Zusagen und 2 Absagen werden in
    die Gästeliste übernommen. Die Abstimmung wird beendet.“) → wie
    `poll` → `fixed` mit `fromOptionId`.
- **`fixed`**: wie heute.

### Einladungstext und Linkvorschau

| Status | „Wann:“-Zeile | Vorschau-Beschreibung |
|---|---|---|
| `unknown` | „Wann: Termin folgt“ | „Du bist eingeladen! Der Termin folgt.“ |
| `poll` | „Wann: wird abgestimmt – bitte stimmt über den Link ab“ | „Du bist eingeladen! Stimme ab, wann es dir passt.“ |
| `fixed` | wie heute | wie heute |

Passwortgeschützte Events: Vorschau bleibt wie im Passwort-Spec (nur Titel).
OG-Bild bei `unknown`/`poll` ohne Datum.

## API

### `PUT /api/events/[id]/date-mode` (nur Owner)

Body:
- `{ mode: "unknown", confirm? }`
- `{ mode: "poll", proposals: Proposal[], confirm? }` – neue Abstimmung bzw. „neu machen“
- `{ mode: "poll", addProposals: Proposal[] }` – nur bei laufender Abstimmung
- `{ mode: "fixed", date, startTime, endTime, fromOptionId?, confirm? }`

`Proposal = { date: "YYYY-MM-DD", startTime: "HH:mm", endTime: "HH:mm" | null }`

- Würde der Wechsel Gäste oder Stimmen löschen (inkl. verfallender Stimmen bei
  `fixed` ohne `fromOptionId`) und `confirm` fehlt: `409`
  `{ error, needsConfirm: true, guests?: n, votes?: n }`.
- Eine Transaktion: Status, Datum/Uhrzeit + Labels (`formatDateRangeLabel`,
  `formatTimeLabel`; bei `unknown`/`poll` geleert), Vorschläge/Stimmen,
  Gäste löschen (von `fixed` rückwärts), Übernahme (bei `fromOptionId`).
- `fromOptionId` muss ein Vorschlag dieses Events sein und zu `date`/`startTime`/`endTime` passen.

### `GET/POST /api/events/[id]/poll-votes`, `PATCH/DELETE /api/events/[id]/poll-votes/[voteId]`

- `GET` → `{ options: PollOptionDto[], votes: PollVoteDto[] }`; pro Stimme und
  Vorschlag Status `yes` | `no` | `unseen` (serverseitig berechnet).
- `POST`/`PATCH` mit `{ name, optionIds, noneFit, recaptchaToken }`.
- Passwortschutz (`denyLockedEvent` → 403), reCAPTCHA außer Owner,
  Status ≠ `poll` → `409` „Die Abstimmung ist beendet.“

### Bestehende Endpunkte

- Gäste `POST`/`PATCH`: nur bei `fixed`, sonst `409` „Der Termin steht noch nicht fest.“
- `PATCH /api/events/[id]` mit `eventDate`/`eventEndDate`/`eventStartTime`/`eventEndTime`:
  nur bei `fixed`, sonst `409`.
- `POST /api/events` nimmt `dateMode` + ggf. `proposals` bzw. Termin an (Erstellen-Dialog).

## E-Mails an den Owner

Bei jeder Aktion eines Nicht-Owners (wie Gästeliste):

| Aktion | Betreff | Text |
|---|---|---|
| neue Stimme | „Neue Stimme bei deinem Event „X““ | „„Anna“ hat abgestimmt: Sa. 12.07. 15:00, So. 13.07. 18:00“ bzw. „… Nichts davon passt“ |
| geändert | „Geänderte Stimme bei deinem Event „X““ | „„Anna“ hat die Auswahl geändert: …“ |
| gelöscht | „Stimme bei deinem Event „X“ entfernt“ | „„Anna“ wurde aus der Terminabstimmung entfernt.“ |

Plus Link zur Event-Seite. Festlegen/Statuswechsel durch den Owner: keine Mail.

## Texte & Recht

- Datenschutz, Abschnitt „Anmeldung als Gast“: Unterabschnitt
  „Terminabstimmung“ (Name, gewählte Termine; sichtbar wie die Gästeliste; bei
  Festlegung Übernahme als Zu-/Absage).
- Marketing-Texte (FAQ, `FEATURES`, passende Anlass-Seiten) nach der Umsetzung.

## Tests

- Validierung: Vorschläge (Anzahl, Pflicht, Vergangenheit, Duplikate,
  Mitternacht), Stimme (Name, Auswahl, Ausschluss „Nichts davon passt“).
- Statuswechsel-Service: jeder Übergang der Tabelle, `409` mit Zahlen ohne
  `confirm`, Übernahme ✓/–/„?“, Mitternachts-Enddatum, `fromOptionId`-Prüfung.
- Abstimmungs-Service: Status-Prüfung, Passwortschutz, reCAPTCHA, E-Mails,
  `unseen`-Berechnung.
- Einladungstext: drei Status.
- Browser: Event lokal mit simulierten Daten, danach echtes Test-Event (nach
  Rückfrage, lokal = Produktions-DB).

## Nicht Teil dieses Features

Stichtag/Deadline, Erinnerungen an Teilnehmer, mehrtägige Vorschläge, einzelne
Vorschläge löschen oder ändern, automatisches Festlegen, Benachrichtigung der
Teilnehmer beim Festlegen.
