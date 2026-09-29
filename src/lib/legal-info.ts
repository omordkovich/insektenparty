// ⚠ Vor dem Livegang ausfüllen: Diese Angaben erscheinen in Impressum,
// Datenschutzerklärung, AGB und Widerrufsbelehrung. Eine ladungsfähige
// Anschrift (kein Postfach) ist Pflicht (§ 5 DDG).
export const LEGAL_INFO = {
  name: "[Vor- und Nachname]",
  street: "[Straße und Hausnummer]",
  city: "[PLZ Ort]",
  country: "Deutschland",
  phone: "[Telefonnummer]",
  email: "info@gastzilla.de",
  // Umsatzsteuer-Identifikationsnummer nach § 27a UStG; null, wenn keine
  // vorhanden ist (die Zeile verschwindet dann aus dem Impressum).
  vatId: "[USt-IdNr. eintragen oder null setzen]" as string | null,
  // true, wenn du Kleinunternehmer nach § 19 UStG bist (keine Umsatzsteuer
  // auf Rechnungen). Steuert den Preishinweis in den AGB.
  smallBusiness: false,
};

// Stand der AGB bzw. Datenschutzerklärung, wie er bei der Registrierung im
// Konto gespeichert wird (Nachweis, welcher Fassung zugestimmt wurde).
// Bei inhaltlichen Änderungen hochsetzen.
export const TERMS_VERSION = "2026-09-29";
export const PRIVACY_VERSION = "2026-09-29";
