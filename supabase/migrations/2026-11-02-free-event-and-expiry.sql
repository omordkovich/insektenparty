-- "Ein freies Event pro Konto + bezahlte Events + automatisches Ablaufen".
--
-- Additive columns, then a one-time data conversion. What happens to
-- existing data:
--   * Per owner, the OLDEST event (created_at, then id) becomes the free
--     event (plan = 'free'); every further event becomes plan = 'paid'
--     (grandfathered, even if the owner has fewer credits than paid events).
--     Events without an owner keep the column default 'free'.
--   * Each owner with events gets one 'free_event' ledger row that points at
--     that oldest event (consumed_event_id / consumed_at = its created_at).
--   * Every 'event_slot' ledger row with quantity n becomes n 'paid_event'
--     rows (source, note and created_at carried over); the event_slot rows
--     are then deleted. Per owner, the paid events are matched against his
--     paid_event rows (oldest first) and mark them consumed; surplus credits
--     stay unconsumed and usable.
--   * 'theme:%' and 'no_badge' rows are untouched.
-- Old code ignores the new columns, but it still reads 'event_slot' rows,
-- so deploy the new code together with (or right after) this migration.
--   * Last step: a partial unique index allows at most one 'free_event' row
--     per user (DB backstop for the quota check in createEvent).
-- The file must run as ONE transaction (supabase apply_migration wraps it
-- itself; with psql use --single-transaction).
-- consumed_event_id is deliberately NOT a foreign key: the ledger row must
-- survive deleting the event (the free event stays used up).

-- 1. Columns.
alter table public.events
  add column plan text not null default 'free'
    constraint events_plan_check check (plan in ('free', 'paid')),
  add column deletion_notice_sent_at timestamptz,
  add column date_reminder_sent_at timestamptz,
  add column badge_hidden boolean not null default false;

alter table public.user_entitlements
  add column consumed_event_id uuid,
  add column consumed_at timestamptz;

-- 2. Replace the feature check (look the name up, whatever it is called)
--    by one that also allows the new features; event_slot stays allowed
--    until step 7 has removed those rows.
do $$
declare
  c record;
begin
  for c in
    select conname
    from pg_constraint
    where conrelid = 'public.user_entitlements'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) like '%feature%'
  loop
    execute format(
      'alter table public.user_entitlements drop constraint %I', c.conname
    );
  end loop;
end $$;

alter table public.user_entitlements
  add constraint user_entitlements_feature_check
  check (
    feature in ('paid_event', 'free_event', 'no_badge', 'event_slot')
    or feature like 'theme:%'
  );

-- 3. Existing events: per owner the oldest is free, all others are paid.
with ranked as (
  select
    id,
    row_number() over (
      partition by owner_id order by created_at, id
    ) as rn
  from public.events
  where owner_id is not null
)
update public.events e
set plan = case when r.rn = 1 then 'free' else 'paid' end
from ranked r
where e.id = r.id;

-- 4. One consumed free_event ledger row per owner with events.
insert into public.user_entitlements
  (user_id, feature, quantity, source, consumed_event_id, consumed_at)
select owner_id, 'free_event', 1, 'manual', id, created_at
from public.events
where owner_id is not null
  and plan = 'free';

-- 5. event_slot rows (quantity n) -> n paid_event rows of quantity 1.
insert into public.user_entitlements
  (user_id, feature, quantity, source, note, created_at)
select u.user_id, 'paid_event', 1, u.source, u.note, u.created_at
from public.user_entitlements u
cross join lateral generate_series(1, u.quantity)
where u.feature = 'event_slot';

-- 6. Match each owner's paid events (oldest first) against his unconsumed
--    paid_event rows (oldest first). More paid events than credits: the
--    surplus events simply stay 'paid' without a matching ledger row.
with paid_events as (
  select
    id,
    owner_id,
    row_number() over (
      partition by owner_id order by created_at, id
    ) as rn
  from public.events
  where plan = 'paid'
    and owner_id is not null
),
credits as (
  select
    id,
    user_id,
    row_number() over (
      partition by user_id order by created_at, id
    ) as rn
  from public.user_entitlements
  where feature = 'paid_event'
    and consumed_event_id is null
)
update public.user_entitlements u
set consumed_event_id = pe.id,
    consumed_at = now()
from paid_events pe
join credits c
  on c.user_id = pe.owner_id
 and c.rn = pe.rn
where u.id = c.id;

-- 7. Drop the converted event_slot rows; the final check no longer allows them.
delete from public.user_entitlements where feature = 'event_slot';

alter table public.user_entitlements
  drop constraint user_entitlements_feature_check;
alter table public.user_entitlements
  add constraint user_entitlements_feature_check
  check (
    feature in ('paid_event', 'free_event', 'no_badge')
    or feature like 'theme:%'
  );

-- 8. At most one free event per user, enforced by the database.
create unique index user_entitlements_one_free_event
  on public.user_entitlements (user_id)
  where feature = 'free_event';
