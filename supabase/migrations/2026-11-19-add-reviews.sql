-- Nutzer-Feedback (docs/superpowers/specs/2026-11-19-user-feedback-design.md).
-- Additiv - der alte Code ignoriert Tabelle und Spalten.
-- REIHENFOLGE: Diese Migration MUSS laufen, BEVOR der neue Code deployt wird.
-- Der neue Code liest die neuen events-Spalten in jedem select()/returning();
-- ohne sie liefern Event-Seiten, Event-Bearbeitung und der tägliche Cron 500.
--
-- reviews: Bewertungen von Gastgebern nach ihrem Event. Bewusst OHNE
-- event_id / user_id - eine Bewertung wird keinem Event und keinem Konto
-- zugeordnet und überlebt so auch die automatische Löschung des Events.
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  rating smallint not null check (rating between 1 and 5),
  text varchar(200) not null,
  display_name varchar(100),
  language text not null check (language in ('de', 'en', 'ru')),
  status text not null default 'pending' check (status in ('pending', 'approved')),
  created_at timestamptz not null default now(),
  approved_at timestamptz
);
create index reviews_banner_idx on public.reviews (language, status, approved_at desc);

-- Like guests: RLS on without policies - only the server's database
-- connection reads and writes this table.
alter table public.reviews enable row level security;

-- feedback_request_sent_at: Feedback-Mail an den Gastgeber verschickt.
-- feedback_submitted_at: Feedback für dieses Event abgeschickt (Sperre gegen
-- doppeltes Abschicken; geht mit dem Event).
alter table public.events
  add column feedback_request_sent_at timestamptz,
  add column feedback_submitted_at timestamptz;
