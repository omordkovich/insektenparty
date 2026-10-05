"use client";

import { useRouter } from "next/navigation";
import { useId, useRef, useState, type SubmitEvent } from "react";
import { DISPLAY_NAME_KEY } from "@/lib/account";
import { PASSWORD_MIN_LENGTH, validateNewPassword } from "@/lib/password";
import {
  serializeSignupIntent,
  SIGNUP_INTENT_COOKIE,
  SIGNUP_INTENT_MAX_AGE_SECONDS,
  SIGNUP_INTENT_PATH,
} from "@/lib/signup-intent";
import { createClient } from "@/lib/supabase/client";
import { consentMetadata } from "@/lib/terms-consent";
import { NAME_MAX_LENGTH, validateEmail, validatePersonName } from "@/lib/validation";
import { Button } from "./Button";
import {
  CONSENT_AGE_ERROR,
  CONSENT_TERMS_ERROR,
  ConsentCheckboxes,
} from "./ConsentCheckboxes";
import { FormModal } from "./FormModal";
import { GoogleIcon } from "./GoogleIcon";
import { PasswordHint } from "./PasswordHint";
import { PasswordInput } from "./PasswordInput";
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
  const nameInputRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<AuthDialogMode>(initialMode);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [fieldError, setFieldError] = useState<string | null>(null);
  // The display name field is the one the error message is about.
  const [nameInvalid, setNameInvalid] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmationSent, setConfirmationSent] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [recaptchaReset, setRecaptchaReset] = useState(0);

  // The rule hint goes away as soon as the new password satisfies every rule.
  const showPasswordHint = mode === "register" && validateNewPassword(form.password) !== null;

  function switchMode(nextMode: AuthDialogMode) {
    setMode(nextMode);
    setFieldError(null);
    setNameInvalid(false);
    setSubmitError(null);
    setConfirmationSent(false);
    setResetSent(false);
  }

  function failName(message: string) {
    setFieldError(message);
    setNameInvalid(true);
    nameInputRef.current?.focus();
  }

  async function handleGoogle() {
    if (saving) return;

    setFieldError(null);
    setNameInvalid(false);
    setSubmitError(null);

    // Registering needs the same name and consent as the email form. (Logging
    // in does not: an account that is still missing them is asked on the
    // start page.)
    let displayName: string | null = null;
    if (mode === "register") {
      const nameResult = validatePersonName(form.name);
      if (!nameResult.ok) {
        failName(nameResult.error);
        return;
      }
      if (!form.acceptedTerms) {
        setFieldError(CONSENT_TERMS_ERROR);
        return;
      }
      if (!form.confirmedAge) {
        setFieldError(CONSENT_AGE_ERROR);
        return;
      }
      displayName = nameResult.value;
    }

    // Handed to /auth/callback through a short-lived cookie (not the URL).
    // Always written or cleared, so an abandoned register attempt can't leak
    // into a later login.
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${SIGNUP_INTENT_COOKIE}=${
      displayName ? serializeSignupIntent(displayName) : ""
    }; Path=${SIGNUP_INTENT_PATH}; Max-Age=${
      displayName ? SIGNUP_INTENT_MAX_AGE_SECONDS : 0
    }; SameSite=Lax${secure}`;

    setSaving(true);
    try {
      const { error } = await createClient().auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}${SIGNUP_INTENT_PATH}` },
      });
      if (error) {
        setSubmitError(error.message);
        setSaving(false);
      }
      // On success the browser navigates to Google; keep the dialog locked.
    } catch {
      setSubmitError("Etwas ist schiefgelaufen. Bitte versuche es erneut.");
      setSaving(false);
    }
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;

    setFieldError(null);
    setNameInvalid(false);
    setSubmitError(null);

    // Checked in the order of the form fields, so the message always refers
    // to the topmost field that needs fixing.
    let name = "";
    if (mode === "register") {
      const nameResult = validatePersonName(form.name);
      if (!nameResult.ok) {
        failName(nameResult.error);
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
        setFieldError(CONSENT_TERMS_ERROR);
        return;
      }
      if (!form.confirmedAge) {
        setFieldError(CONSENT_AGE_ERROR);
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
            [DISPLAY_NAME_KEY]: name,
            ...consentMetadata(),
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
                Anzeigename
              </label>
              <input
                ref={nameInputRef}
                id={nameId}
                name="name"
                type="text"
                autoComplete="nickname"
                maxLength={NAME_MAX_LENGTH}
                placeholder="Dein Anzeigename"
                value={form.name}
                disabled={saving}
                aria-invalid={nameInvalid}
                onChange={(event) => {
                  setNameInvalid(false);
                  setForm((current) => ({ ...current, name: event.target.value }));
                }}
                className={`w-full rounded-xl border bg-white px-3 py-3 ${
                  nameInvalid ? "border-danger" : "border-leaf/25"
                }`}
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
              <PasswordInput
                id={passwordId}
                name="password"
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
                aria-describedby={showPasswordHint ? passwordHintId : undefined}
              />
              {showPasswordHint ? (
                <PasswordHint id={passwordHintId} />
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
                <PasswordInput
                  id={passwordConfirmId}
                  name="passwordConfirm"
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
                />
              </div>

              <ConsentCheckboxes
                acceptedTerms={form.acceptedTerms}
                confirmedAge={form.confirmedAge}
                disabled={saving}
                onAcceptedTermsChange={(checked) =>
                  setForm((current) => ({ ...current, acceptedTerms: checked }))
                }
                onConfirmedAgeChange={(checked) =>
                  setForm((current) => ({ ...current, confirmedAge: checked }))
                }
              />

              <RecaptchaCheckbox
                onTokenChange={setRecaptchaToken}
                resetSignal={recaptchaReset}
              />
            </>
          ) : null}

          {mode !== "reset" ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm text-foreground/60">
                <span className="h-px flex-1 bg-leaf/20" />
                oder
                <span className="h-px flex-1 bg-leaf/20" />
              </div>
              <Button
                variant="outline"
                className="w-full gap-3"
                onClick={handleGoogle}
                disabled={saving}
              >
                <GoogleIcon />
                Mit Google fortfahren
              </Button>
            </div>
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
