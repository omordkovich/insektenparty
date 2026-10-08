"use client";

import { useRouter } from "next/navigation";
import { useId, useState, type ReactNode } from "react";
import { CheckIcon, CloseIcon, PencilIcon } from "./EditIcons";

type SaveResult = { ok: true } | { ok: false; error: string };

// Round pencil button used by every owner edit control on an event page
// (inline fields, the design picker next to the logo) so they all match.
export const EDIT_ICON_BUTTON_CLASS =
  "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-leaf/30 text-leaf-dark transition hover:bg-leaf/10";

type InlineEditShellProps = {
  isOwner: boolean;
  ariaLabel: string;
  className: string;
  isEmpty: boolean;
  placeholder: string;
  displayContent: ReactNode;
  /** Editor markup; `hintId` is set when there is an editHint - put it on
   *  the input as aria-describedby so screen readers read the hint. */
  renderEditor: (state: { saving: boolean; hintId?: string }) => ReactNode;
  onSaveAction: () => Promise<SaveResult>;
  /** Short note shown under the field while editing (e.g. what a change
   *  affects beyond the field itself). */
  editHint?: string;
};

// Shared "pencil to edit, checkmark/X to save/cancel" shell used by every
// inline-editable field on an event page (EditableField). Owns the editing/saving/error state and the
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
  editHint,
}: InlineEditShellProps) {
  const hintId = useId();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

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
    // Re-render the server parts of the page so everything built from the
    // saved field (e.g. the owner's invitation text) shows the new value.
    router.refresh();
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
          className={EDIT_ICON_BUTTON_CLASS}
        >
          <PencilIcon />
        </button>
      </span>
    );
  }

  return (
    <span className="block">
      {renderEditor({ saving, hintId: editHint ? hintId : undefined })}
      {editHint ? (
        // Reset type styles: the field may sit inside a large heading.
        <span
          id={hintId}
          className="mt-1 block font-sans text-sm font-normal leading-snug tracking-normal normal-case text-muted"
        >
          {editHint}
        </span>
      ) : null}
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
