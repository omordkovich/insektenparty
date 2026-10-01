"use client";

import { useState } from "react";
import type { ComponentType, ReactNode } from "react";
import { LEGAL_DOCUMENTS, type LegalDocument } from "@/lib/legal-documents";
import { ImprintContent } from "./ImprintContent";
import { LegalDialog } from "./LegalDialog";
import { PrivacyPolicyContent } from "./PrivacyPolicyContent";
import { TermsContent } from "./TermsContent";
import { WithdrawalContent } from "./WithdrawalContent";

export type { LegalDocument };

const CONTENT: Record<LegalDocument, ComponentType> = {
  imprint: ImprintContent,
  privacy: PrivacyPolicyContent,
  terms: TermsContent,
  withdrawal: WithdrawalContent,
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
  const [open, setOpen] = useState(false);
  const { label, title, href } = LEGAL_DOCUMENTS[document];
  const Content = CONTENT[document];

  return (
    <>
      <a
        href={href}
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
        <LegalDialog title={title} onCloseAction={() => setOpen(false)}>
          <Content />
        </LegalDialog>
      ) : null}
    </>
  );
}
