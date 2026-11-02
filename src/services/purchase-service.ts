import { themeFeatureKey } from "@/lib/features";
import { isDummyPaymentEnabled } from "@/lib/payments";
import { PREMIUM_THEMES } from "@/lib/theme-presets";
import { isUuid, validateRequestBody, validateTheme } from "@/lib/validation";
import { getEventPlanInfo } from "@/repositories/event-repository";
import {
  DUMMY_SOURCE,
  getEventBadgeHidden,
  hideEventBadge,
  insertEntitlement,
  upgradeEventToPaid,
} from "@/repositories/purchase-repository";
import { getUserEntitlements } from "@/services/entitlement-service";
import { denyIfOver } from "@/services/event-lifecycle-service";

export type PurchaseResult =
  | { ok: true; data: { usedCredit: boolean } }
  | { ok: false; status: number; error: string };

const UNAVAILABLE_ERROR = "Käufe sind bald verfügbar.";
const UNKNOWN_PRODUCT_ERROR = "Unbekanntes Produkt.";
const NOT_FOUND_ERROR = "Event wurde nicht gefunden.";
const ALREADY_UNLOCKED_ERROR = "Dieses Event ist schon freigeschaltet.";

const bought: PurchaseResult = { ok: true, data: { usedCredit: false } };
const unavailable: PurchaseResult = { ok: false, status: 403, error: UNAVAILABLE_ERROR };
const notFound: PurchaseResult = { ok: false, status: 404, error: NOT_FOUND_ERROR };
const alreadyUnlocked: PurchaseResult = { ok: false, status: 409, error: ALREADY_UNLOCKED_ERROR };

// Dummy purchases: no payment happens, the ledger row is simply written
// (source "dummy") while PAYMENTS_DUMMY=true. Body:
// { product: "paid_event" } | { product: "theme", theme } |
// { product: "event_upgrade", eventId } | { product: "no_badge", eventId }.
export async function purchase(userId: string, body: unknown): Promise<PurchaseResult> {
  const parsed = validateRequestBody(body);
  if (!parsed.ok) return { ok: false, status: 400, error: parsed.error };

  switch (parsed.value.product) {
    case "paid_event":
      return buyEventCredit(userId);
    case "theme":
      return buyTheme(userId, parsed.value.theme);
    case "event_upgrade":
      return upgradeEvent(userId, parsed.value.eventId);
    case "no_badge":
      return removeBadge(userId, parsed.value.eventId);
    default:
      return { ok: false, status: 400, error: UNKNOWN_PRODUCT_ERROR };
  }
}

async function buyEventCredit(userId: string): Promise<PurchaseResult> {
  if (!isDummyPaymentEnabled()) return unavailable;
  await insertEntitlement({ userId, feature: "paid_event", source: DUMMY_SOURCE });
  return bought;
}

async function buyTheme(userId: string, value: unknown): Promise<PurchaseResult> {
  const theme = validateTheme(value);
  if (!theme.ok) return { ok: false, status: 400, error: theme.error };

  // Free themes and themes the user already owns: nothing to buy.
  if (!PREMIUM_THEMES.includes(theme.value)) return bought;
  const { unlockedThemes } = await getUserEntitlements(userId);
  if (unlockedThemes.includes(theme.value)) return bought;

  if (!isDummyPaymentEnabled()) return unavailable;
  await insertEntitlement({ userId, feature: themeFeatureKey(theme.value), source: DUMMY_SOURCE });
  return bought;
}

// The user's own event, or null (missing, malformed id or somebody else's).
async function ownedEvent(userId: string, eventId: unknown) {
  if (typeof eventId !== "string" || !isUuid(eventId)) return null;
  const info = await getEventPlanInfo(eventId);
  return info && info.ownerId === userId ? { id: eventId, plan: info.plan } : null;
}

async function upgradeEvent(userId: string, eventId: unknown): Promise<PurchaseResult> {
  const event = await ownedEvent(userId, eventId);
  if (!event) return notFound;
  const over = await denyIfOver(event.id);
  if (over) return over;
  if (event.plan === "paid") return alreadyUnlocked;

  // An unused credit is spent even without the dummy switch - it was paid for.
  const outcome = await upgradeEventToPaid(event.id, userId, isDummyPaymentEnabled());
  switch (outcome) {
    case "used_credit":
      return { ok: true, data: { usedCredit: true } };
    case "purchased":
      return bought;
    case "already_paid":
      return alreadyUnlocked;
    case "no_credit":
      return unavailable;
  }
}

async function removeBadge(userId: string, eventId: unknown): Promise<PurchaseResult> {
  const event = await ownedEvent(userId, eventId);
  if (!event) return notFound;
  const over = await denyIfOver(event.id);
  if (over) return over;
  if (await getEventBadgeHidden(event.id)) return bought;

  if (!isDummyPaymentEnabled()) return unavailable;
  const hidden = await hideEventBadge(event.id, userId, DUMMY_SOURCE);
  return hidden === "not_found" ? notFound : bought;
}
