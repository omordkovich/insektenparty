"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { GuestDto } from "@/lib/types";
import { NAME_MAX_LENGTH, validateGuestInput } from "@/lib/validation";
import { Button } from "./Button";
import { RecaptchaCheckbox } from "./RecaptchaCheckbox";

type AdditionalGuestsDialogProps = {
  guest: GuestDto;
  apiBasePath: string;
  onClose: () => void;
  onSaved: () => Promise<void> | void;
};

export function AdditionalGuestsDialog({
  guest,
  apiBasePath,
  onClose,
  onSaved,
}: AdditionalGuestsDialogProps) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);

  const [names, setNames] = useState<string[]>(guest.additionalGuestNames);
  const [editingIndices, setEditingIndices] = useState<Set<number>>(new Set());
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [recaptchaReset, setRecaptchaReset] = useState(0);

  const isDirty = names.join("\n") !== guest.additionalGuestNames.join("\n");

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.classList.add("modal-open");
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    return () => {
      document.body.classList.remove("modal-open");
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  function requestClose() {
    if (saving) return;
    if (isDirty) {
      const confirmed = window.confirm(
        "Es gibt ungespeicherte Änderungen. Fenster wirklich schließen?",
      );
      if (!confirmed) return;
    }
    onClose();
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      event.preventDefault();
      if (saving) return;
      if (isDirty) {
        const confirmed = window.confirm(
          "Es gibt ungespeicherte Änderungen. Fenster wirklich schließen?",
        );
        if (!confirmed) return;
      }
      onClose();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [saving, isDirty, onClose]);

  function toggleEditing(index: number) {
    setEditingIndices((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  function updateName(index: number, value: string) {
    setNames((current) => {
      const next = current.slice();
      next[index] = value;
      return next;
    });
  }

  function removeName(index: number) {
    setNames((current) => current.filter((_, i) => i !== index));
    setEditingIndices((current) => {
      const next = new Set<number>();
      for (const editingIndex of current) {
        if (editingIndex < index) next.add(editingIndex);
        else if (editingIndex > index) next.add(editingIndex - 1);
      }
      return next;
    });
  }

  async function handleConfirm() {
    if (saving) return;
    setFieldError(null);
    setSubmitError(null);

    const validation = validateGuestInput({
      name: guest.name,
      additionalGuests: names.length,
      additionalGuestNames: names,
      arrivalTime: guest.arrivalTime,
      bringingSomething: guest.bringingSomething,
      bringingDescription: guest.bringingDescription,
    });

    if (!validation.ok) {
      setFieldError(validation.error);
      return;
    }

    if (!recaptchaToken) {
      setFieldError("Bitte bestätige, dass du kein Roboter bist.");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`${apiBasePath}/${guest.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...validation.data, recaptchaToken }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        setSubmitError(
          payload?.error ??
            "Die Änderungen konnten nicht gespeichert werden. Bitte versuche es erneut.",
        );
        setRecaptchaReset((value) => value + 1);
        return;
      }

      await onSaved();
      onClose();
    } catch {
      setSubmitError(
        "Die Änderungen konnten nicht gespeichert werden. Bitte versuche es erneut.",
      );
      setRecaptchaReset((value) => value + 1);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-3 sm:items-center sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-black/55"
        aria-label="Dialog schließen"
        onClick={requestClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 flex max-h-[95dvh] w-full max-w-md flex-col overflow-hidden rounded-3xl bg-surface p-1 shadow-[var(--shadow)]"
      >
        <div className="shrink-0 p-5 pb-4 sm:p-7 sm:pb-4">
        <button
          ref={closeRef}
          type="button"
          onClick={requestClose}
          disabled={saving}
          aria-label="Schließen"
          className="absolute top-4 right-4 inline-flex h-8 w-8 items-center justify-center rounded-full text-leaf-dark transition hover:bg-leaf/10 disabled:opacity-50"
        >
          <CloseIcon />
        </button>

        <h2
          id={titleId}
          className="pr-8 font-[family-name:var(--font-display)] text-2xl text-leaf-dark"
        >
          Zusätzliche Personen
        </h2>
        </div>

        <div
          className="mr-4 min-h-0 flex-1 overflow-y-auto px-5 pb-5 sm:px-7 sm:pb-7"
          style={{ scrollbarGutter: "stable" }}
        >
        <div className="space-y-2">
          {names.length === 0 ? (
            <p className="text-muted">Keine zusätzlichen Personen.</p>
          ) : (
            names.map((additionalName, index) => (
              // Same outer card for both states (only its contents swap) so
              // toggling edit mode never removes/re-adds the container itself
              // - that was causing the surrounding list to visibly reflow.
              <div
                key={index}
                className="flex items-center justify-between gap-2 rounded-xl border border-leaf/15 bg-white/80 px-3 py-2"
              >
                {editingIndices.has(index) ? (
                  <input
                    type="text"
                    autoFocus
                    maxLength={NAME_MAX_LENGTH}
                    aria-label={`Name Gast ${index + 1}`}
                    value={additionalName}
                    disabled={saving}
                    onChange={(event) => updateName(index, event.target.value)}
                    className="min-w-0 flex-1 bg-transparent focus:outline-none"
                  />
                ) : (
                  <span className="truncate">{additionalName}</span>
                )}
                <div className="flex shrink-0 gap-2">
                  {editingIndices.has(index) ? (
                    <Button
                      variant="outline"
                      size="icon"
                      aria-label={`Name ${index + 1} übernehmen`}
                      onClick={() => toggleEditing(index)}
                      disabled={saving}
                    >
                      <CheckIcon />
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="icon"
                      aria-label={`${additionalName} bearbeiten`}
                      onClick={() => toggleEditing(index)}
                      disabled={saving}
                    >
                      <PencilIcon />
                    </Button>
                  )}
                  <Button
                    variant="outline-danger"
                    size="icon"
                    aria-label={`${additionalName || `Gast ${index + 1}`} löschen`}
                    onClick={() => removeName(index)}
                    disabled={saving}
                  >
                    <TrashIcon />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-4">
          <RecaptchaCheckbox
            onTokenChange={setRecaptchaToken}
            resetSignal={recaptchaReset}
          />
        </div>

        {fieldError || submitError ? (
          <p className="mt-3 text-sm text-danger" role="alert">
            {fieldError ?? submitError}
          </p>
        ) : null}
        </div>

        <div className="flex shrink-0 flex-col-reverse gap-2 p-5 pt-3 sm:flex-row sm:justify-end sm:p-7 sm:pt-4">
          <Button variant="outline" onClick={requestClose} disabled={saving}>
            Abbrechen
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirm}
            disabled={saving || !recaptchaToken}
          >
            {saving ? "Wird gespeichert ..." : "Bestätigen"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 7h14M10 11v6M14 11v6M9 7V5h6v2M7 7l1 12h8l1-12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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
