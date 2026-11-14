"use client";

import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useId, useRef } from "react";
import { saveConsent } from "@/lib/cookie-consent";
import { Button } from "./Button";
import { Modal } from "./Modal";
import { LegalLink } from "./LegalLink";
import { useCookieConsent } from "./useCookieConsent";

type CookieBannerProps = {
  /** Set by the event layout, which renders its own banner inside the
   *  themed wrapper so it takes the event's theme. The root layout's banner
   *  steps aside on those pages. */
  insideEvent?: boolean;
};

// First-visit consent overlay, mounted in the root layout so it appears on
// whichever page a visitor lands on (guests usually arrive straight on an
// event page). It cannot be dismissed without a choice; both choices are
// equally prominent. It is part of the server HTML - hidden by CSS until
// the inline CONSENT_BANNER_SCRIPT finds no stored choice - so it paints
// with the page instead of after hydration. Once the stored choice is
// known on the client, it is removed for visitors who already decided -
// and shown by itself for those who didn't, without the script's <html>
// attribute: a client-side switch between the site and an event page
// rebuilds <html>, which drops that attribute and doesn't rerun the script.
export function CookieBanner({ insideEvent = false }: CookieBannerProps) {
  const { loaded, consent } = useCookieConsent();
  const pathname = usePathname();
  const t = useTranslations("cookies");
  const titleId = useId();
  const descriptionId = useId();
  const declineRef = useRef<HTMLButtonElement>(null);

  if (!insideEvent && pathname.startsWith("/event/")) return null;
  if (loaded && consent !== null) return null;

  return (
    <div className={loaded ? "contents" : "cookie-banner"}>
      <Modal
        titleId={titleId}
        descriptionId={descriptionId}
        onCloseAction={() => {}}
        closeDisabled
        initialFocusRef={declineRef}
        showCloseButton={false}
        placement="bottom"
      >
        <h2 id={titleId} className="font-display text-2xl text-leaf-dark">
          {t("title")}
        </h2>
        <div id={descriptionId} className="mt-3 space-y-2 text-sm text-muted">
          <p>{t("bannerText")}</p>
          <p>
            {t.rich("bannerChoice", {
              privacy: (chunks) => (
                <LegalLink document="privacy" className="underline underline-offset-2 hover:text-leaf-dark">
                  {chunks}
                </LegalLink>
              ),
            })}
          </p>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button ref={declineRef} variant="secondary" onClick={() => saveConsent(false)}>
            {t("necessaryOnly")}
          </Button>
          <Button variant="primary" onClick={() => saveConsent(true)}>
            {t("acceptAll")}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
