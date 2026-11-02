import { resolveEntitlements, type UserEntitlements } from "@/lib/features";
import { getEntitlementRows } from "@/repositories/entitlement-repository";

export async function getUserEntitlements(userId: string): Promise<UserEntitlements> {
  return resolveEntitlements(await getEntitlementRows(userId));
}
