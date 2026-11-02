import { and, asc, eq, isNull, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { userEntitlements } from "@/db/schema";
import { PAID_EVENT_FEATURE, type EntitlementRow } from "@/lib/features";

export type DbTransaction = Parameters<Parameters<ReturnType<typeof getDb>["transaction"]>[0]>[0];

export async function getEntitlementRows(userId: string): Promise<EntitlementRow[]> {
  return getDb()
    .select({
      feature: userEntitlements.feature,
      quantity: userEntitlements.quantity,
      consumedAt: userEntitlements.consumedAt,
    })
    .from(userEntitlements)
    .where(eq(userEntitlements.userId, userId));
}

// Serialises everything that spends or checks one user's quota (creating an
// event, upgrading one): held until the transaction ends.
export async function lockUserLedger(tx: DbTransaction, userId: string): Promise<void> {
  await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${userId}))`);
}

// The oldest unused event credit of the user (null = none). Call it after
// lockUserLedger so the credit can't be spent twice.
export async function findOldestUnusedCreditId(tx: DbTransaction, userId: string): Promise<string | null> {
  const [credit] = await tx
    .select({ id: userEntitlements.id })
    .from(userEntitlements)
    .where(
      and(
        eq(userEntitlements.userId, userId),
        eq(userEntitlements.feature, PAID_EVENT_FEATURE),
        isNull(userEntitlements.consumedAt),
      ),
    )
    .orderBy(asc(userEntitlements.createdAt), asc(userEntitlements.id))
    .limit(1);
  return credit?.id ?? null;
}
