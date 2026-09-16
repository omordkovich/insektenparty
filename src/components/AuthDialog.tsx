"use client";

import { useRouter } from "next/navigation";
import { useId, useRef, useState, type SubmitEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "./Button";
import { FormModal } from "./FormModal";
import { RecaptchaCheckbox } from "./RecaptchaCheckbox";

export type AuthDialogMode = "login" | "register";

const NAME_MAX_LENGTH = 100;
const PASSWORD_MIN_LENGTH = 6;

type FormState = {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
};

const emptyForm: FormState = { name: "", email: "", password: "", passwordConfirm: "" };

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
  const emailInputRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<AuthDialogMode>(initialMode);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmationSent, setConfirmationSent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [recaptchaReset, setRecaptchaReset] = useState(0);

  function switchMode(nextMode: AuthDialogMode) {
    setMode(nextMode);
    setFieldError(null);
    setSubmitError(null);
    setConfirmationSent(false);
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;

    setFieldError(null);
    setSubmitError(null);

    const email = form.email.trim();
    if (!email) {
      setFieldError("E-Mail ist erforderlich.");
      return;
    }

    if (form.password.length < PASSWORD_MIN_LENGTH) {
      setFieldError(
        `Passwort muss mindestens ${PASSWORD_MIN_LENGTH} Zeichen lang sein.`,
      );
      return;
    }

    if (mode === "register") {
      const name = form.name.trim();
      if (!name) {
        setFieldError("Name ist erforderlich.");
        return;
      }
      if (name.length > NAME_MAX_LENGTH) {
        setFieldError(`Name darf höchstens ${NAME_MAX_LENGTH} Zeichen lang sein.`);
        return;
      }
      if (form.password !== form.passwordConfirm) {
        setFieldError("Die Passwörter stimmen nicht überein.");
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

      const { error } = await supabase.auth.signUp({
        email,
        password: form.password,
        options: { data: { name: form.name.trim() } },
      });
      if (error) {
        setSubmitError(error.message);
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
      header={mode === "login" ? "Login" : "Registrieren"}
      footer={
        <>
          <Button variant="outline" onClick={onCloseAction} disabled={saving}>
            {confirmationSent ? "Schließen" : "Abbrechen"}
          </Button>
          {confirmationSent ? null : (
            <Button
              variant="primary"
              type="submit"
              disabled={saving || (mode === "register" && !recaptchaToken)}
            >
              {saving
                ? "Wird gesendet ..."
                : mode === "login"
                  ? "Einloggen"
                  : "Registrieren"}
            </Button>
          )}
        </>
      }
    >
      {confirmationSent ? (
        <p>
          Fast geschafft! Wir haben dir eine E-Mail geschickt — bitte klicke auf
          den Bestätigungslink, um dein Konto zu aktivieren.
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

          <div>
            <label htmlFor={passwordId} className="mb-1 block text-sm font-bold">
              Passwort
            </label>
            <input
              id={passwordId}
              name="password"
              type="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              minLength={PASSWORD_MIN_LENGTH}
              value={form.password}
              disabled={saving}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  password: event.target.value,
                }))
              }
              className="w-full rounded-xl border border-leaf/25 bg-white px-3 py-3"
            />
          </div>

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

          <button
            type="button"
            onClick={() => switchMode(mode === "login" ? "register" : "login")}
            disabled={saving}
            className="text-sm text-leaf underline decoration-leaf/40 underline-offset-4 hover:text-leaf-dark disabled:opacity-50"
          >
            {mode === "login"
              ? "Noch kein Konto? Registrieren"
              : "Schon ein Konto? Einloggen"}
          </button>
        </div>
      )}
    </FormModal>
  );
}
