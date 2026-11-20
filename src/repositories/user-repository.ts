import { sql } from "drizzle-orm";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/i18n/config";
import { getDb } from "@/db";

type AuthUserRow = {
  name: string | null;
  email: string | null;
  locale?: string | null;
  feedback_mails?: string | null;
};

// The display name is the metadata's `name` (same as getAccountName in
// lib/account.ts); blank counts as missing.
const nameColumn = sql`nullif(trim(raw_user_meta_data ->> 'name'), '') as name`;

// auth.users is Supabase-managed (outside src/db/schema.ts), so this reads
// it directly through the same DB connection rather than via Drizzle's
// query builder.
export async function getUserDisplayName(userId: string): Promise<string | null> {
  const rows = (await getDb().execute(
    sql`select ${nameColumn}, email from auth.users where id = ${userId}`,
  )) as unknown as AuthUserRow[];

  // Shown publicly (event info page): never fall back to the email address.
  return rows[0]?.name ?? null;
}

// Deletes the account itself. events, guests, user_entitlements, profiles,
// identities and sessions reference auth.users with `on delete cascade`, so
// everything the user owns goes with it.
export async function deleteUser(userId: string): Promise<void> {
  await getDb().execute(sql`delete from auth.users where id = ${userId}`);
}

// `locale`: the account language (user metadata, see lib/account.ts) - the
// language of the mails we send the owner. German when not set.
// `feedbackMails`: false once the owner unsubscribed from feedback mails
// (metadata feedback_mails = false); missing counts as true.
export type UserContact = { name: string | null; email: string | null; locale: Locale; feedbackMails: boolean };

export async function getUserContact(userId: string): Promise<UserContact | null> {
  const rows = (await getDb().execute(
    sql`select ${nameColumn}, email, raw_user_meta_data ->> 'locale' as locale,
        raw_user_meta_data ->> 'feedback_mails' as feedback_mails
        from auth.users where id = ${userId}`,
  )) as unknown as AuthUserRow[];

  const row = rows[0];
  if (!row) return null;
  return {
    name: row.name,
    email: row.email,
    locale: isLocale(row.locale) ? row.locale : DEFAULT_LOCALE,
    feedbackMails: row.feedback_mails !== "false",
  };
}

// "Keine Feedback-Mails mehr" (unsubscribe link). A missing account is fine -
// there is nothing left to mail.
export async function disableFeedbackMails(userId: string): Promise<void> {
  await getDb().execute(
    sql`update auth.users
        set raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || '{"feedback_mails": false}'::jsonb
        where id = ${userId}`,
  );
}
