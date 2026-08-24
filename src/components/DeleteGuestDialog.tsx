import { useEffect, useId, useRef, useState } from "react";
import type { GuestDto } from "@/lib/types";

type DeleteGuestDialogProps = {
  guest: GuestDto;
  onClose: () => void;
  onDeleted: () => Promise<void> | void;
};

export function DeleteGuestDialog({
  guest,
  onClose,
  onDeleted,
}: DeleteGuestDialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const deletingRef = useRef(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.classList.add("modal-open");
    document.body.style.overflow = "hidden";
    cancelRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !deletingRef.current) {
        event.preventDefault();
        onClose();
      }
    }

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.classList.remove("modal-open");
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  async function handleDelete() {
    if (deleting) return;

    deletingRef.current = true;
    setDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/guests/${guest.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        setError(
          payload?.error ??
            "Der Gast konnte nicht gelöscht werden. Bitte versuche es erneut.",
        );
        return;
      }

      await onDeleted();
      onClose();
    } catch {
      setError(
        "Der Gast konnte nicht gelöscht werden. Bitte versuche es erneut.",
      );
    } finally {
      deletingRef.current = false;
      setDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-3 sm:items-center sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-black/55"
        aria-label="Dialog schließen"
        onClick={() => {
          if (!deleting) onClose();
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="relative z-10 w-full max-w-md rounded-3xl bg-surface p-5 shadow-[var(--shadow)] sm:p-7"
      >
        <h2
          id={titleId}
          className="font-[family-name:var(--font-display)] text-2xl text-leaf-dark"
        >
          Gast löschen?
        </h2>
        <p id={descriptionId} className="mt-3 text-muted">
          Möchtest du „{guest.name}“ wirklich aus der Gästeliste entfernen?
        </p>

        {error ? (
          <p className="mt-3 text-sm text-danger" role="alert">
            {error}
          </p>
        ) : null}

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            ref={cancelRef}
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="min-h-11 rounded-xl border border-leaf/30 px-4 font-semibold disabled:opacity-50"
          >
            Abbrechen
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="min-h-11 rounded-xl bg-danger px-4 font-bold text-white hover:bg-[var(--danger-dark)] disabled:opacity-50"
          >
            {deleting ? "Wird gelöscht ..." : "Löschen"}
          </button>
        </div>
      </div>
    </div>
  );
}
