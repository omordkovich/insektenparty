"use client";

import { useLocale, useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { useState } from "react";
import type { ComponentType, ReactNode } from "react";
import { DEFAULT_LOCALE, type Locale } from "@/i18n/config";
import { LEGAL_DOCUMENTS, type LegalDocument } from "@/lib/legal-documents";
import { localizedPath } from "@/lib/page-metadata";
import { LegalDialog } from "./LegalDialog";

export type { LegalDocument };

function LoadingText() {
  const t = useTranslations("common");
  return <p className="text-sm text-muted">{t("loading")}</p>;
}

// Loaded only when a dialog is opened: the link sits in the cookie banner
// (root layout), so static imports would put all texts on every page. One
// entry per text and language (the same files as src/components/legal).
function load(loader: () => Promise<ComponentType>): ComponentType {
  return dynamic(loader, { loading: LoadingText });
}

const CONTENT: Record<LegalDocument, Record<Locale, ComponentType>> = {
  imprint: {
    de: load(() => import("./legal/ImprintDe").then((m) => m.ImprintDe)),
    en: load(() => import("./legal/ImprintEn").then((m) => m.ImprintEn)),
    ru: load(() => import("./legal/ImprintRu").then((m) => m.ImprintRu)),
  },
  privacy: {
    de: load(() => import("./legal/PrivacyDe").then((m) => m.PrivacyDe)),
    en: load(() => import("./legal/PrivacyEn").then((m) => m.PrivacyEn)),
    ru: load(() => import("./legal/PrivacyRu").then((m) => m.PrivacyRu)),
  },
  terms: {
    de: load(() => import("./legal/TermsDe").then((m) => m.TermsDe)),
    en: load(() => import("./legal/TermsEn").then((m) => m.TermsEn)),
    ru: load(() => import("./legal/TermsRu").then((m) => m.TermsRu)),
  },
  withdrawal: {
    de: load(() => import("./legal/WithdrawalDe").then((m) => m.WithdrawalDe)),
    en: load(() => import("./legal/WithdrawalEn").then((m) => m.WithdrawalEn)),
    ru: load(() => import("./legal/WithdrawalRu").then((m) => m.WithdrawalRu)),
  },
};

type LegalLinkProps = {
  document: LegalDocument;
  className?: string;
  children?: ReactNode;
};

// Opens a legal text as an overlay - for links inside forms and dialogs
// (registration, cookie banner, guest sign-up), where navigating to the
// page would throw away what the visitor typed. The footer links go to the
// real pages instead (see LegalLinks). The href still points at the page,
// so opening it in a new tab or without JavaScript works too.
export function LegalLink({
  document,
  className = "text-sm text-muted underline underline-offset-2 hover:text-leaf-dark",
  children,
}: LegalLinkProps) {
  const t = useTranslations("legal");
  const locale = useLocale() as Locale;
  const [open, setOpen] = useState(false);
  const { title, href } = LEGAL_DOCUMENTS[document];
  const label = t(`labels.${document}`);
  const Content = CONTENT[document][locale];

  return (
    <>
      <a
        href={localizedPath(href, locale)}
        onClick={(event) => {
          // Let ctrl/cmd/middle-click open the page in a new tab as usual.
          if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
          event.preventDefault();
          setOpen(true);
        }}
        className={className}
      >
        {children ?? label}
      </a>
      {open ? (
        <LegalDialog title={title[locale]} onCloseAction={() => setOpen(false)}>
          {locale === DEFAULT_LOCALE ? null : (
            <p className="mb-4 rounded-2xl border border-leaf/20 bg-leaf/5 px-4 py-3 text-sm text-muted">
              {t("translationNotice")}
            </p>
          )}
          <Content />
        </LegalDialog>
      ) : null}
    </>
  );
}
