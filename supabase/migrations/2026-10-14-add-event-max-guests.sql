-- "Teilnehmerzahl begrenzen": highest number of people (acceptances plus
-- their companions); null = no limit. Additive - old code ignores it.
alter table public.events
  add column max_guests integer
  check (max_guests is null or max_guests between 1 and 300);
