# Passwortgeschützte Events

**Datum:** 2026-10-08
**Status:** Design genehmigt

## Ziel

Der Owner kann ein Event mit einem Passwort schützen. Nur wer das Passwort
kennt (oder der eingeloggte Owner), sieht die Event-Seite und die Gästeliste.
Wer kein Passwort hat, landet auf einer Sperrseite und kann es per E-Mail beim
Owner anfragen. Es ist bewusst ein **Sichtschutz**, kein Hochsicherheits-Schutz
(Mindestlänge 4 Zeichen).

## Entscheidungen

| Frage | Entscheidung |
|---|---|
| Wie wird freigeschaltet? | Signiertes HttpOnly-Cookie pro Event, serverseitig geprüft (keine anonymen Supabase-Sessions, kein reines Ausblenden im Browser). |
| Speicherung des Passworts | Klartext in `events.access_password` – der Owner braucht es im Einladungstext. Es ist ein geteiltes Event-Passwort, kein Konto-Passwort; es verlässt den Server nur in Richtung Owner. |
| Wo stellt der Owner es ein? | Beim Erstellen im Event-Dialog; beim Bearbeiten im bisherigen „Design ändern“-Dialog, der zu „Event-Einstellungen“ wird. |
| Was sehen Gesperrte? | Nur den Event-Titel (Sperrseite, Linkvorschau, OG-Bild) – kein Datum, kein Ort, keine Gäste, keine Kontaktdaten. |
| „Passwort anfragen“ | Formular → Gastzilla schickt eine Mail an die Konto-E-Mail des Owners. Der Gast gibt E-Mail **oder** Telefon (mit Kanal SMS/WhatsApp/Telegram/Sonstiges) an; bei E-Mail mit `Reply-To` auf den Gast. Kein `mailto:`. |

## Datenmodell

- Neue Spalte `events.access_password text null`; `null` = nicht geschützt.
  Migration `supabase/migrations/2026-10-08-add-event-access-password.sql`
  (additiv, mit altem Code verträglich) + Eintrag in `src/db/schema.ts`.
- Das Passwort erscheint nie in öffentlichen Antworten (Gäste-API,
  Metadaten, OG-Bild, Sperrseite). An den Client geht es nur auf der
  Event-Seite des eingeloggten Owners (Event-Dialog, Einladungstext).
  Geprüft: Die einzigen APIs, die Event-Zeilen zurückgeben (`POST /api/events`
  → nur `slug`, `PATCH /api/events/[id]`), sind Owner-only.

## Validierung (`src/lib/validation.ts`, Browser + Server)

- `trim()`, mindestens 4, höchstens 100 Zeichen, sonst keine Regeln.
- Im Dialog zusätzlich: „Passwort“ und „Passwort wiederholen“ müssen gleich sein.
- Meldungen: „Das Passwort muss mindestens 4 Zeichen lang sein.“,
  „Das Passwort darf höchstens 100 Zeichen lang sein.“,
  „Die Passwörter stimmen nicht überein.“
- Event anlegen (`POST /api/events`) und ändern (`PATCH /api/events/[id]`)
  nehmen `accessPassword: string | null` an; `null` hebt den Schutz auf.

## Freischalt-Cookie (`src/lib/event-access.ts`)

- Name `gz_event_<eventId>`, Wert `HMAC-SHA256(EVENT_UNLOCK_SECRET, eventId + ":" + accessPassword)`
  (base64url). HttpOnly, Secure (außer lokal), SameSite=Lax, Path=/, Max-Age 180 Tage.
- Prüfung zeitkonstant (`crypto.timingSafeEqual`). Passwort geändert →
  Signatur passt nicht mehr → alle bisherigen Freischaltungen ungültig.
- Neue Umgebungsvariable `EVENT_UNLOCK_SECRET` (lokal `.env.local`,
  `.env.example`, Vercel). Fehlt sie, schlägt das Freischalten mit
  Serverfehler fehl (geschützte Events bleiben gesperrt, nie offen).
- `hasEventAccess(event, cookies, userId)`: `true`, wenn das Event nicht
  geschützt ist, der Nutzer der Owner ist oder ein gültiges Cookie vorliegt.

## Zugriffsschutz

