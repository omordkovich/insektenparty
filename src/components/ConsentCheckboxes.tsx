"use client";

import { MIN_REGISTRATION_AGE } from "@/lib/legal-info";
import { LegalLink } from "./LegalLink";

type ConsentCheckboxesProps = {
  acceptedTerms: boolean;
  confirmedAge: boolean;
  disabled?: boolean;
  onAcceptedTermsChange: (checked: boolean) => void;
  onConfirmedAgeChange: (checked: boolean) => void;
};

export const CONSENT_TERMS_ERROR =
  "Bitte akzeptiere die AGB und bestätige, dass du die Datenschutzerklärung zur Kenntnis genommen hast.";
export const CONSENT_AGE_ERROR = `Bitte bestätige, dass du mindestens ${MIN_REGISTRATION_AGE} Jahre alt bist.`;

// The two checkboxes every registration (email or Google) has to tick.
export function ConsentCheckboxes({
  acceptedTerms,
  confirmedAge,
  disabled = false,
  onAcceptedTermsChange,
  onConfirmedAgeChange,
}: ConsentCheckboxesProps) {
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
          Ich akzeptiere die{" "}
          <LegalLink document="terms" className="underline underline-offset-2 hover:text-leaf-dark">
            AGB
          </LegalLink>{" "}
          und habe die{" "}
          <LegalLink document="privacy" className="underline underline-offset-2 hover:text-leaf-dark">
            Datenschutzerklärung
          </LegalLink>{" "}
          zur Kenntnis genommen.
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
        <span>Ich bin mindestens {MIN_REGISTRATION_AGE} Jahre alt.</span>
      </label>
    </>
  );
}
