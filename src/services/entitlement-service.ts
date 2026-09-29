import { resolveEntitlements, type UserEntitlements } from "@/lib/features";
import { getEntitlementRows } from "@/repositories/entitlement-repository";
import { countEventsByOwner } from "@/repositories/event-repository";

export async function getUserEntitlements(userId: string): Promise<UserEntitlements> {
  const [rows, eventCount] = await Promise.all([
    getEntitlementRows(userId),
    countEventsByOwner(userId),
  ]);
  return resolveEntitlements(rows, eventCount);
}