| Stelle | Ohne Zugang bei geschütztem Event |
|---|---|
| `/event/[slug]` | Sperrseite statt Event (URL bleibt) |
| `GET/POST/PATCH/DELETE /api/events/[id]/guests…` | `403` „Dieses Event ist passwortgeschützt.“ |
| `generateMetadata` (Layout) | Titel „Einladung: *Titel*“, Beschreibung „Passwortgeschützte Einladung – öffne den Link und gib das Passwort ein.“, kein Datum |
| `opengraph-image` | nur Titel, ohne Datum/Ort |
| `/event/[slug]/info` | unverändert (Owner-Name, Erstellt-Datum) |

Metadaten und OG-Bild prüfen nur „geschützt ja/nein“, nicht das Cookie –
Crawler von WhatsApp & Co. haben ohnehin keins.

## Freischalten: `POST /api/events/[id]/unlock`

- Body `{ password }`. Richtig → Cookie setzen, `200`. Falsch → nach kurzer
  Verzögerung (~500 ms) `401` „Das Passwort ist leider falsch.“
- Nicht geschütztes Event → `200` ohne Cookie. Unbekanntes Event → `404`.
- Kein reCAPTCHA (Gäste sollen nur das Passwort eingeben).

## Owner-Oberfläche

### Event-Dialog (`EventDialog.tsx`)

- Modus `create`: unter dem Design-Raster Checkbox **„Passwortgeschützt“** mit ⓘ-Button.
- Modus `theme` wird zu `settings`: Titel „Event-Einstellungen“, Design + derselbe
  Passwort-Block. Der Stift-Button heißt „Event-Einstellungen“.
- Checkbox an → zwei `PasswordInput`-Felder (Auge rechts) „Passwort“ und
  „Passwort wiederholen“. Beim Bearbeiten mit dem aktuellen Passwort vorbefüllt
  (verdeckt).
- Checkbox aus + speichern → Schutz aufgehoben. Gespeichert wird nur, was sich
  geändert hat (Design und/oder Passwort).

### Tooltip (ⓘ)

Klick/Tap öffnet eine Sprechblase (kein reines `title`, damit es auf Handys
funktioniert), schließt per Klick daneben oder Esc, `aria-expanded` /
`aria-describedby`. Text:

> Nur wer das Passwort kennt, sieht deine Event-Seite und die Gästeliste.
> **Teile das Passwort deinen Gästen mit** – am einfachsten zusammen mit dem
> Einladungslink. Im Einladungstext fügen wir es automatisch ein. Wer es nicht
> hat, kann es auf der Event-Seite bei dir anfragen; du bekommst dann eine E-Mail.

### Einladungstext (`invitation-text.ts`)

- `InvitationFacts.password: string | null`.
- Geschützt → feste, nicht editierbare Zeile direkt nach dem Link:
  „Passwort für die Event-Seite: *xyz*“. Ungeschützt → keine Zeile.
- Das Passwort kommt nur bei `isOwner` von der Event-Seite in den Footer.

### Hinweis auf der eigenen Event-Seite

Kleines Schloss-Badge „Passwortgeschützt“ beim Teilen-Bereich, nur für den Owner.

## Sperrseite (`EventLockedPage`)

- GASTZILLA-Logo (wie `SiteHeader`, nicht im Event-Theme), Überschrift
  „Einladung: *Titel*“, Infotext „Dieses Event ist passwortgeschützt. Gib das
  Passwort ein, das du vom Gastgeber bekommen hast.“
- `PasswordInput` + Button **„Event öffnen“** → `/unlock` → `router.refresh()`.
- Darunter Button **„Passwort anfragen“**.
- Dezenter Link „Du bist der Gastgeber? Anmelden“ → vorhandener Login-Dialog.
- `noindex` bleibt (Layout).

## Passwort anfragen: `POST /api/events/[id]/password-request`

### Dialog

1. **Name** (Pflicht, Regeln wie Gastname).
2. **„Wie soll dir der Gastgeber das Passwort schicken?“** – Radio, Pflicht,
   nichts vorausgewählt:
   - **E-Mail** → Feld **E-Mail-Adresse** (Pflicht, `emailSchema`).
   - **Telefon** → Feld **Telefonnummer** (Pflicht) und darunter Radio
     **„Per“: SMS · WhatsApp · Telegram · Sonstiges** (Pflicht).
     „Sonstiges“ blendet ein Pflicht-Textfeld ein („Wie genau?“, max. 100 Zeichen,
     z. B. „Signal“ oder „Anruf“).
