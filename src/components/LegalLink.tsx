"use client";

import { useState } from "react";
import type { ComponentType, ReactNode } from "react";
import { ImprintContent } from "./ImprintContent";
import { LegalDialog } from "./LegalDialog";
import { PrivacyPolicyContent } from "./PrivacyPolicyContent";
import { TermsContent } from "./TermsContent";
import { WithdrawalContent } from "./WithdrawalContent";

export type LegalDocument = "imprint" | "privacy" | "terms" | "withdrawal";

const DOCUMENTS: Record<
  LegalDocument,
  { label: string; title: string; anchor: string; Content: ComponentType }
> = {
  imprint: { label: "Impressum", title: "Impressum", anchor: "impressum", Content: ImprintContent },
  privacy: {
    label: "Datenschutz",
    title: "Datenschutzerklärung",
    anchor: "datenschutz",
    Content: PrivacyPolicyContent,
  },
  terms: {
    label: "AGB",
    title: "Allgemeine Geschäftsbedingungen",
    anchor: "agb",
    Content: TermsContent,
  },
  withdrawal: {
    label: "Widerruf",
    title: "Widerrufsbelehrung",
    anchor: "widerruf",
    Content: WithdrawalContent,
  },
};

type LegalLinkProps = {
  document: LegalDocument;
  className?: string;
  children?: ReactNode;
};

export function LegalLink({
  document,
  className = "text-sm text-muted underline underline-offset-2 hover:text-leaf-dark",
  children,
}: LegalLinkProps) {
  const [open, setOpen] = useState(false);
  const { label, title, anchor, Content } = DOCUMENTS[document];

  return (
    <>
      <a
        href={`#${anchor}`}
        role="button"
        onClick={(event) => {
          event.preventDefault();
          setOpen(true);
        }}
        className={className}
      >
        {children ?? label}
      </a>
      {open ? (
        <LegalDialog title={title} onCloseAction={() => setOpen(false)}>
          <Content />
        </LegalDialog>
      ) : null}
    </>
  );
}
