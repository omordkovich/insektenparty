"use client";

import dynamic from "next/dynamic";
import { useId, useState } from "react";
import type { ThemeKey } from "@/lib/theme-presets";
import { Button } from "./Button";
import { LockIcon } from "./EditIcons";

// Loaded on the first click, together with the form validation it uses.
const EventDialog = dynamic(() => import("./EventDialog").then((m) => m.EventDialog));

type CreateEventButtonProps = {
  unlockedThemes: ThemeKey[];
  limitReached: boolean;
};

export function CreateEventButton({ unlockedThemes, limitReached }: CreateEventButtonProps) {
  const [open, setOpen] = useState(false);
  const hintId = useId();

  if (limitReached) {
    return (
      <div className="flex flex-col items-center gap-2">
        <Button variant="primary" size="lg" disabled aria-describedby={hintId} className="gap-2">
          <LockIcon />
          Event erstellen
        </Button>
        <p id={hintId} className="text-sm text-muted">
          Weitere Events kannst du bald freischalten.
        </p>
      </div>
    );
  }

  return (
    <>
      <Button variant="primary" size="lg" onClick={() => setOpen(true)}>
        + Event erstellen
      </Button>
      {open ? (
        <EventDialog
          mode="create"
          unlockedThemes={unlockedThemes}
          onCloseAction={() => setOpen(false)}
        />
      ) : null}
    </>
  );
}
