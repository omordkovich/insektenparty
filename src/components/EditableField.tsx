"use client";

import { useRef, useState } from "react";
import { AddToCalendarLink } from "@/components/AddToCalendarLink";
import type { PartyFieldKey } from "@/lib/validation";

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
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  async function handleSave() {
    const newValue = (as === "textarea" ? textareaRef.current?.value : inputRef.current?.value) ?? "";
    setSaving(true);
    setError(null);

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
        setError(body?.error ?? "Konnte nicht gespeichert werden.");
        setSaving(false);
        return;
      }

      setCurrentValue(newValue);
      setEditing(false);
    } catch {
      setError("Konnte nicht gespeichert werden.");
    } finally {
      setSaving(false);
    }
  }

  // Non-owners (and logged-out visitors) get exactly the plain text/link
  // they always got - no wrapper, no extra markup, zero behavior change.
  if (!isOwner) {
    return <>{currentValue ? renderDisplayValue(currentValue) : null}</>;
  }

  if (!editing) {
    return (
      <span className="inline-flex items-center gap-2">
        <span className={currentValue ? className : `${className} opacity-40`}>
          {currentValue ? renderDisplayValue(currentValue) : placeholder}
        </span>
        <button
          type="button"
          onClick={() => setEditing(true)}
          aria-label={ariaLabel}
          className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-leaf/30 text-leaf-dark transition hover:bg-leaf/10"
        >
          <PencilIcon />
        </button>
      </span>
    );
  }

  return (
    <span className="block">
      {as === "textarea" ? (
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
      )}
      <span className="mt-1 inline-flex gap-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          aria-label="Speichern"
          className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-leaf/30 text-leaf-dark transition hover:bg-leaf/10 disabled:opacity-50"
        >
          <CheckIcon />
        </button>
        <button
          type="button"
          onClick={() => setEditing(false)}
          disabled={saving}
          aria-label="Abbrechen"
          className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-danger/30 text-danger transition hover:bg-red-50 disabled:opacity-50"
        >
          <CloseIcon />
        </button>
      </span>
      {error ? (
        <span className="mt-1 block text-sm text-danger" role="alert">
          {error}
        </span>
      ) : null}
    </span>
  );
}

function PencilIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M13 6l3 3" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 13l4 4L19 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
