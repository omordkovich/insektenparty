"use client";

import { useRouter } from "next/navigation";
import { useId, useState, type SubmitEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "./Button";
import {
  CONSENT_AGE_ERROR,
  CONSENT_TERMS_ERROR,
  ConsentCheckboxes,
} from "./ConsentCheckboxes";
import { FormModal } from "./FormModal";

// Shown on the start page to a signed-in user who never accepted the AGB /
// confirmed their age - i.e. an account that was created by logging in with
// Google through the login tab, which has no checkboxes. It can't be closed:
// the only ways out are accepting or logging out.
export function ConsentDialog() {
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
      setError(CONSENT_TERMS_ERROR);
      return;
    }
    if (!confirmedAge) {
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
      header="Fast geschafft"
      footer={
        <>
          <Button variant="outline" onClick={handleLogout} disabled={saving}>
            Abbrechen und ausloggen
          </Button>
          <Button variant="primary" type="submit" disabled={saving}>
            {saving ? "Wird gesendet ..." : "Bestätigen"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
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

        {error ? (
          <p className="text-sm text-danger" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </FormModal>
  );
}
