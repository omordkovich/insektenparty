"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useId, useRef, useState, type SubmitEvent } from "react";
import type { ErrorMessage } from "@/i18n/errors";
import { rememberLocale } from "@/i18n/locale-cookie";
import { splitLocalePrefix } from "@/i18n/locale-path";
import { languageSwitchHref } from "@/i18n/switch-url";
import { getAccountLocale } from "@/lib/account";
import { PASSWORD_MIN_LENGTH, validateNewPassword } from "@/lib/password";
import { createClient } from "@/lib/supabase/client";
import {
  consentMetadata,
  GOOGLE_CONSENT_COOKIE,
  GOOGLE_CONSENT_COOKIE_MAX_AGE_SECONDS,
  GOOGLE_CONSENT_COOKIE_PATH,
} from "@/lib/terms-consent";
import { NAME_MAX_LENGTH, validateEmail, validatePersonName } from "@/lib/validation";
import { Button } from "./Button";
import {
  CONSENT_AGE_ERROR,
  CONSENT_AGE_VALUES,
  CONSENT_TERMS_ERROR,
  ConsentCheckboxes,
} from "./ConsentCheckboxes";
import { FormModal } from "./FormModal";
import { GoogleIcon } from "./GoogleIcon";
import { PasswordHint } from "./PasswordHint";
import { PasswordInput } from "./PasswordInput";
import { RecaptchaCheckbox } from "./RecaptchaCheckbox";
import { useErrorText } from "./useErrorText";

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
  // Where to go after a successful password login. Without it the current
  // page is just refreshed - enough on the start page, which then shows the
  // event list, but static pages (e.g. /einladung) would look unchanged.
  afterLoginHref?: string;
};

