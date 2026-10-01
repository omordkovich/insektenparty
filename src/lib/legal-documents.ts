// The legal texts: each has its own page (footer links, e-mails, Stripe
// and other services that need a fixed URL) and can also be opened as an
// overlay from inside forms (see LegalLink), so nobody loses what they
// typed. Kept free of React so server pages and client components can both
// import it.
export type LegalDocument = "imprint" | "privacy" | "terms" | "withdrawal";

export const LEGAL_DOCUMENTS: Record<
  LegalDocument,
  { label: string; title: string; href: string; description: string }
> = {
  imprint: {
    label: "Impressum",
    title: "Impressum",
    href: "/impressum",
    description: "Impressum von GASTZILLA – Angaben zum Anbieter gemäß § 5 DDG.",
  },
  privacy: {
    label: "Datenschutz",
    title: "Datenschutzerklärung",
    href: "/datenschutz",
    description: "Wie GASTZILLA personenbezogene Daten verarbeitet und welche Rechte du hast.",
  },
  terms: {
    label: "AGB",
    title: "Allgemeine Geschäftsbedingungen",
    href: "/agb",
    description: "Allgemeine Geschäftsbedingungen für die Nutzung von GASTZILLA.",
  },
  withdrawal: {
    label: "Widerruf",
    title: "Widerrufsbelehrung",
    href: "/widerruf",
    description: "Widerrufsbelehrung und Muster-Widerrufsformular für kostenpflichtige Erweiterungen.",
  },
};
