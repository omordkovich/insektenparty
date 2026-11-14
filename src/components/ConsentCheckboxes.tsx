"use client";

import { useTranslations } from "next-intl";
import { MIN_REGISTRATION_AGE } from "@/lib/legal-info";
import { LegalLink } from "./LegalLink";

type ConsentCheckboxesProps = {
  acceptedTerms: boolean;
  confirmedAge: boolean;
  disabled?: boolean;
  onAcceptedTermsChange: (checked: boolean) => void;
  onConfirmedAgeChange: (checked: boolean) => void;
};

// Message keys (namespace "consent") for a missing tick; values for ageError.
export const CONSENT_TERMS_ERROR = "termsError";
export const CONSENT_AGE_ERROR = "ageError";
export const CONSENT_AGE_VALUES = { age: MIN_REGISTRATION_AGE };

// The two checkboxes every registration (email or Google) has to tick.
export function ConsentCheckboxes({
  acceptedTerms,
  confirmedAge,
  disabled = false,
  onAcceptedTermsChange,
  onConfirmedAgeChange,
}: ConsentCheckboxesProps) {
  const t = useTranslations("consent");
  return (
    <>
      <label className="flex items-start gap-2 text-left text-sm">
        <input
          name="acceptedTerms"
          type="checkbox"
          required
          checked={acceptedTerms}
          disabled={disabled}
          onChange={(event) => onAcceptedTermsChange(event.target.checked)}
          className="mt-0.5 h-5 w-5 shrink-0 rounded border-leaf/40"
        />
        <span>
          {t.rich("termsCheckbox", {
            terms: (chunks) => (
              <LegalLink document="terms" className="underline underline-offset-2 hover:text-leaf-dark">
                {chunks}
              </LegalLink>
            ),
            privacy: (chunks) => (
              <LegalLink document="privacy" className="underline underline-offset-2 hover:text-leaf-dark">
                {chunks}
              </LegalLink>
            ),
          })}
        </span>
      </label>

      <label className="flex items-start gap-2 text-left text-sm">
        <input
          name="confirmedAge"
          type="checkbox"
          required
          checked={confirmedAge}
          disabled={disabled}
          onChange={(event) => onConfirmedAgeChange(event.target.checked)}
          className="mt-0.5 h-5 w-5 shrink-0 rounded border-leaf/40"
        />
        <span>{t("ageCheckbox", { age: MIN_REGISTRATION_AGE })}</span>
      </label>
    </>
  );
}
