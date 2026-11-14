"use client";

import { useTranslations } from "next-intl";
import { useId, useState } from "react";
import { saveConsent } from "@/lib/cookie-consent";
import { Button } from "./Button";
import { Modal } from "./Modal";
import { LegalLink } from "./LegalLink";
import { useCookieConsent } from "./useCookieConsent";

type CookieSettingsDialogProps = {
  onCloseAction: () => void;
};

export function CookieSettingsDialog({ onCloseAction }: CookieSettingsDialogProps) {
  const t = useTranslations("cookies");
  const tCommon = useTranslations("common");
  const { consent } = useCookieConsent();
  const titleId = useId();
  const descriptionId = useId();
  const recaptchaId = useId();
  const [recaptcha, setRecaptcha] = useState(consent?.recaptcha ?? false);

  function handleSave() {
    saveConsent(recaptcha);
    // An already-loaded reCAPTCHA script keeps running (and talking to
    // Google) until the page is left; reloading is the only way to drop it
    // once consent is withdrawn. Its cookies live on google.com and cannot
    // be deleted from this site.
    if (!recaptcha && window.grecaptcha) {
      window.location.reload();
      return;
    }
    onCloseAction();
  }

  return (
    <Modal
      titleId={titleId}
      descriptionId={descriptionId}
      onCloseAction={onCloseAction}
      placement="sheet"
    >
      <h2 id={titleId} className="pr-10 font-display text-2xl text-leaf-dark">
        {t("settingsTitle")}
      </h2>
      <p id={descriptionId} className="mt-3 text-sm text-muted">
        {t.rich("settingsIntro", {
          privacy: (chunks) => (
            <LegalLink document="privacy" className="underline underline-offset-2 hover:text-leaf-dark">
              {chunks}
            </LegalLink>
          ),
        })}
      </p>

      <div className="mt-5 space-y-3">
        <div className="rounded-2xl border border-leaf/20 p-4">
          <label className="flex items-center gap-2 text-sm font-bold">
            <input
              type="checkbox"
              checked
              disabled
              className="h-5 w-5 rounded border-leaf/40"
            />
            {t("necessaryTitle")}
          </label>
          <p className="mt-2 text-sm text-muted">
            {t("necessaryText")}
          </p>
        </div>

        <div className="rounded-2xl border border-leaf/20 p-4">
          <label htmlFor={recaptchaId} className="flex items-center gap-2 text-sm font-bold">
            <input
              id={recaptchaId}
              type="checkbox"
              checked={recaptcha}
              onChange={(event) => setRecaptcha(event.target.checked)}
              className="h-5 w-5 rounded border-leaf/40"
            />
            Google reCAPTCHA
          </label>
          <p className="mt-2 text-sm text-muted">
            {t("recaptchaText")}
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="outline" onClick={onCloseAction}>
          {tCommon("cancel")}
        </Button>
        <Button variant="primary" onClick={handleSave}>
          {t("save")}
        </Button>
      </div>
    </Modal>
  );
}
