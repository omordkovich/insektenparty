-- Step 2 (run AFTER the code using slug_key is deployed).
-- Fills the key of events the old code created in between, then makes it
-- mandatory.
update public.events
  set slug_key = case when position('-' in slug) > 0
                      then regexp_replace(slug, '^.*-', '') else slug end
  where slug_key is null;

alter table public.events alter column slug_key set not null;
