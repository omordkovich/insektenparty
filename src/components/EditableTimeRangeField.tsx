"use client";

import { useRef, useState } from "react";
import { normalizeArrivalTime } from "@/lib/validation";
import { InlineEditShell } from "./InlineEditShell";

type EditableTimeRangeFieldProps = {
  eventId: string;
  startValue: string | null;
  endValue: string | null;
  displayLabel: string;
  isOwner: boolean;
  ariaLabel: string;
  className: string;
};

export function EditableTimeRangeField({
  eventId,
  startValue,
  endValue,
  displayLabel,
  isOwner,
  ariaLabel,
  className,
}: EditableTimeRangeFieldProps) {
  const [currentStart, setCurrentStart] = useState(startValue);
  const [currentEnd, setCurrentEnd] = useState(endValue);
  const [currentLabel, setCurrentLabel] = useState(displayLabel);
  const startRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLInputElement>(null);

  // "bis" must be after "von" (unless the event ends on a later day) - checked
  // by the server with the shared Zod schema, its message is shown inline.
  async function handleSaveAction() {
    const newStart = startRef.current?.value || null;
    const newEnd = endRef.current?.value || null;

    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventStartTime: newStart, eventEndTime: newEnd }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        return { ok: false as const, error: body?.error ?? "Konnte nicht gespeichert werden." };
      }

      const updated = (await response.json()) as {
        eventStartTime: string | null;
        eventEndTime: string | null;
        timeLabel: string;
      };
      setCurrentStart(updated.eventStartTime ? normalizeArrivalTime(updated.eventStartTime) : null);
      setCurrentEnd(updated.eventEndTime ? normalizeArrivalTime(updated.eventEndTime) : null);
      setCurrentLabel(updated.timeLabel);
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
      placeholder="Uhrzeit auswählen"
      displayContent={currentLabel}
      onSaveAction={handleSaveAction}
      renderEditor={({ saving }) => (
        <span className="flex flex-col gap-1 text-left">
          <label className="flex items-center gap-2 text-xs font-bold">
            <span className="w-6 shrink-0">von</span>
            <input
              ref={startRef}
              type="time"
              defaultValue={currentStart ?? ""}
              disabled={saving}
              className={`${className} w-full rounded-lg border border-leaf/25 bg-surface px-2 py-1`}
            />
          </label>
          <label className="flex items-center gap-2 text-xs font-bold">
            <span className="w-6 shrink-0">bis</span>
            <input
              ref={endRef}
              type="time"
              defaultValue={currentEnd ?? ""}
              disabled={saving}
              className={`${className} w-full rounded-lg border border-leaf/25 bg-surface px-2 py-1`}
            />
          </label>
          <span className="text-[11px] font-normal text-muted">„bis“ ist optional</span>
        </span>
      )}
    />
  );
}
