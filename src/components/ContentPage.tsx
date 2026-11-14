import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { GermanOnlyNotice } from "./GermanOnlyNotice";
import type { ReactNode } from "react";
import { LegalLinks } from "./LegalLinks";
import { SiteHeader } from "./SiteHeader";

type ContentPageProps = {
  title: string;
  children: ReactNode;
  /** Content exists in German only: shows a notice in other languages. */
  germanOnly?: boolean;
};

// Shell for simple text pages (Über uns, Impressum, Datenschutz, AGB,
// Widerruf): site header, one card with the content, a way back home and
// the footer links.
export async function ContentPage({ title, children, germanOnly = false }: ContentPageProps) {
  const t = await getTranslations("common");
  return (
    <>
      <SiteHeader />
      <main className="flex min-h-full flex-col items-center px-6 py-16">
        {germanOnly ? <GermanOnlyNotice /> : null}
        <article className="w-full max-w-2xl rounded-[2rem] border border-leaf/20 bg-[var(--surface)] p-5 shadow-(--shadow) sm:p-8">
          <h1 className="text-center font-display text-3xl text-leaf-dark sm:text-4xl">{title}</h1>
          <div className="mt-6">{children}</div>
          <div className="mt-8 text-center">
            <Link
              href="/"
              className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-button-primary px-6 text-base font-bold text-button-primary-text transition hover:brightness-90"
            >
              {t("backHome")}
            </Link>
          </div>
        </article>

        <LegalLinks className="mt-auto pt-12" />
      </main>
    </>
  );
}
