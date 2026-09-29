// Angaben zum Anbieter für Impressum, Datenschutzerklärung, AGB und
// Widerrufsbelehrung. Eine ladungsfähige Anschrift (kein Postfach) ist
// Pflicht (§ 5 DDG).
export const LEGAL_INFO = {
  name: "Oleg Mordkovich",
  street: "Am Mutzbach 24",
  city: "51069 Köln",
  country: "Deutschland",
  email: "info@gastzilla.de",
  // Umsatzsteuer-Identifikationsnummer nach § 27a UStG - nur eintragen, wenn
  // vorhanden; bei null verschwindet die Zeile aus dem Impressum.
  vatId: null as string | null,
  // Wirtschafts-Identifikationsnummer nach § 139c AO (vom BZSt zugeteilt) -
  // ebenfalls nur eintragen, wenn vorhanden. Die Steuernummer gehört NICHT
  // ins Impressum.
  businessId: null as string | null,
  // true, wenn du Kleinunternehmer nach § 19 UStG bist (keine Umsatzsteuer
  // auf Rechnungen). Steuert den Preishinweis in den AGB.
  smallBusiness: false,
}

// Stand der AGB bzw. Datenschutzerklärung, wie er bei der Registrierung im
// Konto gespeichert wird (Nachweis, welcher Fassung zugestimmt wurde).
// Bei inhaltlichen Änderungen hochsetzen.
export const TERMS_VERSION = "2026-09-29";
export const PRIVACY_VERSION = "2026-09-29";
