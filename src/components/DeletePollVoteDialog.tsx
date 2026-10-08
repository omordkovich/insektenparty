import { useId, useRef, useState } from "react";
import type { PollVoteDto } from "@/lib/date-poll";
import { Button } from "./Button";
import { Modal } from "./Modal";
import { RecaptchaCheckbox } from "./RecaptchaCheckbox";

type DeletePollVoteDialogProps = {
  vote: PollVoteDto;
  apiBasePath: string;
  isOwner?: boolean;
  onCloseAction: () => void;
  onDeletedAction: () => Promise<void> | void;
};

export function DeletePollVoteDialog({
  vote,
  apiBasePath,
  isOwner = false,
  onCloseAction,
  onDeletedAction,
}: DeletePollVoteDialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [recaptchaReset, setRecaptchaReset] = useState(0);

  async function handleDelete() {
    if (deleting) return;
    if (!isOwner && !recaptchaToken) {
      setError("Bitte bestätige, dass du kein Roboter bist.");
      return;
    }

    setDeleting(true);
    setError(null);

    try {
      const response = await fetch(`${apiBasePath}/${vote.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recaptchaToken }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(payload?.error ?? "Die Stimme konnte nicht gelöscht werden. Bitte versuche es erneut.");
        setRecaptchaReset((value) => value + 1);
        return;
      }

      await onDeletedAction();
      onCloseAction();
    } catch {
      setError("Die Stimme konnte nicht gelöscht werden. Bitte versuche es erneut.");
      setRecaptchaReset((value) => value + 1);
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
        Stimme löschen?
      </h2>
      <p id={descriptionId} className="mt-3 text-muted">
        Möchtest du die Stimme von „{vote.name}“ wirklich aus der Abstimmung entfernen?
      </p>

      {!isOwner ? (
        <div className="mt-4">
          <RecaptchaCheckbox onTokenChange={setRecaptchaToken} resetSignal={recaptchaReset} />
        </div>
      ) : null}

      {error ? (
        <p className="mt-3 text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button ref={cancelRef} variant="outline" onClick={onCloseAction} disabled={deleting}>
          Abbrechen
        </Button>
        <Button
          variant="danger"
          onClick={handleDelete}
          disabled={deleting || (!isOwner && !recaptchaToken)}
        >
          {deleting ? "Wird gelöscht ..." : "Löschen"}
        </Button>
      </div>
    </Modal>
  );
}
