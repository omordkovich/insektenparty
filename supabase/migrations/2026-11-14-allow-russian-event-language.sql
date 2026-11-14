-- Russian as a third event language (see src/i18n/config.ts and
-- docs/neue-sprache.md). Must be applied BEFORE the deploy that adds "ru",
-- otherwise saving a Russian event fails on this check.
alter table public.events drop constraint events_language_check;
alter table public.events
  add constraint events_language_check
  check (language in ('de', 'en', 'ru'));
