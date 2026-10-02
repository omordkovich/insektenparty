-- Supabase Auth hook "Before User Created": blocks registrations whose email
-- is just a variant of an already confirmed account.
--
-- Gmail (gmail.com / googlemail.com) ignores dots in the local part, and most
-- providers deliver "name+tag@..." to "name@...". Supabase itself only
-- compares the exact (lowercased) address, so without this check one mailbox
-- could register many accounts. Dots are only ignored for Gmail: at other
-- providers "a.b@" and "ab@" are different mailboxes.
--
-- Only confirmed accounts block a registration, so nobody can lock out a
-- real owner by registering (and never confirming) a variant of their address.
--
-- Applied manually (auth.users is Supabase-managed, outside drizzle). After
-- running this, enable the hook once in the dashboard:
--   Authentication > Hooks > Before User Created > Postgres function >
--   public.hook_before_user_created

create or replace function public.normalize_email(email text)
returns text
language plpgsql
immutable
set search_path = ''
as $$
declare
  lowered text := lower(email);
  local_part text := split_part(lowered, '@', 1);
  domain_part text := split_part(lowered, '@', 2);
begin
  -- Drop a "+tag"; keep the part as-is if nothing would be left of it.
  local_part := coalesce(nullif(split_part(local_part, '+', 1), ''), local_part);

  if domain_part in ('gmail.com', 'googlemail.com') then
    return replace(local_part, '.', '') || '@gmail.com';
  end if;

  return local_part || '@' || domain_part;
end;
$$;

create or replace function public.hook_before_user_created(event jsonb)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  new_email text := event -> 'user' ->> 'email';
begin
  if new_email is not null and exists (
    select 1
    from auth.users u
    where u.email is not null
      and u.email_confirmed_at is not null
      and public.normalize_email(u.email) = public.normalize_email(new_email)
  ) then
    return jsonb_build_object(
      'error',
      jsonb_build_object(
        'http_code', 422,
        'message', 'User mit dieser E-Mail-Adresse existiert bereits!'
      )
    );
  end if;

  return '{}'::jsonb;
end;
$$;

-- Not meant to be callable through the public API.
revoke execute on function public.normalize_email(text) from anon, authenticated, public;

-- Only the auth service may call the hook.
grant execute on function public.hook_before_user_created(jsonb) to supabase_auth_admin;
revoke execute on function public.hook_before_user_created(jsonb) from authenticated, anon, public;
