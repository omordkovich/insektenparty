"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useId, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "./Button";
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
  onClose: () => void;
};

export function AuthDialog({ initialMode = "login", onClose }: AuthDialogProps) {
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

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.classList.add("modal-open");
    document.body.style.overflow = "hidden";
    emailInputRef.current?.focus();

    return () => {
      document.body.classList.remove("modal-open");
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      event.preventDefault();
      if (saving) return;
      onClose();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [saving, onClose]);

  function requestClose() {
    if (saving) return;
    onClose();
  }

  function switchMode(nextMode: AuthDialogMode) {
    setMode(nextMode);
    setFieldError(null);
    setSubmitError(null);
    setConfirmationSent(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
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
        onClose();
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
    <div className="fixed inset-0 z-50 flex items-end justify-center p-3 sm:items-center sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-black/55"
        aria-label="Dialog schließen"
        onClick={requestClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 flex max-h-[95dvh] w-full max-w-md flex-col overflow-hidden rounded-3xl bg-surface p-1 shadow-[var(--shadow)]"
      >
        <form onSubmit={handleSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
          <div className="shrink-0 p-5 pb-4 sm:p-7 sm:pb-4">
            <button
              type="button"
              onClick={requestClose}
              disabled={saving}
              aria-label="Schließen"
              className="absolute top-4 right-4 inline-flex h-8 w-8 items-center justify-center rounded-full text-leaf-dark transition hover:bg-leaf/10 disabled:opacity-50"
            >
              <CloseIcon />
            </button>

            <h2
              id={titleId}
              className="pr-8 font-[family-name:var(--font-display)] text-2xl text-leaf-dark"
            >
              {mode === "login" ? "Login" : "Registrieren"}
            </h2>
          </div>

          <div
            className="mr-4 min-h-0 flex-1 overflow-y-auto px-5 pb-5 sm:px-7 sm:pb-7"
            style={{ scrollbarGutter: "stable" }}
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
          </div>

          <div className="flex shrink-0 flex-col-reverse gap-2 p-5 pt-3 sm:flex-row sm:justify-end sm:p-7 sm:pt-4">
            <Button variant="outline" onClick={requestClose} disabled={saving}>
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
          </div>
        </form>
      </div>
    </div>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
