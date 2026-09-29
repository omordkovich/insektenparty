import type { ReactNode } from "react";
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

export function PostalAddress() {
  return (
    <>
      {LEGAL_INFO.name}
      <br />
      {LEGAL_INFO.street}
      <br />
      {LEGAL_INFO.city}
      <br />
      {LEGAL_INFO.country}
    </>
  );
}

export function LastUpdated({ date }: { date: string }) {
  return <p className="mt-6">Stand: {date}</p>;
}
