"use client";

import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { useEffect, useId, useState } from "react";
import type { EventPlan } from "@/lib/event-plan";
import type { UserEntitlements } from "@/lib/features";
import type { UnlockContext } from "@/lib/products";
import { clearStartIntent, readStartIntent, startView, type StartIntent } from "@/lib/start-intent";
import { Button } from "./Button";
import { LockIcon } from "./EditIcons";

// Loaded on the first click, together with the form validation it uses.
const EventDialog = dynamic(() => import("./EventDialog").then((m) => m.EventDialog));
const UnlockDialog = dynamic(() => import("./UnlockDialog").then((m) => m.UnlockDialog));

type CreateEventButtonProps = {
  entitlements: UserEntitlements;
  /** No free event and no credit left: the button asks to unlock one first. */
  limitReached: boolean;
  dummyPayments: boolean;
  /** From the URL (?design=...): open the dialog with this design at once. */
  startIntent?: StartIntent | null;
  /** Called once the start wish has been used. */
  onStartConsumedAction?: () => void;
};

export function CreateEventButton({ entitlements, limitReached, dummyPayments, startIntent = null, onStartConsumedAction }: CreateEventButtonProps) {
  const t = useTranslations("home");
  const [view, setView] = useState<"unlock" | "create" | null>(null);
  // A credit was just bought here: the new event is a paid one, even before
  // the refreshed entitlements arrive.
  const [creditBought, setCreditBought] = useState(false);
  // "Mit diesem Design starten" on a design page: the design to preselect
  // and whether a paid event was asked for.
  const [start, setStart] = useState<StartIntent | null>(null);
  const hintId = useId();
  const unlock: UnlockContext = { eventCredits: entitlements.eventCredits, dummyPayments };
  // The free event goes first; after it only paid events (one credit each).
  const createPlan: EventPlan =
    creditBought || (start?.paid && entitlements.eventCredits > 0) || !entitlements.freeEventAvailable ? "paid" : "free";
  const locked = limitReached && !creditBought;

  // Once on mount: the wish from the URL, or the one saved before a login
  // (which lands here without the URL parameters). Read in an effect -
  // localStorage does not exist during server rendering.
  useEffect(() => {
    const intent = startIntent ?? readStartIntent();
    clearStartIntent();
    if (!intent) return;
    onStartConsumedAction?.();
    // A reload or the back button must not open the dialog again.
    if (startIntent) window.history.replaceState(null, "", window.location.pathname);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-off start from the URL/storage
    setStart(intent);
    setView(startView(intent, entitlements, false) === "create" ? "create" : "unlock");
    // Only the wish present when the page loaded counts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function close() {
    setView(null);
    setStart(null);
  }

  return (
    <>
      {locked ? (
        <div className="flex flex-col items-center gap-2">
          <Button
            variant="primary"
            size="lg"
            aria-describedby={hintId}
            className="gap-2"
            onClick={() => setView("unlock")}
          >
            <LockIcon />
            {t("createEvent")}
          </Button>
          <p id={hintId} className="text-sm text-muted">
            {t("freeEventUsed")}
          </p>
        </div>
      ) : (
        <Button variant="primary" size="lg" onClick={() => setView("create")}>
          {t("createEventPlus")}
        </Button>
      )}
      {view === "unlock" ? (
        <UnlockDialog
          kind="credit"
          eventCredits={unlock.eventCredits}
          dummyPayments={unlock.dummyPayments}
          onCloseAction={close}
          onUnlockedAction={() => {
            setCreditBought(true);
            setView("create");
          }}
        />
      ) : null}
      {view === "create" ? (
        <EventDialog
          mode="create"
          createPlan={createPlan}
          unlockedThemes={entitlements.unlockedThemes}
          initialTheme={start?.theme}
          unlock={unlock}
          onCloseAction={close}
        />
      ) : null}
    </>
  );
}
