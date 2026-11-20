"use client";

import dynamic from "next/dynamic";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { cardClass } from "@/components/card";
import { formatPrice, PAID_EVENT_FEATURE_KEYS, PRODUCTS } from "@/lib/products";
import { saveStartIntent, startHref, type StartIntent } from "@/lib/start-intent";
import type { ThemeKey } from "@/lib/theme-presets";
import { Button } from "./Button";
import { useLoggedIn } from "./useLoggedIn";

// Loaded on the first click (Supabase client, reCAPTCHA, form validation).
const AuthDialog = dynamic(() => import("./AuthDialog").then((m) => m.AuthDialog));

type DesignPurchaseOptionsProps = {
  theme: ThemeKey;
  /** PAYMENTS_DUMMY, read on the server when the page was built. */
  dummyPayments: boolean;
};

type TestState = { busy: boolean; done: "theme" | "event" | null; failed: boolean };

// Both ways to get a design, with their prices. "Mit diesem Design starten"
// always leads on - to the create dialog with the design preselected (the
// purchase itself happens there), after a login if needed. With dummy
// purchases on, signed-in visitors can also unlock right here.
export function DesignPurchaseOptions({ theme, dummyPayments }: DesignPurchaseOptionsProps) {
  const t = useTranslations("designs");
  const tDialog = useTranslations("eventDialog");
  const locale = useLocale();
  const loggedIn = useLoggedIn();
  const [authIntent, setAuthIntent] = useState<StartIntent | null>(null);
  const [test, setTest] = useState<TestState>({ busy: false, done: null, failed: false });

  async function start(intent: StartIntent) {
    saveStartIntent(intent);
    // Login state still loading (first moment on the page): ask the session
    // directly, so a signed-in visitor never gets the login dialog.
    let signedIn = loggedIn;
    if (signedIn === null) {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        signedIn = (await createClient().auth.getSession()).data.session !== null;
      } catch {
        signedIn = false;
      }
    }
    if (signedIn) window.location.assign(startHref(intent, locale));
    else setAuthIntent(intent);
  }

  async function testUnlock(kind: "theme" | "event") {
    if (test.busy) return;
    setTest({ busy: true, done: null, failed: false });
    try {
      const response = await fetch("/api/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(kind === "theme" ? { product: "theme", theme } : { product: "paid_event" }),
      });
      setTest({ busy: false, done: response.ok ? kind : null, failed: !response.ok });
    } catch {
      setTest({ busy: false, done: null, failed: true });
    }
  }

  const options = [
    {
      kind: "theme" as const,
      heading: t("onlyThisDesign", { price: formatPrice(PRODUCTS.theme.priceCents, locale) }),
      body: <p className="mt-2 text-muted">{t("forAllEvents")}</p>,
      intent: { theme, paid: false },
    },
    {
      kind: "event" as const,
      heading: t("wholeEvent", { price: formatPrice(PRODUCTS.paid_event.priceCents, locale) }),
      body: (
        <>
          <p className="mt-2 text-muted">{t("wholeEventText")}</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-left text-muted">
            {/* "Alle Designs" is already said in the sentence above. */}
            {PAID_EVENT_FEATURE_KEYS.filter((key) => key !== "allDesigns").map((key) => (
              <li key={key}>{tDialog(key)}</li>
            ))}
          </ul>
        </>
      ),
      intent: { theme, paid: true },
    },
  ];

  return (
    <section aria-labelledby="buy-title" className={cardClass}>
      <h2 id="buy-title" className="text-center font-display text-2xl text-leaf-dark sm:text-3xl">
        {t("buyTitle")}
      </h2>
      <ul className="mt-6 grid gap-4 text-left sm:grid-cols-2">
        {options.map((option) => (
          <li key={option.kind} className="flex flex-col rounded-2xl border border-leaf/20 bg-[var(--surface)] p-4">
            <h3 className="font-display text-lg text-leaf-dark">{option.heading}</h3>
            {option.body}
            <div className="mt-auto flex flex-col gap-2 pt-4">
              <Button variant="primary" onClick={() => void start(option.intent)}>
                {t("startWithDesign")}
              </Button>
              {dummyPayments && loggedIn ? (
                <Button variant="outline" onClick={() => testUnlock(option.kind)} disabled={test.busy}>
                  {test.busy ? t("unlocking") : t("testUnlock")}
                </Button>
              ) : null}
            </div>
          </li>
        ))}
      </ul>

      {test.done ? (
        <p className="mt-4 text-center text-sm font-semibold text-leaf-dark" role="status">
          {test.done === "theme" ? t("unlockedTheme") : t("unlockedEvent")}
        </p>
      ) : null}
      {test.failed ? (
        <p className="mt-4 text-center text-sm text-danger" role="alert">
          {t("unlockFailed")}
        </p>
      ) : null}
      {dummyPayments ? <p className="mt-4 text-center text-xs text-muted">{tDialog("testphaseEsWirdNichts")}</p> : null}

      {authIntent ? (
        <AuthDialog
          initialMode="login"
          onCloseAction={() => setAuthIntent(null)}
          afterLoginHref={startHref(authIntent, locale)}
        />
      ) : null}
    </section>
  );
}
