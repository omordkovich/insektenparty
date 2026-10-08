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
  accessPassword: string | null;
  className?: string;
};

// Owner-only pencil next to the event logo: opens design and password settings.
export function ThemeEditButton({
  eventId,
  theme,
  unlockedThemes,
  accessPassword,
  className = "",
}: ThemeEditButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className={`${EDIT_ICON_BUTTON_CLASS} ${className}`}
        aria-label="Event-Einstellungen"
        title="Event-Einstellungen"
        onClick={() => setOpen(true)}
      >
        <PencilIcon />
      </button>
      {open ? (
        <EventDialog
          mode="settings"
          event={{ id: eventId, theme, accessPassword }}
          unlockedThemes={unlockedThemes}
          onCloseAction={() => setOpen(false)}
        />
      ) : null}
    </>
  );
}
