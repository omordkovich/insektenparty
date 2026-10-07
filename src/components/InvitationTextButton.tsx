"use client";

import { useState } from "react";
import type { InvitationFacts } from "@/lib/invitation-text";
import { Button } from "./Button";
import { InvitationTextDialog } from "./InvitationTextDialog";

type InvitationTextButtonProps = {
  eventId: string;
  facts: InvitationFacts;
  /** Same background as the neighbouring share/copy buttons. */
  className?: string;
};

// Owner-only icon button next to "Link kopieren" that opens the
// invitation text overlay.
export function InvitationTextButton({ eventId, facts, className = "" }: InvitationTextButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className={className}
        onClick={() => setDialogOpen(true)}
        aria-label="Einladungstext erstellen"
        title="Einladungstext"
      >
        <TextIcon />
      </Button>
      {dialogOpen ? (
        <InvitationTextDialog eventId={eventId} facts={facts} onCloseAction={() => setDialogOpen(false)} />
      ) : null}
    </>
  );
}

// A "T" as used for text tools.
function TextIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 7V5h14v2M12 5v14M9 19h6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
