import type { ComponentType } from "react";
import type { Locale } from "@/i18n/config";
import type { LegalDocument } from "@/lib/legal-documents";
import { ImprintDe } from "./ImprintDe";
import { ImprintEn } from "./ImprintEn";
import { ImprintRu } from "./ImprintRu";
import { PrivacyDe } from "./PrivacyDe";
import { PrivacyEn } from "./PrivacyEn";
import { PrivacyRu } from "./PrivacyRu";
import { TermsDe } from "./TermsDe";
import { TermsEn } from "./TermsEn";
import { TermsRu } from "./TermsRu";
import { WithdrawalDe } from "./WithdrawalDe";
import { WithdrawalEn } from "./WithdrawalEn";
import { WithdrawalRu } from "./WithdrawalRu";

// Every legal text in every language. The German one is binding, the others
// are translations of it - a change goes into all of them at once (checked
// by legal-parity.test.ts). Static imports: for the pages. The overlays
// (LegalLink) load them on demand instead.
export const LEGAL_CONTENT: Record<LegalDocument, Record<Locale, ComponentType>> = {
  imprint: { de: ImprintDe, en: ImprintEn, ru: ImprintRu },
  privacy: { de: PrivacyDe, en: PrivacyEn, ru: PrivacyRu },
  terms: { de: TermsDe, en: TermsEn, ru: TermsRu },
  withdrawal: { de: WithdrawalDe, en: WithdrawalEn, ru: WithdrawalRu },
};
