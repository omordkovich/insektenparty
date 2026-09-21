import { sql } from "drizzle-orm";
import { getDb } from "@/db";

type AuthUserRow = { name: string | null; email: string | null };

// auth.users is Supabase-managed (outside src/db/schema.ts), so this reads
// it directly through the same DB connection rather than via Drizzle's
// query builder.
export async function getUserDisplayName(userId: string): Promise<string | null> {
  const rows = (await getDb().execute(
    sql`select raw_user_meta_data ->> 'name' as name, email from auth.users where id = ${userId}`,
  )) as unknown as AuthUserRow[];

  const row = rows[0];
  return row?.name ?? row?.email ?? null;
}
