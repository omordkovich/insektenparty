"use client";

import { useRef, useState } from "react";
import { AddToCalendarLink } from "@/components/AddToCalendarLink";
import type { PartyFieldKey } from "@/lib/validation";
import { InlineEditShell } from "./InlineEditShell";

type EditableFieldProps = {
  partyId: string;
  fieldKey: PartyFieldKey;
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
};

export function EditableField({
  partyId,
  fieldKey,
  value,
  placeholder,
  isOwner,
  as = "input",
  className,
  ariaLabel,
  link,
  calendarLinks,
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
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  async function handleSaveAction() {
    const newValue = (as === "textarea" ? textareaRef.current?.value : inputRef.current?.value) ?? "";

    try {
      const response = await fetch(`/api/parties/${partyId}`, {
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
      renderEditor={({ saving }) =>
        as === "textarea" ? (
          <textarea
            ref={textareaRef}
            defaultValue={currentValue}
            placeholder={placeholder}
            disabled={saving}
            rows={2}
            className={`${className} w-full resize-none rounded-lg border border-leaf/25 bg-white px-2 py-1`}
          />
        ) : (
          <input
            ref={inputRef}
            type="text"
            defaultValue={currentValue}
            placeholder={placeholder}
            disabled={saving}
            className={`${className} w-full rounded-lg border border-leaf/25 bg-white px-2 py-1`}
          />
        )
      }
    />
  );
}
