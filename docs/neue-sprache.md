# Eine neue Sprache hinzufügen

Beispiel: Französisch (`fr`). Die Seite ist so gebaut, dass für eine neue
Sprache **keine neuen Routen und keine Code-Weichen** nötig sind – nur
Einträge in Tabellen und neue Textdateien. TypeScript zeigt dir, was noch
fehlt.

## 1. Sprache eintragen

In `src/i18n/config.ts`:

- `LOCALES` um `"fr"` ergänzen,
- `INTL_FORMAT_LOCALE` (`"fr-FR"`), `OG_LOCALE` (`"fr_FR"`) und
  `LOCALE_NAMES` (`"Français"`) ergänzen.

Die URL-Präfixe (`/fr/...`), das Sprachmenü, die Sprachauswahl beim Event,
die Sitemap, hreflang, das Sprach-Cookie und die Browser-Erkennung ergeben
sich daraus von selbst.

## 2. TypeScript als Checkliste

```bash
npx tsc --noEmit
```

Jeder Fehler ist eine Tabelle `Record<Locale, …>`, in der der Eintrag für
`fr` fehlt. Stand heute (18 Dateien):

| Was | Wo |
|---|---|
| Oberflächentexte | `messages/fr.json` anlegen (Kopie von `en.json` übersetzen), in `src/i18n/messages.ts` eintragen |
| Datum, Uhrzeit, Preis, Kapazität, Teilen | `src/lib/calendar.ts`, `date-poll.ts`, `products.ts`, `guest-capacity.ts`, `share.ts`, `validation.ts`, `invitation-text.ts` |
| Design-Namen | `src/lib/theme-presets.ts` (fehlende Namen bleiben deutsch) |
| Startseite: Beschreibung, FAQ, Funktionen | `src/lib/site.ts`, `faq.ts`, `structured-data.ts` |
| Anlass-Seiten | Texte in neuer Datei `src/lib/occasions-fr.ts` (wie `occasions-en.ts`), eingetragen in `src/lib/occasions.ts`; Bereichsname und je Anlass ein Slug in `src/lib/occasion-slugs.ts` |
| llms.txt | Abschnitt für die Sprache in `src/app/llms.txt/route.ts` |
| Rechtstexte | Übersetzung von Impressum, Datenschutz, AGB und Widerruf in `src/components/legal/` (`ImprintFr.tsx` usw., in `index.ts` und `LegalLink.tsx` eintragen), Titel und Beschreibung in `src/lib/legal-documents.ts` |

Die Tests prüfen dazu, dass `fr.json` genau dieselben Schlüssel und
Platzhalter wie `de.json` hat, jede Sprache für jeden Anlass einen
gültigen, eindeutigen Slug, und dass jeder Rechtstext in jeder Sprache
dieselben Abschnitte, Absätze, Listenpunkte und Links hat wie der deutsche
(`legal-parity.test.ts`).

Für die Anlass-Texte gilt der SEO-Skill (`optimizing-seo-aeo-geo`): echte
Suchfragen in der Sprache recherchieren, nicht übersetzen. Bereichsname
und Slugs sind öffentliche URLs – nach dem Livegang nicht mehr ändern.

## 3. Außerhalb des Codes

- **Datenbank:** Die Regel `events_language_check` erlaubt nur die
  bekannten Sprachen. Neue Migration in `supabase/migrations/`, z. B.:

  ```sql
  alter table public.events drop constraint events_language_check;
  alter table public.events
    add constraint events_language_check
    check (language in ('de', 'en', 'ru', 'fr'));
  ```

  Sie muss **vor** dem Deploy eingespielt sein, sonst schlägt das Speichern
  eines französischen Events fehl.
- **Datenschutzerklärung** (`src/components/legal/Privacy*.tsx`, in allen
  Sprachen, Abschnitt 5 „Sprach-Cookie“): die Liste der Sprachen ergänzen
  und `PRIVACY_VERSION` in `src/lib/legal-info.ts` auf das Datum setzen.
- **Supabase-Mails** (Registrierung, Passwort-Reset): in jeder Vorlage
  einen Zweig `{{ else if eq .Data.locale "fr" }}…` vor dem `{{ else }}`
  (Deutsch) ergänzen – siehe `docs/supabase-auth-mail-templates.md`.

## 4. Rechtstexte und was deutsch bleibt

Impressum, Datenschutz, AGB und Widerruf gibt es in jeder Sprache; über
der Übersetzung steht, dass nur die deutsche Fassung verbindlich ist.
**Jede Änderung an einem Rechtstext wird in allen Sprachen gleichzeitig
gemacht** – nie erst Deutsch und die Übersetzung „später“. Das Datum
(`PRIVACY_VERSION`, `TERMS_VERSION`, `WITHDRAWAL_VERSION` in
`src/lib/legal-info.ts`) gilt für alle Sprachen gemeinsam.

Texte der Gastgeber werden nie übersetzt. Die Seite `/vergleich` und
„Über uns“ gibt es nur auf Deutsch (unter `/fr/...` mit Hinweis und
`noindex`).

## 5. Prüfen

```bash
npx tsc --noEmit
```

```bash
npm test
```

```bash
npx tsx .claude/skills/optimizing-seo-aeo-geo/scripts/audit-occasions.mts
```

```bash
npm run build
```

Danach im Browser: Sprachmenü, `/fr`, `/fr/<bereich>/<slug>`, Event in der
neuen Sprache anlegen und die Event-Seite ansehen.
