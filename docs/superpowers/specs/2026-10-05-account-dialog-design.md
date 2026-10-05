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
| Anzeigename ändern | `auth.updateUser({ data: { display_name } })`, validiert mit `validatePersonName`; danach `refreshSession()` + `router.refresh()`, weil die Startseite den Namen aus dem JWT liest. |
| Passwort ändern | Wie „Passwort vergessen“: `resetPasswordForEmail` an die Konto-Adresse, Rücksprung auf `/auth/reset-password`. Kein neues Formular. |
| Konto löschen | Warnansicht: listet auf, was gelöscht wird (Login, alle Events, alle Gästelisten, Freischaltungen), „nicht rückgängig zu machen“, Buttons „Abbrechen“ / „Konto endgültig löschen“. Danach `POST /auth/delete-account`. |

## Google-Konten

| | Mit Google-Identität | Nur E-Mail |
|---|---|---|
| Anzeige | „Angemeldet mit Google“ | „Angemeldet mit E-Mail“ |
| Name | änderbar | änderbar |
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

- Es gibt genau ein Namensfeld, das die App liest: `display_name` in den
  Nutzer-Metadaten (`lib/account.ts` → `getAccountName`, SQL in
  `user-repository.ts`). `name` wird nie gelesen: Google überschreibt es bei
  jedem Login, und der Google-Name soll nicht ungefragt übernommen werden.
- Registrierung per E-Mail schreibt `display_name` (nicht mehr `name`).
- Registrierung per Google (Registrieren-Tab) verlangt Anzeigename und
  AGB/Alter vor dem Klick. Beides geht per kurzlebigem Cookie
  (`lib/signup-intent.ts`, Path `/auth/callback`, 10 Minuten, base64url-JSON)
  an `/auth/callback`, nicht per URL. Der Callback trägt nur nach, was fehlt.
- Erster Google-Login im Login-Tab: Der `ConsentDialog` fragt Anzeigename (falls
  keiner existiert) und Zustimmung ab; `POST /auth/consent` speichert beides.
- Öffentliche Info-Seite eines Events: ohne Anzeigenamen „einem Nutzer“, nie die
  E-Mail-Adresse.
- Supabase speichert Googles Profildaten (Name, Bild) trotzdem in
  `raw_user_meta_data` und `auth.identities`; wir lesen und zeigen sie nicht.
- Eine E-Mail-Änderung gibt es bewusst nicht (E-Mail ist der Login).

## Einmalige Datenübernahme

Bestehende E-Mail-Konten haben ihren Namen noch unter `name`:

```sql
update auth.users
set raw_user_meta_data = raw_user_meta_data || jsonb_build_object('display_name', raw_user_meta_data ->> 'name')
where coalesce(raw_user_meta_data ->> 'display_name', '') = ''
  and coalesce(raw_user_meta_data ->> 'name', '') <> ''
  and not (coalesce(raw_app_meta_data -> 'providers', '[]'::jsonb) ? 'google');
```
