"use client";

import dynamic from "next/dynamic";
import { useId, useState } from "react";
import type { EventPlan } from "@/lib/event-plan";
import type { UserEntitlements } from "@/lib/features";
import type { UnlockContext } from "@/lib/products";
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
};

export function CreateEventButton({ entitlements, limitReached, dummyPayments }: CreateEventButtonProps) {
  const [view, setView] = useState<"unlock" | "create" | null>(null);
  // A credit was just bought here: the new event is a paid one, even before
  // the refreshed entitlements arrive.
  const [creditBought, setCreditBought] = useState(false);
  const hintId = useId();
  const unlock: UnlockContext = { eventCredits: entitlements.eventCredits, dummyPayments };
  // The free event goes first; after it only paid events (one credit each).
  const createPlan: EventPlan = creditBought || !entitlements.freeEventAvailable ? "paid" : "free";
  const locked = limitReached && !creditBought;

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
            Event erstellen
          </Button>
          <p id={hintId} className="text-sm text-muted">
            Dein kostenloses Event hast du schon genutzt. Weitere Events kannst du freischalten.
          </p>
        </div>
      ) : (
        <Button variant="primary" size="lg" onClick={() => setView("create")}>
          + Event erstellen
        </Button>
      )}
      {view === "unlock" ? (
        <UnlockDialog
          kind="credit"
          eventCredits={unlock.eventCredits}
          dummyPayments={unlock.dummyPayments}
          onCloseAction={() => setView(null)}
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
          unlock={unlock}
          onCloseAction={() => setView(null)}
        />
      ) : null}
    </>
  );
}
