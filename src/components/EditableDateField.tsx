"use client";

import { useRef, useState } from "react";
import { AddToCalendarLink } from "@/components/AddToCalendarLink";
import { InlineEditShell } from "./InlineEditShell";

type EditableDateFieldProps = {
  eventId: string;
  value: string | null;
  /** Optional last day of a multi-day event. */
  endValue: string | null;
  displayLabel: string;
  isOwner: boolean;
  ariaLabel: string;
  className: string;
  calendarLinks?: { icsHref: string; googleHref: string };
};

const inputClass = "w-full rounded-lg border border-leaf/25 bg-surface px-2 py-1";

export function EditableDateField({
  eventId,
  value,
  endValue,
  displayLabel,
  isOwner,
  ariaLabel,
  className,
  calendarLinks,
}: EditableDateFieldProps) {
  const [currentValue, setCurrentValue] = useState(value);
  const [currentEndValue, setCurrentEndValue] = useState(endValue);
  const [currentLabel, setCurrentLabel] = useState(displayLabel);
  const startRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLInputElement>(null);

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

  // The rules between the dates (and against the times) are checked by the
  // server with the shared Zod schema; its German message is shown inline.
  async function handleSaveAction() {
    const newStart = startRef.current?.value || null;
    const newEnd = endRef.current?.value || null;

    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventDate: newStart, eventEndDate: newEnd }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        return { ok: false as const, error: body?.error ?? "Konnte nicht gespeichert werden." };
      }

      const updated = (await response.json()) as {
        eventDate: string | null;
        eventEndDate: string | null;
        dateLabel: string;
      };
      setCurrentValue(updated.eventDate);
      setCurrentEndValue(updated.eventEndDate);
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
        <span className="flex flex-col gap-1 text-left">
          <label className="flex items-center gap-2 text-xs font-bold">
            <span className="w-6 shrink-0">von</span>
            <input
              ref={startRef}
              type="date"
              defaultValue={currentValue ?? ""}
              disabled={saving}
              className={`${className} ${inputClass}`}
            />
          </label>
          <label className="flex items-center gap-2 text-xs font-bold">
            <span className="w-6 shrink-0">bis</span>
            <input
              ref={endRef}
              type="date"
              defaultValue={currentEndValue ?? ""}
              disabled={saving}
              className={`${className} ${inputClass}`}
            />
          </label>
          <span className="text-[11px] font-normal text-muted">„bis“ nur bei mehrtägigen Events</span>
        </span>
      )}
    />
  );
}
