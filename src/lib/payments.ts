// Until real payments exist, purchases are dummies: they write the ledger row
// (source "dummy") without charging anything. Switched on per environment -
// also in production - with PAYMENTS_DUMMY=true.
export function isDummyPaymentEnabled(): boolean {
  return process.env.PAYMENTS_DUMMY === "true";
}
