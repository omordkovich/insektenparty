"use client";

import { useRouter } from "next/navigation";
import { useId, useState, type SubmitEvent } from "react";
import { DISPLAY_NAME_KEY } from "@/lib/account";
import { createClient } from "@/lib/supabase/client";
import { NAME_MAX_LENGTH, validatePersonName } from "@/lib/validation";
import { Button } from "./Button";

type AccountNameFormProps = {
  currentName: string;
  onDoneAction: () => void;
  onCancelAction: () => void;
};

export function AccountNameForm({ currentName, onDoneAction, onCancelAction }: AccountNameFormProps) {
  const router = useRouter();
  const nameId = useId();
  const [name, setName] = useState(currentName);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;

    setError(null);
    const result = validatePersonName(name);
    if (!result.ok) {
      setError(result.error);
      return;
    }

    setSaving(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({
        data: { [DISPLAY_NAME_KEY]: result.value },
      });
      if (updateError) {
        setError(updateError.message);
        return;
      }
      // The start page reads the name from the session's JWT, which only
      // carries the new metadata after a refresh.
      await supabase.auth.refreshSession();
      router.refresh();
      onDoneAction();
    } catch {
      setError("Etwas ist schiefgelaufen. Bitte versuche es erneut.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="mt-4 space-y-4">
      <div>
        <label htmlFor={nameId} className="mb-1 block text-sm font-bold">
          Anzeigename
        </label>
        <input
          id={nameId}
          name="name"
          type="text"
          autoComplete="name"
          maxLength={NAME_MAX_LENGTH}
          value={name}
          disabled={saving}
          onChange={(event) => setName(event.target.value)}
          className="w-full rounded-xl border border-leaf/25 bg-white px-3 py-3"
        />
      </div>

      {error ? (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="outline" onClick={onCancelAction} disabled={saving}>
          Abbrechen
        </Button>
        <Button variant="primary" type="submit" disabled={saving}>
          {saving ? "Wird gespeichert ..." : "Speichern"}
        </Button>
      </div>
    </form>
  );
}
