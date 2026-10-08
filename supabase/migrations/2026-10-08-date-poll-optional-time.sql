-- Terminabstimmung: a proposal may be just a day, without a start time.
alter table public.date_poll_options alter column start_time drop not null;
