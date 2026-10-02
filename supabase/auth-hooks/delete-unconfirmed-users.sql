-- Removes sign-ups that were never confirmed.
--
-- Supabase email links (signup confirmation) are valid for 1 hour by default
-- (Authentication > Sign In / Providers > Email > "Email OTP Expiration",
-- 3600 seconds). After that the account can no longer be confirmed, so it is
-- deleted. Matching text is in the "Confirm signup" email template and in
-- src/components/LinkExpiredDialog.tsx - keep all three in sync.
--
-- profiles / events / user_entitlements reference auth.users with
-- ON DELETE CASCADE; an account that never confirmed has no data there.
--
-- The age is measured from the LAST confirmation mail (re-submitting the
-- sign-up form sends a new one), so a fresh link is never cut short.
--
-- Applied manually (auth.users is Supabase-managed, outside drizzle).

create extension if not exists pg_cron;

create or replace function public.delete_unconfirmed_users()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  deleted_count integer;
begin
  delete from auth.users
  where email_confirmed_at is null
    and last_sign_in_at is null
    and email is not null
    and invited_at is null
    and coalesce(confirmation_sent_at, created_at) < now() - interval '1 hour';

  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$;

-- Only the scheduler (and the owner) may run it, never API callers.
revoke execute on function public.delete_unconfirmed_users() from anon, authenticated, public;

select cron.schedule(
  'delete-unconfirmed-users',
  '*/10 * * * *',
  $$select public.delete_unconfirmed_users()$$
);
