import Link from "next/link";
import type { ReactNode } from "react";
import { LegalLinks } from "./LegalLinks";
import { SiteHeader } from "./SiteHeader";

type ContentPageProps = {
  title: string;
  children: ReactNode;
};

// Shell for simple text pages (Über uns, Impressum, Datenschutz, AGB,
// Widerruf): site header, one card with the content, a way back home and
// the footer links.
export function ContentPage({ title, children }: ContentPageProps) {
  return (
    <>
      <SiteHeader />
      <main className="flex min-h-full flex-col items-center px-6 py-16">
        <article className="w-full max-w-2xl rounded-[2rem] border border-leaf/20 bg-[var(--surface)] p-5 shadow-(--shadow) sm:p-8">
          <h1 className="text-center font-display text-3xl text-leaf-dark sm:text-4xl">{title}</h1>
          <div className="mt-6">{children}</div>
          <div className="mt-8 text-center">
            <Link
              href="/"
              className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-button-primary px-6 text-base font-bold text-button-primary-text transition hover:brightness-90"
            >
              Zurück zur Startseite
            </Link>
          </div>
        </article>

        <LegalLinks className="mt-auto pt-12" />
      </main>
    </>
  );
}
