"use client";

import { useRef, useState } from "react";
import { AddToCalendarLink } from "@/components/AddToCalendarLink";
import { EVENT_FIELDS, type EventFieldKey } from "@/lib/validation";
import { CharCounter } from "./CharCounter";
import { InlineEditShell } from "./InlineEditShell";

type EditableFieldProps = {
  eventId: string;
  fieldKey: EventFieldKey;
  value: string;
  placeholder: string;
  isOwner: boolean;
  as?: "input" | "textarea";
  className: string;
  ariaLabel: string;
  /** Wraps a non-empty value in a plain <a> for display only (e.g. the maps
   * or mailto link) - never applied to the placeholder or while editing.
   * Functions can't cross the server/client boundary, so this takes plain
   * data instead of a render callback. */
  link?: { href: string; external?: boolean };
  /** Wraps a non-empty value in the calendar "add to calendar" link instead
   * of a plain <a> - mutually exclusive with `link`. */
  calendarLinks?: { icsHref: string; googleHref: string };
  /** Note shown under the field while editing (see InlineEditShell). */
  editHint?: string;
};

export function EditableField({
  eventId,
  fieldKey,
  value,
  placeholder,
  isOwner,
  as = "input",
  className,
  ariaLabel,
  link,
  calendarLinks,
  editHint,
}: EditableFieldProps) {
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
    if (link) {
      return (
        <a
          href={link.href}
          target={link.external ? "_blank" : undefined}
          rel={link.external ? "noopener noreferrer" : undefined}
          className="underline decoration-leaf/40 underline-offset-4 hover:text-leaf-dark"
        >
          {text}
        </a>
      );
    }
    return text;
  }

  const [currentValue, setCurrentValue] = useState(value);
  // Length of the text being edited, for the "noch … Zeichen" counter.
  const [draftLength, setDraftLength] = useState(value.length);
  const maxLength = EVENT_FIELDS[fieldKey].maxLength;
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  async function handleSaveAction() {
    const newValue = (as === "textarea" ? textareaRef.current?.value : inputRef.current?.value) ?? "";

    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [fieldKey]: newValue }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        return { ok: false as const, error: body?.error ?? "Konnte nicht gespeichert werden." };
      }

      setCurrentValue(newValue);
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
      isEmpty={!currentValue}
      placeholder={placeholder}
      displayContent={currentValue ? renderDisplayValue(currentValue) : null}
      onSaveAction={handleSaveAction}
      editHint={editHint}
      renderEditor={({ saving, hintId }) =>
        as === "textarea" ? (
          <>
            <textarea
              ref={(element) => {
                textareaRef.current = element;
                // Opening the editor starts from the saved text.
                if (element) setDraftLength(element.value.length);
              }}
              defaultValue={currentValue}
              placeholder={placeholder}
              disabled={saving}
              aria-describedby={hintId}
              maxLength={maxLength}
              onInput={(event) => setDraftLength(event.currentTarget.value.length)}
              rows={2}
              className={`${className} w-full resize-none rounded-lg border border-leaf/25 bg-surface px-2 py-1`}
            />
            <CharCounter length={draftLength} max={maxLength} />
          </>
        ) : (
          <input
            ref={inputRef}
            type="text"
            defaultValue={currentValue}
            placeholder={placeholder}
            disabled={saving}
            aria-describedby={hintId}
            maxLength={maxLength}
            className={`${className} w-full rounded-lg border border-leaf/25 bg-surface px-2 py-1`}
          />
        )
      }
    />
  );
}
