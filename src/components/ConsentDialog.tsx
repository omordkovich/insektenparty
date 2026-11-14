"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useId, useState, type SubmitEvent } from "react";
import { TERMS_VERSION } from "@/lib/legal-info";
import { createClient } from "@/lib/supabase/client";
import { Button } from "./Button";
import {
  CONSENT_AGE_ERROR,
  CONSENT_AGE_VALUES,
  CONSENT_TERMS_ERROR,
  ConsentCheckboxes,
} from "./ConsentCheckboxes";
import { FormModal } from "./FormModal";
import { LegalLink } from "./LegalLink";


// "2026-11-02" -> "02.11.2026"
const TERMS_DATE = TERMS_VERSION.split("-").reverse().join(".");

// Shown on the start page to a signed-in user who still has to agree:
// - "first": never accepted the AGB / confirmed their age - i.e. an account
//   that was created by logging in with Google through the login tab, which
//   has no checkboxes.
// - "update": accepted an older AGB version (AGB § 12: changes only bind
//   existing accounts once they agree). The age was confirmed at sign-up.
// It can't be closed: the only ways out are accepting or logging out.
export function ConsentDialog({ kind }: { kind: "first" | "update" }) {
  const router = useRouter();
  const t = useTranslations("consent");
  const tCommon = useTranslations("common");
  const titleId = useId();
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [confirmedAge, setConfirmedAge] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;

    if (!acceptedTerms) {
      setError(t(kind === "update" ? "updatedTermsError" : CONSENT_TERMS_ERROR));
      return;
    }
    if (kind === "first" && !confirmedAge) {
      setError(t(CONSENT_AGE_ERROR, CONSENT_AGE_VALUES));
      return;
    }

    setError(null);
    setSaving(true);
    try {
      const response = await fetch("/auth/consent", { method: "POST" });
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(body?.error ?? tCommon("genericError"));
        return;
      }
      router.refresh();
    } catch {
      setError(tCommon("genericError"));
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    setSaving(true);
    try {
      await createClient().auth.signOut();
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <FormModal
      titleId={titleId}
      onSubmitAction={handleSubmit}
      onCloseAction={() => {}}
      closeDisabled
      header={kind === "update" ? t("updateTitle") : t("firstTitle")}
      footer={
        <>
          <Button variant="outline" onClick={handleLogout} disabled={saving}>
            {t("cancelAndLogout")}
          </Button>
          <Button variant="primary" type="submit" disabled={saving}>
            {saving ? tCommon("sending") : kind === "update" ? t("agree") : t("confirm")}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {kind === "update" ? (
          <>
            <p>
              {t("updateText", { date: TERMS_DATE })}
            </p>

            <label className="flex items-start gap-2 text-left text-sm">
              <input
                name="acceptedTerms"
                type="checkbox"
                required
                checked={acceptedTerms}
                disabled={saving}
                onChange={(event) => setAcceptedTerms(event.target.checked)}
                className="mt-0.5 h-5 w-5 shrink-0 rounded border-leaf/40"
              />
              <span>
                {t.rich("updateCheckbox", {
                  terms: (chunks) => (
                    <LegalLink document="terms" className="underline underline-offset-2 hover:text-leaf-dark">
                      {chunks}
                    </LegalLink>
                  ),
                })}
              </span>
            </label>
          </>
        ) : (
          <>
            <p>
              {t("googleText")}
            </p>

            <ConsentCheckboxes
              acceptedTerms={acceptedTerms}
              confirmedAge={confirmedAge}
              disabled={saving}
              onAcceptedTermsChange={setAcceptedTerms}
              onConfirmedAgeChange={setConfirmedAge}
            />
          </>
        )}

        {error ? (
          <p className="text-sm text-danger" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </FormModal>
  );
}
