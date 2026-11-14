import { useEffect, useId, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { createPortal } from "react-dom";
import { Button } from "./Button";
import { CookieSettingsDialog } from "./CookieSettingsDialog";
import { themePortalTarget } from "./themePortalTarget";
import { useCookieConsent } from "./useCookieConsent";

const SCRIPT_ID = "google-recaptcha-v2";
// The widget's language ("I'm not a robot") follows the page.
const scriptSrc = (locale: string) => `https://www.google.com/recaptcha/api.js?render=explicit&hl=${locale}`;

type Grecaptcha = {
  ready: (callback: () => void) => void;
  render: (
    container: HTMLElement,
    parameters: {
      sitekey: string;
      callback: (token: string) => void;
      "expired-callback": () => void;
      "error-callback": () => void;
    },
  ) => number;
  reset: (widgetId?: number) => void;
};

declare global {
  interface Window {
    grecaptcha?: Grecaptcha;
  }
}

function loadRecaptchaScript(locale: string): Promise<Grecaptcha> {
  if (window.grecaptcha) {
    return Promise.resolve(window.grecaptcha);
  }

  return new Promise((resolve, reject) => {
    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => {
        if (window.grecaptcha) resolve(window.grecaptcha);
        else reject(new Error("reCAPTCHA could not be loaded."));
      });
      existing.addEventListener("error", () =>
        reject(new Error("reCAPTCHA could not be loaded.")),
      );
      return;
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = scriptSrc(locale);
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.grecaptcha) resolve(window.grecaptcha);
      else reject(new Error("reCAPTCHA could not be loaded."));
    };
    script.onerror = () =>
      reject(new Error("reCAPTCHA could not be loaded."));
    document.head.appendChild(script);
  });
}

type RecaptchaCheckboxProps = {
  onTokenChange: (token: string | null) => void;
  resetSignal: number;
};

export function RecaptchaCheckbox({
  onTokenChange,
  resetSignal,
}: RecaptchaCheckboxProps) {
  const t = useTranslations("auth");
  const locale = useLocale();
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<number | null>(null);
  const onTokenChangeRef = useRef(onTokenChange);
  const labelId = useId();
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  // Google's script is only loaded once the visitor consented to it.
  const { consent } = useCookieConsent();
  const consentGiven = consent?.recaptcha === true;
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Keeps the latest callback for the widget's async handlers without making
  // the effect below re-run (and re-render the widget) whenever the parent
  // re-renders. Declared first, so it also runs first after each render.
  useEffect(() => {
    onTokenChangeRef.current = onTokenChange;
  });

  useEffect(() => {
    if (!siteKey || !consentGiven || !containerRef.current) return;

    let cancelled = false;

    void loadRecaptchaScript(locale)
      .then(
        (grecaptcha) =>
          new Promise<void>((resolve) => {
            grecaptcha.ready(() => resolve());
          }).then(() => grecaptcha),
      )
      .then((grecaptcha) => {
        if (cancelled || !containerRef.current) return;
        if (widgetIdRef.current !== null) return;

        widgetIdRef.current = grecaptcha.render(containerRef.current, {
          sitekey: siteKey,
          callback: (token) => onTokenChangeRef.current(token),
          "expired-callback": () => onTokenChangeRef.current(null),
          "error-callback": () => onTokenChangeRef.current(null),
        });
      })
      .catch((error) => {
        console.error(error);
        onTokenChangeRef.current(null);
      });

    return () => {
      cancelled = true;
    };
  }, [siteKey, consentGiven, locale]);

  useEffect(() => {
    if (resetSignal === 0) return;
    if (widgetIdRef.current === null || !window.grecaptcha) return;
    window.grecaptcha.reset(widgetIdRef.current);
    onTokenChangeRef.current(null);
  }, [resetSignal]);

  if (!siteKey) {
    return (
      <p className="text-sm text-danger" role="alert">
        {t("recaptchaIstNichtKonfiguriert")}
      </p>
    );
  }

  if (!consentGiven) {
    return (
      <div className="rounded-2xl border border-leaf/20 p-4">
        <p id={labelId} className="text-sm font-bold">
          {t("sicherheitsprufung")}
        </p>
        <p className="mt-2 text-sm text-muted">
          {t("furDieSicherheitsprufungWird")}
        </p>
        <Button
          variant="outline"
          className="mt-3"
          aria-describedby={labelId}
          onClick={() => setSettingsOpen(true)}
        >
          {t("recaptchaZulassen")}
        </Button>
        {/* The visitor confirms the choice themselves in the cookie settings
            instead of a one-click opt-in. Portalled out of the surrounding
            form (and onto the event theme, like the legal texts); the form's
            input is kept because only this dialog is opened on top of it. */}
        {settingsOpen
          ? createPortal(
              <CookieSettingsDialog onCloseAction={() => setSettingsOpen(false)} />,
              themePortalTarget(),
            )
          : null}
      </div>
    );
  }

  return (
    <div>
      <p id={labelId} className="mb-2 text-sm font-bold">
        {t("sicherheitsprufung")}
      </p>
      <div
        ref={containerRef}
        className="overflow-x-auto"
        role="group"
        aria-labelledby={labelId}
      />
    </div>
  );
}
