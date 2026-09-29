import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { userEntitlements } from "@/db/schema";
import type { EntitlementRow } from "@/lib/features";

export async function getEntitlementRows(userId: string): Promise<EntitlementRow[]> {
  return getDb()
    .select({ feature: userEntitlements.feature, quantity: userEntitlements.quantity })
    .from(userEntitlements)
    .where(eq(userEntitlements.userId, userId));
}
