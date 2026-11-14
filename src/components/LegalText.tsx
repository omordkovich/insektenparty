import type { ReactNode } from "react";
import { INTL_FORMAT_LOCALE, type Locale } from "@/i18n/config";
import { LEGAL_INFO } from "@/lib/legal-info";

// Shared building blocks for the legal texts (Impressum, Datenschutz, AGB,
// Widerrufsbelehrung) so they all look the same inside LegalDialog.

export function LegalBody({ children }: { children: ReactNode }) {
  return <div className="text-sm leading-relaxed text-muted">{children}</div>;
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-6 first:mt-0">
      <h3 className="font-display text-lg text-leaf-dark">{title}</h3>
      <div className="mt-2 space-y-2">{children}</div>
    </section>
  );
}

export function SubHeading({ children }: { children: ReactNode }) {
  return <p className="font-bold text-foreground">{children}</p>;
}

export function List({ children }: { children: ReactNode }) {
  return <ul className="list-disc space-y-1 pl-5">{children}</ul>;
}

export function ExternalLink({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="break-all underline underline-offset-2 hover:text-leaf-dark"
    >
      {href}
    </a>
  );
}

export function EmailLink() {
  return (
    <a href={`mailto:${LEGAL_INFO.email}`} className="underline underline-offset-2">
      {LEGAL_INFO.email}
    </a>
  );
}

const COUNTRY: Record<Locale, string> = { de: LEGAL_INFO.country, en: "Germany", ru: "Германия" };

export function PostalAddress({ locale }: { locale: Locale }) {
  return (
    <>
      {LEGAL_INFO.name}
      <br />
      {LEGAL_INFO.street}
      <br />
      {LEGAL_INFO.city}
      <br />
      {COUNTRY[locale]}
    </>
  );
}

const LAST_UPDATED_LABEL: Record<Locale, string> = { de: "Stand", en: "Last updated", ru: "Обновлено" };

// "Stand: November 2026" from a version date (src/lib/legal-info.ts), so
// every language shows the same date.
export function LastUpdated({ date, locale }: { date: string; locale: Locale }) {
  const month = new Intl.DateTimeFormat(INTL_FORMAT_LOCALE[locale], {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
  return (
    <p className="mt-6" data-updated={date}>
      {LAST_UPDATED_LABEL[locale]}: {month}
    </p>
  );
}
