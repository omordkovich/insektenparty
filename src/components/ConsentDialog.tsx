"use client";

import { useRouter } from "next/navigation";
import { useId, useState, type SubmitEvent } from "react";
import { TERMS_VERSION } from "@/lib/legal-info";
import { createClient } from "@/lib/supabase/client";
import { Button } from "./Button";
import {
  CONSENT_AGE_ERROR,
  CONSENT_TERMS_ERROR,
  ConsentCheckboxes,
} from "./ConsentCheckboxes";
import { FormModal } from "./FormModal";
import { LegalLink } from "./LegalLink";

const UPDATED_TERMS_ERROR = "Bitte stimme den geänderten AGB zu.";

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
  const titleId = useId();
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [confirmedAge, setConfirmedAge] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;

    if (!acceptedTerms) {
      setError(kind === "update" ? UPDATED_TERMS_ERROR : CONSENT_TERMS_ERROR);
      return;
    }
    if (kind === "first" && !confirmedAge) {
      setError(CONSENT_AGE_ERROR);
      return;
    }

    setError(null);
    setSaving(true);
    try {
      const response = await fetch("/auth/consent", { method: "POST" });
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(body?.error ?? "Etwas ist schiefgelaufen. Bitte versuche es erneut.");
        return;
      }
      router.refresh();
    } catch {
      setError("Etwas ist schiefgelaufen. Bitte versuche es erneut.");
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
      header={kind === "update" ? "Wir haben unsere AGB geändert" : "Fast geschafft"}
      footer={
        <>
          <Button variant="outline" onClick={handleLogout} disabled={saving}>
            Abbrechen und ausloggen
          </Button>
          <Button variant="primary" type="submit" disabled={saving}>
            {saving ? "Wird gesendet ..." : kind === "update" ? "Zustimmen" : "Bestätigen"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {kind === "update" ? (
          <>
            <p>
              Unsere AGB haben einen neuen Stand ({TERMS_DATE}). Damit du weiter Events anlegen
              und Erweiterungen kaufen kannst, brauchen wir deine Zustimmung. Deine bestehenden
              Events und bereits gekaufte Erweiterungen bleiben, wie sie sind.
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
                Ich stimme den geänderten{" "}
                <LegalLink document="terms" className="underline underline-offset-2 hover:text-leaf-dark">
                  AGB
                </LegalLink>{" "}
                zu.
              </span>
            </label>
          </>
        ) : (
          <>
            <p>
              Dein Konto wurde über Google angelegt. Bevor du loslegen kannst, brauchen wir noch
              deine Zustimmung:
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
