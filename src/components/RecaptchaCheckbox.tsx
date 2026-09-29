import { useEffect, useId, useRef } from "react";
import { saveConsent } from "@/lib/cookie-consent";
import { Button } from "./Button";
import { useCookieConsent } from "./useCookieConsent";

const SCRIPT_ID = "google-recaptcha-v2";
const SCRIPT_SRC =
  "https://www.google.com/recaptcha/api.js?render=explicit&hl=de";

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

function loadRecaptchaScript(): Promise<Grecaptcha> {
  if (window.grecaptcha) {
    return Promise.resolve(window.grecaptcha);
  }

  return new Promise((resolve, reject) => {
    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => {
        if (window.grecaptcha) resolve(window.grecaptcha);
        else reject(new Error("reCAPTCHA konnte nicht geladen werden."));
      });
      existing.addEventListener("error", () =>
        reject(new Error("reCAPTCHA konnte nicht geladen werden.")),
      );
      return;
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.grecaptcha) resolve(window.grecaptcha);
      else reject(new Error("reCAPTCHA konnte nicht geladen werden."));
    };
    script.onerror = () =>
      reject(new Error("reCAPTCHA konnte nicht geladen werden."));
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
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<number | null>(null);
  const onTokenChangeRef = useRef(onTokenChange);
  const labelId = useId();
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  // Google's script is only loaded once the visitor consented to it.
  const { consent } = useCookieConsent();
  const consentGiven = consent?.recaptcha === true;

  onTokenChangeRef.current = onTokenChange;

  useEffect(() => {
    if (!siteKey || !consentGiven || !containerRef.current) return;

    let cancelled = false;

    void loadRecaptchaScript()
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
  }, [siteKey, consentGiven]);

  useEffect(() => {
    if (resetSignal === 0) return;
    if (widgetIdRef.current === null || !window.grecaptcha) return;
    window.grecaptcha.reset(widgetIdRef.current);
    onTokenChangeRef.current(null);
  }, [resetSignal]);

  if (!siteKey) {
    return (
      <p className="text-sm text-danger" role="alert">
        reCAPTCHA ist nicht konfiguriert.
      </p>
    );
  }

  if (!consentGiven) {
    return (
      <div className="rounded-2xl border border-leaf/20 p-4">
        <p id={labelId} className="text-sm font-bold">
          Sicherheitsprüfung
        </p>
        <p className="mt-2 text-sm text-muted">
          Für die Sicherheitsprüfung wird Google reCAPTCHA benötigt. Dabei
          werden Daten an Google übertragen und Cookies von Google gesetzt.
        </p>
        <Button
          variant="outline"
          className="mt-3"
          aria-describedby={labelId}
          onClick={() => saveConsent(true)}
        >
          reCAPTCHA zulassen
        </Button>
      </div>
    );
  }

  return (
    <div>
      <p id={labelId} className="mb-2 text-sm font-bold">
        Sicherheitsprüfung
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