3. **Nachricht** (optional, max. 500 Zeichen).
4. **reCAPTCHA** (wie Gast-Formular; ohne Cookie-Zustimmung derselbe Hinweis).

Nicht gewählte Felder werden ausgeblendet und nicht mitgeschickt.

### Validierung (`validatePasswordRequest` in `validation.ts`, Browser + Server)

- Request-Form als diskriminierte Union:
  `{ name, contact: { kind: "email", email } | { kind: "phone", phone, channel, channelOther? }, message? }`
  mit `channel ∈ "sms" | "whatsapp" | "telegram" | "other"`.
- Telefonnummer locker: nur Ziffern, Leerzeichen, `+ - / ( )`; nach Entfernen
  der Trennzeichen 6–20 Ziffern, optional mit führendem `+`. Meldung:
  „Bitte gib eine gültige Telefonnummer ein.“
- Fehlt die Wahl: „Bitte wähle, wie du das Passwort bekommen möchtest.“;
  fehlt der Kanal: „Bitte wähle, wie du das Passwort per Telefon bekommen möchtest.“;
  „Sonstiges“ leer: „Bitte gib an, wie du das Passwort bekommen möchtest.“

### Server und Mail

- reCAPTCHA prüfen, validieren, Owner-E-Mail über `getUserContact(ownerId)`
  holen, Mail senden. `sendEmail` bekommt optionales `replyTo`.
- Betreff immer: „Passwort-Anfrage für „*Titel*““.
- **E-Mail gewählt** (`Reply-To` = Gast):
  „„*Name*“ möchte das Passwort für dein Event „*Titel*“ per E-Mail an *E-Mail*.“
  … „Antworte einfach auf diese E-Mail, um *Name* das Passwort zu schicken.“
- **Telefon gewählt** (kein `Reply-To`):
  „„*Name*“ möchte das Passwort für dein Event „*Titel*“ per *SMS / WhatsApp /
  Telegram / Freitext* an *Telefonnummer*.“
- Beide: ggf. „Nachricht: …“ und „Event ansehen: *Link*“.
- Erfolg: „Deine Anfrage wurde an den Gastgeber geschickt. Er meldet sich bei dir.“
- Event nicht (mehr) geschützt → `409` mit Hinweis, Seite neu laden. Owner ohne
  E-Mail → `503` „Die Anfrage konnte nicht zugestellt werden.“
- E-Mail-Adresse bzw. Telefonnummer des Gastes werden **nicht gespeichert**.

## Texte & Recht

- Datenschutzerklärung: neuer Abschnitt „Passwort-Anfrage“ (Name, E-Mail
  oder Telefonnummer mit gewünschtem Kanal, Nachricht; einmalige Weiterleitung an den Veranstalter per E-Mail; keine
  Speicherung bei uns; Rechtsgrundlage Art. 6 Abs. 1 lit. b/f DSGVO) und im
  Cookie-Abschnitt das technisch notwendige Freischalt-Cookie `gz_event_*`
  (180 Tage). Stand-Datum aktualisieren.
- Marketing-Texte (Startseite, FAQ, `FEATURES`, passende Anlass-Seiten):
  „Optional mit Passwortschutz“ – nach der Umsetzung, analog zur Absage-Funktion.

## Tests

- Unit: Passwort-Validierung; Anfrage-Validierung (E-Mail/Telefon, Kanal,
  „Sonstiges“, Telefonformat); Cookie-Signatur (gültig, andere Event-ID,
  geändertes Passwort, manipulierter Wert, fehlendes Secret);
  `invitationLines` mit/ohne Passwort.
- Service: Freischalten (richtig/falsch/ungeschützt), Passwort-Anfrage
  (Validierung, nicht geschützt, Owner ohne E-Mail) analog zu `event-service.test.ts`.
- Browser: Sperrseite, Freischalten, `403` der Gäste-API ohne Cookie,
  Owner-Dialog, Einladungstext. Dafür ein eigenes Test-Event, das danach
  wieder gelöscht wird (lokal läuft die Produktions-DB).

## Nicht Teil dieses Features

- Rate-Limiting über die kurze Verzögerung hinaus.
- Automatisches Versenden des Passworts an anfragende Gäste.
- Direkt-Links in der Owner-Mail (z. B. `wa.me/…`) – dafür müsste die
  Telefonnummer ins internationale Format gebracht werden.
- Passwortschutz für `/event/[slug]/info`.
