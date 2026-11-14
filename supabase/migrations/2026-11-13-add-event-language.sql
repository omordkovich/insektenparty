-- Event language (see src/i18n/config.ts): the event page, its dialogs and
-- link previews appear in this language, whatever the visitor's own choice.
-- Additive - existing events become German, as they were.
alter table public.events add column language text not null default 'de';
alter table public.events
  add constraint events_language_check
  check (language in ('de', 'en'));
