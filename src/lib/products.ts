// Product catalog with prices in cents. Shown in the UI and later mapped to
// Stripe lookup keys; until then purchases are dummy purchases.

export const PRODUCTS = {
  paid_event: { label: "Event freischalten", priceCents: 299 },
  theme: { label: "Design freischalten", priceCents: 99 },
  no_badge: { label: "Ohne GASTZILLA-Hinweis", priceCents: 99 },
} as const;

export type ProductKey = keyof typeof PRODUCTS;

// 299 -> "2,99 €"
export function formatPrice(cents: number): string {
  const euros = Math.floor(cents / 100);
  const rest = String(cents % 100).padStart(2, "0");
  return `${euros},${rest} €`;
}

// What a page hands down to every "Freischalten" dialog: unused event
// credits (spent before anything is bought) and whether dummy purchases
// are switched on (PAYMENTS_DUMMY, read on the server).
export type UnlockContext = { eventCredits: number; dummyPayments: boolean };
