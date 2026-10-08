-- Terminabstimmung. date_mode: 'unknown' (noch kein Termin), 'poll'
-- (Abstimmung läuft), 'fixed' (fester Termin). Bestehende Events bleiben
-- 'fixed'. Additiv - der alte Code ignoriert Spalte und Tabellen.
alter table public.events
  add column date_mode text not null default 'fixed'
  check (date_mode in ('unknown', 'poll', 'fixed'));

create table public.date_poll_options (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  date date not null,
  start_time time not null,
  end_time time,
  position integer not null,
  created_at timestamptz not null default now()
);
create index date_poll_options_event_id_idx on public.date_poll_options (event_id);

create table public.date_poll_votes (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  name varchar(100) not null,
  option_ids uuid[] not null default '{}',
  none_fit boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index date_poll_votes_event_id_idx on public.date_poll_votes (event_id);

-- Like guests: RLS on without policies - only the server's database
-- connection reads and writes these tables.
alter table public.date_poll_options enable row level security;
alter table public.date_poll_votes enable row level security;
