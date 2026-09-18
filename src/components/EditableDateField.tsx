"use client";

import { useRef, useState } from "react";
import { AddToCalendarLink } from "@/components/AddToCalendarLink";
import { InlineEditShell } from "./InlineEditShell";

type EditableDateFieldProps = {
  eventId: string;
  value: string | null;
  displayLabel: string;
  isOwner: boolean;
  ariaLabel: string;
  className: string;
  calendarLinks?: { icsHref: string; googleHref: string };
};

export function EditableDateField({
  eventId,
  value,
  displayLabel,
  isOwner,
  ariaLabel,
  className,
  calendarLinks,
}: EditableDateFieldProps) {
  const [currentValue, setCurrentValue] = useState(value);
  const [currentLabel, setCurrentLabel] = useState(displayLabel);
  const inputRef = useRef<HTMLInputElement>(null);

  function renderDisplayValue(text: string) {
    if (calendarLinks) {
      return (
        <AddToCalendarLink
          icsHref={calendarLinks.icsHref}
          googleHref={calendarLinks.googleHref}
          className="underline decoration-leaf/40 underline-offset-4 hover:text-leaf-dark"
        >
          {text}
        </AddToCalendarLink>
      );
    }
    return text;
  }

  async function handleSaveAction() {
    const newValue = inputRef.current?.value || null;

    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventDate: newValue }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        return { ok: false as const, error: body?.error ?? "Konnte nicht gespeichert werden." };
      }

      const updated = (await response.json()) as {
        eventDate: string | null;
        dateLabel: string;
      };
      setCurrentValue(updated.eventDate);
      setCurrentLabel(updated.dateLabel);
      return { ok: true as const };
    } catch {
      return { ok: false as const, error: "Konnte nicht gespeichert werden." };
    }
  }

  return (
    <InlineEditShell
      isOwner={isOwner}
      ariaLabel={ariaLabel}
      className={className}
      isEmpty={!currentLabel}
      placeholder="Datum auswählen"
      displayContent={currentLabel ? renderDisplayValue(currentLabel) : null}
      onSaveAction={handleSaveAction}
      renderEditor={({ saving }) => (
        <input
          ref={inputRef}
          type="date"
          defaultValue={currentValue ?? ""}
          disabled={saving}
          className={`${className} w-full rounded-lg border border-leaf/25 bg-white px-2 py-1`}
        />
      )}
    />
  );
}
