"use client";

import { useState, type ReactNode } from "react";
import { CheckIcon, CloseIcon, PencilIcon } from "./EditIcons";

type SaveResult = { ok: true } | { ok: false; error: string };

type InlineEditShellProps = {
  isOwner: boolean;
  ariaLabel: string;
  className: string;
  isEmpty: boolean;
  placeholder: string;
  displayContent: ReactNode;
  renderEditor: (state: { saving: boolean }) => ReactNode;
  onSaveAction: () => Promise<SaveResult>;
};

// Shared "pencil to edit, checkmark/X to save/cancel" shell used by every
// inline-editable field on a party page (EditableField, EditableDateField,
// EditableTimeRangeField). Owns the editing/saving/error state and the
// view/edit toggle; the caller only supplies the display content, the
// editor markup (its own inputs + refs), and how to persist a save.
export function InlineEditShell({
  isOwner,
  ariaLabel,
  className,
  isEmpty,
  placeholder,
  displayContent,
  renderEditor,
  onSaveAction,
}: InlineEditShellProps) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);

    const result = await onSaveAction();
    if (!result.ok) {
      setError(result.error);
      setSaving(false);
      return;
    }

    setSaving(false);
    setEditing(false);
  }

  if (!isOwner) {
    return <>{isEmpty ? null : displayContent}</>;
  }

  if (!editing) {
    return (
      <span className="inline-flex items-center gap-2">
        <span className={isEmpty ? `${className} opacity-40` : className}>
          {isEmpty ? placeholder : displayContent}
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
      {renderEditor({ saving })}
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
