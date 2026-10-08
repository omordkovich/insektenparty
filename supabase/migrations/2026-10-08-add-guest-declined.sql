-- "Ich sage ab": a declined guest keeps only name and message; times,
-- extra people and "Ich bringe was mit" stay empty. Safe to run before the
-- code is deployed: the old code never writes declined guests, so it never
-- sees a null arrival_time.
alter table public.guests add column declined boolean not null default false;
alter table public.guests alter column arrival_time drop not null;
