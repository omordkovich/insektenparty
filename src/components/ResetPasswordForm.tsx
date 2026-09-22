"use client";

import Link from "next/link";
import { useId, useState, type SubmitEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { PASSWORD_MIN_LENGTH } from "./AuthDialog";
import { Button } from "./Button";

export function ResetPasswordForm() {
  const passwordId = useId();
  const passwordConfirmId = useId();

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;

    setFieldError(null);
    setSubmitError(null);

    if (password.length < PASSWORD_MIN_LENGTH) {
      setFieldError(`Passwort muss mindestens ${PASSWORD_MIN_LENGTH} Zeichen lang sein.`);
      return;
    }
    if (password !== passwordConfirm) {
      setFieldError("Die Passwörter stimmen nicht überein.");
      return;
    }

    setSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setSubmitError(error.message);
        return;
      }
      setDone(true);
    } catch {
      setSubmitError("Etwas ist schiefgelaufen. Bitte versuche es erneut.");
    } finally {
      setSaving(false);
    }
  }

  if (done) {
    return (
      <div className="space-y-4 text-center">
        <p>Dein Passwort wurde erfolgreich geändert.</p>
        <Link
          href="/"
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-leaf px-4 font-bold text-white transition hover:bg-leaf-dark"
        >
          Zur Startseite
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div>
        <label htmlFor={passwordId} className="mb-1 block text-sm font-bold">
          Neues Passwort
        </label>
        <input
          id={passwordId}
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={PASSWORD_MIN_LENGTH}
          value={password}
          disabled={saving}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-xl border border-leaf/25 bg-white px-3 py-3"
        />
      </div>

      <div>
        <label htmlFor={passwordConfirmId} className="mb-1 block text-sm font-bold">
          Neues Passwort wiederholen
        </label>
        <input
          id={passwordConfirmId}
          name="passwordConfirm"
          type="password"
          autoComplete="new-password"
          minLength={PASSWORD_MIN_LENGTH}
          value={passwordConfirm}
          disabled={saving}
          onChange={(event) => setPasswordConfirm(event.target.value)}
          className="w-full rounded-xl border border-leaf/25 bg-white px-3 py-3"
        />
      </div>

      {fieldError || submitError ? (
        <p className="text-sm text-danger" role="alert">
          {fieldError ?? submitError}
        </p>
      ) : null}

      <Button variant="primary" type="submit" className="w-full" disabled={saving}>
        {saving ? "Wird gespeichert ..." : "Passwort speichern"}
      </Button>
    </form>
  );
}
