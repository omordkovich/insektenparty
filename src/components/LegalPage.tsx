import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { DEFAULT_LOCALE } from "@/i18n/config";
import { pageLocale } from "@/i18n/page-locale";
import { LEGAL_DOCUMENTS, type LegalDocument } from "@/lib/legal-documents";
import { pageMetadata } from "@/lib/page-metadata";
import { ContentPage } from "./ContentPage";
import { LEGAL_CONTENT } from "./legal";

type LegalPageParams = Promise<{ locale: string }>;

// The four legal pages (Impressum, Datenschutz, AGB, Widerruf) in every
// language; the route files only name their document.
export async function legalPageMetadata(document: LegalDocument, params: LegalPageParams): Promise<Metadata> {
  const locale = await pageLocale(params);
  const doc = LEGAL_DOCUMENTS[document];
  return pageMetadata({
    title: `${doc.title[locale]} – GASTZILLA`,
    description: doc.description[locale],
    path: doc.href,
    locale,
    alternates: true,
  });
}

export async function LegalPage({ document, params }: { document: LegalDocument; params: LegalPageParams }) {
  const locale = await pageLocale(params);
  const Content = LEGAL_CONTENT[document][locale];
  return (
    <ContentPage title={LEGAL_DOCUMENTS[document].title[locale]}>
      {locale === DEFAULT_LOCALE ? null : <LegalTranslationNotice />}
      <Content />
    </ContentPage>
  );
}

// Above a translated legal text: the German version is the binding one.
export async function LegalTranslationNotice() {
  const t = await getTranslations("legal");
  return (
    <p className="mb-6 rounded-2xl border border-leaf/20 bg-leaf/5 px-4 py-3 text-center text-sm text-muted">
      {t("translationNotice")}
    </p>
  );
}
