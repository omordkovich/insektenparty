import type { Locale } from "@/i18n/config";

// The legal texts: each has its own page (footer links, e-mails, Stripe
// and other services that need a fixed URL) and can also be opened as an
// overlay from inside forms (see LegalLink), so nobody loses what they
// typed. Every text exists in every language (src/components/legal) - the
// German one is binding. Kept free of React so server pages and client
// components can both import it.
export type LegalDocument = "imprint" | "privacy" | "terms" | "withdrawal";

export const LEGAL_DOCUMENTS: Record<
  LegalDocument,
  { href: string; title: Record<Locale, string>; description: Record<Locale, string> }
> = {
  imprint: {
    href: "/impressum",
    title: { de: "Impressum", en: "Legal notice", ru: "Выходные данные" },
    description: {
      de: "Impressum von GASTZILLA – Angaben zum Anbieter gemäß § 5 DDG.",
      en: "Legal notice of GASTZILLA – information about the provider under § 5 DDG (German Digital Services Act).",
      ru: "Выходные данные GASTZILLA – сведения о владельце сайта согласно § 5 DDG (закон Германии о цифровых услугах).",
    },
  },
  privacy: {
    href: "/datenschutz",
    title: { de: "Datenschutzerklärung", en: "Privacy policy", ru: "Политика конфиденциальности" },
    description: {
      de: "Wie GASTZILLA personenbezogene Daten verarbeitet und welche Rechte du hast.",
      en: "How GASTZILLA processes personal data and what rights you have.",
      ru: "Как GASTZILLA обрабатывает персональные данные и какие у вас есть права.",
    },
  },
  terms: {
    href: "/agb",
    title: { de: "Allgemeine Geschäftsbedingungen", en: "Terms and conditions", ru: "Условия использования" },
    description: {
      de: "Allgemeine Geschäftsbedingungen für die Nutzung von GASTZILLA.",
      en: "Terms and conditions for using GASTZILLA.",
      ru: "Условия использования сервиса GASTZILLA.",
    },
  },
  withdrawal: {
    href: "/widerruf",
    title: { de: "Widerrufsbelehrung", en: "Right of withdrawal", ru: "Право на отказ от договора" },
    description: {
      de: "Widerrufsbelehrung und Muster-Widerrufsformular für kostenpflichtige Erweiterungen.",
      en: "Information on the right of withdrawal and model withdrawal form for paid extensions.",
      ru: "Информация о праве на отказ от договора и образец формы отказа для платных опций.",
    },
  },
};