export function AuthDialog({
  initialMode = "login",
  onCloseAction,
  afterLoginHref,
}: AuthDialogProps) {
  const t = useTranslations("auth");
  const errorText = useErrorText();
  const passwordText = (error: ErrorMessage | null) => (error ? errorText(error) : null);
  const router = useRouter();
  const locale = useLocale();
  const tConsent = useTranslations("consent");
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

  async function handleGoogle() {
    if (saving) return;

    setFieldError(null);
    setNameInvalid(false);
    setSubmitError(null);

    // Registering needs the same consent as the email form. The name comes
    // from the Google account. (Logging in needs no checkboxes: an account
    // that never consented is asked on the start page.)
    if (mode === "register") {
      if (!form.acceptedTerms) {
        setFieldError(tConsent(CONSENT_TERMS_ERROR));
        return;
      }
      if (!form.confirmedAge) {
        setFieldError(tConsent(CONSENT_AGE_ERROR, CONSENT_AGE_VALUES));
        return;
      }
    }

    // Always written or cleared, so an abandoned register attempt can't leak
    // into a later login.
    const registering = mode === "register";
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${GOOGLE_CONSENT_COOKIE}=${registering ? "1" : ""}; Path=${GOOGLE_CONSENT_COOKIE_PATH}; Max-Age=${
      registering ? GOOGLE_CONSENT_COOKIE_MAX_AGE_SECONDS : 0
    }; SameSite=Lax${secure}`;

    setSaving(true);
    try {
      // Google sign-up: the callback takes this language for the new account.
      rememberLocale(locale);
      const { error } = await createClient().auth.signInWithOAuth({
        provider: "google",
        // Exactly the URL on Supabase's redirect allow-list: no query string.
        options: { redirectTo: `${window.location.origin}${GOOGLE_CONSENT_COOKIE_PATH}` },
      });
      if (error) {
        setSubmitError(error.message);
        setSaving(false);
      }
      // On success the browser navigates to Google; keep the dialog locked.
    } catch {
      setSubmitError(t("etwasIstSchiefgelaufenBitte"));
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
        setFieldError(errorText(nameResult.error));
        setNameInvalid(true);
        nameInputRef.current?.focus();
        return;
      }
      name = nameResult.value;
    }

    const emailResult = validateEmail(form.email);
    if (!emailResult.ok) {
      setFieldError(errorText(emailResult.error));
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
        setSubmitError(t("etwasIstSchiefgelaufenBitte"));
      } finally {
        setSaving(false);
      }
      return;
    }

    // New passwords must meet the rules; login only needs one entered, so
    // accounts with older, shorter passwords can still sign in.
    const passwordError =
      mode === "register"
        ? passwordText(validateNewPassword(form.password))
        : form.password
          ? null
          : t("bitteGibDeinPasswort");
    if (passwordError) {
      setFieldError(passwordError);
      return;
    }

    if (mode === "register") {
      if (form.password !== form.passwordConfirm) {
        setFieldError(t("diePassworterStimmenNicht"));
        return;
      }
      if (!form.acceptedTerms) {
        setFieldError(tConsent(CONSENT_TERMS_ERROR));
        return;
      }
      if (!form.confirmedAge) {
        setFieldError(tConsent(CONSENT_AGE_ERROR, CONSENT_AGE_VALUES));
        return;
      }
      if (!recaptchaToken) {
        setFieldError(t("bitteBestatigeDassDu"));
        return;
      }
    }

    setSaving(true);
    try {
      const supabase = createClient();

      if (mode === "login") {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: form.password,
        });
        if (error) {
          setSubmitError(error.message);
          return;
        }
        // The account's language wins over this device's choice. A full
        // navigation lets the proxy move the page to that language.
        const accountLocale = getAccountLocale(data.user?.user_metadata);
        if (accountLocale && accountLocale !== locale) {
          rememberLocale(accountLocale);
          // The same page in the account's language (query string dropped,
          // as before: e.g. ?link_expired= would show its notice again).
          window.location.assign(
            afterLoginHref ?? languageSwitchHref(splitLocalePrefix(window.location.pathname).path, "", accountLocale),
          );
          return;
        }
        if (afterLoginHref) router.push(afterLoginHref);
        else router.refresh();
        onCloseAction();
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password: form.password,
        options: {
          data: {
            name,
            locale,
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
          t("dieseEMailAdresse"),
        );
        setRecaptchaReset((value) => value + 1);
        return;
      }

      setConfirmationSent(true);
    } catch {
      setSubmitError(t("etwasIstSchiefgelaufenBitte"));
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
        mode === "login" ? t("login") : mode === "register" ? t("register") : t("passwortZurucksetzen")
      }
      footer={
        <>
          <Button variant="outline" onClick={onCloseAction} disabled={saving}>
            {confirmationSent || resetSent ? t("schliessen") : t("abbrechen")}
          </Button>
          {confirmationSent || resetSent ? null : (
            <Button
              variant="primary"
              type="submit"
              disabled={saving || (mode === "register" && !recaptchaToken)}
            >
              {saving
                ? t("sending")
                : mode === "login"
                  ? t("logIn")
                  : mode === "register"
                    ? t("register")
                    : t("passwortZurucksetzen")}
            </Button>
          )}
        </>
      }
    >
      {confirmationSent || resetSent ? (
        <p>
          {confirmationSent
            ? t("fastGeschafftWirHaben")
            : t("fallsDieseEMail")}
        </p>
      ) : (
        <div className="space-y-4">
          {mode === "register" ? (
            <div>
              <label htmlFor={nameId} className="mb-1 block text-sm font-bold">
                {t("anzeigename")}
              </label>
              <input
                ref={nameInputRef}
                id={nameId}
                name="name"
                type="text"
                autoComplete="nickname"
                maxLength={NAME_MAX_LENGTH}
                placeholder={t("displayNamePlaceholder")}
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
              {t("eMail")}
            </label>
            <input
              ref={emailInputRef}
              id={emailId}
              name="email"
              type="email"
              autoComplete="email"
              placeholder={t("emailPlaceholder")}
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
                {t("passwort")}
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
                  {t("passwortWiederholen")}
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
                {t("oder")}
                <span className="h-px flex-1 bg-leaf/20" />
              </div>
              <Button
                variant="outline"
                className="w-full gap-3"
                onClick={handleGoogle}
                disabled={saving}
              >
                <GoogleIcon />
                {t("mitGoogleFortfahren")}
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
              {t("zuruckZumLogin")}
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
                  ? t("nochKeinKontoRegistrieren")
                  : t("schonEinKontoEinloggen")}
              </button>

              {mode === "login" ? (
                <button
                  type="button"
                  onClick={() => switchMode("reset")}
                  disabled={saving}
                  className="block text-sm text-leaf underline decoration-leaf/40 underline-offset-4 hover:text-leaf-dark disabled:opacity-50"
                >
                  {t("passwortVergessen")}
                </button>
              ) : null}
            </div>
          )}
        </div>
      )}
    </FormModal>
  );
}


