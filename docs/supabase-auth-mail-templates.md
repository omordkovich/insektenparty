# Supabase-Auth-Mails mehrsprachig (DE/EN/RU)

Die Mails für Registrierung und Passwort-Reset verschickt Supabase selbst –
ihre Vorlagen liegen im Dashboard, nicht im Repo:
**Supabase → Authentication → Emails → Templates**.

Seit der Mehrsprachigkeit speichert GASTZILLA die gewählte Sprache in den
Nutzer-Metadaten (`user_metadata.locale`, `"de"`, `"en"` oder `"ru"`). In den
Vorlagen ist sie als `{{ .Data.locale }}` verfügbar. Konten ohne Sprache
(alle Konten von vor der Umstellung) bekommen weiter Deutsch.

Kommt eine weitere Sprache dazu (`docs/neue-sprache.md`), bekommt jede
Vorlage einen Zweig `{{ else if eq .Data.locale "<code>" }}` vor dem
`{{ else }}`.

Der deutsche Zweig unten ist ein Vorschlag. **Wenn deine aktuelle deutsche
Vorlage anders formuliert ist, übernimm deren Text in den `{{ else }}`-Zweig**
und ergänze nur den englischen und den russischen Teil.

---

## Confirm signup

**Subject**

```
{{ if eq .Data.locale "en" }}Confirm your GASTZILLA account{{ else if eq .Data.locale "ru" }}Подтвердите аккаунт GASTZILLA{{ else }}Bestätige dein GASTZILLA-Konto{{ end }}
```

**Body (HTML)**

```html
{{ if eq .Data.locale "en" }}
<h2>Welcome to GASTZILLA!</h2>
<p>Please confirm your email address to activate your account:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm email address</a></p>
<p>The link is valid for 1 hour. If you didn't sign up, you can ignore this email.</p>
{{ else if eq .Data.locale "ru" }}
<h2>Добро пожаловать в GASTZILLA!</h2>
<p>Пожалуйста, подтвердите свой адрес e-mail, чтобы активировать аккаунт:</p>
<p><a href="{{ .ConfirmationURL }}">Подтвердить адрес e-mail</a></p>
<p>Ссылка действует 1 час. Если вы не регистрировались, просто проигнорируйте это письмо.</p>
{{ else }}
<h2>Willkommen bei GASTZILLA!</h2>
<p>Bitte bestätige deine E-Mail-Adresse, um dein Konto zu aktivieren:</p>
<p><a href="{{ .ConfirmationURL }}">E-Mail-Adresse bestätigen</a></p>
<p>Der Link ist 1 Stunde gültig. Wenn du dich nicht registriert hast, kannst du diese E-Mail ignorieren.</p>
{{ end }}
```

## Reset password

**Subject**

```
{{ if eq .Data.locale "en" }}Reset your GASTZILLA password{{ else if eq .Data.locale "ru" }}Сброс пароля GASTZILLA{{ else }}Passwort für GASTZILLA zurücksetzen{{ end }}
```

**Body (HTML)**

```html
{{ if eq .Data.locale "en" }}
<h2>Reset your password</h2>
<p>Click the link to choose a new password:</p>
<p><a href="{{ .ConfirmationURL }}">Choose a new password</a></p>
<p>If you didn't request this, you can ignore this email – your password stays the same.</p>
{{ else if eq .Data.locale "ru" }}
<h2>Сброс пароля</h2>
<p>Перейдите по ссылке, чтобы выбрать новый пароль:</p>
<p><a href="{{ .ConfirmationURL }}">Выбрать новый пароль</a></p>
<p>Если вы этого не запрашивали, просто проигнорируйте письмо – ваш пароль останется прежним.</p>
{{ else }}
<h2>Passwort zurücksetzen</h2>
<p>Über den Link legst du ein neues Passwort fest:</p>
<p><a href="{{ .ConfirmationURL }}">Neues Passwort festlegen</a></p>
<p>Wenn du das nicht angefordert hast, kannst du diese E-Mail ignorieren – dein Passwort bleibt unverändert.</p>
{{ end }}
```

## Woher kommt die Sprache?

- Registrierung per E-Mail: die Seitensprache beim Absenden
  (`signUp` → `options.data.locale`).
- Erster Google-Login: die Sprache aus dem Cookie `NEXT_LOCALE`
  (gesetzt im Auth-Callback).
- Sprachauswahl oben rechts: aktualisiert `user_metadata.locale`, wenn man
  eingeloggt ist.
