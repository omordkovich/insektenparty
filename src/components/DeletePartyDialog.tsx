import { useId, useRef, useState } from "react";
import { Button } from "./Button";
import { Modal } from "./Modal";

type DeletePartyDialogProps = {
  party: { id: string; title: string };
  onCloseAction: () => void;
  onDeletedAction: () => Promise<void> | void;
};

export function DeletePartyDialog({
  party,
  onCloseAction,
  onDeletedAction,
}: DeletePartyDialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (deleting) return;

    setDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/parties/${party.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        setError(
          payload?.error ??
            "Das Event konnte nicht gelöscht werden. Bitte versuche es erneut.",
        );
        return;
      }

      await onDeletedAction();
      onCloseAction();
    } catch {
      setError("Das Event konnte nicht gelöscht werden. Bitte versuche es erneut.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Modal
      titleId={titleId}
      descriptionId={descriptionId}
      onCloseAction={onCloseAction}
      closeDisabled={deleting}
      initialFocusRef={cancelRef}
      showCloseButton={false}
    >
      <h2 id={titleId} className="font-display text-2xl text-leaf-dark">
        Wirklich löschen?
      </h2>
      <p id={descriptionId} className="mt-3 text-muted">
        Möchtest du „{party.title}“ und die komplette Gästeliste dazu wirklich löschen?
      </p>

      {error ? (
        <p className="mt-3 text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button ref={cancelRef} variant="outline" onClick={onCloseAction} disabled={deleting}>
          Abbrechen
        </Button>
        <Button variant="danger" onClick={handleDelete} disabled={deleting}>
          {deleting ? "Wird gelöscht ..." : "Löschen"}
        </Button>
      </div>
    </Modal>
  );
}
