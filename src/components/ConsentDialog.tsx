"use client";

import { useRouter } from "next/navigation";
import { useId, useRef, useState, type SubmitEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { NAME_MAX_LENGTH, validatePersonName } from "@/lib/validation";
import { Button } from "./Button";
import {
  CONSENT_AGE_ERROR,
  CONSENT_TERMS_ERROR,
  ConsentCheckboxes,
} from "./ConsentCheckboxes";
import { FormModal } from "./FormModal";

type ConsentDialogProps = {
  // The account has no display name yet (Google doesn't give us one to use).
  askForName: boolean;
};

// Shown on the start page to a signed-in user who never completed the
// registration form - i.e. an account that was created by logging in with
// Google through the login tab, which has no name field or checkboxes. It
// can't be closed: the only ways out are completing it or logging out.
export function ConsentDialog({ askForName }: ConsentDialogProps) {
  const router = useRouter();
  const titleId = useId();
  const nameId = useId();
  const nameInputRef = useRef<HTMLInputElement>(null);
  const [displayName, setDisplayName] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [confirmedAge, setConfirmedAge] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nameInvalid, setNameInvalid] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;

    setNameInvalid(false);
    let name: string | null = null;
    if (askForName) {
      const nameResult = validatePersonName(displayName);
      if (!nameResult.ok) {
        setError(nameResult.error);
        setNameInvalid(true);
        nameInputRef.current?.focus();
        return;
      }
      name = nameResult.value;
    }
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
      const response = await fetch("/auth/consent", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ displayName: name }),
      });
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
          Dein Konto wurde über Google angelegt. Bevor du loslegen kannst, brauchen wir noch{" "}
          {askForName ? "deinen Anzeigenamen und " : ""}deine Zustimmung:
        </p>

        {askForName ? (
          <div className="text-left">
            <label htmlFor={nameId} className="mb-1 block text-sm font-bold">
              Anzeigename
            </label>
            <input
              ref={nameInputRef}
              id={nameId}
              name="displayName"
              type="text"
              autoComplete="nickname"
              maxLength={NAME_MAX_LENGTH}
              placeholder="Dein Anzeigename"
              value={displayName}
              disabled={saving}
              aria-invalid={nameInvalid}
              onChange={(event) => {
                setNameInvalid(false);
                setDisplayName(event.target.value);
              }}
              className={`w-full rounded-xl border bg-white px-3 py-3 ${
                nameInvalid ? "border-danger" : "border-leaf/25"
              }`}
            />
          </div>
        ) : null}

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
