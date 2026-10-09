"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import type { DateSettings } from "@/lib/date-poll-form";
import type { InvitationBase } from "@/lib/invitation-text";
import { DateSettingsDialog } from "./DateSettingsDialog";
import { PencilIcon } from "./EditIcons";
import { EDIT_ICON_BUTTON_CLASS } from "./InlineEditShell";
import { themePortalTarget } from "./themePortalTarget";

type DateEditButtonProps = {
  eventId: string;
  dateSettings: DateSettings;
  announcement: InvitationBase;
};

// Owner-only pencil at the date: opens the "Termin" window. Portalled out
// of the hero card, whose fade-in transform would otherwise trap the
// fixed-position overlay inside the card.
export function DateEditButton({ eventId, dateSettings, announcement }: DateEditButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className={EDIT_ICON_BUTTON_CLASS}
        aria-label="Termin bearbeiten"
        title="Termin bearbeiten"
        onClick={() => setOpen(true)}
      >
        <PencilIcon />
      </button>
      {open
        ? createPortal(
            <DateSettingsDialog
              eventId={eventId}
              original={dateSettings}
              announcement={announcement}
              onCloseAction={() => setOpen(false)}
            />,
            themePortalTarget(),
          )
        : null}
    </>
  );
}
