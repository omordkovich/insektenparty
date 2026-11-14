"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import type { Locale } from "@/i18n/config";
import type { UnlockContext } from "@/lib/products";
import type { ThemeKey } from "@/lib/theme-presets";
import { GearIcon } from "./EditIcons";
import { EventDialog } from "./EventDialog";
import { EDIT_ICON_BUTTON_CLASS } from "./InlineEditShell";

type ThemeEditButtonProps = {
  eventId: string;
  theme: ThemeKey;
  unlockedThemes: ThemeKey[];
  accessPassword: string | null;
  maxGuests: number | null;
  language: Locale;
  unlock: UnlockContext;
  className?: string;
};

// Owner-only gear next to the event logo: opens design and password settings.
export function ThemeEditButton({
  eventId,
  theme,
  unlockedThemes,
  accessPassword,
  maxGuests,
  language,
  unlock,
  className = "",
}: ThemeEditButtonProps) {
  const t = useTranslations("eventDialog");
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className={`${EDIT_ICON_BUTTON_CLASS} ${className}`}
        aria-label={t("eventEinstellungen")}
        title={t("eventEinstellungen")}
        onClick={() => setOpen(true)}
      >
        <GearIcon />
      </button>
      {open ? (
        <EventDialog
          mode="settings"
          event={{ id: eventId, theme, accessPassword, maxGuests, language }}
          unlockedThemes={unlockedThemes}
          unlock={unlock}
          onCloseAction={() => setOpen(false)}
        />
      ) : null}
    </>
  );
}
