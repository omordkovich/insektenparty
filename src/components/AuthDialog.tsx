"use client";

import { useRouter } from "next/navigation";
import { useId, useRef, useState, type SubmitEvent } from "react";
import { MIN_REGISTRATION_AGE, PRIVACY_VERSION, TERMS_VERSION } from "@/lib/legal-info";
import { PASSWORD_HINT, PASSWORD_MIN_LENGTH, validateNewPassword } from "@/lib/password";
import { createClient } from "@/lib/supabase/client";
import { NAME_MAX_LENGTH, validateEmail, validatePersonName } from "@/lib/validation";
import { Button } from "./Button";
import { FormModal } from "./FormModal";
import { LegalLink } from "./LegalLink";
import { RecaptchaCheckbox } from "./RecaptchaCheckbox";

export type AuthDialogMode = "login" | "register" | "reset";


type FormState = {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
  acceptedTerms: boolean;
  confirmedAge: boolean;
};

const emptyForm: FormState = {
  name: "",
  email: "",
  password: "",
  passwordConfirm: "",
  acceptedTerms: false,
  confirmedAge: false,
};

type AuthDialogProps = {
  initialMode?: AuthDialogMode;
  onCloseAction: () => void;
};

export function AuthDialog({ initialMode = "login", onCloseAction }: AuthDialogProps) {
  const router = useRouter();
  const titleId = useId();
  const nameId = useId();
  const emailId = useId();
  const passwordId = useId();
  const passwordConfirmId = useId();
  const passwordHintId = useId();
  const emailInputRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<AuthDialogMode>(initialMode);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmationSent, setConfirmationSent] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [recaptchaReset, setRecaptchaReset] = useState(0);

  function switchMode(nextMode: AuthDialogMode) {
    setMode(nextMode);
    setFieldError(null);
    setSubmitError(null);
    setConfirmationSent(false);
    setResetSent(false);
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;

    setFieldError(null);
    setSubmitError(null);

    // Checked in the order of the form fields, so the message always refers
    // to the topmost field that needs fixing.
    let name = "";
    if (mode === "register") {
      const nameResult = validatePersonName(form.name);
      if (!nameResult.ok) {
        setFieldError(nameResult.error);
        return;
      }
      name = nameResult.value;
    }

    const emailResult = validateEmail(form.email);
    if (!emailResult.ok) {
      setFieldError(emailResult.error);
      return;
    }
    const email = emailResult.value;

    if (mode === "reset") {
      setSaving(true);
      try {
        const supabase = createClient();
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        });
        if (error) {
          setSubmitError(error.message);
          return;
        }
        // Supabase never reveals whether the email is actually registered
        // here (to avoid leaking that), so this message is shown either way.
        setResetSent(true);
      } catch {
        setSubmitError("Etwas ist schiefgelaufen. Bitte versuche es erneut.");
      } finally {
        setSaving(false);
      }
      return;
    }

    // New passwords must meet the rules; login only needs one entered, so
    // accounts with older, shorter passwords can still sign in.
    const passwordError =
      mode === "register"
        ? validateNewPassword(form.password)
        : form.password
          ? null
          : "Bitte gib dein Passwort ein.";
    if (passwordError) {
      setFieldError(passwordError);
      return;
    }

    if (mode === "register") {
      if (form.password !== form.passwordConfirm) {
        setFieldError("Die Passwörter stimmen nicht überein.");
        return;
      }
      if (!form.acceptedTerms) {
        setFieldError(
          "Bitte akzeptiere die AGB und bestätige, dass du die Datenschutzerklärung zur Kenntnis genommen hast.",
        );
        return;
      }
      if (!form.confirmedAge) {
        setFieldError(
          `Bitte bestätige, dass du mindestens ${MIN_REGISTRATION_AGE} Jahre alt bist.`,
        );
        return;
      }
      if (!recaptchaToken) {
        setFieldError("Bitte bestätige, dass du kein Roboter bist.");
        return;
      }
    }

    setSaving(true);
    try {
      const supabase = createClient();

      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password: form.password,
        });
        if (error) {
          setSubmitError(error.message);
          return;
        }
        router.refresh();
        onCloseAction();
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password: form.password,
        options: {
          data: {
            name,
            // Proof of which AGB/privacy policy version was accepted, and
            // that the minimum age was confirmed - and when.
            terms_accepted_at: new Date().toISOString(),
            terms_version: TERMS_VERSION,
            privacy_version: PRIVACY_VERSION,
            min_age_confirmed: MIN_REGISTRATION_AGE,
          },
        },
      });
      if (error) {
        setSubmitError(error.message);
        setRecaptchaReset((value) => value + 1);
        return;
      }

      // Supabase never returns an error for a duplicate email (to avoid
      // leaking which addresses are registered) - it returns a user with an
      // empty identities array instead. That's the only way to detect it.
      if (data.user && data.user.identities?.length === 0) {
        setSubmitError(
          "Diese E-Mail-Adresse ist bereits registriert. Bitte melde dich stattdessen an.",
        );
        setRecaptchaReset((value) => value + 1);
        return;
      }

      setConfirmationSent(true);
    } catch {
      setSubmitError("Etwas ist schiefgelaufen. Bitte versuche es erneut.");
      setRecaptchaReset((value) => value + 1);
    } finally {
      setSaving(false);
    }
  }

  return (
    <FormModal
      titleId={titleId}
      onSubmitAction={handleSubmit}
      onCloseAction={onCloseAction}
      closeDisabled={saving}
      initialFocusRef={emailInputRef}
      header={
        mode === "login" ? "Login" : mode === "register" ? "Registrieren" : "Passwort zurücksetzen"
      }
      footer={
        <>
          <Button variant="outline" onClick={onCloseAction} disabled={saving}>
            {confirmationSent || resetSent ? "Schließen" : "Abbrechen"}
          </Button>
          {confirmationSent || resetSent ? null : (
            <Button
              variant="primary"
              type="submit"
              disabled={saving || (mode === "register" && !recaptchaToken)}
            >
              {saving
                ? "Wird gesendet ..."
                : mode === "login"
                  ? "Einloggen"
                  : mode === "register"
                    ? "Registrieren"
                    : "Passwort zurücksetzen"}
            </Button>
          )}
        </>
      }
    >
      {confirmationSent || resetSent ? (
        <p>
          {confirmationSent
            ? "Fast geschafft! Wir haben dir eine E-Mail geschickt — bitte klicke auf den Bestätigungslink, um dein Konto zu aktivieren."
            : "Falls diese E-Mail-Adresse bei uns registriert ist, haben wir dir eine E-Mail mit einem Link zum Zurücksetzen deines Passworts geschickt."}
        </p>
      ) : (
        <div className="space-y-4">
          {mode === "register" ? (
            <div>
              <label htmlFor={nameId} className="mb-1 block text-sm font-bold">
                Name
              </label>
              <input
                id={nameId}
                name="name"
                type="text"
                autoComplete="name"
                maxLength={NAME_MAX_LENGTH}
                placeholder="Dein Name"
                value={form.name}
                disabled={saving}
                onChange={(event) =>
                  setForm((current) => ({ ...current, name: event.target.value }))
                }
                className="w-full rounded-xl border border-leaf/25 bg-white px-3 py-3"
              />
            </div>
          ) : null}

          <div>
            <label htmlFor={emailId} className="mb-1 block text-sm font-bold">
              E-Mail
            </label>
            <input
              ref={emailInputRef}
              id={emailId}
              name="email"
              type="email"
              autoComplete="email"
              placeholder="name@beispiel.de"
              value={form.email}
              disabled={saving}
              onChange={(event) =>
                setForm((current) => ({ ...current, email: event.target.value }))
              }
              className="w-full rounded-xl border border-leaf/25 bg-white px-3 py-3"
            />
          </div>

          {mode !== "reset" ? (
            <div>
              <label htmlFor={passwordId} className="mb-1 block text-sm font-bold">
                Passwort
              </label>
              <input
                id={passwordId}
                name="password"
                type="password"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                minLength={mode === "register" ? PASSWORD_MIN_LENGTH : undefined}
                value={form.password}
                disabled={saving}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    password: event.target.value,
                  }))
                }
                aria-describedby={mode === "register" ? passwordHintId : undefined}
                className="w-full rounded-xl border border-leaf/25 bg-white px-3 py-3"
              />
              {mode === "register" ? (
                <p id={passwordHintId} className="mt-1 text-xs text-muted">
                  {PASSWORD_HINT}
                </p>
              ) : null}
            </div>
          ) : null}

          {mode === "register" ? (
            <>
              <div>
                <label
                  htmlFor={passwordConfirmId}
                  className="mb-1 block text-sm font-bold"
                >
                  Passwort wiederholen
                </label>
                <input
                  id={passwordConfirmId}
                  name="passwordConfirm"
                  type="password"
                  autoComplete="new-password"
                  minLength={PASSWORD_MIN_LENGTH}
                  value={form.passwordConfirm}
                  disabled={saving}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      passwordConfirm: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-leaf/25 bg-white px-3 py-3"
                />
              </div>

              <label className="flex items-start gap-2 text-left text-sm">
                <input
                  name="acceptedTerms"
                  type="checkbox"
                  required
                  checked={form.acceptedTerms}
                  disabled={saving}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      acceptedTerms: event.target.checked,
                    }))
                  }
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
                  checked={form.confirmedAge}
                  disabled={saving}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      confirmedAge: event.target.checked,
                    }))
                  }
                  className="mt-0.5 h-5 w-5 shrink-0 rounded border-leaf/40"
                />
                <span>Ich bin mindestens {MIN_REGISTRATION_AGE} Jahre alt.</span>
              </label>

              <RecaptchaCheckbox
                onTokenChange={setRecaptchaToken}
                resetSignal={recaptchaReset}
              />
            </>
          ) : null}

          {fieldError || submitError ? (
            <p className="text-sm text-danger" role="alert">
              {fieldError ?? submitError}
            </p>
          ) : null}

          {mode === "reset" ? (
            <button
              type="button"
              onClick={() => switchMode("login")}
              disabled={saving}
              className="text-sm text-leaf underline decoration-leaf/40 underline-offset-4 hover:text-leaf-dark disabled:opacity-50"
            >
              Zurück zum Login
            </button>
          ) : (
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => switchMode(mode === "login" ? "register" : "login")}
                disabled={saving}
                className="block text-sm text-leaf underline decoration-leaf/40 underline-offset-4 hover:text-leaf-dark disabled:opacity-50"
              >
                {mode === "login"
                  ? "Noch kein Konto? Registrieren"
                  : "Schon ein Konto? Einloggen"}
              </button>

              {mode === "login" ? (
                <button
                  type="button"
                  onClick={() => switchMode("reset")}
                  disabled={saving}
                  className="block text-sm text-leaf underline decoration-leaf/40 underline-offset-4 hover:text-leaf-dark disabled:opacity-50"
                >
                  Passwort vergessen?
                </button>
              ) : null}
            </div>
          )}
        </div>
      )}
    </FormModal>
  );
}
