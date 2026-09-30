"use client";

import { useState } from "react";
import type { ThemeKey } from "@/lib/theme-presets";
import { PencilIcon } from "./EditIcons";
import { EventDialog } from "./EventDialog";
import { EDIT_ICON_BUTTON_CLASS } from "./InlineEditShell";

type ThemeEditButtonProps = {
  eventId: string;
  theme: ThemeKey;
  unlockedThemes: ThemeKey[];
  className?: string;
};

// Owner-only pencil next to the event logo: opens the design picker.
export function ThemeEditButton({ eventId, theme, unlockedThemes, className = "" }: ThemeEditButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className={`${EDIT_ICON_BUTTON_CLASS} ${className}`}
        aria-label="Design ändern"
        title="Design ändern"
        onClick={() => setOpen(true)}
      >
        <PencilIcon />
      </button>
      {open ? (
        <EventDialog
          mode="theme"
          event={{ id: eventId, theme }}
          unlockedThemes={unlockedThemes}
          onCloseAction={() => setOpen(false)}
        />
      ) : null}
    </>
  );
}
