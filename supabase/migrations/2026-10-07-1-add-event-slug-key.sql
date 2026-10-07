-- Step 1 (run BEFORE deploying the code that uses slug_key).
-- The last part of an event address becomes its permanent key, so the
-- readable part can follow the title while old links keep resolving:
--   anna-sommerfest-k7q2xm  ->  key k7q2xm
--   sommerfest-k3x9qa       ->  key k3x9qa
--   milans7BD (old, no dash) ->  key milans7BD
-- Nullable for now: the code still running in production doesn't know the
-- column yet; step 2 adds NOT NULL once the new code is deployed.
alter table public.events add column slug_key text;
-- The owner's first-name part of the address, fixed when the event is
-- created (renaming the event or the account doesn't change it). Null for
-- old events - they get it on their first rename.
alter table public.events add column slug_name text;

update public.events
  set slug_key = case when position('-' in slug) > 0
                      then regexp_replace(slug, '^.*-', '') else slug end;

alter table public.events add constraint events_slug_key_unique unique (slug_key);
