"use client";

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
// known on the client, it is removed for visitors who already decided.
export function CookieBanner({ insideEvent = false }: CookieBannerProps) {
  const { loaded, consent } = useCookieConsent();
  const pathname = usePathname();
  const titleId = useId();
  const descriptionId = useId();
  const declineRef = useRef<HTMLButtonElement>(null);

  if (!insideEvent && pathname.startsWith("/event/")) return null;
  if (loaded && consent !== null) return null;

  return (
    <div className="cookie-banner">
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
          Cookies 🍪
        </h2>
        <div id={descriptionId} className="mt-3 space-y-2 text-sm text-muted">
          <p>
            Wir verwenden notwendige Cookies, damit du angemeldet bleiben kannst.
            Zum Schutz unserer Formulare vor Spam möchten wir außerdem Google
            reCAPTCHA einsetzen. Dabei werden Daten an Google übertragen und
            Cookies von Google gesetzt.
          </p>
          <p>
            Ohne Zustimmung kannst du die Seite ansehen, Anmelde- und
            Gästeformulare benötigen aber reCAPTCHA. Du kannst deine Auswahl
            jederzeit über „Cookies“ unten auf der Seite ändern. Mehr dazu in
            unserer{" "}
            <LegalLink document="privacy" className="underline underline-offset-2 hover:text-leaf-dark">
              Datenschutzerklärung
            </LegalLink>
            .
          </p>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button ref={declineRef} variant="secondary" onClick={() => saveConsent(false)}>
            Nur notwendige
          </Button>
          <Button variant="primary" onClick={() => saveConsent(true)}>
            Alle akzeptieren
          </Button>
        </div>
      </Modal>
    </div>
  );
}
