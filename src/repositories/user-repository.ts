import { sql } from "drizzle-orm";
import { getDb } from "@/db";

type AuthUserRow = { name: string | null; email: string | null };

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

export type UserContact = { name: string | null; email: string | null };

export async function getUserContact(userId: string): Promise<UserContact | null> {
  const rows = (await getDb().execute(
    sql`select ${nameColumn}, email from auth.users where id = ${userId}`,
  )) as unknown as AuthUserRow[];

  return rows[0] ?? null;
}
