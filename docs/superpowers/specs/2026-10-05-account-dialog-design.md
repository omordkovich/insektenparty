# „Mein Konto“-Dialog (Name, Passwort, Konto löschen)

**Datum:** 2026-10-05
**Status:** Design genehmigt

## Ziel

Eingeloggte Nutzer verwalten ihr Konto selbst. Auf der Startseite ersetzt der
Button „Mein Konto“ den Logout-Button und öffnet einen Dialog. Konten mit
Google-Anmeldung (siehe `2026-10-05`-Google-Login) werden sinnvoll behandelt.

## Dialog (`AccountDialog`)

Übersicht: Anmeldeart oben, Zeilen „Name“ und „Passwort“ mit „Ändern“, „E-Mail“
nur als Anzeige (die E-Mail-Adresse ist nicht änderbar), unten „Logout“ und „Konto löschen“ (rot). Jede Aktion öffnet eine
eigene Ansicht im selben Dialog.

| Aktion | Umsetzung |
|---|---|
| Anzeigename ändern (nur Konten ohne Google) | `auth.updateUser({ data: { name } })`, validiert mit `validatePersonName`; danach `refreshSession()` + `router.refresh()`, weil die Startseite den Namen aus dem JWT liest. |
| Passwort ändern | Wie „Passwort vergessen“: `resetPasswordForEmail` an die Konto-Adresse, Rücksprung auf `/auth/reset-password`. Kein neues Formular. |
| Konto löschen | Warnansicht: listet auf, was gelöscht wird (Login, alle Events, alle Gästelisten, Freischaltungen), „nicht rückgängig zu machen“, Buttons „Abbrechen“ / „Konto endgültig löschen“. Danach `POST /auth/delete-account`. |

## Google-Konten

| | Mit Google-Identität | Nur E-Mail |
|---|---|---|
| Anzeige | „Angemeldet mit Google“ | „Angemeldet mit E-Mail“ |
| Passwort | „Passwort festlegen“, solange keine E-Mail-Identität existiert (ergänzt E-Mail-Login) | „Passwort ändern“ |
| Löschen | wie oben | wie oben |

## Konto löschen (Server)

- `src/app/auth/delete-account/route.ts`, `POST`, JSON `{ "confirm": true }`.
  Reiner JSON-Body ist zugleich der CSRF-Schutz (Cross-Site-Formulare können
  keinen `application/json`-Body senden).
- Ohne Session → 401, ohne `confirm: true` → 400.
- Löschen per `delete from auth.users where id = …` über die vorhandene
  DB-Verbindung (`user-repository.deleteUser`), wie schon die Lesezugriffe auf
  `auth.users`. Es ist kein Service-Role-Key nötig. `events`, `guests`,
  `user_entitlements`, `profiles`, Identitäten und Sessions hängen per
  `on delete cascade` an `auth.users`.
- Danach `signOut()` (Cookies löschen; Fehler wird ignoriert, der Nutzer
  existiert nicht mehr), Antwort `{ ok: true }`, der Client lädt `/`.
- Datenschutzerklärung: „formlos per E-Mail“ → auch Selbstlöschung im Konto.

## Bewusst weggelassen

- Erneute Anmeldung vor sensiblen Aktionen (bei Google-Konten gibt es kein
  Passwort zum Nachfragen).
- Bestätigungsmail nach dem Löschen.
- Aufbewahrungspflichten für Rechnungen: erst relevant, wenn es Zahlungen gibt.

## Dateien

Neu: `AccountDialog.tsx` (+ Unteransichten), `AccountButton.tsx`,
`auth/delete-account/route.ts` (+ Test), `lib/account.ts` (+ Test).
Geändert: `user-repository.ts`, `app/page.tsx`, `PrivacyPolicyContent.tsx`.

## Anzeigename (nachträgliche Entscheidung)

- Der Anzeigename ist immer `name` in den Nutzer-Metadaten (`lib/account.ts`
  → `getAccountName`, gleiche Regel als SQL in `user-repository.ts`). Es gibt
  kein zweites Namensfeld.
- Konten ohne Google-Identität: Der Name wird bei der Registrierung eingegeben
  und kann in „Mein Konto“ geändert werden.
- Google-Konten: Der Name kommt von Google (Supabase schreibt ihn bei jedem
  Login nach `name`). In „Mein Konto“ ist er nicht änderbar; ein Hinweis
  erklärt, dass er im Google-Konto geändert wird. Bei der Google-Registrierung
  (Registrieren-Tab) wird nur die Zustimmung abgefragt (AGB, Alter), kein Name.
- Die Zustimmung geht über ein kurzlebiges Cookie (`gz_google_consent`, Path
  `/auth/callback`, 10 Minuten, nur das Häkchen) an `/auth/callback`; der
  Callback trägt sie nach, falls sie fehlt. Kein `?consent=1` an der Redirect-
  URL: Supabase lässt nur Redirect-URLs zu, die exakt auf der Allow-List
  stehen, mit Query fiel es auf die Site URL zurück und der Callback lief nie. Erster Google-Login im Login-Tab: der
  `ConsentDialog` fragt die Zustimmung ab (`POST /auth/consent`).
- Öffentliche Info-Seite eines Events: ohne Namen „einem Nutzer“, nie die
  E-Mail-Adresse.
- Eine E-Mail-Änderung gibt es bewusst nicht (E-Mail ist der Login).
- Keine Sonderbehandlung für Altkonten (nur Testnutzer).
