"use client";

import { useState } from "react";
import type { UnlockContext } from "@/lib/products";
import { CloseIcon } from "./EditIcons";
import { UnlockDialog } from "./UnlockDialog";

type BadgeRemoveButtonProps = {
  eventId: string;
  unlock: UnlockContext;
};

// Owner-only X at the top right of the "made with Gastzilla" badge: offers
// "Ohne GASTZILLA-Hinweis"; once bought, the refreshed page hides the badge.
export function BadgeRemoveButton({ eventId, unlock }: BadgeRemoveButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-label="GASTZILLA-Hinweis entfernen"
        title="GASTZILLA-Hinweis entfernen"
        onClick={() => setOpen(true)}
        className="absolute -top-2 -right-2 inline-flex h-6 w-6 items-center justify-center rounded-full border border-leaf/30 bg-surface text-leaf-dark shadow-sm transition hover:bg-leaf/10"
      >
        <CloseIcon />
      </button>
      {open ? (
        <UnlockDialog
          kind="no_badge"
          eventId={eventId}
          eventCredits={unlock.eventCredits}
          dummyPayments={unlock.dummyPayments}
          onCloseAction={() => setOpen(false)}
          // The page refresh (done by the dialog) removes the badge.
          onUnlockedAction={() => {}}
        />
      ) : null}
    </>
  );
}
